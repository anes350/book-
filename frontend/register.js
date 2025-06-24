document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    // const role = document.getElementById('role').value; // إذا كنت تستخدم حقل الدور
  
    try {
      const response = await fetch('http://localhost:5000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password /* , role */ })
      });
  
      const result = await response.json();
  
      const messageDiv = document.getElementById('message');
  
      if (response.ok) {
        messageDiv.innerHTML = `<div class="alert alert-success">تم التسجيل بنجاح! يمكنك الآن <a href="login.html">تسجيل الدخول</a>.</div>`;
        document.getElementById('registerForm').reset();
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">حدث خطأ: ${result.message}</div>`;
      }
    } catch (error) {
      console.error('خطأ:', error);
      document.getElementById('message').innerHTML = `<div class="alert alert-danger">حدث خطأ في الاتصال بالخادم.</div>`;
    }
  });
  