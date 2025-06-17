# Widescreen Browsing (Enhanced Fork)

Some webpages like Wikipedia insist on using the whole screen width, which makes them annoying to read. This extension reduces the width of webpages on screen. You can set a custom width per domain, which will be saved and automatically applied everytime you go to this domain.

## Enhanced Features (This Fork)

This fork adds several powerful new features for better URL-specific control:

### 🌟 **Global Settings with Site Exceptions**

- **Global Toggle**: Enable widescreen for ALL websites with one click
- **Site Exceptions**: Easily disable specific sites (like Google Maps) while keeping global settings
- **Smart Workflow**: Enable globally → Create exceptions as needed

### 🎯 **Flexible URL Matching Patterns**

Choose exactly how broad or specific your rules should be:

- **Exact URL**: Match the complete URL including parameters
- **Path Only**: Match URL path with customizable depth levels
- **Domain Only**: Match entire domain

### 🔧 **Path Level Control**

For "Path Only" matching, choose the depth:

- **Level 1**: `google.com/maps` (matches all maps)
- **Level 2**: `google.com/maps/search` (matches all searches)

Perfect for handling URLs with changing parameters like Google Maps locations.

## Screenshots

|                              Global Settings                              |                        Flexible URL Patterns                        |
| :-----------------------------------------------------------------------: | :-----------------------------------------------------------------: |
| ![Global toggle for all sites](./publish/screenshots/Screenshot1.svg.png) | ![URL pattern selection](./publish/screenshots/Screenshot3.svg.png) |

## How to Use

### **Quick Setup (Recommended):**

1. Go to any website
2. ✅ Check "**limit page width**" (applies globally)
3. Set your preferred width (e.g., 1200px)
4. Now ALL websites use widescreen!

### **Create Exceptions:**

1. Visit a problematic site (e.g., Google Maps)
2. ✅ Check "**disable for this site**"
3. Choose pattern:
   - **Path only** → **Level 1** for `google.com/maps/*`
   - **Domain only** for entire `google.com`
   - **Exact URL** for that specific page only

### **Real-World Examples:**

**Google Maps with dynamic parameters:**

```
URL: https://www.google.com/maps/@36.5299245,-101.3618552,6.55z?entry=ttu&g_ep=...
Pattern: Path only → Level 1
Result: Disables ALL google.com/maps/* URLs
```

**YouTube specific video:**

```
URL: https://www.youtube.com/watch/abc123?t=30s
Pattern: Path only → Level 2
Result: Disables only youtube.com/watch/abc123
```

**Entire domain:**

```
URL: https://www.reddit.com/r/programming/comments/xyz
Pattern: Domain only
Result: Disables ALL reddit.com URLs
```

## Installation

### From Source (Recommended for this fork):

1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension will be loaded with all enhanced features

### Building from Source:

```bash
python build.py
```

This creates zip files for both Chrome and Firefox in the `build/` directory.

## Enhanced Features Details

### **Storage Structure:**

```javascript
// Global settings (applied everywhere)
globalSettings: {
    activated: true,
    width: 1200,
    method: "automatic"
}

// URL-specific exceptions
"www.google.com/maps": {
    disabled: true,
    pattern: "path",
    pathLevel: 1
}
```

### **Smart Pattern Matching:**

The extension checks settings in order of specificity:

1. **Exact URL** (most specific)
2. **Path Level 2** (medium-high)
3. **Path Level 1** (medium)
4. **Domain** (least specific)

Uses the most specific match found.

## Special Rules Support

The extension still supports the original `rules.js` for automatic site-specific adjustments:

```javascript
rules = [
  {
    page: "[^ ]*.wikipedia.org", // regex pattern
    preferred: "absolute", // preferred positioning method
    rules: {
      // custom CSS adjustments
      ".mwe-popups, .rt-tooltip": { "margin-left": `-${hw}px` },
      ".suggestions": { "margin-right": `-${hw - 15}px` },
    },
  },
]
```

Rules are automatically applied when "automatic" positioning method is selected.

## Differences from Original

| Feature                | Original                    | Enhanced Fork                       |
| ---------------------- | --------------------------- | ----------------------------------- |
| **Settings Scope**     | Per-domain only             | Global + exceptions                 |
| **URL Matching**       | Domain only                 | Exact/Path/Domain patterns          |
| **Path Control**       | None                        | 2-level path depth                  |
| **Parameter Handling** | Poor (creates new settings) | Smart (ignores parameters)          |
| **Workflow**           | Configure each site         | Enable globally, disable exceptions |

## Contributing

Feel free to submit issues and pull requests! This fork focuses on:

- Better user experience for URL pattern matching
- Global settings with site-specific overrides
- Smart handling of dynamic URLs with parameters

## Credits

- **Original Extension**: [nilshellerhoff/widescreen-browsing](https://github.com/nilshellerhoff/widescreen-browsing)
- **Enhanced Fork**: Adds global settings, flexible URL patterns, and path-level control

## License

Same as original project.
