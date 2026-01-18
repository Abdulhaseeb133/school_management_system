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
const UPLOAD_DIR = path.join(__dirname, 'uploads', 'teacher');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ serve uploaded files (optional but useful)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ✅ multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const teacherid = req.params.teacherid;
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeExt = ext || '.jpg';
        cb(null, `teacher_${teacherid}_${Date.now()}${safeExt}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
        if (!ok) return cb(new Error('Only JPG/PNG/WebP images are allowed'));
        cb(null, true);
    }
});

// ------------------ TEACHER ROUTES ------------------

// Get all teachers with pagination and search









