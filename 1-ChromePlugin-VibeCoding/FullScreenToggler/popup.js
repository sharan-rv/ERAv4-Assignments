document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    const testBtn = document.getElementById('testBtn');
    const statusDiv = document.getElementById('status');

    function showStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + (isError ? 'error' : 'success');
    }

    // Test extension functionality
    testBtn.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: 'test'}, function(response) {
            if (chrome.runtime.lastError) {
                showStatus('Extension test failed: ' + chrome.runtime.lastError.message, true);
            } else {
                showStatus('Extension is working!');
            }
        });
    });

    // Toggle fullscreen button
    toggleBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    function: toggleFullscreen
                }).then(() => {
                    showStatus('Fullscreen toggled!');
                }).catch((error) => {
                    showStatus('Error: ' + error.message, true);
                });
            } else {
                showStatus('No active tab found', true);
            }
        });
    });
});

// Function to toggle fullscreen mode
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
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
