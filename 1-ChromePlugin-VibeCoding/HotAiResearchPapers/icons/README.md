# Icon Generation Instructions

## Problem
The Chrome extension requires PNG icon files in specific sizes (16x16, 48x48, 128x128), but we only have SVG files.

## Solution
Use the provided icon generator files to create the required PNG icons:

### Option 1: Use the HTML Icon Generator
1. Open `icon-generator.html` in your browser
2. Right-click on each generated icon
3. Select "Save image as..."
4. Save with the correct filename:
   - `icon16.png` (16x16)
   - `icon48.png` (48x48) 
   - `icon128.png` (128x128)

### Option 2: Use the Advanced Icon Generator
1. Open `create-icons.html` in your browser
2. Click the download buttons for each icon size
3. Save the files in the icons folder

### Option 3: Manual Creation
Create simple PNG icons using any image editor:
- 16x16 pixels
- 48x48 pixels
- 128x128 pixels
- Use a fire emoji (🔥) on a gradient background

## After Creating Icons
Once you have the PNG files, update `manifest.json` to include them:

```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

## Current Status
- ✅ SVG icon created
- ❌ PNG icons needed
- ✅ Icon generators provided
- ❌ Extension won't load without PNG icons

**Note**: The extension will work without icons, but Chrome may show a default icon or warning.
