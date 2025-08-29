# Fullscreen Toggle Chrome Extension

A lightweight Chrome extension that adds a keyboard shortcut to toggle fullscreen mode on any webpage.

## Features

- **Keyboard Shortcut**: Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac) to toggle fullscreen
- **Lightweight**: Minimal code, no popup, no UI clutter
- **Cross-browser Compatible**: Works with standard and webkit fullscreen APIs
- **Simple**: Just install and use - no configuration needed

## Installation

1. **Download/Clone** this extension to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the `Plug-In-Two` folder
5. **Generate Icons** (optional):
   - Open `generate-icons.html` in your browser
   - Right-click each icon and save as `icon16.png`, `icon48.png`, and `icon128.png`
   - Place them in the extension folder

## Usage

- **Toggle Fullscreen**: Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
- The extension will toggle fullscreen mode for the current tab
- Works on any webpage that supports fullscreen mode

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker that handles the keyboard shortcut
- `icon.svg` - Source icon file
- `generate-icons.html` - Tool to generate PNG icons
- `README.md` - This file

## Customization

To change the keyboard shortcut:
1. Go to `chrome://extensions/shortcuts`
2. Find "Fullscreen Toggle" in the list
3. Click the pencil icon and set your preferred shortcut

## Troubleshooting

- **Shortcut not working**: Make sure the extension is enabled and check for conflicts with other extensions
- **Fullscreen not working**: Some websites may block fullscreen mode for security reasons
- **Icons not showing**: Generate the PNG icons using the provided HTML tool

## Permissions

This extension only requests:
- `activeTab` - To access the current tab
- `scripting` - To inject the fullscreen toggle script

No data is collected or transmitted.
