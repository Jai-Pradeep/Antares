require("dotenv").config();

const express = require("express")
const cors = require("cors")
require("dotenv").config();

const app = express();

app.use(cors({
  exposedHeaders: ["Content-Disposition"]
}));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const worklogRoutes = require("./routes/worklogRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/auth", authRoutes);
app.use("/worklogs", worklogRoutes);
app.use("/admin", adminRoutes);

app.listen(5000, () => console.log("Server running"));

// --------------------------TEST DB CONNECTION------------------------------------
// Test DB Connection
// const pool = require("./config/db"); // adjust path if needed

// pool.query("SELECT NOW()")
//   .then(res => {
//     console.log("✅ DB Connected");
//     console.log(res.rows);
//   })
//   .catch(err => {
//     console.error("❌ DB Error");
//     console.error(err);
//   });