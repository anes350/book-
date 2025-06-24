document.addEventListener('DOMContentLoaded', () => {
  fetchBookDetails();
  document.getElementById('ratingForm').addEventListener('submit', submitRating);
  document.getElementById('commentForm').addEventListener('submit', submitComment);
});

async function fetchBookDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');

  if (!bookId) {
    document.getElementById('book-details').innerHTML = `<div class="alert alert-danger">لم يتم تحديد الكتاب.</div>`;
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/books/${bookId}`);
    const book = await response.json();

    if (!response.ok) {
      document.getElementById('book-details').innerHTML = `<div class="alert alert-danger">لم يتم العثور على الكتاب.</div>`;
      return;
    }

    const coverImage = book.coverImage ? `http://localhost:5000/${book.coverImage}` : 'default-cover.jpg';

    document.getElementById('book-details').innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img src="${coverImage}" class="img-fluid" alt="${book.title}">
        </div>
        <div class="col-md-8">
          <h2>${book.title}</h2>
          <p><strong>المؤلف:</strong> ${book.author}</p>
          <p><strong>الفئة:</strong> ${book.category}</p>
          <p><strong>الوصف:</strong> ${book.description}</p>
          <p><strong>التقييم:</strong> ${book.rating ? book.rating.toFixed(2) : '0'} نجوم</p>
          <a href="http://localhost:5000/${book.downloadLink}" class="btn btn-primary" download>تحميل الكتاب</a>
        </div>
      </div>
    `;

    // عرض التعليقات
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    if (book.comments && book.comments.length > 0) {
      book.comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'card mb-2';
        commentDiv.innerHTML = `
          <div class="card-body">
            <p class="card-text">${comment.body}</p>
            <p class="card-text"><small class="text-muted">${new Date(comment.date).toLocaleString()}</small></p>
          </div>
        `;
        commentsList.appendChild(commentDiv);
      });
    } else {
      commentsList.innerHTML = `<p>لا توجد تعليقات بعد.</p>`;
    }

    // إذا كان الكتاب PDF، عرض قسم القراءة
    if (book.downloadLink && book.downloadLink.endsWith('.pdf')) {
      document.getElementById('readBookSection').style.display = 'block';
      const pdfUrl = `http://localhost:5000/${book.downloadLink}`;
      renderPDF(pdfUrl);
    } else {
      document.getElementById('readBookSection').style.display = 'none';
    }
}

async function submitRating(e) {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  const rating = document.getElementById('rating').value;

  if (!rating) {
    document.getElementById('ratingMessage').innerHTML = `<div class="alert alert-danger">يرجى اختيار تقييم.</div>`;
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/books/${bookId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rating: parseInt(rating) })
    });

    const result = await response.json();

    const messageDiv = document.getElementById('ratingMessage');

    if (response.ok) {
      messageDiv.innerHTML = `<div class="alert alert-success">تم تقييم الكتاب بنجاح!</div>`;
      fetchBookDetails(); // تحديث تفاصيل الكتاب لعرض التقييم الجديد
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger">حدث خطأ: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('خطأ في تقييم الكتاب:', error);
    document.getElementById('ratingMessage').innerHTML = `<div class="alert alert-danger">حدث خطأ في الاتصال بالخادم.</div>`;
  }
}

async function submitComment(e) {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  const comment = document.getElementById('comment').value;

  if (!comment) {
    document.getElementById('commentMessage').innerHTML = `<div class="alert alert-danger">يرجى كتابة تعليق.</div>`;
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/books/${bookId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment })
    });

    const result = await response.json();

    const messageDiv = document.getElementById('commentMessage');

    if (response.ok) {
      messageDiv.innerHTML = `<div class="alert alert-success">تم إضافة التعليق بنجاح!</div>`;
      document.getElementById('commentForm').reset();
      fetchBookDetails(); // تحديث تفاصيل الكتاب لعرض التعليق الجديد
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger">حدث خطأ: ${result.message}</div>`;
    }
  } catch (error) {
    console.error('خطأ في إضافة التعليق:', error);
    document.getElementById('commentMessage').innerHTML = `<div class="alert alert-danger">حدث خطأ في الاتصال بالخادم.</div>`;
  }
}

function renderPDF(url) {
  const loadingTask = pdfjsLib.getDocument(url);
  loadingTask.promise.then(pdf => {
    // تحميل الصفحة الأولى
    pdf.getPage(1).then(page => {
      const scale = 1.5;
      const viewport = page.getViewport({ scale: scale });

      const canvas = document.getElementById('pdf-render');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);
    });
  }, function (reason) {
    console.error(reason);
  });
}
