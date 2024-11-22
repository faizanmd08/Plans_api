const mysql = require("mysql2");

// MySQL Connection Configuration
const pool = mysql.createPool({
  host: "localhost", // Default to localhost
  user: "root", // Replace with your MySQL root username
  password: "faizu", // Replace with your MySQL root password
  database: "plans_db", // Database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create Database and Tables if Not Exists
(async () => {
  try {
    const connection = await pool.promise();

    // Create the "users" table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the "plans" table with user_id reference
    await connection.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        features TEXT NOT NULL, -- Comma-separated string for features
        category ENUM('travel', 'shop', 'socialize', 'business') NOT NULL,
        location_name VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        user_id INT, -- Foreign key for user
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Create `friends` table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS friends (
        friend_id INT AUTO_INCREMENT PRIMARY KEY,
        friends_list JSON NOT NULL,
        plan_id INT,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
      );
    `);

    console.log("Database setup completed.");
  } catch (err) {
    console.error("Error setting up the database:", err.message);
  }
})();

module.exports = pool.promise();
