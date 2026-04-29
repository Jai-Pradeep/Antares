const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


//-------------SIGN UP STARTS----------------
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const role = "employee";
  
  try {
    const normalizedEmail = email.toLowerCase();

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, normalizedEmail, hashed, role]
    );

    const user = result.rows[0];
    delete user.password;

    res.json(user);

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};
//-------------SIGN UP ENDS------------------

//-------------LOG IN STARTS-----------------
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    const normalizedEmail = email.toLowerCase();

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [normalizedEmail]);

    if (user.rows.length === 0)
        return res.status(400).json({ error: "User not found"});

    const valid = await bcrypt.compare(password, user.rows[0].password);

    if (!valid)
        return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
        {id: user.rows[0].id, role: user.rows[0].role},
        process.env.JWT_SECRET
    );

    res.json({token});
};

//---------------LOG IN ENDS-------------------
