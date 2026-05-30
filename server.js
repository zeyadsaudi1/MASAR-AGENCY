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

// Auth: Register (مسار تسجيل حساب طالب جديد)
app.post('/api/register', async (req, res) => {
    try {
        const { username, firstName, lastName, birthDate, phone, parentPhone, nationalId, governorate, grade, section, secondLanguage, password } = req.body;
        
        if(!username || !firstName || !lastName || !phone || !nationalId || !password) {
            return res.status(400).json({ success: false, message: 'الرجاء ملء جميع الحقول المطلوبة' });
        }

        const phoneRegex = /^01[0125]\d{8}$/;
        if (!phoneRegex.test(phone) || (parentPhone && !phoneRegex.test(parentPhone))) {
            return res.status(400).json({ success: false, message: 'رقم الهاتف غير صحيح' });
        }

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

// Auth: Login (مسار تسجيل دخول الطلاب والمشرف المخصص)
app.post('/api/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        // التحقق من حساب الأدمن المخصص الخاص بك
        if(phone === '01556448880' && password === 'masar2027@agency') {
            return res.json({ success: true, user: { _id: "admin-master-id", role: 'admin', firstName: 'الإدارة', lastName: '', phone: '01556448880' } });
        }

        const user = await User.findOne({ phone, password });
        if (!user) {
            return res.status(401).json({ success: false, message: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تسجيل الدخول' });
    }
});

// مسار متابعة وإلغاء متابعة المعلم
app.post('/api/users/:id/follow', async (req, res) => {
    try {
        const { teacherId } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        
        if (!user.followedTeachers) user.followedTeachers = [];
        
        const index = user.followedTeachers.indexOf(teacherId);
        let isFollowing = false;
        
        if (index > -1) {
            user.followedTeachers.splice(index, 1); // إلغاء المتابعة
        } else {
            user.followedTeachers.push(teacherId); // تفعيل المتابعة
            isFollowing = true;
        }
        
        await user.save();
        res.json({ success: true, isFollowing, followedTeachers: user.followedTeachers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث المتابعة' });
    }
});

// مسار تفعيل كود الشحن والاشتراك الفوري في المحاضرة
app.post('/api/users/:id/subscribe', async (req, res) => {
    try {
        const { codeStr, videoId } = req.body;
        
        // 1. التحقق من كود الشحن وصلاحيته لهذا الفيديو
        const code = await Code.findOne({ code: codeStr, videoId });
        if (!code) {
            return res.status(404).json({ success: false, message: 'كود الشحن غير صحيح أو لا يخص هذه المحاضرة' });
        }
        if (code.views >= 3) {
            return res.status(400).json({ success: false, message: 'انتهت عدد المشاهدات المسموحة لهذا الكود (3 مرات كحد أقصى)' });
        }
        if (code.studentId && code.studentId.toString() !== req.params.id) {
            return res.status(403).json({ success: false, message: 'كود الشحن مستخدم بالفعل بواسطة طالب آخر' });
        }

        // 2. تحديث بيانات المستخدم (إضافة المحاضرة لكورسات الطالب)
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        
        if (!user.subscribedVideos) user.subscribedVideos = [];
        if (!user.subscribedVideos.includes(videoId)) {
            user.subscribedVideos.push(videoId);
        }
        
        // 3. ربط الكود بالطالب وزيادة الـ views
        code.views += 1;
        code.used = true;
        code.studentId = req.params.id;
        
        await Promise.all([user.save(), code.save()]);
        res.json({ success: true, remainingViews: 3 - code.views, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء تفعيل الاشتراك' });
    }
});

// مسار التحقق من الكود والمشاهدة الآمنة
app.post('/api/codes/verify', async (req, res) => {
    try {
        const { codeStr, videoId, studentId } = req.body;
        
        // 0. التحقق من حالة قفل المحاضرة أولاً
        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ success: false, message: 'المحاضرة غير موجودة' });
        if (video.closed) {
            return res.status(403).json({ success: false, message: 'هذه المحاضرة مغلقة حالياً بواسطة الإدارة' });
        }

        // 1. إذا كان الطالب مشتركاً بالفعل في هذه المحاضرة، نسمح له بالمرور الفوري دون كود
        if (studentId) {
            const user = await User.findById(studentId);
            if (user && user.subscribedVideos && user.subscribedVideos.includes(videoId)) {
                return res.json({ success: true, remainingViews: 'مفتوحة دائماً', alreadySubscribed: true });
            }
        }

        // 2. إذا لم يكن مشتركاً، نطالبه بالتحقق من كود الشحن
        if (!codeStr) {
            return res.status(400).json({ success: false, message: 'يرجى إدخال كود الشحن لتفعيل الاشتراك' });
        }

        const code = await Code.findOne({ code: codeStr, videoId });
        if (!code) {
            return res.status(404).json({ success: false, message: 'كود غير صحيح' });
        }
        if (code.views >= 3) {
            return res.status(400).json({ success: false, message: 'انتهت عدد المشاهدات المسموحة' });
        }
        if (code.studentId && code.studentId.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'كود مستخدم من طالب آخر' });
        }

        // تفعيل الاشتراك الدائم للطالب في الداتابيز ليراها في بروفايله وتفتح له دائماً
        if (studentId) {
            const user = await User.findById(studentId);
            if (user) {
                if (!user.subscribedVideos) user.subscribedVideos = [];
                if (!user.subscribedVideos.includes(videoId)) {
                    user.subscribedVideos.push(videoId);
                    await user.save();
                }
            }
        }

        code.views += 1;
        code.used = true;
        if (!code.studentId && studentId) code.studentId = studentId;
        await code.save();

        res.json({ success: true, remainingViews: 3 - code.views, code });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء التحقق' });
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

app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ في حذف الطالب' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json({ success: true, user: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ في تحديث بيانات الطالب' });
    }
});

// مسار قفل وفتح المحاضرة
app.put('/api/videos/:id/toggle', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ success: false, message: 'المحاضرة غير موجودة' });
        video.closed = !video.closed; // عكس الحالة الحالية
        await video.save();
        res.json({ success: true, closed: video.closed });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ في تعديل حالة الفيديو' });
    }
});

// مسار تعديل بيانات المحاضرة الأساسية
app.put('/api/videos/:id', async (req, res) => {
    try {
        const { title, price, link } = req.body;
        const video = await Video.findByIdAndUpdate(req.params.id, { title, price, link }, { new: true });
        if (!video) return res.status(404).json({ success: false, message: 'المحاضرة غير موجودة' });
        res.json({ success: true, video });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ في التعديل' });
    }
});

// مسار حذف المحاضرة نهائياً
app.delete('/api/videos/:id', async (req, res) => {
    try {
        await Video.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'حدث خطأ في الحذف' });
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
        const { title, link, price, grades, teacherId } = req.body;
        const imageFile = req.files['image'] ? req.files['image'][0] : null;
        const videoFile = req.files['video'] ? req.files['video'][0] : null;

        const imagePath = imageFile ? `/uploads/${imageFile.filename}` : req.body.image;
        const gradesArray = grades ? (Array.isArray(grades) ? grades : grades.split(",").map(g => g.trim())) : [];
        const videoPath = videoFile ? `/uploads/${videoFile.filename}` : '';

        const newVideo = new Video({
            title, 
            link, 
            price, 
            imagePath, 
            videoPath, 
            grades: gradesArray, 
            teacherId: teacherId || null // حفظ معرف المعلم هنا
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
            const codeStr = 'MS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            newCodes.push({ code: codeStr, videoId, videoTitle, value });
        }
        const savedCodes = await Code.insertMany(newCodes);
        res.status(201).json({ success: true, codes: savedCodes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'حدث خطأ' });
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
        if (grades) gradesArray = Array.isArray(grades) ? grades : grades.split(',').map(g => g.trim());
        const newTeacher = new Teacher({ name, subjectAr, bio, imagePath, grades: gradesArray });
        await newTeacher.save();
        res.status(201).json({ success: true, teacher: newTeacher });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في إضافة المعلم' });
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

// التقارير الأمنية
const reportsFile = path.join(__dirname, 'security-reports.json');
let securityReports = [];
try {
  if (fs.existsSync(reportsFile)) securityReports = JSON.parse(fs.readFileSync(reportsFile, 'utf8'));
} catch (e) { securityReports = []; }

app.post('/api/security/report', (req, res) => {
  const report = { ...req.body, serverTimestamp: new Date().toISOString(), ip: req.ip };
  securityReports.push(report);
  try {
    fs.writeFileSync(reportsFile, JSON.stringify(securityReports, null, 2), 'utf8');
  } catch (e) { console.error(e); }
  res.json({ success: true });
});

app.get('/api/security/reports', (req, res) => res.json(securityReports));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`🚀 الخادم يعمل على: http://localhost:${port}`));