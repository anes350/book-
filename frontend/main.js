// main.js

document.addEventListener('DOMContentLoaded', function() {
  checkLoginStatus(); // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
});

// دالة للتحقق من حالة تسجيل الدخول وعرض/إخفاء عناصر شريط التنقل
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const logoutNavItem = document.getElementById('logoutNavItem');
  const loginNavItem = document.getElementById('loginNavItem');
  const registerNavItem = document.getElementById('registerNavItem');
  const addAuthorButtonContainer = document.getElementById('addAuthorButtonContainer');

  if (token) {
    logoutNavItem.style.display = 'block';
    loginNavItem.style.display = 'none';
    registerNavItem.style.display = 'none';
    
    // التحقق من دور المستخدم
    let isAdmin = false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // فك تشفير التوكن
      if (payload.role === 'admin') {
        isAdmin = true;
      }
    } catch (err) {
      console.error('خطأ في تحليل التوكن:', err);
    }

    // عرض زر إضافة المؤلف فقط للمشرفين
    if (isAdmin && addAuthorButtonContainer) {
      addAuthorButtonContainer.style.display = 'block';
    }
  } else {
    logoutNavItem.style.display = 'none';
    loginNavItem.style.display = 'block';
    registerNavItem.style.display = 'block';
    if (addAuthorButtonContainer) {
      addAuthorButtonContainer.style.display = 'none';
    }
  }
}

// دالة لتسجيل الخروج وإعادة توجيه المستخدم
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  displayMessage('تم تسجيل الخروج بنجاح.', 'success');
  // إعادة توجيه المستخدم إلى الصفحة الرئيسية بعد 1.5 ثانية
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}

// دالة لعرض رسائل التفاعل مع المستخدم
function displayMessage(message, type) {
  // يمكنك إضافة قسم لعرض الرسائل في شريط التنقل أو أي مكان آخر
  alert(message); // مثال بسيط، يمكنك تحسينه بإضافة عناصر HTML لعرض الرسائل
}
