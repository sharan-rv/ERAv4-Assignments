# Troubleshooting Guide

## Extension is Greyed Out

If the "Fullscreen Toggle" extension appears greyed out and you can't click on it, follow these steps:

### Step 1: Reload the Extension
1. Go to `chrome://extensions/`
2. Find "Fullscreen Toggle" in the list
3. Click the **refresh/reload button** (🔄) next to the extension
4. Wait for it to reload

### Step 2: Check for Errors
1. After reloading, look for any error messages in red
2. If there are errors, they will appear below the extension name
3. Common errors and solutions:
   - **"Could not load manifest"** → Check manifest.json syntax
   - **"Could not load background script"** → Check background.js syntax
   - **"Could not load popup"** → Check popup.html/popup.js syntax

### Step 3: Enable Developer Mode
1. Make sure "Developer mode" is enabled (toggle in top-right corner)
2. The extension should show as "Enabled" with a blue toggle

### Step 4: Test the Extension
1. Click on the extension icon in the toolbar
2. A popup should appear with two buttons
3. Click "Test Extension" to verify it's working
4. Click "Toggle Fullscreen" to test the functionality

### Step 5: Check Console for Errors
1. Right-click the extension icon → "Inspect popup"
2. Check the Console tab for any error messages
3. Also check the background script console:
   - Go to `chrome://extensions/`
   - Find your extension
   - Click "service worker" link
   - Check the Console tab

### Step 6: Keyboard Shortcut Test
1. Go to `chrome://extensions/shortcuts`
2. Find "Fullscreen Toggle" in the list
3. Make sure the shortcut is set to `Ctrl+Shift+F`
4. Try pressing the shortcut on any webpage

## Common Issues

### Extension Won't Load
- Check that all files exist in the folder
- Verify JSON syntax in manifest.json
- Make sure no files are missing

### Shortcut Not Working
- Check for conflicts with other extensions
- Try a different shortcut combination
- Make sure the extension is enabled

### Fullscreen Not Working
- Some websites block fullscreen for security
- Try on a simple website like google.com
- Check browser console for errors

## Files Checklist
Make sure these files exist in your extension folder:
- ✅ manifest.json
- ✅ background.js
- ✅ popup.html
- ✅ popup.js

## Still Having Issues?
1. Try removing and re-adding the extension
2. Check Chrome's error console (F12 → Console)
3. Restart Chrome completely
4. Try in an incognito window
