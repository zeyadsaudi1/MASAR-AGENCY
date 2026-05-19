const themeButtons = document.querySelectorAll('.theme-switcher');

let videos = [];
let codes = [];
let users = [];
const API_URL = 'http://localhost:3000';

const teachersData = [
    {
        id: 1,
        name: 'علي عزيز',
        subject: 'الرياضيات',
        subjectAr: 'الرياضيات',
        image: 'imges/st.jpg',
        students: '245',
        rating: '4.9',
        bio: 'معلم رياضيات متخصص مع 10 سنوات خبرة',
        grades: ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي']
    },
    {
        id: 2,
        name: 'غادة ثروت',
        subject: 'الEnglish',
        subjectAr: 'اللغة الإنجليزية',
        image: 'imges/st.jpg',
        students: '312',
        rating: '4.8',
        bio: 'متخصصة في تعليم اللغة الإنجليزية بطرق حديثة',
        grades: ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي']
    },
    {
        id: 3,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 4,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 5,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 6,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 7,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 8,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 9,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 10,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 11,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    },
    {
        id: 12,
        name: 'تيموثيوس ناصر',
        subject: 'التجارة',
        subjectAr: 'كلية التجارة',
        image: 'imges/st2.jpg',
        students: '198',
        rating: '4.7',
        bio: 'خبير في مجال التجارة والإدارة الحديثة',
        grades: ['الصف الثالث الإعدادي', 'الصف الأول الثانوي', 'الصف الثاني الثانوي']
    }
];

// تحميل البيانات من قاعدة البيانات عند بدء التطبيق
async function loadDataFromDB() {
    try {
        const videoRes = await fetch(`${API_URL}/api/videos`);
        const codeRes = await fetch(`${API_URL}/api/codes`);
        const userRes = await fetch(`${API_URL}/api/users`);
        
        videos = await videoRes.json();
        codes = await codeRes.json();
        users = await userRes.json();
    } catch (err) {
        console.log('البيانات ستحمل من localStorage في الوقت الحالي');
        videos = JSON.parse(localStorage.getItem('videos')) || [];
        codes = JSON.parse(localStorage.getItem('codes')) || {};
        users = JSON.parse(localStorage.getItem('users')) || [];
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

// تهيئة نموذج التسجيل المتعدد الخطوات
document.addEventListener('DOMContentLoaded', function() {
    // عرض اسم الطالب في صورة الترحيب
    const studentNameElement = document.querySelector('.student-name');
    if (studentNameElement) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.name) {
            studentNameElement.textContent = currentUser.name;
        }
    }

    // عرض المعلمين
    renderTeachers();

    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        showStep(1);
        const gradeSelect = document.getElementById('gradeSelect');
        if (gradeSelect) {
            gradeSelect.addEventListener('change', updateSectionVisibility);
            updateSectionVisibility();
        }
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
    // مثال: أضف هذا السطر بعد نجاح تسجيل الدخول لتجربة الرصيد
data.user.balance = 50; // افتراض أن الطالب معه 50 جنيه
localStorage.setItem('currentUser', JSON.stringify(data.user));
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

function setPrice(index) {
    if (videos[index]) {
        document.getElementById('code-price').value = videos[index].price;
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
                    <button onclick="toggleCode('${c.videoIndex}', ${c.codeIndex})">إلغاء التفعيل</button>
                    <button onclick="deleteCode('${c.videoIndex}', ${c.codeIndex})">حذف</button>
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
                    <select onchange="changeVideo('${c.videoIndex}', ${c.codeIndex}, this.value)">
                        ${videos.map((v, idx) => `<option value="${idx}" ${idx == c.videoIndex ? 'selected' : ''}>${v.title}</option>`).join('')}
                    </select>
                </div>
                <div class="code-field">
                    <label>الإجراءات:</label>
                    <button onclick="toggleCode('${c.videoIndex}', ${c.codeIndex})">تفعيل</button>
                    <button onclick="deleteCode('${c.videoIndex}', ${c.codeIndex})">حذف</button>
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
    select.innerHTML = '';
    videos.forEach((v, i) => {
        select.innerHTML += `<option value="${i}">${v.title}</option>`;
    });
}

function loadVideos() {
    const latest = document.getElementById('latest-videos');
    if (!latest) return;
    latest.innerHTML = '<h2>احدث الفيديوهات</h2><div class="video-grid">';
    videos.forEach(v => {
        latest.innerHTML += `
            <div class="video-card">
                <img src="${v.image || 'https://via.placeholder.com/280x180?text=No+Image'}" alt="${v.title}">
                <div class="card-content">
                    <h3>${v.title}</h3>
                    <div class="video-info">
                        <span class="price">${v.price} جنيه</span>
                        <button class="btn-red" onclick="watchVideo(${videos.indexOf(v)})">شاهد</button>
                    </div>
                </div>
            </div>
        `;
    });
    latest.innerHTML += '</div>';
}

function watchVideo(index) {
    const code = prompt('أدخل الكود للمشاهدة:');
    if (!code) return;
    const videoCodes = codes[index] || [];
    const found = videoCodes.find(c => c.code === code.trim().toUpperCase());
    if (found && found.views < 3) {
        found.views++;
        localStorage.setItem('codes', JSON.stringify(codes));
        alert(`مشاهدة الفيديو. المشاهدات المتبقية: ${3 - found.views}`);
        // Here, you can redirect to v.link or play video
        if (videos[index].link) {
            window.open(videos[index].link, '_blank');
        }
    } else {
        alert('كود غير صحيح أو انتهت المشاهدات (3 مشاهدات كحد أقصى)');
    }
}

// Load on page load
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    loadVideos();
    setupVideoScroll();
}

// Setup smooth dragging for video grid
function setupVideoScroll() {
    const videoGrids = document.querySelectorAll('.video-grid');
    videoGrids.forEach(grid => {
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        let startTime = 0;
        
        grid.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
            startTime = Date.now();
            grid.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        grid.addEventListener('mouseleave', () => {
            isDragging = false;
            grid.style.cursor = 'grab';
        });
        
        grid.addEventListener('mouseup', () => {
            isDragging = false;
            grid.style.cursor = 'grab';
        });
        
        grid.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - grid.offsetLeft;
            const walk = (x - startX) * 1.5;
            grid.scrollLeft = scrollLeft - walk;
        });
        
        // Touch support for mobile
        grid.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
        });
        
        grid.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) return;
            const x = e.touches[0].pageX - grid.offsetLeft;
            const walk = (x - startX) * 1.5;
            grid.scrollLeft = scrollLeft - walk;
        });
    });
}
if (window.location.pathname.includes('admin.html')) {
    populateVideoSelect();
    displayCodes();
    displayUsers();
    showSection('users');
}

function showSection(section) {
    const sectionMap = {
        'users': 'users-list',
        'codes': 'codes-list',
        'online': 'online-list',
        'add-video': 'add-video',
        'generate-codes': 'generate-codes'
    };
    const sections = Object.values(sectionMap);
    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = s === sectionMap[section] ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}
// عرض المعلمين في الصفحة الرئيسية
// وظيفة عرض المعلمين مع نظام الحركة المستمرة والسحب اليدوي
function renderTeachers() {
    const teachersGrid = document.getElementById('teachersGrid');
    if (!teachersGrid) return;

    const teachers = [...teachersData];
    if (teachers.length === 0) return;

    // 1. توليد محتوى الكروت
    const cardsHTML = teachers.map(teacher => `
        <div class="teacher-card">
            <div class="teacher-avatar-container">
                <div class="teacher-avatar">
                    <img src="${teacher.image}" alt="${teacher.name}" onerror="this.onerror=null;this.src='imges/1.png';">
                </div>
            </div>
            <h3 class="teacher-name">${teacher.name}</h3>
            <p class="teacher-subject">${teacher.subjectAr}</p>
            <p class="teacher-bio">${teacher.bio}</p>
            <div class="teacher-stats">
                <div class="teacher-stat">
                    <span class="teacher-stat-number">${teacher.students}</span>
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

    // 2. مضاعفة المحتوى مرتين لضمان حلقة وصل لا نهائية (Infinite Loop)
    teachersGrid.innerHTML = cardsHTML + cardsHTML;

    // 3. إعداد متغيرات الحركة
    let scrollPos = 0;
    let isDragging = false;
    let startX = 0;
    let currentScrollLeft = 0;
    let speed = 0.8; // سرعة الحركة التلقائية (يمكنك زيادتها)

    // وظيفة التحريك المستمر
    function animate() {
        if (!isDragging) {
            scrollPos += speed;
            
            // إعادة التموضع عند الوصول لمنتصف المحتوى (نهاية النسخة الأولى)
            // هذا هو السر في جعل الـ Loop غير منقطع
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
        // تحديث وضع التمرير ليتماشى مع المكان الذي تركه المستخدم
        scrollPos = teachersGrid.scrollLeft;
    };

    const move = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - teachersGrid.offsetLeft;
        const walk = (x - startX) * 1.5; // سرعة الاستجابة للسحب
        teachersGrid.scrollLeft = currentScrollLeft - walk;
        scrollPos = teachersGrid.scrollLeft; // تحديث الموقع برمجياً
    };

    // إضافة المستمعات
    teachersGrid.addEventListener('mousedown', startDragging);
    teachersGrid.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stopDragging);

    teachersGrid.addEventListener('touchstart', startDragging);
    teachersGrid.addEventListener('touchmove', move);
    teachersGrid.addEventListener('touchend', stopDragging);
}

const subjectsData = [
    { name: "صيدله", teachers: 1, img: "imges/sub1.png" },
    { name: "Integrated Science", teachers: 1, img: "imges/sub2.png" },
    { name: "bue", teachers: 1, img: "imges/sub3.png" },
    { name: "جغرافيا", teachers: 0, img: "imges/sub4.png" },
    { name: "لغة عربية", teachers: 5, img: "imges/sub5.png" },
    { name: "ASU LEVEL 1 general", teachers: 2, img: "imges/sub6.png" },
    { name: "كيمياء", teachers: 3, img: "imges/sub1.png" },
    { name: "فيزياء", teachers: 4, img: "imges/sub2.png" }
];

function renderSubjects() {
    const wrapper = document.getElementById('subjectsWrapper');
    const dotsContainer = document.getElementById('paginationDots');
    if (!wrapper) return;

    wrapper.innerHTML = subjectsData.map(sub => `
        <div class="subject-card">
            <img src="${sub.img}" class="subject-img" alt="${sub.name}">
            <h3>${sub.name}</h3>
            <span class="teacher-count">${sub.teachers} معلمين</span>
        </div>
    `).join('');

    // إنشاء النقط بناءً على عدد المواد
    dotsContainer.innerHTML = subjectsData.map((_, i) => 
        `<span class="dot ${i === 0 ? 'active' : ''}" onclick="scrollToIndex(${i})"></span>`
    ).join('');
}

function scrollSubjects(direction) {
    const wrapper = document.getElementById('subjectsWrapper');
    const scrollAmount = wrapper.clientWidth / 2;
    wrapper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

function scrollToIndex(index) {
    const wrapper = document.getElementById('subjectsWrapper');
    const cardWidth = wrapper.querySelector('.subject-card').clientWidth + 20;
    wrapper.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
}

// تحديث النقطة النشطة عند التمرير
document.getElementById('subjectsWrapper')?.addEventListener('scroll', function() {
    const wrapper = this;
    const index = Math.round(wrapper.scrollLeft / (wrapper.clientWidth / 2));
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
});

// تشغيل الوظيفة
document.addEventListener('DOMContentLoaded', renderSubjects);

// بيانات الكورسات المجانية
const freeCoursesData = [
    {
        title: "كورس الشهر الثالث- الكيمياء العضوية - عام",
        price: "مجاني",
        image: "imges/st2.jpg", // استبدل بصورة حقيقية
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
                    <div class="meta-item"><i class="far fa-calendar-alt"></i> ${course.date}</div>
                    <div class="meta-item"><i class="fas fa-book-open"></i> ${course.chapter}</div>
                </div>
                <div class="course-btns">
                    <button class="btn-enter">الدخول للكورس</button>
                    <button class="btn-join">الإشتراك في الكورس !</button>
                </div>
            </div>
        </div>
    `).join('');

    // إنشاء النقط
    dotsContainer.innerHTML = freeCoursesData.map((_, i) => 
        `<span class="c-dot ${i === 0 ? 'active' : ''}" onclick="jumpToCourse(${i})"></span>`
    ).join('');
}

// وظيفة تحريك الشريط بالأسهم
window.scrollCourses = (direction) => {
    const wrapper = document.getElementById('freeCoursesWrapper');
    const scrollAmount = 375; // عرض الكارت + الفجوة
    wrapper.scrollBy({ left: -direction * scrollAmount, behavior: 'smooth' });
    setTimeout(updateCourseDots, 500);
}

function updateCourseDots() {
    const wrapper = document.getElementById('freeCoursesWrapper');
    const dots = document.querySelectorAll('.c-dot');
    const index = Math.round(wrapper.scrollLeft / -375);
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
}

// استدعاء الوظيفة عند التحميل
document.addEventListener('DOMContentLoaded', renderFreeCourses);


function updateHeroDisplay() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userGreeting = document.getElementById('userGreeting');
    const guestGreeting = document.getElementById('guestGreeting');
    const userNamePlaceholder = document.getElementById('userNamePlaceholder');

    if (currentUser) {
        // حالة مسجل دخول: أهلاً بك + اسم الطالب
        guestGreeting.style.display = 'none';
        userGreeting.style.display = 'block';
        userNamePlaceholder.textContent = currentUser.firstName;
    } else {
        // حالة غير مسجل: منصة مَســـار فقط
        userGreeting.style.display = 'none';
        guestGreeting.style.display = 'block';
    }
}

// استدعي الوظيفة عند التحميل
document.addEventListener('DOMContentLoaded', updateHeroDisplay);
