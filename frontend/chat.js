
async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    const messagesDiv = document.getElementById('messages');

    if (userInput.trim() === "") return;

    // عرض رسالة المستخدم
    messagesDiv.innerHTML += `<div><strong>أنت:</strong> ${userInput}</div>`;
    document.getElementById('user-input').value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userInput }]
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        // عرض رد الذكاء الصناعي
        messagesDiv.innerHTML += `<div><strong>ChatGPT:</strong> ${botReply}</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

    } catch (error) {
        messagesDiv.innerHTML += `<div><strong>خطأ:</strong> ${error.message}</div>`;
    }
}
