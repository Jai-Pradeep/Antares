const pool = require("../config/db");

exports.createLog = async (req, res) => {

  const user_id = req.user.id;

  const {
    location,
    project,
    distance,
    status,
    remarks
  } = req.body;

  const today = new Date().toLocaleDateString('en-CA');

  try {

    // check if user already logged today
    const existing = await pool.query(
      `SELECT * FROM worklogs
       WHERE user_id = $1
       AND date = $2`,
      [user_id, today]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Already logged today"
      });
    }

    // insert new log
    const result = await pool.query(
      `INSERT INTO worklogs
      (user_id, date, location, project, distance, status, remarks)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        user_id,
        today,
        location,
        project,
        distance,
        status,
        remarks
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.updateLog = async (req, res) => {

  try {

    const user_id = req.user.id;
    const logId = req.params.id;

    const {
      location,
      project,
      distance,
      status,
      remarks
    } = req.body;

    // check if log belongs to current user
    const existing = await pool.query(
      `SELECT *
       FROM worklogs
       WHERE id = $1
       AND user_id = $2`,
      [logId, user_id]
    );

    if (existing.rows.length === 0) {
      return res.status(403).json({
        message: "Unauthorized"
      });
    }

    // only allow updating today's log
    const logDate = new Date(existing.rows[0].date)
      .toLocaleDateString('en-CA');

    const today = new Date()
      .toLocaleDateString('en-CA');

    if (logDate !== today) {
      return res.status(400).json({
        message: "Cannot edit past logs"
      });
    }

    const result = await pool.query(
      `UPDATE worklogs
       SET
         location = $1,
         project = $2,
         distance = $3,
         status = $4,
         remarks = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        location,
        project,
        distance,
        status,
        remarks,
        logId
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getTodayWorklog = async (req, res) => {

  try {

    const user_id = req.user.id;

    const today = new Date()
      .toLocaleDateString('en-CA'); // YYYY-MM-DD

    const result = await pool.query(
      `SELECT *
       FROM worklogs
       WHERE user_id = $1
       AND DATE(date) = $2
       LIMIT 1`,
      [user_id, today]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMyWorklogs = async (req, res) => {

  try {

    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT *
       FROM worklogs
       WHERE user_id = $1
       ORDER BY date DESC`,
      [user_id]
    );

    res.json(result.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};