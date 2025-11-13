// =======================================================
// CAMPUS EXCHANGE (PROJECT COMPONENT EDITION)
// Final Backend — by Adarsh L (PES2UG23CS025) & Amar Sagar
// Includes Admin, Feedback, Refunds, Frontend Support, and SQL Integration
// =======================================================

import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const _dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_PATH = path.join(_dirname, "frontend");

// ✅ Serve static files (HTML, JS, CSS)
app.use(express.static(FRONTEND_PATH));

// ✅ Default route → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

// ✅ Admin page route
app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "admin.html"));
});

 

// =======================================================
// 🗄️ DATABASE CONNECTION POOL
// =======================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "campus_exchange",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

pool.getConnection()
  .then(conn => {
    console.log("✅ Connected to MySQL Database");
    conn.release();
  })
  .catch(err => console.error("❌ Database connection failed:", err.message));

// =======================================================
// 👥 USERS (REGISTER + LOGIN)
// =======================================================
app.post("/add-user", async (req, res) => {
  const { FullName, Email, PasswordHash, Role, Department } = req.body;
  if (!FullName || !Email || !PasswordHash)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const [r] = await pool.query(
      "INSERT INTO Users (FullName, Email, PasswordHash, Department, Role) VALUES (?, ?, ?, ?, ?)",
      [FullName.trim(), Email.trim().toLowerCase(), PasswordHash, Department || "CSE", Role || "student"]
    );
    res.json({ message: "✅ User registered successfully", userId: r.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { Email, Password } = req.body;
  if (!Email || !Password)
    return res.status(400).json({ error: "Missing credentials" });
  try {
    const [rows] = await pool.query(
      "SELECT UserId, FullName, Email, Role FROM Users WHERE Email = ? AND PasswordHash = ?",
      [Email.trim().toLowerCase(), Password]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Invalid credentials" });
    res.json({ message: "✅ Login successful", user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🧱 COMPONENTS (LISTINGS)
// =======================================================
app.get("/listings", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.ComponentId AS ListingId,
        c.Name AS Title,
        CONCAT(p.Title, ' - ', c.Type) AS Description,
        c.Price,
        c.Status,
        u.FullName AS SellerName,
        u.UserId AS SellerId,
        u.Department AS SellerDepartment
      FROM Components c
      JOIN Projects p ON c.ProjectId = p.ProjectId
      JOIN Users u ON p.UserId = u.UserId
      WHERE c.Status = 'Available'
      ORDER BY c.ComponentId DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add-listing", async (req, res) => {
  const { sellerId, title, type, price, projectName, description } = req.body;
  if (!sellerId || !title || !price || !projectName || !type)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    let pid;
    const [existing] = await pool.query(
      "SELECT ProjectId FROM Projects WHERE UserId = ? AND Title = ? LIMIT 1",
      [sellerId, projectName]
    );

    if (!existing.length) {
      const [newProject] = await pool.query(
        "INSERT INTO Projects (Title, Description, UserId) VALUES (?, ?, ?)",
        [projectName, description || "Auto-created project", sellerId]
      );
      pid = newProject.insertId;
    } else {
      pid = existing[0].ProjectId;
    }

    const [r] = await pool.query(
      "INSERT INTO Components (Name, Type, Price, ProjectId, Status) VALUES (?, ?, ?, ?, 'Available')",
      [title, type, price, pid]
    );
    res.json({ message: "✅ Component added successfully", componentId: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 💰 PURCHASE & FEEDBACK
// =======================================================
app.post("/purchase", async (req, res) => {
  const { listingId, buyerId, amount, paymentMethod } = req.body;
  if (!listingId || !buyerId || !amount)
    return res.status(400).json({ error: "Missing fields" });

  try {
    await pool.query("CALL PurchaseComponent(?, ?, ?, ?)", [
      buyerId,
      listingId,
      amount,
      paymentMethod || "UPI",
    ]);
    res.json({ message: "✅ Purchase successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/feedback", async (req, res) => {
  const { buyerId, componentId, rating, comments } = req.body;
  if (!buyerId || !componentId || !rating)
    return res.status(400).json({ error: "Missing fields" });
  try {
    await pool.query("CALL AddFeedback(?, ?, ?, ?)", [
      buyerId,
      componentId,
      rating,
      comments || null,
    ]);
    res.json({ message: "⭐ Feedback added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🧑‍💼 ADMIN ROUTES
// =======================================================
app.get("/admin/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM v_Users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/available-items", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM v_AvailableItems");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/overview", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM v_AdminOverview");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/refund", async (req, res) => {
  const { componentId } = req.body;
  if (!componentId)
    return res.status(400).json({ error: "Missing component ID" });

  try {
    const [rows] = await pool.query(
      "SELECT TransactionId FROM Transactions WHERE ComponentId = ? AND Status = 'Completed' LIMIT 1",
      [componentId]
    );
    if (!rows.length)
      return res.status(400).json({ error: "No completed transaction found" });
    await pool.query("CALL RefundTransaction(?)", [rows[0].TransactionId]);
    res.json({ message: "💸 Transaction refunded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/reset-component", async (req, res) => {
  const { componentId } = req.body;
  if (!componentId)
    return res.status(400).json({ error: "Missing component ID" });

  try {
    await pool.query("CALL ResetComponentStatus(?)", [componentId]);
    res.json({ message: "♻ Component reset to Available" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🌐 STATIC FRONTEND ROUTES
// =======================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// =======================================================
// 🚀 SERVER START
// =======================================================
const PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 5000;
app.listen(PORT, () => console.log(`🌐 Server running on http://localhost:${PORT}`));
