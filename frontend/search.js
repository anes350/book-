// تعريف Supabase
const SUPABASE_URL = "https://cpjqcdlwpcdttqqvpluv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwanFjZGx3cGNkdHRxcXZwbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzQ2MTcsImV4cCI6MjA1MDQ1MDYxN30.wxO6-9mGV-6Pip2M1MV8of-5H4qYJwMdaU06lo1SYw0";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase Client Initialized:", supabase);

// تأكد من أن DOM تم تحميله
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded");

  // تعريف عناصر DOM
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const bookListContainer = document.getElementById("bookListContainer");
  const bookList = document.getElementById("bookList");

  if (!searchInput || !searchButton || !bookListContainer || !bookList) {
    console.error("خطأ: لم يتم العثور على أحد العناصر المطلوبة!");
    return;
  }

  // دالة لجلب الكتب من قاعدة البيانات
  async function fetchBooks(query) {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .ilike("title", `%${query}%`);

      if (error) {
        console.error("خطأ في جلب البيانات:", error);
        return [];
      }

      console.log("بيانات جلبت بنجاح:", data);
      return data;
    } catch (err) {
      console.error("خطأ غير متوقع:", err);
      return [];
    }
  }

  // تشغيل البحث
  async function searchBooks() {
    const query = searchInput.value.trim();
    if (!query) {
      console.log("حقل البحث فارغ.");
      return;
    }

    console.log("جاري البحث عن:", query);

    const results = await fetchBooks(query);

    bookList.innerHTML = "";
    if (results.length > 0) {
      results.forEach((book) => {
        const card = document.createElement("div");
        card.classList.add("book-card");

        card.innerHTML = `
          <img src="${book.image_url || 'placeholder.jpg'}" alt="${book.title}" class="book-image">
          <div class="book-info">
            <h4 class="book-title">${book.title}</h4>
            <p class="book-author">By ${book.author}</p>
          </div>
        `;
        bookList.appendChild(card);
      });
      bookListContainer.style.display = "block";
    } else {
      bookListContainer.style.display = "block";
      bookList.innerHTML = "<p>لا توجد نتائج.</p>";
    }
  }

  // إضافة الأحداث
  searchButton.addEventListener("click", searchBooks);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchBooks();
    }
  });
});
