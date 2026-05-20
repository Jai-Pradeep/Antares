const pool = require("../config/db");
const ExcelJS = require("exceljs");
const bcrypt = require("bcrypt");

exports.getAllLogs = async (req, res) => {

  try {

    const { date, project, employee_code } = req.query;

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

    // Filter by date
    if (date) {

      values.push(date);

      conditions.push(
        `worklogs.date = $${values.length}`
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

    console.log(query);
    console.log(values);

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
  try {
    const { name, password, employee_code } = req.body;

    let finalEmployeeCode = employee_code;

    // Auto-generate if not provided
    if (!finalEmployeeCode) {

      const latestUser = await pool.query(`
        SELECT employee_code
        FROM users
        WHERE employee_code IS NOT NULL
        ORDER BY employee_code DESC
        LIMIT 1
      `);

      let nextNumber = 1;

      if (latestUser.rows.length > 0) {

        const lastCode =
          latestUser.rows[0].employee_code;

        const numericPart =
          parseInt(lastCode.slice(2));

        nextNumber = numericPart + 1;
      }

      finalEmployeeCode =
        `AW${String(nextNumber).padStart(3, "0")}`;
    }

    // Check duplicate employee_code
    const existing = await pool.query(
      "SELECT * FROM users WHERE employee_code = $1",
      [finalEmployeeCode]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Employee code already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
      (name, password, role, employee_code)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        name,
        hashed,
        "employee",
        finalEmployeeCode
      ]
    );

    const user = result.rows[0];

    delete user.password;

    res.json(user);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.exportLogs = async (req, res) => {
    const result = await pool.query(`
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
        

    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Worklogs");
    
    // Headers
    sheet.columns = [
        { header: "Employee Code", key: "employee_code" },
        { header: "Name", key: "name" },
        { header: "Date", key: "date" },
        { header: "Location", key: "location" },
        { header: "Project", key: "project" },
        { header: "Distance", key: "distance" },
        { header: "Status", key: "status" },
        { header: "Remarks", key: "remarks" }
        ];

    // Rows
    result.rows.forEach(row =>{
        sheet.addRow(row);
    });

    res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    const monthName = new Date().toLocaleString(
        "default",
        { month: "long" }
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${monthName}_worklogs.xlsx`
    );
    
    await workbook.xlsx.write(res);
    res.end();
};

exports.resetPassword = async (req, res) => {

  try {

    const employee_code =
      req.params.employee_code.toUpperCase();

    const { newPassword } = req.body;

    console.log("PARAM:", employee_code);
    console.log("NEW PASSWORD:", newPassword);

    const hashed =
      await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `UPDATE users
       SET password = $1
       WHERE employee_code = $2`,
      [hashed, employee_code]
    );

    console.log("ROW COUNT:", result.rowCount);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Employee not found"
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

exports.resetPassword = async (req, res) => {

  try {

    const { employee_code } = req.params;

    const { newPassword } = req.body;

    const hashed = await bcrypt.hash(
      newPassword,
      10
    );

    await pool.query(
      `UPDATE users
       SET password = $1
       WHERE employee_code = $2`,
      [hashed, employee_code]
    );

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

exports.deleteEmployee = async (req, res) => {

  try {

    const employee_code =
      req.params.employee_code.toUpperCase();

    const result = await pool.query(
      `UPDATE users
       SET is_active = FALSE
       WHERE employee_code = $1
       RETURNING *`,
      [employee_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found"
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