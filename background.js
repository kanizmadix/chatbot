if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('background.js').then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'getWebsiteInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: extractWebsiteInfo
      }, function(result) {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ data: result[0] });
        }
      });
    });

    // Indicate that we want to use sendResponse asynchronously
    return true;
  }
});

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

chrome.management.get('your_extension_id', function(extensionInfo) {
  if (extensionInfo) {
    console.log('Your extension is installed.');
  } else {
    console.log('Your extension is not installed.');
  }
});
