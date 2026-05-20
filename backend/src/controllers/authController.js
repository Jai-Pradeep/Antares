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
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
//-------------SIGN UP ENDS------------------

//-------------LOG IN STARTS-----------------
exports.login = async (req, res) => {
    const { employee_code, password } = req.body;
    
    const normalizedCode = employee_code.toUpperCase();

    const user = await pool.query("SELECT * FROM users WHERE employee_code=$1", [normalizedCode]);

    if (user.rows.length === 0)
        return res.status(400).json({ message: "User not found"});

    const valid = await bcrypt.compare(password, user.rows[0].password);

    if (!valid)
        return res.status(400).json({ message: "Wrong password" });

    if (!user.rows[0].is_active) {
      return res.status(403).json({
        message: "Employee account deactivated"
      });
    }
    const userData = user.rows[0];

    const token = jwt.sign(
      {
        employee_code: userData.employee_code,
        role: userData.role,
        name: userData.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({token});
};

//---------------LOG IN ENDS-------------------


exports.changePassword = async (req, res) => {

  try {

    const employee_code = req.user.employee_code;

    const { oldPassword, newPassword } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE employee_code = $1",
      [employee_code]
    );

    const user = result.rows[0];

    const valid = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!valid) {
      return res.status(400).json({
        message: "Old password incorrect"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = $1
       WHERE employee_code = $2`,
      [hashed, employee_code]
    );

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};