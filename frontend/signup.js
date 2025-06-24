const SIGNUP_API_BASE_URL = 'http://127.0.0.1:5000';

document.querySelector('.sign-up-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const username = form.querySelector('input[placeholder="Username"]').value;
  const email = form.querySelector('input[placeholder="Email"]').value;
  const password = form.querySelector('input[placeholder="Password"]').value;

  try {
   const SIGNUP_API_BASE_URL = 'http://127.0.0.1:5000';

const res = await fetch(`${SIGNUP_API_BASE_URL}/users/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, email, password })
});

    const data = await res.json();

    if (res.ok) {
      alert("✅ تم التسجيل بنجاح، يمكنك تسجيل الدخول الآن");
      window.location.href = "login.html";
    } else {
      alert(data.message || "❌ حدث خطأ أثناء التسجيل");
    }
  } catch (err) {
    console.error(err);
    alert("❌ فشل الاتصال بالخادم");
  }
});
