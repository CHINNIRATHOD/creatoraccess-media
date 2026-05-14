const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-before-deploying";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database is not connected" });
  }

  return next();
}

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  social: { type: String, trim: true },
  followers: { type: Number, default: 0 },
  category: { type: String, required: true, trim: true },
  message: { type: String, trim: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  date: {
    type: Date,
    default: Date.now
  }
});

const Application = mongoose.model("Application", applicationSchema);
const Message = mongoose.model("Message", messageSchema);

app.get("/", (req, res) => {
  res.json({ message: "CreatorAccess backend running" });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.post("/admin-login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, error: "Invalid credentials" });
});

app.post("/contact", requireDatabase, async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    return res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    return res.status(400).json({ error: "Failed to send message" });
  }
});

app.get("/messages", verifyToken, requireDatabase, async (req, res) => {
  try {
    const data = await Message.find().sort({ date: -1 });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.post("/apply", requireDatabase, async (req, res) => {
  try {
    const newApplication = new Application(req.body);
    await newApplication.save();
    return res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    return res.status(400).json({ error: "Failed to save application" });
  }
});

app.get("/applications", verifyToken, requireDatabase, async (req, res) => {
  try {
    const data = await Application.find().sort({ createdAt: -1 });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
});

app.get("/stats", verifyToken, requireDatabase, async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: "Pending" });
    const totalMessages = await Message.countDocuments();

    return res.json({ totalApplications, pendingApplications, totalMessages });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.put("/update-status/:id", verifyToken, requireDatabase, async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await Application.findByIdAndUpdate(req.params.id, { status }, { runValidators: true });
    return res.json({ message: "Status updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update status" });
  }
});

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection failed:", err.message));
} else {
  console.warn("MONGO_URI is not set. Database routes will return 503.");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
