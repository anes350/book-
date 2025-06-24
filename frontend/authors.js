// جلب قائمة المؤلفين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchAuthors);

async function fetchAuthors() {
  try {
    const response = await fetch('http://localhost:5000/authors');
    const authors = await response.json();

    const authorsList = document.getElementById('authors-list');
    authorsList.innerHTML = ''; // مسح القائمة الحالية

    if (authors.length === 0) {
      authorsList.innerHTML = `<div class="col-12"><p class="text-center">لا توجد مؤلفين متاحين.</p></div>`;
      return;
    }

    authors.forEach(author => {
      const authorItem = document.createElement('div');
      authorItem.className = 'col-md-4';

      const authorImage = author.photo ? `http://localhost:5000/${author.photo}` : 'default-author.jpg';

      authorItem.innerHTML = `
        <div class="card mb-4">
          <img src="${authorImage}" class="card-img-top" alt="${author.name}">
          <div class="card-body">
            <h5 class="card-title">${author.name}</h5>
            <p class="card-text">${author.bio ? author.bio : 'لا يوجد وصف للمؤلف.'}</p>
            <a href="authorBooks.html?id=${author._id}" class="btn btn-info">عرض كتب المؤلف</a>
          </div>
        </div>
      `;

      authorsList.appendChild(authorItem);
    });
  } catch (error) {
    console.error('خطأ في جلب المؤلفين:', error);
    const authorsList = document.getElementById('authors-list');
    authorsList.innerHTML = `<div class="col-12"><p class="text-center text-danger">حدث خطأ في جلب المؤلفين.</p></div>`;
  }
}
