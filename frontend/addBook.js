document.getElementById('addBookForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
  
    try {
      const response = await fetch('http://localhost:5000/books/add', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      const messageDiv = document.getElementById('message');
  
      if (response.ok) {
        messageDiv.innerHTML = `<div class="alert alert-success">تم إضافة الكتاب بنجاح!</div>`;
        form.reset();
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">حدث خطأ: ${result.message}</div>`;
      }
    } catch (error) {
      console.error('خطأ:', error);
      document.getElementById('message').innerHTML = `<div class="alert alert-danger">حدث خطأ في الاتصال بالخادم.</div>`;
    }
  });
  document.getElementById('addBookForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const form = e.target;
    const formData = new FormData(form);
  
    try {
      const response = await fetch('http://localhost:5000/books/add', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      const messageDiv = document.getElementById('message');
  
      if (response.ok) {
        messageDiv.innerHTML = `<div class="alert alert-success">تم إضافة الكتاب بنجاح!</div>`;
        form.reset();
      } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">حدث خطأ: ${result.message}</div>`;
      }
    } catch (error) {
      console.error('خطأ:', error);
      document.getElementById('message').innerHTML = `<div class="alert alert-danger">حدث خطأ في الاتصال بالخادم.</div>`;
    }
  });
  document.addEventListener('DOMContentLoaded', populateAuthors);

async function populateAuthors() {
  try {
    const response = await fetch('http://localhost:5000/authors');
    const authors = await response.json();

    const authorSelect = document.getElementById('author');
    authors.forEach(author => {
      const option = document.createElement('option');
      option.value = author._id;
      option.textContent = author.name;
      authorSelect.appendChild(option);
    });
  } catch (error) {
    console.error('خطأ في جلب المؤلفين:', error);
  }
}
document.addEventListener('DOMContentLoaded', populateAuthors);

async function populateAuthors() {
  try {
    const response = await fetch('http://localhost:5000/authors');
    const authors = await response.json();

    const authorSelect = document.getElementById('author');
    authors.forEach(author => {
      const option = document.createElement('option');
      option.value = author._id;
      option.textContent = author.name;
      authorSelect.appendChild(option);
    });
  } catch (error) {
    console.error('خطأ في جلب المؤلفين:', error);
  }
}

document.getElementById('addBookForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    // يجب أن يكون المستخدم مسجلاً الدخول للحصول على التوكن
    const token = localStorage.getItem('token'); // تأكد من تخزين التوكن بعد تسجيل الدخول
    const response = await fetch('http://localhost:5000/books/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    const result = await response.json();

    const messageDiv = document.getElementById('message');

    if (response.ok) {
      messageDiv.innerHTML = `<div class="alert alert-success">تم إضافة الكتاب بنجاح!</div>`;
      form.reset();
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger">حدث خطأ: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('خطأ:', error);
    document.getElementById('message').innerHTML = `<div class="alert alert-danger">حدث خطأ في الاتصال بالخادم.</div>`;
  }
});
