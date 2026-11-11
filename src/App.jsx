
import { useState, useEffect } from "react";
import "./App.css";

// EXPRESS + MYSQL API
const API_URL = "http://localhost:5000/api/students";

const EMPTY_FORM = {
    studentId: "",
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: "",
    program: "",
    level: ""
};

export default function App() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // DISPLAY MESSAGE
    const notify = (type, text) => {
        setMessage({ type, text });

        setTimeout(() => {
            setMessage(null);
        }, 5000);
    };

    // HANDLE API ERRORS
    const getErrorMessage = async (response) => {
        const text = await response.text();

        try {
            const data = JSON.parse(text);
            return data.message || data.error || text;
        } catch {
            return text || `HTTP Error ${response.status}`;
        }
    };

    // GET ALL STUDENTS
    const fetchStudents = async () => {
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(response)
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid data received from server.");
            }

            setStudents(data);

            console.log("Students loaded:", data);

        } catch (error) {
            console.error("FETCH STUDENTS ERROR:", error);

            notify(
                "error",
                "Failed to fetch students: " + error.message
            );
        } finally {
            setLoading(false);
        }
    };

    // LOAD STUDENTS WHEN PAGE OPENS
    useEffect(() => {
        fetchStudents();
    }, []);

    // HANDLE INPUT CHANGES
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // RESET FORM
    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    // REGISTER OR UPDATE STUDENT
    const handleSubmit = async (e) => {
        e.preventDefault();

        const emptyField = Object.values(form).some(
            (value) => !String(value).trim()
        );

        if (emptyField) {
            notify("error", "Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const isEditing = editingId !== null;

            const url = isEditing
                ? `${API_URL}/${editingId}`
                : API_URL;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(response)
                );
            }

            const result = await response.json();

            console.log("SAVE RESULT:", result);

            notify(
                "success",
                isEditing
                    ? "Student updated successfully!"
                    : "Student registered successfully!"
            );

            resetForm();

            await fetchStudents();

        } catch (error) {
            console.error("SAVE STUDENT ERROR:", error);

            notify(
                "error",
                "Unable to save student: " + error.message
            );
        } finally {
            setLoading(false);
        }
    };

    // EDIT STUDENT
    const handleEdit = (student) => {
        setForm({
            studentId: student.studentId || "",
            fullName: student.fullName || "",
            gender: student.gender || "",
            dateOfBirth: student.dateOfBirth
                ? String(student.dateOfBirth).slice(0, 10)
                : "",
            phone: student.phone || "",
            email: student.email || "",
            address: student.address || "",
            program: student.program || "",
            level: student.level || ""
        });

        setEditingId(student.id);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // CANCEL EDIT
    const handleCancelEdit = () => {
        resetForm();
    };

    // DELETE STUDENT
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmed) return;

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(response)
                );
            }

            notify("success", "Student deleted successfully!");

            await fetchStudents();

        } catch (error) {
            console.error("DELETE ERROR:", error);

            notify(
                "error",
                "Unable to delete student: " + error.message
            );
        } finally {
            setLoading(false);
        }
    };

    // SEARCH STUDENTS
    const handleSearch = async () => {
        const query = search.trim();

        if (!query) {
            await fetchStudents();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/search?q=${encodeURIComponent(query)}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    await getErrorMessage(response)
                );
            }

            const results = await response.json();

            setStudents(results);

            if (results.length === 0) {
                notify("error", "No matching student found.");
            } else {
                notify(
                    "success",
                    `${results.length} student(s) found.`
                );
            }

        } catch (error) {
            console.error("SEARCH ERROR:", error);

            notify(
                "error",
                "Search failed: " + error.message
            );
        } finally {
            setLoading(false);
        }
    };

    // CLEAR SEARCH
    const handleClear = async () => {
        setSearch("");
        await fetchStudents();
    };

    // FORMAT DATE
    const formatDate = (date) => {
        if (!date) return "";

        return String(date).slice(0, 10);
    };

    return (
        <div className="container">

            <h1>Student Registration System</h1>

            <p className="subtitle">
                Manage student registration records
            </p>

            {/* STATUS MESSAGE */}
            <div className="status">
                {message && (
                    <div className={`alert ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {loading && (
                    <p className="loading">
                        Processing, please wait...
                    </p>
                )}
            </div>

            {/* REGISTRATION FORM */}
            <form className="card" onSubmit={handleSubmit}>

                <h2>
                    {editingId !== null
                        ? "Update Student"
                        : "Register Student"}
                </h2>

                <div className="grid">

                    <input
                        name="studentId"
                        placeholder="Student ID"
                        value={form.studentId}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="fullName"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>

                    <input
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="address"
                        placeholder="Address"
                        value={form.address}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="program"
                        placeholder="Program / Track"
                        value={form.program}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="level"
                        value={form.level}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Level</option>
                        <option value="Level 3">Level 3</option>
                        <option value="Level 4">Level 4</option>
                        <option value="Level 5">Level 5</option>
                    </select>

                </div>

                <div className="actions">

                    <button type="submit" disabled={loading}>
                        {loading
                            ? "Processing..."
                            : editingId !== null
                            ? "Update Student"
                            : "Register Student"}
                    </button>

                    {editingId !== null && (
                        <button
                            type="button"
                            className="secondary"
                            onClick={handleCancelEdit}
                        >
                            Cancel
                        </button>
                    )}

                </div>

            </form>

            {/* STUDENT LIST */}
            <div className="card">

                <div className="list-header">

                    <h2>
                        Registered Students ({students.length})
                    </h2>

                    <div className="search-box">

                        <input
                            className="search"
                            placeholder="Search by name, ID or email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                        />

                        <button
                            type="button"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            className="secondary"
                            onClick={handleClear}
                            disabled={loading}
                        >
                            Clear
                        </button>

                    </div>

                </div>

                {/* STUDENT TABLE */}
                <div className="table-wrap">

                    <table>

                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>Student ID</th>
                                <th>Full Name</th>
                                <th>Gender</th>
                                <th>Date of Birth</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Program</th>
                                <th>Level</th>
                            </tr>
                        </thead>

                        <tbody>

                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="empty">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id}>

                                        <td>
                                            <div className="row-actions">

                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(student)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="danger"
                                                    onClick={() => handleDelete(student.id)}
                                                    disabled={loading}
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>

                                        <td>{student.studentId}</td>
                                        <td>{student.fullName}</td>
                                        <td>{student.gender}</td>
                                        <td>{formatDate(student.dateOfBirth)}</td>
                                        <td>{student.phone}</td>
                                        <td>{student.email}</td>
                                        <td>{student.address}</td>
                                        <td>{student.program}</td>
                                        <td>{student.level}</td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}
