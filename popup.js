var chatMessagesContainer = document.getElementById('chat-messages');
var userInputField = document.getElementById('user-input');

function toggleChatbot() {
  var chatbotContainer = document.getElementById('chatbot-container');
  chatbotContainer.style.display = (chatbotContainer.style.display === 'none') ? 'block' : 'none';
}

function sendMessage() {
  var userMessage = userInputField.value.trim();
  if (userMessage !== '') {
    appendMessage('user', userMessage);

    // Process user message and get bot's response
    processUserMessage(userMessage);

    userInputField.value = ''; // Clear the input field
  }
}

function appendMessage(sender, message) {
  var messageDiv = document.createElement('div');
  messageDiv.className = 'message ' + sender;
  messageDiv.textContent = message;
  chatMessagesContainer.appendChild(messageDiv);

  // Scroll to the bottom to show the latest message
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function processUserMessage(userMessage) {
  var botResponse = '';

  if (userMessage.toLowerCase().includes('website information')) {
    // Extract information from the website
    getWebsiteInfo()
      .then(info => {
        botResponse = 'Here is the website information:\n' + info;
        appendMessage('bot', botResponse);
      })
      .catch(error => {
        console.error('Error extracting website information:', error);
        botResponse = "I'm sorry, I couldn't retrieve the website information.";
        appendMessage('bot', botResponse);
      });
  } else {
    // Provide a default response
    botResponse = "I'm sorry, I didn't understand that. How can I assist you?";
    appendMessage('bot', botResponse);
  }
}

async function getWebsiteInfo() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: extractWebsiteInfo
      }, function (result) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[0]);
        }
      });
    });
  });
}

function extractWebsiteInfo() {
  var websiteInfo = {
    title: document.title,
    url: window.location.href,
    metaTags: Array.from(document.getElementsByTagName('meta')).map(tag => ({
      name: tag.getAttribute('name'),
      content: tag.getAttribute('content')
    })),
    // Add more information extraction logic as needed
  };

  return websiteInfo;
}
