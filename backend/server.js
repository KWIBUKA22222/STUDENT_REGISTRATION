
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();

app.use(cors());
app.use(express.json());

// JWT SECRET
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("ERROR: JWT_SECRET is missing in .env file");
    process.exit(1);
}

// DATABASE CONNECTION
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "student_registration",
    waitForConnections: true,
    connectionLimit: 10
});

// FORMAT STUDENT DATA
function formatStudent(student) {
    return {
        id: student.id,
        studentId: student.student_id,
        fullName: student.full_name,
        gender: student.gender,
        dateOfBirth: student.date_of_birth,
        phone: student.phone,
        email: student.email,
        address: student.address,
        program: student.program,
        level: student.level
    };
}

// AUTHENTICATION MIDDLEWARE
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please login first."
        });
    }

    jwt.verify(token, JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token."
            });
        }

        req.user = user;
        next();
    });
}

// AUTHORIZATION MIDDLEWARE
function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You do not have permission."
            });
        }

        next();
    };
}

// SERVER TEST
app.get("/", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            success: true,
            message: "Student Registration API is running!",
            database: "Connected"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "MY SERVER IS WORKING"
    });
});

// ===============================
// REGISTER
// ===============================
app.post("/api/auth/register", async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "Full name, email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        const cleanName = full_name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanName.length > 150 || cleanEmail.length > 150) {
            return res.status(400).json({
                message: "Full name or email is too long."
            });
        }

        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // New registrations always receive User role.
        const [result] = await db.query(
            `INSERT INTO users
            (full_name, email, password, role, status)
            VALUES (?, ?, ?, 'User', 'Active')`,
            [cleanName, cleanEmail, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "Registration successful.",
            userId: result.insertId
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        res.status(500).json({
            message: "Registration failed."
        });
    }
});

// ===============================
// LOGIN
// ===============================
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        if (user.status !== "Active") {
            return res.status(403).json({
                message: "Your account is inactive."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error.message);

        res.status(500).json({
            message: "Login failed."
        });
    }
});

// ===============================
// CHECK LOGGED-IN USER
// ===============================
app.get(
    "/api/auth/me",
    authenticateToken,
    async (req, res) => {
        try {
            const [users] = await db.query(
                `SELECT id, full_name, email, role, status
                 FROM users WHERE id = ?`,
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found."
                });
            }

            res.json({
                success: true,
                user: users[0]
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }
);

// ===============================
// STUDENT CRUD
// ===============================

// GET ALL STUDENTS
app.get("/api/students", async (req, res) => {
    try {
        const [students] = await db.query(
            "SELECT * FROM students ORDER BY id DESC"
        );

        res.json(students.map(formatStudent));

    } catch (error) {
        console.error("GET ERROR:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
});

// SEARCH STUDENTS
app.get("/api/students/search", async (req, res) => {
    try {
        const q = `%${req.query.q || ""}%`;

        const [students] = await db.query(
            `SELECT * FROM students
             WHERE student_id LIKE ?
             OR full_name LIKE ?
             OR email LIKE ?
             OR program LIKE ?`,
            [q, q, q, q]
        );

        res.json(students.map(formatStudent));

    } catch (error) {
        console.error("SEARCH ERROR:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
});

// ADD STUDENT
app.post("/api/students", async (req, res) => {
    try {
        const {
            studentId, fullName, gender, dateOfBirth,
            phone, email, address, program, level
        } = req.body;

        if (!studentId || !fullName || !gender) {
            return res.status(400).json({
                message: "Student ID, full name and gender are required."
            });
        }

        const [result] = await db.query(
            `INSERT INTO students
            (student_id, full_name, gender, date_of_birth,
             phone, email, address, program, level)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                studentId, fullName, gender,
                dateOfBirth || null, phone || "",
                email || "", address || "",
                program || "", level || ""
            ]
        );

        const [rows] = await db.query(
            "SELECT * FROM students WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json(formatStudent(rows[0]));

    } catch (error) {
        console.error("POST ERROR:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
});

// UPDATE STUDENT
app.put("/api/students/:id", async (req, res) => {
    try {
        const {
            studentId, fullName, gender, dateOfBirth,
            phone, email, address, program, level
        } = req.body;

        const [result] = await db.query(
            `UPDATE students SET
             student_id = ?, full_name = ?, gender = ?,
             date_of_birth = ?, phone = ?, email = ?,
             address = ?, program = ?, level = ?
             WHERE id = ?`,
            [
                studentId, fullName, gender,
                dateOfBirth || null, phone || "",
                email || "", address || "",
                program || "", level || "",
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM students WHERE id = ?",
            [req.params.id]
        );

        res.json(formatStudent(rows[0]));

    } catch (error) {
        console.error("PUT ERROR:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
});

// DELETE STUDENT
app.delete("/api/students/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM students WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        res.json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {
        console.error("DELETE ERROR:", error.message);

        res.status(500).json({
            message: error.message
        });
    }
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("STUDENT REGISTRATION SYSTEM");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("--------------------------------");
});
