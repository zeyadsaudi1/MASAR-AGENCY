const themeButtons = document.querySelectorAll('.theme-switcher');

let videos = [];
let codes = [];
let users = [];
const API_URL = 'http://localhost:3000';

let teachers = [];

// تحميل البيانات من قاعدة البيانات عند بدء التطبيق
async function loadDataFromDB() {
    try {
        const videoRes = await fetch(`${API_URL}/api/videos`);
        const codeRes = await fetch(`${API_URL}/api/codes`);
        const userRes = await fetch(`${API_URL}/api/users`);
        const teacherRes = await fetch(`${API_URL}/api/teachers`);
        
        videos = await videoRes.json();
        codes = await codeRes.json();
        users = await userRes.json();
        teachers = await teacherRes.json();
    } catch (err) {
        console.log('البيانات ستحمل من localStorage في الوقت الحالي');
        videos = JSON.parse(localStorage.getItem('videos')) || [];
        codes = JSON.parse(localStorage.getItem('codes')) || [];
        users = JSON.parse(localStorage.getItem('users')) || [];
        teachers = [];
    }
}

function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('theme', theme);
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

function getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

if (themeButtons.length > 0) {
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
        });
    });

    applyTheme(getInitialTheme());
}

// تهيئة نموذج التسجيل والتحقق من حالة المستخدم
document.addEventListener('DOMContentLoaded', async function() {
    await loadDataFromDB(); // Ensure data is loaded
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // تحديث أزرار التنقل وقائمة الطالب المنسدلة
    const authActions = document.getElementById('authActions');
    const userDropdownArea = document.getElementById('userDropdownArea');
    const navUserName = document.getElementById('navUserName');
    const userPoints = document.getElementById('userPoints');

    if (currentUser) {
        if (authActions) authActions.style.display = 'none';
        if (userDropdownArea) {
            userDropdownArea.style.display = 'block';
            if (navUserName) navUserName.textContent = currentUser.firstName || currentUser.name || 'طالب';
            if (userPoints) userPoints.textContent = currentUser.balance !== undefined ? currentUser.balance : 0;
        }
    } else {
        if (authActions) authActions.style.display = 'flex';
        if (userDropdownArea) userDropdownArea.style.display = 'none';
    }

    // عرض الترحيب بالبطل (Hero Banner)
    const userGreeting = document.getElementById('userGreeting');
    const guestGreeting = document.getElementById('guestGreeting');
    const userNamePlaceholder = document.getElementById('userNamePlaceholder');

    if (currentUser) {
        if (guestGreeting) guestGreeting.style.display = 'none';
        if (userGreeting) userGreeting.style.display = 'block';
        if (userNamePlaceholder) userNamePlaceholder.textContent = currentUser.firstName || currentUser.name || 'طالب';
    } else {
        if (userGreeting) userGreeting.style.display = 'none';
        if (guestGreeting) guestGreeting.style.display = 'block';
    }

    // عرض المعلمين
    renderTeachers();

    // عرض المواد الدراسية
    renderSubjects();

    // عرض الفيديوهات المرفوعة
    renderVideos();

    // عرض الكورسات المجانية
    renderFreeCourses();

    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        showStep(1);
        const gradeSelect = document.getElementById('gradeSelect');
        if (gradeSelect) {
            gradeSelect.addEventListener('change', updateSectionVisibility);
            updateSectionVisibility();
        }
        
        // National ID logic
        const nationalIdInput = document.getElementById('nationalId');
        const birthDateInput = document.getElementById('birthDate');
        
        if (nationalIdInput && birthDateInput) {
            nationalIdInput.addEventListener('input', function(e) {
                const val = e.target.value;
                if (val.length === 14) {
                    const century = val.substring(0, 1);
                    const year = val.substring(1, 3);
                    const month = val.substring(3, 5);
                    const day = val.substring(5, 7);
                    
                    let fullYear = '';
                    if (century === '2') fullYear = '19' + year;
                    else if (century === '3') fullYear = '20' + year;
                    else {
                        alert('❌ رقم قومي غير صحيح (القرن)');
                        return;
                    }
                    
                    const birthDateStr = `${fullYear}-${month}-${day}`;
                    birthDateInput.value = birthDateStr;
                    
                    // Age validation
                    const currentYear = new Date().getFullYear(); // e.g. 2026
                    const age = currentYear - parseInt(fullYear);
                    if (age < 10 || age > 21) {
                        alert(`❌ سنك ${age} عاماً. المنصة مخصصة للطلاب من سن 10 إلى 21 عاماً.`);
                        nationalIdInput.value = '';
                        birthDateInput.value = '';
                    }
                } else {
                    birthDateInput.value = '';
                }
            });
        }
    }
    
    // تشغيل لوحة التحكم بعد تحميل البيانات بالكامل
    if (window.location.pathname.includes('admin.html')) {
        populateVideoSelect();
        displayCodes();
        displayUsers();
        displayAdminTeachers();
        showSection('users');
    }
});

function updateSectionVisibility() {
    const gradeSelect = document.getElementById('gradeSelect');
    const sectionGroup = document.getElementById('sectionGroup');
    const sectionSelect = sectionGroup ? sectionGroup.querySelector('select[name="section"]') : null;
    if (!gradeSelect || !sectionGroup || !sectionSelect) return;

    const preparatoryGrades = [
        'الصف الأول الإعدادي',
        'الصف الثاني الإعدادي',
        'الصف الثالث الإعدادي'
    ];
    const isPreparatory = preparatoryGrades.includes(gradeSelect.value);

    if (isPreparatory) {
        sectionGroup.style.display = 'none';
        sectionSelect.required = false;
        sectionSelect.value = '';
    } else {
        sectionGroup.style.display = 'block';
        sectionSelect.required = true;
    }
}

function handleLogin(event) {
    event.preventDefault();
    const phone = document.querySelector('input[type="tel"]').value;
    const password = document.querySelector('input[type="password"]').value;
    
    // الحساب الإداري
    if (phone === '01234567890' && password === 'admin') {
        window.location.href = 'admin.html';
        return;
    }
    
    // التحقق من قاعدة البيانات
    fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              localStorage.setItem('currentUser', JSON.stringify(data.user));
              alert('✅ تم الدخول بنجاح!');
              window.location.href = 'index.html';
          } else {
              alert('❌ بيانات غير صحيحة!');
          }
      })
      .catch(err => {
          alert('❌ خطأ في الاتصال بقاعدة البيانات');
          console.error(err);
      });
}

// متغير لتتبع الخطوة الحالية
let currentStep = 1;
function validateStep(step) {
    const form = document.getElementById('registrationForm');
    const currentStepElement = form.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required]');

    if (step === 1) {
        const phone = form.querySelector('input[name="phone"]').value;
        const parentPhone = form.querySelector('input[name="parentPhone"]').value;
        const phoneRegex = /^01[0125]\d{8}$/;

        if (!phoneRegex.test(phone)) {
            alert('❌ رقم الهاتف غير صحيح. يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015');
            return false;
        }

        if (!phoneRegex.test(parentPhone)) {
            alert('❌ رقم هاتف ولي الأمر غير صحيح. يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015');
            return false;
        }
        
        if (phone === parentPhone) {
            alert('❌ رقم هاتف الطالب لا يمكن أن يكون متطابقاً مع رقم هاتف ولي الأمر');
            return false;
        }
    }
    
    if (step === 2) {
        const gradeSelect = form.querySelector('select[name="grade"]');
        if (!gradeSelect.value) {
            alert('❌ لم يتم اختيار المرحلة الدراسية');
            return false;
        }
    }

    for (let input of inputs) {
        if (!input.value) {
            alert(`❌ الرجاء ملء جميع الحقول المطلوبة`);
            return false;
        }
    }
    
    // تحقق من تطابق كلمات المرور في الخطوة الثالثة
    if (step === 3) {
        const password = form.querySelector('input[name="password"]').value;
        const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        if (password !== confirmPassword) {
            alert('❌ كلمة المرور وتأكيدها غير متطابقين');
            return false;
        }
        if (password.length < 6) {
            alert('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return false;
        }
    }
    
    return true;
}

function showStep(step) {
    const form = document.getElementById('registrationForm');
    
    // إخفاء جميع الخطوات
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    // إظهار الخطوة المطلوبة
    form.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
    
    // تحديث مؤشر الخطوات
    document.querySelectorAll('.step').forEach((el, index) => {
        el.classList.toggle('active', parseInt(el.dataset.step) === step);
    });
    
    // تحديث الأزرار
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = step > 1 ? 'block' : 'none';
    nextBtn.style.display = step < 3 ? 'block' : 'none';
    submitBtn.style.display = step === 3 ? 'block' : 'none';
}

function nextStep() {
    if (validateStep(currentStep)) {
        currentStep++;
        if (currentStep > 3) currentStep = 3;
        showStep(currentStep);
        window.scrollTo(0, 0);
    }
}

function previousStep() {
    currentStep--;
    if (currentStep < 1) currentStep = 1;
    showStep(currentStep);
    window.scrollTo(0, 0);
}

function handleRegister(event) {
    event.preventDefault();
    
    // التحقق من الخطوة الأخيرة
    if (!validateStep(3)) {
        return false;
    }
    
    const form = event.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const firstName = form.querySelector('input[name="firstName"]').value;
    const lastName = form.querySelector('input[name="lastName"]').value;
    const birthDate = form.querySelector('input[name="birthDate"]').value;
    const phone = form.querySelector('input[name="phone"]').value;
    const parentPhone = form.querySelector('input[name="parentPhone"]').value;
    const nationalId = form.querySelector('input[name="nationalId"]').value;
    const governorate = form.querySelector('select[name="governorate"]').value;
    const grade = form.querySelector('select[name="grade"]').value;
    const section = form.querySelector('select[name="section"]').value;
    const secondLanguage = form.querySelector('select[name="secondLanguage"]').value;

    // إرسال البيانات إلى قاعدة البيانات
    fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            firstName,
            lastName,
            birthDate,
            phone,
            parentPhone,
            nationalId,
            governorate,
            grade,
            section,
            secondLanguage,
            password
        })
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              alert('✅ تم إنشاء الحساب بنجاح!');
              localStorage.setItem('currentUser', JSON.stringify(data.user));
              window.location.href = 'index.html';
          } else {
              alert('❌ خطأ: ' + data.message);
          }
      })
      .catch(err => {
          alert('❌ خطأ في الاتصال بقاعدة البيانات');
          console.error(err);
      });
    
    return false;
}

function togglePasswordVisibility(button) {
    const input = button.previousElementSibling;
    const isPassword = input.getAttribute('type') === 'password';
    input.setAttribute('type', isPassword ? 'text' : 'password');
    button.textContent = isPassword ? '🙈' : '👁️';
}

function handleAddVideo(event) {
    event.preventDefault();
    const form = event.target;
    const title = form.querySelector('input[type="text"]').value;
    const link = form.querySelectorAll('input[type="text"]')[1].value;
    const price = form.querySelector('input[type="number"]').value;
    const imageFile = form.querySelector('input[type="file"]').files[0];
    const videoFile = form.querySelectorAll('input[type="file"]')[1].files[0];

    if (!imageFile) {
        alert('❌ يرجى اختيار صورة للفيديو');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const videoData = {
            title, link,
            price: parseInt(price),
            image: e.target.result,
            video: videoFile ? videoFile.name : ''
        };

        // إرسال البيانات إلى قاعدة البيانات
        fetch(`${API_URL}/api/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(videoData)
        }).then(res => res.json())
          .then(data => {
              if (data.success) {
                  alert('✅ تم إضافة الفيديو بنجاح!');
                  form.reset();
                  loadDataFromDB();
                  if (window.location.pathname.includes('admin.html')) populateVideoSelect();
              } else {
                  alert('❌ خطأ: ' + data.message);
              }
          })
          .catch(err => {
              alert('❌ خطأ في الاتصال بقاعدة البيانات');
              console.error(err);
          });
    };
    reader.readAsDataURL(imageFile);
}

function handleGenerateCodes(event) {
    event.preventDefault();
    const form = event.target;
    const videoIndex = form.querySelector('select').value;
    const count = parseInt(form.querySelector('input[type="number"]').value);
    const value = parseInt(form.querySelectorAll('input[type="number"]')[1].value);

    if (!videoIndex) {
        alert('❌ يرجى اختيار فيديو');
        return;
    }

    const videoTitle = videos[videoIndex] ? videos[videoIndex].title : 'فيديو';

    fetch(`${API_URL}/api/codes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: videoIndex, videoTitle, count, value })
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              alert('✅ تم توليد ' + data.codes.length + ' أكواد بنجاح!');
              form.reset();
              loadDataFromDB();
              displayCodes();
              exportCodes(videoIndex);
          } else {
              alert('❌ خطأ: ' + data.message);
          }
      })
      .catch(err => {
          alert('❌ خطأ في الاتصال بقاعدة البيانات');
          console.error(err);
      });
}

function toggleCode(codeId) {
    const code = codes.find(c => c._id === codeId);
    if (!code) return;
    
    fetch(`${API_URL}/api/codes/${codeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ used: !code.used })
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              loadDataFromDB();
              displayCodes();
          } else {
              alert('❌ خطأ: ' + data.message);
          }
      })
      .catch(err => console.error(err));
}

function deleteCode(codeId) {
    if (!confirm('هل أنت متأكدأ من حذف هذا الكود؟')) return;
    
    fetch(`${API_URL}/api/codes/${codeId}`, {
        method: 'DELETE'
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              loadDataFromDB();
              displayCodes();
          } else {
              alert('❌ خطأ: ' + data.message);
          }
      })
      .catch(err => console.error(err));
}

function setPrice(videoId) {
    const video = videos.find(v => v._id === videoId);
    if (video) {
        document.getElementById('code-price').value = video.price;
    }
}

function displayCodes() {
    const codesList = document.getElementById('codes-list');
    if (!codesList) return;
    codesList.innerHTML = '<h3 id="codes">الأكواد <button onclick="clearAllCodes()" style="float:right; font-size:0.8rem;">مسح جميع الأكواد</button></h3>';
    
    const activated = codes.filter(c => c.used || c.views > 0);
    const notActivated = codes.filter(c => !(c.used || c.views > 0));
    
    if (activated.length > 0) {
        codesList.innerHTML += '<h4>الأكواد المفعلة</h4>';
        activated.forEach(c => {
            codesList.innerHTML += `<div class="code-item">
                <div class="code-field">
                    <label>الكود:</label>
                    <input type="text" value="${c.code}" readonly>
                </div>
                <div class="code-field">
                    <label>القيمة:</label>
                    <input type="text" value="${c.value} جنيه" readonly>
                </div>
                <div class="code-field">
                    <label>المشاهدات:</label>
                    <input type="text" value="${c.views}/3" readonly>
                </div>
                <div class="code-field">
                    <label>الفيديو:</label>
                    <input type="text" value="${c.videoTitle}" readonly>
                </div>
                <div class="code-field">
                    <label>الإجراءات:</label>
                    <button onclick="toggleCode('${c._id}')">إلغاء التفعيل</button>
                    <button onclick="deleteCode('${c._id}')">حذف</button>
                </div>
            </div>`;
        });
    }
    
    if (notActivated.length > 0) {
        codesList.innerHTML += '<h4>الأكواد غير المفعلة</h4>';
        notActivated.forEach(c => {
            codesList.innerHTML += `<div class="code-item">
                <div class="code-field">
                    <label>الكود:</label>
                    <input type="text" value="${c.code}" readonly>
                </div>
                <div class="code-field">
                    <label>القيمة:</label>
                    <input type="text" value="${c.value} جنيه" readonly>
                </div>
                <div class="code-field">
                    <label>الفيديو:</label>
                    <input type="text" value="${c.videoTitle}" readonly>
                </div>
                <div class="code-field">
                    <label>الإجراءات:</label>
                    <button onclick="toggleCode('${c._id}')">تفعيل</button>
                    <button onclick="deleteCode('${c._id}')">حذف</button>
                </div>
            </div>`;
        });
    }
    
    if (activated.length === 0 && notActivated.length === 0) {
        codesList.innerHTML += '<p>لا توجد أكواد.</p>';
    }
}

function clearAllCodes() {
    if (!confirm('هل أنت متأكدأ من مسح جميع الأكواد؟')) return;
    
    fetch(`${API_URL}/api/codes`, {
        method: 'DELETE'
    }).then(res => res.json())
      .then(data => {
          if (data.success) {
              loadDataFromDB();
              displayCodes();
              alert('✅ تم مسح جميع الأكواد');
          }
      })
      .catch(err => console.error(err));
}

function displayUsers() {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;
    usersList.innerHTML = '<h3 id="users">المستخدمون المسجلون</h3><ul>';
    users.forEach(u => usersList.innerHTML += `<li>${u.firstName} ${u.secondName} ${u.thirdName} - ${u.phone}</li>`);
    usersList.innerHTML += '</ul>';
}

function populateVideoSelect() {
    const select = document.querySelector('#generate-codes select');
    if (!select) return;
    select.innerHTML = '<option value="">-- اختر فيديو --</option>';
    videos.forEach(v => {
        select.innerHTML += `<option value="${v._id}">${v.title}</option>`;
    });
}

function renderSubjects() {
    const wrapper = document.getElementById('subjectsWrapper');
    const dotsContainer = document.getElementById('paginationDots');
    if (!wrapper) return;
    
    // تجميع المعلمين حسب المادة الدراسية من قاعدة البيانات
    const subjectCounts = {};
    teachers.forEach(t => {
        if (t.subjectAr) {
            const sub = t.subjectAr.trim();
            subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
        }
    });

    const subjectsList = Object.keys(subjectCounts);
    
    if (subjectsList.length === 0) {
        wrapper.innerHTML = '<p style="color: var(--gray); text-align: center; width: 100%;">لا توجد مواد دراسية مضافة حالياً.</p>';
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }

    // تعيين أيقونات افتراضية للمواد
    const icons = ["imges/sub1.png", "imges/sub2.png", "imges/sub3.png", "imges/sub4.png", "imges/sub5.png", "imges/sub6.png"];

    wrapper.innerHTML = subjectsList.map((subject, idx) => {
        const count = subjectCounts[subject];
        const img = icons[idx % icons.length];
        return `
            <div class="subject-card">
                <img src="${img}" class="subject-img" alt="${subject}">
                <h3>${subject}</h3>
                <span class="teacher-count">${count} معلمين</span>
            </div>
        `;
    }).join('');

    // إنشاء النقط بناءً على عدد المواد
    if (dotsContainer) {
        dotsContainer.innerHTML = subjectsList.map((_, i) => 
            `<span class="dot ${i === 0 ? 'active' : ''}" onclick="scrollToIndex(${i})"></span>`
        ).join('');
    }
}

window.scrollSubjects = function(direction) {
    const wrapper = document.getElementById('subjectsWrapper');
    if (!wrapper) return;
    const scrollAmount = wrapper.clientWidth / 2;
    wrapper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
};

window.scrollToIndex = function(index) {
    const wrapper = document.getElementById('subjectsWrapper');
    if (!wrapper) return;
    const card = wrapper.querySelector('.subject-card');
    if (!card) return;
    const cardWidth = card.clientWidth + 20;
    wrapper.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
};

// تحديث النقطة النشطة عند التمرير
document.addEventListener('DOMContentLoaded', () => {
    const subjectsWrapper = document.getElementById('subjectsWrapper');
    if (subjectsWrapper) {
        subjectsWrapper.addEventListener('scroll', function() {
            const index = Math.round(this.scrollLeft / (this.clientWidth / 2));
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        });
    }
});

function watchVideo(videoId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('يرجى تسجيل الدخول أولاً');
        window.location.href = 'login.html';
        return;
    }

    const code = prompt('أدخل كود الشحن للمشاهدة:');
    if (!code) return;

    fetch(`${API_URL}/api/codes/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeStr: code.trim().toUpperCase(), videoId, studentId: currentUser._id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(`✅ كود صحيح! المشاهدات المتبقية: ${data.remainingViews}`);
            // Redirect to secure watch page with ID and Code
            window.location.href = `watch.html?videoId=${videoId}&code=${data.code.code}`;
        } else {
            alert('❌ ' + data.message);
        }
    })
    .catch(err => {
        alert('❌ خطأ في الاتصال بالسيرفر');
        console.error(err);
    });
}




function displayAdminTeachers() {
    const list = document.getElementById('teachers-list-admin');
    if (!list) return;
    list.innerHTML = '<h4>المعلمون المضافون</h4>';
    if (teachers.length === 0) {
        list.innerHTML += '<p>لا يوجد معلمون.</p>';
        return;
    }
    teachers.forEach(t => {
        list.innerHTML += `<div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:5px;">
            <strong>${t.name}</strong> - ${t.subjectAr}
            <button onclick="deleteTeacher('${t._id}')" class="btn-red" style="float:left; padding:5px 10px;">حذف</button>
        </div>`;
    });
}

function handleAddTeacher(event) {
    event.preventDefault();
    const name = document.getElementById('teacher-name').value;
    const subjectAr = document.getElementById('teacher-subject').value;
    const bio = document.getElementById('teacher-bio').value;
    
    // Collect selected grades from checkboxes
    const checkedBoxes = document.querySelectorAll('input[name="teacher-grades-check"]:checked');
    const gradesArray = Array.from(checkedBoxes).map(cb => cb.value);
    if (gradesArray.length === 0) {
        alert('❌ يرجى اختيار صف دراسي واحد على الأقل للمعلم');
        return;
    }
    const grades = gradesArray.join(',');
    
    const imageFile = document.getElementById('teacher-image').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('subjectAr', subjectAr);
    formData.append('bio', bio);
    formData.append('grades', grades);
    if (imageFile) formData.append('image', imageFile);

    fetch(`${API_URL}/api/teachers`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert('تم إضافة المعلم بنجاح');
            event.target.reset();
            loadDataFromDB().then(() => displayAdminTeachers());
        } else {
            alert('خطأ في إضافة المعلم: ' + (data.message || ''));
        }
    }).catch(err => {
        console.error(err);
        alert('خطأ في الاتصال بالسيرفر. يرجى التأكد من أن السيرفر يعمل وقاعدة البيانات متصلة.');
    });
}

function deleteTeacher(id) {
    if(!confirm('تأكيد الحذف؟')) return;
    fetch(`${API_URL}/api/teachers/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            loadDataFromDB().then(() => displayAdminTeachers());
        }
    });
}

function showSection(section) {
    const sectionMap = {
        'users': 'users-list',
        'codes': 'codes-list',
        'online': 'online-list',
        'add-video': 'add-video',
        'generate-codes': 'generate-codes',
        'teachers': 'teachers-section'
    };
    const sections = Object.values(sectionMap);
    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = s === sectionMap[section] ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    
    if (typeof event !== 'undefined' && event && event.target) {
        event.target.classList.add('active');
    } else {
        const btn = Array.from(document.querySelectorAll('.sidebar button')).find(b => b.getAttribute('onclick')?.includes(`'${section}'`));
        if (btn) btn.classList.add('active');
    }
}
// عرض المعلمين في الصفحة الرئيسية
// وظيفة عرض المعلمين مع نظام الحركة المستمرة والسحب اليدوي
function renderTeachers() {
    const teachersGrid = document.getElementById('teachersGrid');
    if (!teachersGrid) return;

    const teachersList = [...teachers];
    if (teachersList.length === 0) return;

    // 1. توليد محتوى الكروت
    const cardsHTML = teachersList.map(teacher => `
        <div class="teacher-card">
            <div class="teacher-avatar-container">
                <div class="teacher-avatar">
                    <img src="${teacher.imagePath || 'imges/1.png'}" alt="${teacher.name}" onerror="this.onerror=null;this.src='imges/1.png';">
                </div>
            </div>
            <h3 class="teacher-name">${teacher.name}</h3>
            <p class="teacher-subject">${teacher.subjectAr}</p>
            <p class="teacher-bio">${teacher.bio}</p>
            <div class="teacher-stats">
                <div class="teacher-stat">
                    <span class="teacher-stat-number">${teacher.studentsCount || 0}</span>
                    <span class="teacher-stat-label">طالب</span>
                </div>
                <div class="teacher-stat">
                    <span class="teacher-stat-number">⭐${teacher.rating}</span>
                    <span class="teacher-stat-label">تقييم</span>
                </div>
            </div>
            <button class="teacher-btn">اتابع الآن</button>
        </div>
    `).join('');

    // 2. التحقق من عدد المعلمين لتحديد ما إذا كنا سنفعل الحركة الدائرية اللانهائية
    if (teachersList.length > 2) {
        teachersGrid.innerHTML = cardsHTML + cardsHTML;

        // 3. إعداد متغيرات الحركة
        let scrollPos = 0;
        let isDragging = false;
        let startX = 0;
        let currentScrollLeft = 0;
        let speed = 0.8; // سرعة الحركة التلقائية

        // وظيفة التحريك المستمر
        function animate() {
            if (!isDragging) {
                scrollPos += speed;
                
                // إعادة التموضع عند الوصول لمنتصف المحتوى
                if (scrollPos >= teachersGrid.scrollWidth / 2) {
                    scrollPos = 0;
                }
                teachersGrid.scrollLeft = scrollPos;
            }
            requestAnimationFrame(animate);
        }

        // ابدأ الحركة
        requestAnimationFrame(animate);

        // --- أحداث الماوس واللمس للسحب اليدوي ---
        const startDragging = (e) => {
            isDragging = true;
            teachersGrid.style.cursor = 'grabbing';
            startX = (e.pageX || e.touches[0].pageX) - teachersGrid.offsetLeft;
            currentScrollLeft = teachersGrid.scrollLeft;
        };

        const stopDragging = () => {
            isDragging = false;
            teachersGrid.style.cursor = 'grab';
            scrollPos = teachersGrid.scrollLeft;
        };

        const move = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = (e.pageX || e.touches[0].pageX) - teachersGrid.offsetLeft;
            const walk = (x - startX) * 1.5;
            teachersGrid.scrollLeft = currentScrollLeft - walk;
            scrollPos = teachersGrid.scrollLeft;
        };

        // إضافة المستمعات
        teachersGrid.addEventListener('mousedown', startDragging);
        teachersGrid.addEventListener('mousemove', move);
        window.addEventListener('mouseup', stopDragging);

        teachersGrid.addEventListener('touchstart', startDragging, { passive: true });
        teachersGrid.addEventListener('touchmove', move, { passive: false });
        teachersGrid.addEventListener('touchend', stopDragging);
        
        teachersGrid.style.cursor = 'grab';
    } else {
        // إذا كان هناك معلم واحد أو اثنين فقط، نعرضهم بشكل ثابت ومنسق في المنتصف
        teachersGrid.innerHTML = cardsHTML;
        teachersGrid.style.display = 'flex';
        teachersGrid.style.justifyContent = 'center';
        teachersGrid.style.gap = '20px';
    }
}

function exportCodes(videoId) {
    const videoCodes = codes.filter(c => c.videoId === videoId);
    if (!videoCodes || videoCodes.length === 0) {
        alert("لا توجد أكواد لهذا الفيديو لتصديرها.");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Arabic
    csvContent += "الكود,القيمة,الفيديو,الحالة,المشاهدات\n";
    videoCodes.forEach(c => {
        const status = c.used ? "مستعمل" : "غير مستعمل";
        csvContent += `${c.code},${c.value},"${c.videoTitle}",${status},${c.views}/3\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `codes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// تسجيل الخروج
function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// قائمة المستخدم المنسدلة
window.toggleUserMenu = function() {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.classList.toggle('show');
    }
};

window.addEventListener('click', function(e) {
    if (!e.target.closest('#userDropdownArea')) {
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.classList.remove('show');
    }
});

// عرض الفيديوهات المرفوعة ديناميكياً
function renderVideos() {
    const container = document.getElementById('latest-videos');
    const section = document.getElementById('latest-videos-section');
    if (!container) return;

    if (videos.length === 0) {
        if (section) section.style.display = 'none';
        container.innerHTML = '<p style="color: var(--gray); text-align: center; width: 100%;">لا توجد محاضرات متاحة حالياً.</p>';
        return;
    }

    if (section) section.style.display = 'block';

    container.innerHTML = videos.map(video => {
        return `
            <div class="course-card" style="flex: 0 0 320px;">
                <img src="${video.image || 'imges/st.jpg'}" class="course-thumb" alt="${video.title}" onerror="this.onerror=null;this.src='imges/st.jpg';">
                <div class="course-body">
                    <h3 class="course-title">${video.title}</h3>
                    <div class="course-price">${video.price || 0} ج.م</div>
                    <div class="course-btns">
                        <button class="btn-join" onclick="watchVideo('${video._id}')">مشاهدة المحاضرة !</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// بيانات الكورسات المجانية
const freeCoursesData = [
    {
        title: "كورس الشهر الثالث- الكيمياء العضوية - عام",
        price: "مجاني",
        image: "imges/st2.jpg",
        date: "الأربعاء، ١٨ مارس ٢٠٢٦",
        chapter: "الباب الخامس"
    },
    {
        title: "كورس الترم الثاني كاملاً - 2 ث",
        price: "مجاني",
        image: "imges/st.jpg",
        date: "الخميس، ٢٩ يناير ٢٠٢٦",
        chapter: "أول محاضرة بداية من يوم 2/8"
    },
    {
        title: "كورس الشهر الثالث- الكيمياء العضوية - ازهر",
        price: "مجاني",
        image: "imges/st2.jpg",
        date: "الأربعاء، ١٨ مارس ٢٠٢٦",
        chapter: "الباب الخامس"
    },
    {
        title: "كورس الترم الثاني كاملاً - 2 ث",
        price: "مجاني",
        image: "imges/st.jpg",
        date: "الخميس، ٢٩ يناير ٢٠٢٦",
        chapter: "أول محاضرة بداية من يوم 2/8"
    }
];

function renderFreeCourses() {
    const wrapper = document.getElementById('freeCoursesWrapper');
    const dotsContainer = document.getElementById('freeCourseDots');
    if (!wrapper) return;

    wrapper.innerHTML = freeCoursesData.map(course => `
        <div class="course-card">
            <img src="${course.image}" class="course-thumb" alt="${course.title}">
            <div class="course-body">
                <h3 class="course-title">${course.title}</h3>
                <div class="course-price">${course.price}</div>
                <div class="course-meta">
                    <div class="meta-item">📅 ${course.date}</div>
                    <div class="meta-item">📖 ${course.chapter}</div>
                </div>
                <div class="course-btns">
                    <button class="btn-enter" onclick="alert('كورس مجاني - متاح للمشاهدة المباشرة')">الدخول للكورس</button>
                    <button class="btn-join" onclick="alert('أنت مشترك بالفعل في هذا الكورس المجاني!')">مشترك بالفعل !</button>
                </div>
            </div>
        </div>
    `).join('');

    if (dotsContainer) {
        dotsContainer.innerHTML = freeCoursesData.map((_, i) => 
            `<span class="c-dot ${i === 0 ? 'active' : ''}" onclick="jumpToCourse(${i})"></span>`
        ).join('');
    }
}

window.scrollCourses = function(direction) {
    const wrapper = document.getElementById('freeCoursesWrapper');
    if (!wrapper) return;
    const scrollAmount = 375;
    wrapper.scrollBy({ left: -direction * scrollAmount, behavior: 'smooth' });
    setTimeout(updateCourseDots, 500);
};

window.jumpToCourse = function(index) {
    const wrapper = document.getElementById('freeCoursesWrapper');
    if (!wrapper) return;
    wrapper.scrollTo({ left: index * -375, behavior: 'smooth' });
    setTimeout(updateCourseDots, 500);
};

function updateCourseDots() {
    const wrapper = document.getElementById('freeCoursesWrapper');
    if (!wrapper) return;
    const dots = document.querySelectorAll('.c-dot');
    const index = Math.round(wrapper.scrollLeft / -375);
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}


/*------------------البروفايل-----------------*/
function loadFullProfile() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { window.location.href = 'login.html'; return; }

    // 1. تحديث النصوص الشخصية
    document.getElementById('sideUserName').textContent = user.firstName;
    document.getElementById('sideUserGrade').textContent = user.grade;
    document.getElementById('u-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('u-phone').textContent = user.phone;
    document.getElementById('u-email').textContent = user.username + "@masar.edu";
    document.getElementById('u-grade').textContent = user.grade;

    if (user.profileImage) document.getElementById('profileImg').src = user.profileImage;

    // 2. ضبط أهداف الإحصائيات (قيم من داتا الطالب أو 0)
    document.getElementById('v-count').setAttribute('data-target', user.watchedVideos || 0);
    document.getElementById('e-count').setAttribute('data-target', user.examsTaken || 0);
    document.getElementById('g-count').setAttribute('data-target', user.averageGrade || 0);

    runCircularProgress();
}

function runCircularProgress() {
    const items = document.querySelectorAll('.stat-progress-item');
    const circumference = 283; 

    items.forEach(item => {
        const counter = item.querySelector('.counter');
        const circle = item.querySelector('.progress');
        const target = +counter.getAttribute('data-target');
        
        let count = 0;
        const updateNum = () => {
            const inc = target / 40;
            if (count < target) {
                count += inc;
                counter.innerText = Math.ceil(count);
                setTimeout(updateNum, 35);
            } else { counter.innerText = target; }
        };
        updateNum();

        let max = 100;
        if (item.querySelector('.blue')) max = 40; // سقف المشاهدات
        if (item.querySelector('.pink')) max = 20; // سقف الامتحانات
        
        const offset = circumference - (target / max) * circumference;
        circle.style.strokeDashoffset = isNaN(offset) ? circumference : offset;
    });
}

function switchTab(tabId, element) {
    document.querySelectorAll('.profile-pane').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    document.querySelectorAll('.side-item').forEach(b => b.classList.remove('active'));

    const target = document.getElementById(tabId);
    if (target) {
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active'), 10);
        if (tabId === 'tab-user') runCircularProgress();
    }
    element.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.royal-dashboard')) {
        loadFullProfile();
        switchTab('tab-user', document.querySelector('.side-item.active'));
    }
});