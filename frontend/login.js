const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

const API_BASE_URL = 'http://127.0.0.1:5000';

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const email = form.querySelector('input[name="email"]').value;
  const password = form.querySelector('input[name="password"]').value;

  try {
    const res = await fetch('http://127.0.0.1:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.message || 'Données de connexion non valides❌');
      return;
    }

    const data = await res.json();
    console.log('الاستجابة من السيرفر:', data);

    if (data.user && data.user.id) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('username', data.user.username);
      alert('Connexion réussie !✅ ');
      window.location.href = 'help.html';
    } else {
      alert('Informations utilisateur non trouvées. Vérifiez la validité des données❌.');
      console.error('الاستجابة غير المتوقعة:', data);
    }
  } catch (err) {
    console.error(err);
    alert('❌ فشل الاتصال بالخادم');
  }
});
