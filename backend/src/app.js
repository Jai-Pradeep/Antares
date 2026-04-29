const express = require("express")
require("dotenv").config();

const app = express();
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const worklogRoutes = require("./routes/worklogRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/auth", authRoutes);
app.use("/worklogs", worklogRoutes);
app.use("/admin", adminRoutes);

app.listen(5000, () => console.log("Server running"));
