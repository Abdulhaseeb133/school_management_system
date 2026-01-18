require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
//const auth = require('./auth.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(bodyParser.json());
const verifyToken = require('./auth');
const allowRoles = require('./roleAuth');

// ✅ ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'students');
const UPLOAD_DIR2 = path.join(__dirname, 'uploads', 'teachers');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR2, { recursive: true });

// ✅ serve uploaded files (optional but useful)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const commonMulterOptions = {
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
        if (!ok) return cb(new Error('Only JPG/PNG/WebP images are allowed'));
        cb(null, true);
    }
};

// Student upload (prefix: student_)
const studentStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const studentid = req.params.studentid;
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeExt = ext || '.jpg';
        cb(null, `student_${studentid}_${Date.now()}${safeExt}`);
    }
});
const uploadStudent = multer({ storage: studentStorage, ...commonMulterOptions });

// Teacher upload (prefix: teacher_)
const teacherStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR2),
    filename: (req, file, cb) => {
        const teacherid = req.params.teacherid;
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeExt = ext || '.jpg';
        cb(null, `teacher_${teacherid}_${Date.now()}${safeExt}`);
    }
});
const uploadTeacher = multer({ storage: teacherStorage, ...commonMulterOptions });




function checkDbConnection() {
    db.query("SELECT 1", (error) => {
        if (error) {
            console.error("Unable to connect to the database:", error);
        } else {
            console.log("Database connection successful!");
        }
    });
}

checkDbConnection();


app.post('/login', (req, res) => {
    const { username, password, role } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Server error", error: err.message });
        }

        if (data.length === 0) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const user = data[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            {
                userid: user.userid,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            message: "Login successful",
            token,
            email: user.email

        });
    });
});

app.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    // 1️⃣ Validate input
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Username, email and password are required"
        });
    }

    try {
        // 2️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3️⃣ Insert user
        const sql = `
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [username, email, hashedPassword, role || 'user'],
            (error, result) => {
                if (error) {
                    // Duplicate username/email
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({
                            message: "Username or email already exists"
                        });
                    }
                    return res.status(500).json({ message: "Server error", error: error.message });
                }

                res.status(201).json({
                    message: "User registered successfully",
                    userid: result.insertId
                });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
/*
app.get("/student/:id", (req, res) => {
    const studentId = req.params.id;

    const sql = "SELECT * FROM students WHERE id = ?";

    db.query(sql, [studentId], (err, result) => {
        if (err) {
            return res.json({ message: "Database error" });
        }

        if (result.length === 0) {
            return res.json({ message: "Student not found" });
        }

        res.json(result[0]);
    });
});
*/
app.get('/areas', verifyToken, allowRoles('student'), (req, res) => {
    db.query(
        'SELECT areaid, areaname FROM area',
        (error, rows) => {
            if (error) {
                console.error('Error fetching areas:', error);
                return res.status(500).json({ error: 'Failed to fetch areas' });
            }
            res.json(rows);
        }
    );
}
);
app.get('/admin/dashboard', verifyToken, allowRoles('admin'), (req, res) => {
    res.json({
        message: 'Welcome Admin',
        user: req.user
    });
}
);

app.get('/students', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const name = req.query.name;
    const rollno = req.query.rollno;
    const areaid = req.query.areaid;


    const limit = 10;
    const offset = (page - 1) * limit;


    let query = `
        SELECT s.*, a.areaname 
        FROM students s
        LEFT JOIN area a
        ON a.areaid = s.areaid
        WHERE 1=1
    `;

    let params = [];

    if (name) {
        query += ` AND (
            firstname LIKE ?
            OR lastname LIKE ?
            OR fathername LIKE ?
        )`;
        const search = `%${name}%`;
        params.push(search, search, search);
    }

    if (rollno) {
        query += " AND rollno = ?";
        params.push(rollno);
    }

    if (areaid) {
        query += " AND a.areaid = ?";
        params.push(areaid);
    }
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);


    db.query(query, params, (err, students) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Fetch total number of records
        const sqlTotal = 'SELECT COUNT(*) AS total FROM students';
        db.query(sqlTotal, (err2, totalResult) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const total = totalResult[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                data: students,
                totalRecords: total,
                currentPage: page,
                totalPages: totalPages
            });
        });
    });
});

app.get('/country', (req, res) => {
    db.query(
        "select countryid, countryname from country",
        (error, country) => {
            if (error) {
                console.error("Error fetching country:", error);
                return res.status(500).json({ error: "Failed to fetch country" });
            }
            res.json(country);
        }
    );
});

app.get('/state/:countryid', (req, res) => {
    const { countryid } = req.params;

    db.query('select stateid, statename from state where countryid = ?', [countryid], (error, rows) => {
        if (error) {
            console.error('Error fetching state:', error);
            return res.status(500).json({ error: 'Failed to fetch state' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'State not found' });
        }

        res.json(rows);
    });
});
app.get('/city/:stateid', (req, res) => {
    const { stateid } = req.params;

    db.query('select cityid, cityname from city where stateid = ?', [stateid], (error, rows) => {
        if (error) {
            console.error('Error fetching City:', error);
            return res.status(500).json({ error: 'Failed to fetch City' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'City not found' });
        }

        res.json(rows);
    });
});
app.get('/area/:cityid', (req, res) => {
    const { cityid } = req.params;

    db.query('select areaid, areaname from area where cityid = ?', [cityid], (error, rows) => {
        if (error) {
            console.error('Error fetching Area:', error);
            return res.status(500).json({ error: 'Failed to fetch Area' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Area not found' });
        }

        res.json(rows);
    });
});
app.get('/area', (req, res) => {
    db.query(
        "select a.areaid, a.areaname from area a",
        (error, area) => {
            if (error) {
                console.error("Error fetching area:", error);
                return res.status(500).json({ error: "Failed to fetch area" });
            }
            res.json(area);
        }
    );
});
// Add a new student
app.post('/students', (req, res) => {
    const { rollno, email, firstname, lastname, fathername, class2, age, marks, fees, admission_year, areaid, gender, phone_number } = req.body;

    db.query(
        'INSERT INTO students (rollno, email, firstname, lastname, fathername, class2, age, marks, fees, admission_year, areaid, gender, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [rollno, email, firstname, lastname, fathername, class2, age, marks, fees, admission_year, areaid, gender, phone_number],
        (error, result) => {
            if (error) {
                console.error('Error adding student:', error);

                // Handle duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Student with this roll number or email already exists' });
                }

                return res.status(500).json({ error: 'Failed to add student' });
            }

            res.status(201).json({
                message: 'Student added successfully',
                studentid: result.insertId,
                rollno,
                email,
                firstname,
                lastname,
                fathername,
                class2,
                age,
                marks,
                fees,
                admission_year,
                areaid,
                gender,
                phone_number
            });
        }
    );
});

// Delete a student by ID
app.delete('/students/:studentid', (req, res) => {
    const { studentid } = req.params;

    db.query('DELETE FROM students WHERE studentid = ?', [studentid], (error, result) => {
        if (error) {
            console.error('Error deleting student:', error);
            return res.status(500).json({ error: 'Failed to delete student' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    });
});
// Get a student by ID
app.get('/students/:studentid', (req, res) => {
    const { studentid } = req.params;

    db.query(`select s.*, a.areaid,c.cityid,st.stateid,ct.countryid from students s 
            left join area a 
            on a.areaid=s.areaid
            left join city c 
            on c.cityid= a.cityid
            left join state st 
            on st.stateid=c.stateid
            left join country ct 
            on ct.countryid=st.countryid
            WHERE s.studentid = ?`, [studentid], (error, rows) => {
        if (error) {
            console.error('Error fetching student:', error);
            return res.status(500).json({ error: 'Failed to fetch student' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(rows[0]);
    });
});
// Update a student by ID
app.put('/students/:studentid', (req, res) => {
    const { studentid } = req.params;
    const { rollno, email, firstname, lastname, fathername, class2, age, marks, fees, admission_year, areaid, gender, phone_number } = req.body;

    db.query(
        'UPDATE students SET rollno = ?, email = ?, firstname = ?, lastname = ?, fathername = ?, class2 = ?, age = ?, marks = ?, fees = ?, admission_year = ?, areaid = ?, gender = ?, phone_number = ? WHERE studentid = ?',
        [rollno, email, firstname, lastname, fathername, class2, age, marks, fees, admission_year, areaid, gender, phone_number, studentid],
        (error, result) => {
            if (error) {
                console.error('Error updating student:', error);
                return res.status(500).json({ error: 'Failed to update student' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.json({ message: 'Student updated successfully' });
        }
    );
});

// ✅ Upload student profile picture (file field name: "photo")
app.post('/students/:studentid/profile-picture', uploadStudent.single('photo'), (req, res) => {
    const { studentid } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Use form-data field name "photo".' });
    }

    // store a URL-like path (so frontend can load it)
    const profilePicturePath = `/uploads/students/${req.file.filename}`;

    // check student exists first
    db.query('SELECT studentid FROM students WHERE studentid = ?', [studentid], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err.message });
        if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });

        // update student record
        db.query(
            'UPDATE students SET profile_picture = ? WHERE studentid = ?',
            [profilePicturePath, studentid],
            (err2) => {
                if (err2) return res.status(500).json({ message: 'Server error', error: err2.message });

                res.status(200).json({
                    message: 'Profile picture uploaded successfully',
                    studentid,
                    profile_picture: profilePicturePath
                });
            }
        );
    });
});

// Get all teachers with pagination and search

// ------------------ TEACHER ROUTES ------------------


app.get('/teachers', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const name = req.query.name;


    const limit = 10;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM teacher WHERE 1=1";

    let params = [];

    if (name) {
        query += ` AND (      
            firstname LIKE ?
            OR lastname LIKE ?
            OR fathername LIKE ?
        )`;
        const search = `%${name}%`;
        params.push(search, search, search);
    }



    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);


    db.query(query, params, (err, teachers) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Fetch total number of records
        const sqlTotal = 'SELECT COUNT(*) AS total FROM teacher WHERE 1=1';
        db.query(sqlTotal, (err2, totalResult) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const total = totalResult[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                data: teachers,
                totalRecords: total,
                currentPage: page,
                totalPages: totalPages
            });
        });
    });
});


// Add a new teacher
app.post('/teacher', (req, res) => {
    const { firstname, lastname, fathername, email, phone_number, qualification, subject, gender } = req.body;

    db.query(
        'INSERT INTO teacher (firstname,lastname,fathername,email,phone_number,qualification,subject,gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [firstname, lastname, fathername, email, phone_number, qualification, subject, gender],
        (error, result) => {
            if (error) {
                console.error('Error adding teacher:', error);

                // Handle duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Teacher with this email already exists' });
                }

                return res.status(500).json({ error: 'Failed to add teacher' });
            }

            res.status(201).json({
                message: 'Teacher added successfully',
                teacherid: result.insertId,
                firstname,
                lastname,
                fathername,
                email,
                phone_number,
                qualification,
                subject,
                gender
            });
        }
    );
});

// Delete a teacher by ID
app.delete('/teachers/:teacherid', (req, res) => {
    const { teacherid } = req.params;

    db.query('DELETE FROM teacher WHERE teacherid = ?', [teacherid], (error, result) => {
        if (error) {
            console.error('Error deleting teacher:', error);
            return res.status(500).json({ error: 'Failed to delete teacher' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json({ message: 'Teacher deleted successfully' });
    });
});

app.get("/teacher/:teacherid", (req, res) => {
    const { teacherid } = req.params;


    const sql = "SELECT * FROM teacher WHERE teacherid = ?";

    db.query(sql, [teacherid], (err, result) => {
        if (err) {
            return res.json({ message: "Database error" });
        }

        if (result.length === 0) {
            return res.json({ message: "Teacher not found" });
        }

        res.json(result[0]);
    });
});


// Update a teacher by ID
app.put('/teachers/:teacherid', (req, res) => {
    const { teacherid } = req.params;
    const { firstname, lastname, fathername, email, phone_number, qualification, subject, gender } = req.body;

    db.query(
        'UPDATE teacher SET firstname = ?, lastname = ?, fathername = ?, email = ?, phone_number = ?, qualification = ?, subject = ?, gender = ? WHERE teacherid = ?',
        [firstname, lastname, fathername, email, phone_number, qualification, subject, gender, teacherid],
        (error, result) => {
            if (error) {
                console.error('Error updating teacher:', error);
                return res.status(500).json({ error: 'Failed to update teacher' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Teacher not found' });
            }

            res.json({ message: 'Teacher updated successfully' });
        }
    );
});

// ✅ Upload teacher profile picture (file field name: "photo")
app.post('/teacher/:teacherid/profile-picture', uploadTeacher.single('photo'), (req, res) => {
    const { teacherid } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Use form-data field name "photo".' });
    }

    // store a URL-like path (so frontend can load it)
    const profilePicturePath = `/uploads/teachers/${req.file.filename}`;

    // check teacher exists first
    db.query('SELECT teacherid FROM teacher WHERE teacherid = ?', [teacherid], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err.message });
        if (rows.length === 0) return res.status(404).json({ message: 'Teacher not found' });

        // update teacher record
        db.query(
            'UPDATE teacher SET profile_picture = ? WHERE teacherid = ?',
            [profilePicturePath, teacherid],
            (err2) => {
                if (err2) return res.status(500).json({ message: 'Server error', error: err2.message });

                res.status(200).json({
                    message: 'Profile picture uploaded successfully',
                    teacherid: teacherid,
                    profile_picture: profilePicturePath
                });
            }
        );
    });
});

//-----------------------------SUBJECT ROUTES-----------------------------


app.get('/subject', (req, res) => {
    db.query(
        "select * from subjects",
        (error, subjects) => {
            if (error) {
                console.error("Error fetching subjects:", error);
                return res.status(500).json({ error: "Failed to fetch subjects" });
            }
            res.json(subjects);
        }
    );
});
// Add a new subject
app.post('/subject', (req, res) => {
    const { subjectname, subjectcode, description, created_at } = req.body;

    db.query(
        'INSERT INTO subjects (subjectname, subjectcode, description, created_at) VALUES (?, ?, ?, ?)',
        [subjectname, subjectcode, description, created_at],
        (error, result) => {
            if (error) {
                console.error('Error adding subject:', error);

                // Handle duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Subject with this code already exists' });
                }

                return res.status(500).json({ error: 'Failed to add subject' });
            }

            res.status(201).json({
                message: 'Subject added successfully',
                subjectid: result.insertId,
                subjectname,
                subjectcode,
                description,
                created_at
            });
        }
    );
});

// Delete a subject by ID
app.delete('/subject/:subjectid', (req, res) => {
    const { subjectid } = req.params;


    db.query('DELETE FROM subjects WHERE subjectid = ?', [subjectid], (error, result) => {
        if (error) {
            console.error('Error deleting subject:', error);
            return res.status(500).json({ error: 'Failed to delete subject' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json({ message: 'Subject  deleted successfully' });
    });
});

app.get("/subject/:subjectid", (req, res) => {
    const { subjectid } = req.params;


    const sql = "SELECT * FROM subjects WHERE subjectid = ?";
    db.query(sql, [subjectid], (err, result) => {
        if (err) {
            return res.json({ message: "Database error" });
        }

        if (result.length === 0) {
            return res.json({ message: "Subject not found" });
        }

        res.json(result[0]);
    });
});


// Update a subject by ID
app.put('/subject/:subjectid', (req, res) => {
    const { subjectid } = req.params;
    const { subjectname, subjectcode, description, created_at } = req.body;

    db.query(
        'UPDATE subjects SET subjectname = ?, subjectcode = ?, description = ?, created_at = ? WHERE subjectid = ?',
        [subjectname, subjectcode, description, created_at, subjectid],
        (error, result) => {
            if (error) {
                console.error('Error updating subject:', error);
                return res.status(500).json({ error: 'Failed to update subject' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Subject not found' });
            }

            res.json({ message: 'Subject updated successfully' });
        }
    );
});

//-----------------------------TEACHER_SUBJECTROUTES-----------------------------

app.get('/teacher_subject', (req, res) => {
    const { teacher_subject } = req.params;

    db.query(` select ts.id, concat(t.firstname, ' ' ,t.lastname) as teacher_name ,s.subjectname from teacher_subject ts
                inner join teacher t 
                on ts.teacherid=t.teacherid
                inner join subjects s 
                on ts.subjectid=s.subjectid `, [teacher_subject], (error, rows) => {
        if (error) {
            console.error('Error fetching teacher_subject:', error);
            return res.status(500).json({ error: 'Failed to fetch teacher_subject' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'teacher_subject not found' });
        }

        res.json(rows);
    });
});

// Add a new subject
app.post('/teacher_subject', (req, res) => {
    const { id, teacherid, subjectid, assigned_at } = req.body;

    db.query(
        'INSERT INTO teacher_subject (id, teacherid, subjectid, assigned_at) VALUES (?, ?, ?, ?)',
        [id, teacherid, subjectid, assigned_at],
        (error, result) => {
            if (error) {
                console.error('Error adding teacher_subject:', error);

                // Handle duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Teacher_subject with this id already exists' });
                }

                return res.status(500).json({ error: 'Failed to add teacher_subject' });
            }

            res.status(201).json({
                message: 'Teacher_subject added successfully',
                id: result.insertId,
                teacherid,
                subjectid,
                assigned_at
            });
        }
    );
});

app.delete('/teacher_subject/:id', (req, res) => {
    const { id } = req.params;


    db.query('DELETE FROM teacher_subject WHERE id = ?', [id], (error, result) => {
        if (error) {
            console.error('Error deleting teacher_subject:', error);
            return res.status(500).json({ error: 'Failed to delete teacher_subject' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Teacher_subject not found' });
        }

        res.json({ message: 'assigned teacher deleted successfully' });
    });
});

app.get('/teacherdd', (req, res) => {
    db.query(
        "select teacherid, concat(firstname, ' ', lastname) as name from teacher",
        (error, teachers) => {
            if (error) {
                console.error("Error fetching teachers:", error);
                return res.status(500).json({ error: "Failed to fetch teachers" });
            }
            res.json(teachers);
        }
    );
});


app.get('/subjectdd', (req, res) => {
    db.query(
        "select subjectid, subjectname from subjects",
        (error, subjects) => {
            if (error) {
                console.error("Error fetching subjects:", error);
                return res.status(500).json({ error: "Failed to fetch subjects" });
            }
            res.json(subjects);
        }
    );
});
// ------------------ START SERVER ------------------


app.listen(3000, () => {
    console.log("Server running on port 3000");
});