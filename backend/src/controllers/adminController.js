const pool = require("../config/db");

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

    const result await pool.query(query, values);

    res.json(result.rows);
};
