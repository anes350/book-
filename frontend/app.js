document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    // هنا يمكنك تنفيذ طلب إلى الخادم للبحث عن الكتب
    console.log('بحث عن:', query);
  });
  // جلب قائمة الكتب عند تحميل الصفحة
fetch('http://localhost:5000/books')
.then(response => response.json())
.then(data => {
  const bookList = document.getElementById('book-list');
  data.forEach(book => {
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    bookItem.innerHTML = `
      <img src="${book.coverImage}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>${book.author}</p>
    `;
    bookList.appendChild(bookItem);
  });
})
.catch(error => console.error('خطأ في جلب الكتب:', error));
document.getElementById('search-button').addEventListener('click', function() {
  const query = document.getElementById('search-input').value;

  fetch(`http://localhost:5000/books/search?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      // تحديث قائمة الكتب بناءً على نتائج البحث
    })
    .catch(error => console.error('خطأ في البحث:', error));
});
$(function() {
  var availableTags = [
    "كتاب 1",
    "كتاب 2",
    "مؤلف 1",
    "مؤلف 2"
    // قم بجلب هذه البيانات من الخادم
  ];
  $("#search-input").autocomplete({
    source: availableTags
  });
});
