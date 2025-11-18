const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

const cors = require("cors");

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    return callback(null, true);  // Allow all origins temporarily
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));          // Admin + Worker login
app.use("/api/reports", require("./routes/reportRoutes"));     // User report routes
app.use("/api/admin", require("./routes/adminRoutes"));        // Admin functionality
app.use("/api/worker", require("./routes/workerRoutes"));      // Worker endpoints

// Test route
app.get("/", (req, res) => {
  res.send("GreenReport Backend Running...");
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
