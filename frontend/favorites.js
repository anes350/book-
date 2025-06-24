// جلب قائمة الكتب المفضلة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchFavorites);

async function fetchFavorites() {
  // يجب أن يكون المستخدم مسجلاً الدخول والحصول على التوكن
  const token = localStorage.getItem('token'); // تأكد من تخزين التوكن بعد تسجيل الدخول

  if (!token) {
    document.getElementById('favorites-list').innerHTML = `<div class="col-12"><p class="text-center text-danger">يرجى تسجيل الدخول لرؤية المفضلة.</p></div>`;
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/users/favorites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const books = await response.json();

    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = ''; // مسح القائمة الحالية

    if (books.length === 0) {
      favoritesList.innerHTML = `<div class="col-12"><p class="text-center">لا توجد كتب في المفضلة بعد.</p></div>`;
      return;
    }

    books.forEach(book => {
      const bookItem = document.createElement('div');
      bookItem.className = 'col-md-4 book-card';

      const coverImage = book.coverImage ? `http://localhost:5000/${book.coverImage}` : 'default-cover.jpg';

      bookItem.innerHTML = `
        <div class="card h-100">
          <img src="${coverImage}" class="card-img-top" alt="${book.title}">
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <p class="card-text"><strong>المؤلف:</strong> ${book.author.name}</p>
            <p class="card-text"><strong>الفئة:</strong> ${book.category}</p>
            <a href="bookDetails.html?id=${book._id}" class="btn btn-info">عرض التفاصيل</a>
            <a href="http://localhost:5000/${book.downloadLink}" class="btn btn-primary" download>تحميل الكتاب</a>
          </div>
        </div>
      `;

      favoritesList.appendChild(bookItem);
    });
  } catch (error) {
    console.error('خطأ في جلب الكتب المفضلة:', error);
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = `<div class="col-12"><p class="text-center text-danger">حدث خطأ في جلب الكتب المفضلة.</p></div>`;
  }
}
