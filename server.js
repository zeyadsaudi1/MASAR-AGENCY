require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 الخادم يعمل على: http://localhost:${port}`);
});



