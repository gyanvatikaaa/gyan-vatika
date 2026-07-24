require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const seedAdmin = require("./services/seedAdmin");
const { scheduleDailySummary } = require("./services/dailySummaryService");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const testRoutes = require("./routes/testRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const progressRoutes = require("./routes/progressRoutes");
const parentRoutes = require("./routes/parentRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const recordsRoutes = require("./routes/recordsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// ---- Middleware ----
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "10mb" }));

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Gyan Vatika API is running 🎓" });
});

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ---- Start server ----
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedAdmin();
  scheduleDailySummary();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start();
