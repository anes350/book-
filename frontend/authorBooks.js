// جلب كتب المؤلف عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchAuthorBooks);

async function fetchAuthorBooks() {
  const urlParams = new URLSearchParams(window.location.search);
  const authorId = urlParams.get('id');

  if (!authorId) {
    document.getElementById('author-books-list').innerHTML = `<div class="col-12"><p class="text-center text-danger">لم يتم تحديد المؤلف.</p></div>`;
    return;
  }

  try {
    // جلب بيانات المؤلف
    const authorResponse = await fetch(`http://localhost:5000/authors/${authorId}`);
    const author = await authorResponse.json();

    if (!authorResponse.ok) {
      document.getElementById('author-books-list').innerHTML = `<div class="col-12"><p class="text-center text-danger">لم يتم العثور على المؤلف.</p></div>`;
      return;
    }

    // تحديث عنوان الصفحة باسم المؤلف
    document.getElementById('author-name').textContent = `كتب المؤلف: ${author.name}`;

    const books = author.books;

    const authorBooksList = document.getElementById('author-books-list');
    authorBooksList.innerHTML = ''; // مسح القائمة الحالية

    if (books.length === 0) {
      authorBooksList.innerHTML = `<div class="col-12"><p class="text-center">لا توجد كتب لهذا المؤلف بعد.</p></div>`;
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
            <p class="card-text"><strong>الفئة:</strong> ${book.category}</p>
            <a href="bookDetails.html?id=${book._id}" class="btn btn-info">عرض التفاصيل</a>
            <a href="http://localhost:5000/${book.downloadLink}" class="btn btn-primary" download>تحميل الكتاب</a>
          </div>
        </div>
      `;

      authorBooksList.appendChild(bookItem);
    });
  } catch (error) {
    console.error('خطأ في جلب كتب المؤلف:', error);
    const authorBooksList = document.getElementById('author-books-list');
    authorBooksList.innerHTML = `<div class="col-12"><p class="text-center text-danger">حدث خطأ في جلب كتب المؤلف.</p></div>`;
  }
}
