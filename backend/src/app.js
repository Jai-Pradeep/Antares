const express = require("express")
const cors = require("cors")
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const worklogRoutes = require("./routes/worklogRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/auth", authRoutes);
app.use("/worklogs", worklogRoutes);
app.use("/admin", adminRoutes);

app.listen(5000, () => console.log("Server running"));
