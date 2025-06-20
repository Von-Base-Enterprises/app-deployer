# App Deployer 🚀

**Drop your app files and get a live URL instantly**

A beautiful, minimal drag-and-drop interface for deploying applications using the Landing Page API. Upload HTML files, ZIP archives, or folders and get a shareable URL in seconds.

## Features

- 🎯 **One-click deployment**: Drag, drop, get URL
- 📱 **Mobile responsive**: Works on all devices  
- ⚡ **Instant feedback**: Real-time progress and visual states
- 🎨 **Beautiful UI**: Clean, modern design focused on the core task
- 📋 **Easy sharing**: One-click URL copying and QR codes
- 🔄 **Smart processing**: Automatically extracts titles and metadata

## Supported File Types

- **HTML files** (`.html`, `.htm`) - Automatically extracts title and description
- **ZIP archives** (`.zip`) - Processes compressed applications
- **Multiple files** - Handles folders and file collections

## How It Works

1. **Drop files** onto the drop zone or click to browse
2. **Processing** automatically extracts metadata and content
3. **Deployment** creates a live landing page via API
4. **Share** your instantly generated URL anywhere

## Local Development

### Prerequisites
- Any modern web browser
- Local web server (optional, for file:// protocol limitations)

### Quick Start

```bash
# Clone or download the files
git clone <repo-url>
cd app-deployer

# Option 1: Open directly
open index.html

# Option 2: Use a local server (recommended)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Visit `http://localhost:8000` in your browser.

## Deployment Options

### Static Hosting (Recommended)
Deploy to any static hosting service:

- **Netlify**: Drag the folder to Netlify dashboard
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Push to `gh-pages` branch
- **Render Static Site**: Connect repository

### CDN/S3
Upload `index.html` and `script.js` to any CDN or S3 bucket with public access.

### Same Server as API
Copy files to the `public` folder of your Landing Page API server:

```bash
cp -r app-deployer/* landing-page-api/public/
```

## Configuration

### API Endpoint
Update the API URL in `script.js`:

```javascript
this.apiUrl = 'https://your-api-domain.com';
```

### Customization
- **Colors**: Edit CSS custom properties in `index.html`
- **Branding**: Update title, headers, and footer links  
- **File Types**: Modify accepted types in JavaScript
- **Features**: Add/remove processing logic as needed

## File Processing Logic

### HTML Files
1. Reads file content as text
2. Extracts `<title>` tag for page title
3. Extracts `<meta name="description">` for description
4. Uses filename as fallback title

### ZIP Files
1. Detects ZIP files by extension
2. Uses filename (without extension) as title
3. Creates descriptive text about the ZIP content
4. Future: Could extract and process internal files

### Multiple Files
1. Prioritizes HTML files (especially `index.html`)
2. Falls back to first file for naming
3. Creates generic description for file collections

## API Integration

The frontend integrates with the [Landing Page API](https://github.com/Von-Base-Enterprises/landing-page-api):

```javascript
// POST /api/pages
{
  "title": "Extracted App Title",
  "subtitle": "Deployed Application", 
  "description": "Auto-generated description",
  "ctaText": "View Source Files",
  "ctaUrl": "#",
  "accentColor": "#667eea",
  "template": "default"
}

// Response
{
  "success": true,
  "page": { /* page data */ },
  "url": "https://api-domain.com/page-id"
}
```

## Browser Support

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features used**: 
  - Drag and Drop API
  - Fetch API  
  - ES6 Classes
  - CSS Grid/Flexbox
  - File API

## Security Considerations

- **Client-side processing**: Files are processed in the browser
- **No file upload**: Only metadata is sent to the API
- **CORS**: Ensure API allows cross-origin requests
- **Content validation**: Basic HTML parsing and sanitization

## Performance

- **Zero dependencies**: Pure vanilla JavaScript
- **Lightweight**: < 50KB total size
- **Fast processing**: Client-side file handling
- **Responsive**: Optimized for mobile and desktop

## Roadmap

- [ ] **ZIP extraction**: Full ZIP file processing with JSZip
- [ ] **File preview**: Show thumbnails of uploaded content  
- [ ] **Multiple templates**: Choose different landing page styles
- [ ] **Custom domains**: Integration with custom domain services
- [ ] **Analytics**: Track deployment usage and success rates
- [ ] **PWA features**: Offline support and app-like experience

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use for personal and commercial projects.

## Support

- **Issues**: [GitHub Issues](https://github.com/Von-Base-Enterprises/app-deployer/issues)
- **API Docs**: [Landing Page API](https://github.com/Von-Base-Enterprises/landing-page-api)
- **Contact**: support@vonbase.com