const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const authMiddleware = async (req, res, next) => {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            error: "No token"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Load full user from DB
        const result = await pool.query(
            "SELECT * FROM users WHERE employee_code = $1",
            [decoded.employee_code]
        );

        if (result.rows.length === 0 || !result.rows[0].is_active) {
            return res.status(401).json({
                error: "User not found or account deactivated"
            });
        }

        req.user = result.rows[0];

        next();

    } catch (err) {

        console.log(err);

        res.status(401).json({
            error: "Invalid token"
        });
    }
};

module.exports = authMiddleware;
