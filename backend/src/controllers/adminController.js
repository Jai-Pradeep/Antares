const pool = require("../config/db");
const ExcelJS = require("exceljs");

exports.getAllLogs = async (req, res) => {

    const { date, user_id, project } = req.query;

    let query = `
        SELECT worklogs.*, users.name
        FROM worklogs
        JOIN users ON worklogs.user_id = user.id
        `;
    const conditions = [];
    const values = [];

    if (date) {
        values.push(date);
        conditions.push(`worklogs.date = $${values.length}`);
    }

    if (user_id) {
        values.push(user_id);
        conditions.push(`worklogs.user_id = $${values.length}`);
    }

    if (project) {
        values.push(project);
        conditions.push(`worklogs.project = $${values.length}`);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND "); 
    }

    query += " ORDER BY worklogs.date DESC";

    const result = await pool.query(query, values);

    res.json(result.rows);
};

exports.exportLogs = async (req, res) => {
    const result = await pool.query(`
        SELECT worklogs.*, users.name
        FROM worklogs
        JOIN users ON worklogs.user_id = user_id
        ORDER BY date DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Worklogs");
    
    // Headers
    sheet.columns = [
        { header: "Employee", key: "name" },
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

    res.setHeader(
    "Content-Disposition",
    "attachment; filename=worklogs.xlsx"
    );
    
    await workbook.xlsx.write(res);
    res.end();
};
