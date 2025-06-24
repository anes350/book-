document.getElementById('addAuthorForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('http://localhost:5000/authors/add', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    const messageDiv = document.getElementById('message');

    if (response.ok) {
      messageDiv.innerHTML = `<div class="alert alert-success">تم إضافة المؤلف بنجاح!</div>`;
      form.reset();
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger">حدث خطأ: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('خطأ:', error);
    document.getElementById('message').innerHTML = `<div class="alert alert-danger">حدث خطأ في الاتصال بالخادم.</div>`;
  }
});
