const pool = require("../config/db");

exports.createLog = async (req, res) => {
    const user_id = req.user.id;
    const {location, project, distance, status, remarks} = req.body;

    const today = new Date().toISOString().split("T")[0];

    try {
        const result = await pool.query(
            `INSERT INTO worklogs
            (user_id, date, location, project, distance, status, remarks)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [user_id, today, location, project, distance, status, remarks]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({error: "Already logged today"});
    }
};

exports.updateLog = async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  const log = await pool.query("SELECT * FROM worklogs WHERE id=$1", [id]);

  if (log.rows.length === 0)
    return res.status(404).json({ error: "Not found" });

  const today = new Date().toISOString().split("T")[0];

  if (log.rows[0].date.toISOString().split("T")[0] !== today)
    return res.status(403).json({ error: "Cannot edit past logs" });

  if (log.rows[0].user_id !== user_id)
    return res.status(403).json({ error: "Unauthorized" });

  const { location, project, distance, status, remarks } = req.body;

  const updated = await pool.query(
    `UPDATE worklogs SET location=$1, project=$2, distance=$3,
     status=$4, remarks=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [location, project, distance, status, remarks, id]
  );

  res.json(updated.rows[0]);
};
