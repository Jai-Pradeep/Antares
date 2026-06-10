const pool = require("../config/db");
const ExcelJS = require("exceljs");
const bcrypt = require("bcrypt");

exports.getAllLogs = async (req, res) => {

  try {

    const { date, project, employee_code } = req.query;
    const now = new Date();
    const currentMonth =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const month = req.query.month || currentMonth;

    let query = `
      SELECT
        worklogs.*,
        users.employee_code,
        users.name
      FROM worklogs
      JOIN users
      ON worklogs.user_id = users.id
      
    `;

    const conditions = [];
    const values = [];

    // A specific date overrides the month filter.
    if (date) {

      values.push(date);

      conditions.push(
        `worklogs.date = $${values.length}`
      );
    } else {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
          message: "Month must use the YYYY-MM format"
        });
      }

      const [year, monthNumber] = month.split("-").map(Number);

      if (monthNumber < 1 || monthNumber > 12) {
        return res.status(400).json({
          message: "Month must use the YYYY-MM format"
        });
      }

      const fromDate = `${month}-01`;
      const nextMonthDate = new Date(Date.UTC(year, monthNumber, 1))
        .toISOString()
        .split("T")[0];

      values.push(fromDate, nextMonthDate);
      conditions.push(
        `worklogs.date >= $${values.length - 1} AND worklogs.date < $${values.length}`
      );
    }

    // Filter by project
    if (project) {

      values.push(`%${project}%`);

      conditions.push(
        `worklogs.project ILIKE $${values.length}`
      );
    }

    // Filter by employee_code
    if (employee_code) {

      values.push(employee_code);

      conditions.push(
        `users.employee_code = $${values.length}`
      );
    }

    // Add WHERE conditions
    if (conditions.length > 0) {

      query += `
        WHERE ${conditions.join(" AND ")}
      `;
    }

    query += `
      ORDER BY worklogs.date DESC
    `;

    const result = await pool.query(
      query,
      values
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.createUser = async (req, res) => {
  let client;

  try {
    client = await pool.connect();

    const { name, password, employee_code, email } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail =
      typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : null;
    const requestedEmployeeCode =
      typeof employee_code === "string" && employee_code.trim()
        ? employee_code.trim().toUpperCase()
        : null;

    if (!normalizedName || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Name and password are required"
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        message: "Password must be at least 4 characters"
      });
    }

    if (requestedEmployeeCode && !/^AW\d{3}$/.test(requestedEmployeeCode)) {
      return res.status(400).json({
        message: "Employee code must use the format AW followed by 3 digits"
      });
    }

    if (normalizedEmail && !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Enter a valid email"
      });
    }

    await client.query("BEGIN");

    // Serialize employee creation so two requests cannot generate the same code.
    await client.query("SELECT pg_advisory_xact_lock($1)", [20260609]);

    let finalEmployeeCode = requestedEmployeeCode;

    if (!finalEmployeeCode) {
      const latestUser = await client.query(`
        SELECT MAX(SUBSTRING(employee_code FROM 3)::INTEGER) AS latest_number
        FROM users
        WHERE employee_code ~ '^AW[0-9]{3}$'
      `);

      const nextNumber = Number(latestUser.rows[0].latest_number || 0) + 1;

      if (nextNumber > 999) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "No employee codes are available"
        });
      }

      finalEmployeeCode = `AW${String(nextNumber).padStart(3, "0")}`;
    }

    const existing = await client.query(
      "SELECT 1 FROM users WHERE employee_code = $1",
      [finalEmployeeCode]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Employee code already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await client.query(
      `INSERT INTO users
      (name, password, role, employee_code, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, role, employee_code, email, is_active, created_at`,
      [
        normalizedName,
        hashed,
        "employee",
        finalEmployeeCode,
        normalizedEmail
      ]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);

  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.log(err);

    if (err.code === "23505") {
      return res.status(400).json({
        message: "Employee code or email already exists"
      });
    }

    res.status(500).json({
      message: "Server error"
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

exports.exportLogs = async (req, res) => {
  try {

    const { from, to, all } = req.query;

    let query = `
      SELECT
        users.employee_code,
        users.name,
        worklogs.date,
        worklogs.location,
        worklogs.project,
        worklogs.distance,
        worklogs.status,
        worklogs.remarks
      FROM worklogs
      JOIN users
      ON worklogs.user_id = users.id
    `;

    const values = [];

    // FILTERING
    if (all !== "true") {

      if (from && to) {

        query += `
          WHERE DATE(worklogs.date) >= $1
          AND DATE(worklogs.date) < $2
        `;

        // from: 2026-01
        // -> 2026-01-01

        const fromDate = `${from}-01`;
        const [toYear, toMonth] = to.split("-").map(Number);
        const nextMonthDate =
          new Date(Date.UTC(toYear, toMonth, 1))
            .toISOString()
            .split("T")[0];

        values.push(fromDate, nextMonthDate);
      }
    }

    query += `
      ORDER BY worklogs.date DESC
    `;

    const result =
      await pool.query(query, values);

    const workbook = new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet("Worklogs");

    sheet.columns = [
      {
        header: "Employee Code",
        key: "employee_code",
        width: 18
      },
      {
        header: "Name",
        key: "name",
        width: 25
      },
      {
        header: "Date",
        key: "date",
        width: 15
      },
      {
        header: "Location",
        key: "location",
        width: 25
      },
      {
        header: "Project",
        key: "project",
        width: 30
      },
      {
        header: "Distance",
        key: "distance",
        width: 12
      },
      {
        header: "Status",
        key: "status",
        width: 15
      },
      {
        header: "Remarks",
        key: "remarks",
        width: 40
      }
    ];

    result.rows.forEach(row => {
      sheet.addRow(row);
    });

    // HEADER STYLING
    sheet.getRow(1).font = {
      bold: true
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    let fileName = "worklogs.xlsx";

    if (all === "true") {
      fileName = "All_Worklogs.xlsx";
    }
    else if (from && to) {
      fileName =
        `Worklogs_${from}_to_${to}.xlsx`;
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Export failed"
    });
  }
};

exports.resetPassword = async (req, res) => {

  try {

    const employee_code =
      req.params.employee_code.toUpperCase();

    const { newPassword } = req.body;

    if (typeof newPassword !== "string" || newPassword.length < 4) {
      return res.status(400).json({
        message: "Password must be at least 4 characters"
      });
    }

    const hashed =
      await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `UPDATE users
       SET password = $1
       WHERE employee_code = $2
       AND role = 'employee'
       AND is_active = TRUE`,
      [hashed, employee_code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Active employee not found"
      });
    }

    res.json({
      message: "Password reset successful"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getEmployees = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        id,
        employee_code,
        name,
        role,
        created_at
      FROM users
      WHERE is_active = TRUE
      AND role = 'employee'
      ORDER BY employee_code
    `);

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.deleteEmployee = async (req, res) => {

  try {

    const employee_code =
      req.params.employee_code.toUpperCase();

    const result = await pool.query(
      `UPDATE users
       SET is_active = FALSE
       WHERE employee_code = $1
       AND role = 'employee'
       AND is_active = TRUE
       RETURNING *`,
      [employee_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Active employee not found"
      });
    }

    res.json({
      message: "Employee deactivated successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};
