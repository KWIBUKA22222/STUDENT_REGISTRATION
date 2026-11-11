
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET ALL STUDENTS / SEARCH
router.get("/", async (req, res) => {
    try {
        const q = req.query.q;

        let sql = "SELECT * FROM students";
        let values = [];

        if (q) {
            sql += ` WHERE fullName LIKE ?
                     OR studentId LIKE ?
                     OR email LIKE ?`;

            values = [`%${q}%`, `%${q}%`, `%${q}%`];
        }

        sql += " ORDER BY id DESC";

        const [students] = await db.query(sql, values);
        res.json(students);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// REGISTER STUDENT
router.post("/", async (req, res) => {
    try {
        const {
            studentId, fullName, gender, dateOfBirth,
            phone, email, address, program, level
        } = req.body;

        const sql = `
            INSERT INTO students
            (studentId, fullName, gender, dateOfBirth,
             phone, email, address, program, level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            studentId, fullName, gender, dateOfBirth,
            phone, email, address, program, level
        ]);

        res.status(201).json({
            message: "Student registered successfully",
            id: result.insertId
        });

    } catch (error) {
        res.status(error.code === "ER_DUP_ENTRY" ? 409 : 500)
           .json({ message: error.message });
    }
});

// UPDATE STUDENT
router.put("/:id", async (req, res) => {
    try {
        const {
            fullName, gender, dateOfBirth,
            phone, email, address, program, level
        } = req.body;

        const sql = `
            UPDATE students SET
            fullName=?, gender=?, dateOfBirth=?,
            phone=?, email=?, address=?, program=?, level=?
            WHERE id=?
        `;

        const [result] = await db.query(sql, [
            fullName, gender, dateOfBirth,
            phone, email, address, program, level,
            req.params.id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({ message: "Student updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE STUDENT
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM students WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({ message: "Student deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
