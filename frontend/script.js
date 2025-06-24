document.getElementById('generate-button').addEventListener('click', async () => {
  const topic = document.getElementById('topic')?.value.trim();
  const subheadings = document.getElementById('subheadings')?.value.trim();
  const notes = document.getElementById('notes')?.value.trim();
  const tone = document.getElementById('tone')?.value.trim();
  const length = document.getElementById('length')?.value.trim();

  // تحقق من الحقول المطلوبة
  if (!topic || !length) {
    alert('❌ يرجى تعبئة جميع الحقول المطلوبة: الموضوع وعدد الكلمات.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/generate-gemini-essay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        subheadings: subheadings || '',
        notes: notes || '',
        tone: tone || '',
        length,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'فشل في توليد المقال');
    }

    document.querySelector('.editor-area').textContent = data.essay || 'لم يتم توليد نص.';
  } catch (error) {
    console.error('Error:', error);
    alert(`❌ ${error.message}`);
  }
});
 const languageSelect = document.getElementById('language');
const choices = new Choices(languageSelect, {
  searchEnabled: false,
  itemSelectText: '',
  callbackOnCreateTemplates: function(template) {
    return {
      option: (classNames, data) => {
        return template(`
          <div class="${classNames.item} ${classNames.itemChoice}" data-select-text="" data-choice data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
            <img src="${JSON.parse(data.customProperties).flag}" style="width:22px;vertical-align:middle;margin-right:8px;">${data.label}
          </div>
        `);
      },
      item: (classNames, data) => {
        return template(`
          <div class="${classNames.item} ${classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
            <img src="${JSON.parse(data.customProperties).flag}" style="width:22px;vertical-align:middle;margin-right:8px;">${data.label}
          </div>
        `);
      }
    };
  }
});

// إضافة خاصية العلم لكل خيار
Array.from(languageSelect.options).forEach(option => {
  option.dataset.customProperties = JSON.stringify({ flag: option.getAttribute('data-flag') });
});
// عكس القائمة عند تحميل الصفحة
window.onload = function() {
  reverseLanguageOptions();
};