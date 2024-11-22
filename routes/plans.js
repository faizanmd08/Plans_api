const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../models/db");

const JWT_SECRET = "your_jwt_secret_key";

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!email.includes("@gmail.com")) {
    return res
      .status(400)
      .json({ error: "Email must be a valid Gmail address" });
  }

  if (password.length < 4) {
    return res
      .status(400)
      .json({ error: "Password must be at least 4 characters long" });
  }

  try {
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "User created successfully", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (user.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user[0].id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

router.post("/", verifyJWT, async (req, res) => {
  const {
    title,
    description,
    price,
    duration,
    features,
    category,
    location,
    radius,
    latitude,
    longitude,
    startDate,
    endDate,
  } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO plans (title, description, price, duration, features, category, location_name, latitude, longitude, user_id, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        price,
        duration,
        features.join(","),
        category,
        location,
        latitude,
        longitude,
        req.userId,
        startDate,
        endDate,
      ]
    );
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      price,
      duration,
      features,
      category,
      location,
      radius,
      latitude,
      longitude,
      startDate,
      endDate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", verifyJWT, async (req, res) => {
  try {
    const [plans] = await db.execute("SELECT * FROM plans WHERE user_id = ?", [
      req.userId,
    ]);
    plans.forEach((plan) => {
      plan.features = plan.features.split(",");
    });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/filter", async (req, res) => {
  const { people, location, radius, category, startDate, endDate } = req.query;
  var query = "SELECT * FROM plans WHERE 1=1";
  const params = [];

  if (people) {
    query += `
      AND id IN (
        SELECT plans.id
        FROM plans
        JOIN friends ON plans.id = friends.plan_id
        WHERE friends.user_id = ?
      )
    `;
    params.push(people);
  }

  if (location) {
    const radiusF = radius ? radius : 1;
    query += `
      AND ST_Distance_Sphere(
        POINT(Longitude, Latitude),
        (SELECT POINT(Longitude, Latitude) FROM plans WHERE Location_name = ? LIMIT 1)
      ) / 1000 <= ?
    `;
    params.push(location, radiusF);
  }

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (startDate && endDate) {
    query += " AND created_at BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }

  try {
    console.log(query);
    console.log(params);
    const [plans] = await db.execute(query, params);
    console.log(plans);
    plans.forEach((plan) => {
      plan.features = plan.features.split(",");
    });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", verifyJWT, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, duration, features } = req.body;
  try {
    await db.execute(
      "UPDATE plans SET title = ?, description = ?, price = ?, duration = ?, features = ? WHERE id = ? AND user_id = ?",
      [title, description, price, duration, features.join(","), id, req.userId]
    );
    res.status(200).json({ id, title, description, price, duration, features });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", verifyJWT, async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("DELETE FROM plans WHERE id = ? AND user_id = ?", [
      id,
      req.userId,
    ]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
