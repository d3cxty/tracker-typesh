import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql2.createPool({
  host: process.env.dbhost,
  user: process.env.dbuser,
  password: process.env.dbpass,
  database: process.env.dbname,
});

// Test the connection
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully");
    connection.release(); // Release connection back to pool
  } catch (err) {
    console.error("MySQL connection error:", err.message);
    process.exit(1); // Exit process if connection fails
  }
};

export { connectDB, pool };
