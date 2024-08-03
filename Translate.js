// Translate.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const messagesDiv = document.getElementById('messages');
  const inputMessage = document.getElementById('input-message');
  const languageSelect = document.getElementById('language-select');
  const imageInput = document.getElementById('image-input');
  const translateImageBtn = document.getElementById('translate-image-btn');
  const startAudioBtn = document.getElementById('start-audio-btn');

  async function translateText(text, targetLang) {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    return data[0][0][0];
  }

  function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.textContent = text;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the bottom
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userMessage = inputMessage.value.trim();
    const selectedLanguage = languageSelect.value;
    if (userMessage) {
      addMessage(userMessage, 'user');
      inputMessage.value = '';

      // Translate user message
      const botResponse = await translateText(userMessage, selectedLanguage);
      addMessage(botResponse, 'bot');
    }
  });

  translateImageBtn.addEventListener('click', () => {
    const imageFile = imageInput.files[0];
    const selectedLanguage = languageSelect.value;
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
          Tesseract.recognize(
            img,
            'eng',
            {
              logger: m => console.log(m)
            }
          ).then(({ data: { text } }) => {
            translateText(text, selectedLanguage).then(translatedText => {
              addMessage(`Original: ${text}`, 'user');
              addMessage(`Translated: ${translatedText}`, 'bot');
            });
          });
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      alert("Please select an image file.");
    }
  });

  startAudioBtn.addEventListener('click', () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = function(event) {
      const audioText = event.results[0][0].transcript;
      const selectedLanguage = languageSelect.value;
      addMessage(`Audio: ${audioText}`, 'user');

      translateText(audioText, selectedLanguage).then(translatedText => {
        addMessage(`Translated: ${translatedText}`, 'bot');
      });
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      alert('Error occurred in speech recognition: ' + event.error);
    };
  });
});
