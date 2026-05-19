require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Models
const User = require('./models/user.model');
const Video = require('./models/video.model');
const Code = require('./models/code.model');
const Teacher = require('./models/teacher.model');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

// Database Connection
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('✅ تم الاتصال بقاعدة بيانات MongoDB بنجاح');
}).catch(err => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err);
});

// ================= API ROUTES =================

// Auth: Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, firstName, lastName, birthDate, phone, parentPhone, nationalId, governorate, grade, section, secondLanguage, password } = req.body;
        
        // Basic validation
        if(!username || !firstName || !lastName || !phone || !nationalId || !password) {
            return res.status(400).json({ success: false, message: 'الرجاء ملء جميع الحقول المطلوبة' });
        }

        // Egyptian phone validation
        const phoneRegex = /^01[0125]\d{8}$/;
        if (!phoneRegex.test(phone) || (parentPhone && !phoneRegex.test(parentPhone))) {
            return res.status(400).json({ success: false, message: 'رقم الهاتف أو رقم هاتف ولي الأمر غير صحيح. يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ phone }, { nationalId }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'رقم الهاتف، الرقم القومي أو اسم المستخدم مسجل مسبقاً' });
        }

        const newUser = new User({
            username, firstName, lastName, birthDate, phone, parentPhone, nationalId, governorate, grade, section, secondLanguage, password
        });

        await newUser.save();
        res.status(201).json({ success: true, user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء التسجيل' });
    }
});

// Auth: Login
app.post('/api/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        // Admin hardcoded check
        if(phone === '01234567890' && password === 'admin') {
            return res.json({ success: true, user: { role: 'admin', name: 'Admin' } });
        }

        const user = await User.findOne({ phone, password }); // Note: Using plain text for simplicity per original design, but bcrypt is recommended.
        if (!user) {
            return res.status(401).json({ success: false, message: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
    }
});

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ' });
    }
});

// Videos
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ' });
    }
});

app.post('/api/videos', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, link, price } = req.body;
        const imageFile = req.files['image'] ? req.files['image'][0] : null;
        const videoFile = req.files['video'] ? req.files['video'][0] : null;

        const imagePath = imageFile ? `/uploads/${imageFile.filename}` : req.body.image; // Fallback to base64 if sent
        const videoPath = videoFile ? `/uploads/${videoFile.filename}` : '';

        const newVideo = new Video({
            title, link, price, imagePath, videoPath
        });

        await newVideo.save();
        res.status(201).json({ success: true, video: newVideo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء رفع الفيديو' });
    }
});

app.get('/api/videos/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ success: false, message: 'الفيديو غير موجود' });
        res.json({ success: true, video });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الفيديو' });
    }
});

// Codes
app.get('/api/codes', async (req, res) => {
    try {
        const codes = await Code.find().sort({ createdAt: -1 });
        res.json(codes);
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ' });
    }
});

app.post('/api/codes/generate', async (req, res) => {
    try {
        const { videoId, videoTitle, count, value } = req.body;
        const newCodes = [];
        for (let i = 0; i < count; i++) {
            // Generate a random 8-character alphanumeric code
            const codeStr = 'MS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            newCodes.push({ code: codeStr, videoId, videoTitle, value });
        }
        const savedCodes = await Code.insertMany(newCodes);
        res.status(201).json({ success: true, codes: savedCodes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء توليد الأكواد' });
    }
});

app.put('/api/codes/:id', async (req, res) => {
    try {
        const { used } = req.body;
        await Code.findByIdAndUpdate(req.params.id, { used });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ' });
    }
});

app.delete('/api/codes/:id', async (req, res) => {
    try {
        await Code.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ' });
    }
});

app.delete('/api/codes', async (req, res) => {
    try {
        await Code.deleteMany({});
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ' });
    }
});

// Verify Code (for watching video)
app.post('/api/codes/verify', async (req, res) => {
    try {
        const { codeStr, videoId, studentId } = req.body;
        const code = await Code.findOne({ code: codeStr, videoId });
        
        if (!code) {
            return res.status(404).json({ success: false, message: 'كود غير صحيح' });
        }
        
        if (code.views >= 3) {
            return res.status(400).json({ success: false, message: 'انتهت عدد المشاهدات المسموحة (3 مرات كحد أقصى)' });
        }

        // Check if code was used by a different student (optional logic: bind code to first student who uses it)
        if (code.studentId && code.studentId.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'هذا الكود مستخدم بواسطة طالب آخر' });
        }

        // Update code
        code.views += 1;
        code.used = true;
        if (!code.studentId && studentId) {
            code.studentId = studentId;
        }
        await code.save();

        res.json({ success: true, remainingViews: 3 - code.views, code });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء التحقق' });
    }
});


// Teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ' });
    }
});

app.post('/api/teachers', upload.single('image'), async (req, res) => {
    try {
        const { name, subjectAr, bio, grades } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
        
        let gradesArray = [];
        if (grades) {
            gradesArray = Array.isArray(grades) ? grades : grades.split(',').map(g => g.trim());
        }

        const newTeacher = new Teacher({
            name, subjectAr, bio, imagePath, grades: gradesArray
        });
        await newTeacher.save();
        res.status(201).json({ success: true, teacher: newTeacher });
    } catch (err) {
        console.error('Teacher add error:', err);
        if (err.message && err.message.includes('buffering timed out')) {
            res.status(500).json({ success: false, message: 'فشل الاتصال بقاعدة البيانات. يرجى التأكد من السماح للـ IP في إعدادات MongoDB Atlas أو تشغيل VPN.' });
        } else {
            res.status(500).json({ success: false, message: 'حدث خطأ أثناء إضافة المعلم' });
        }
    }
});

app.delete('/api/teachers/:id', async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ' });
    }
});

// ─── Security Violation Reports ───
const reportsFile = path.join(__dirname, 'security-reports.json');

// تحميل التقارير الموجودة
let securityReports = [];
try {
  if (fs.existsSync(reportsFile)) {
    securityReports = JSON.parse(fs.readFileSync(reportsFile, 'utf8'));
  }
} catch (e) {
  securityReports = [];
}

// استقبال بلاغات الأمان
app.post('/api/security/report', (req, res) => {
  const report = {
    ...req.body,
    serverTimestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress
  };

  securityReports.push(report);

  // حفظ في ملف JSON
  try {
    fs.writeFileSync(reportsFile, JSON.stringify(securityReports, null, 2), 'utf8');
  } catch (e) {
    console.error('❌ خطأ في حفظ التقرير:', e.message);
  }

  console.log(`🛡️ [تحذير أمني] ${report.reason} - المستخدم: ${report.userId} - الفيديو: ${report.videoId}`);

  res.json({ success: true, message: 'تم استلام البلاغ' });
});

// عرض التقارير (للأدمن فقط)
app.get('/api/security/reports', (req, res) => {
  res.json(securityReports);
});

// Fallback routing for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 الخادم يعمل على: http://localhost:${port}`);
});
