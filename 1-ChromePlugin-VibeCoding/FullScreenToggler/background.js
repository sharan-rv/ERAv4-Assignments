// Listen for keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  
  if (command === "toggle-fullscreen") {
    // Get the active tab and inject the fullscreen toggle script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        console.log('Active tab found:', tabs[0].id);
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: toggleFullscreen
        }).then(() => {
          console.log('Script executed successfully');
        }).catch((error) => {
          console.error('Error executing script:', error);
        });
      } else {
        console.error('No active tab found');
      }
    });
  }
});

// Function to toggle fullscreen mode
function toggleFullscreen() {
  console.log('Toggle fullscreen function called');
  
  if (!document.fullscreenElement) {
    console.log('Entering fullscreen mode');
    // Enter fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  } else {
    console.log('Exiting fullscreen mode');
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

// Add a simple test function that can be called from the console
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "test") {
    console.log('Extension is working!');
    sendResponse({status: 'Extension is working!'});
  }
});
