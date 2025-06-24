let summaryText = '';
let uploadedPDF = null;
let fileUrl = '';

// رفع ملف يدوي من الجهاز
document.getElementById('pdf-upload').addEventListener('change', function () {
  uploadedPDF = this.files[0];
  if (!uploadedPDF) return;

  document.getElementById('upload-screen').style.display = 'none';
  document.getElementById('viewer-screen').style.display = 'block';
  document.getElementById('pdf-name').textContent = "Fichier : " + uploadedPDF.name;
  document.getElementById('pdf-viewer').src = URL.createObjectURL(uploadedPDF);
});

// التبديل بين التبويبات وتنفيذ التلخيص الذكي
function switchTab(tab) {
  const pdfPanel = document.getElementById('pdf-panel');
  const summaryPanel = document.getElementById('summary-panel');
  const tabPDF = document.getElementById('tab-pdf');
  const tabSummary = document.getElementById('tab-summary');

  pdfPanel.style.display = tab === 'pdf' ? 'block' : 'none';
  summaryPanel.style.display = tab === 'summary' ? 'block' : 'none';
  tabPDF.classList.toggle('active-tab', tab === 'pdf');
  tabSummary.classList.toggle('active-tab', tab === 'summary');

  if (tab === 'summary' && !summaryText) {
    summarizeFile();
  }
}

// تلخيص الملف (يدوي أو من المكتبة) باستخدام الذكاء الاصطناعي
async function summarizeFile() {
  try {
  
    let res;

    if (uploadedPDF) {
      const formData = new FormData();
      formData.append("pdf", uploadedPDF);
      formData.append("userId", userId);
      res = await fetch('http://localhost:5000/summarize-pdf', { method: 'POST', body: formData });
    } else if (fileUrl) {
      res = await fetch('http://localhost:5000/summarize-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, userId })
      });
    }

    if (res) {
      const data = await res.json();
      summaryText = data.summary || 'Résumé non disponible.';
      document.getElementById('summary').value = summaryText;
      document.getElementById('download-btn').style.display = 'inline-block';
    }
  } catch (err) {
    document.getElementById('summary').value = 'Erreur lors du résumé.';
  }
}



// وظائف إضافية
function insertQuestion(text) {
  document.getElementById('chat-input').value = text;
}

function downloadSummary() {
  const blob = new Blob([summaryText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function sendQuestion() {
  const question = document.getElementById('chat-input').value.trim();
  if (!question || !summaryText) return;

  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<p><strong>Vous:</strong> ${question}</p>`;

  fetch('http://localhost:5000/chat-with-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: summaryText, question })
  })
  .then(res => res.json())
  .then(data => {
    chatBox.innerHTML += `<p><strong>IA:</strong> ${data.answer}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    document.getElementById('chat-input').value = '';
  });
}

// عند تحميل الصفحة، تحديد الملف من الرابط إذا موجود
window.addEventListener('DOMContentLoaded', () => {
 const urlParams = new URLSearchParams(window.location.search);
fileUrl = urlParams.get('file') || '';
const tab = urlParams.get('tab') || 'pdf';
const summary = urlParams.get('summary');
userId = urlParams.get('userId') || localStorage.getItem('userId') || '';

if (fileUrl) {
  document.getElementById('upload-screen').style.display = 'none';
  document.getElementById('viewer-screen').style.display = 'block';
  document.getElementById('pdf-name').textContent = 'Fichier : ' + decodeURIComponent(fileUrl);
  document.getElementById('pdf-viewer').src = decodeURIComponent(fileUrl);
}

if (summary) {
  document.getElementById('summary').value = decodeURIComponent(summary);
  summaryText = decodeURIComponent(summary);
  document.getElementById('download-btn').style.display = 'inline-block';
}

switchTab(tab);

  if (fileUrl) {
    document.getElementById('upload-screen').style.display = 'none';
    document.getElementById('viewer-screen').style.display = 'block';
    document.getElementById('pdf-name').textContent = 'Fichier : ' + decodeURIComponent(fileUrl);
    document.getElementById('pdf-viewer').src = decodeURIComponent(fileUrl);
  }

  if (summary) {
    document.getElementById('summary').value = decodeURIComponent(summary);
    summaryText = decodeURIComponent(summary);
    document.getElementById('download-btn').style.display = 'inline-block';
  }

  switchTab(tab);
});

// قراءة الملخص صوتيًا
document.getElementById('speak-btn').addEventListener('click', () => {
  const summary = summaryText || document.getElementById('summary').value;
  if (!summary) return;

  const utterance = new SpeechSynthesisUtterance(summary);
  utterance.lang = 'fr-FR';
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
});
