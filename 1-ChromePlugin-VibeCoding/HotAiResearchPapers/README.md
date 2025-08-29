# 🔥 AI Research Papers - Hot Papers Chrome Extension

A powerful Chrome extension that helps you discover the hottest AI research papers from arXiv, ranked by popularity, citations, downloads, and social engagement.

## ✨ Features

### 🎯 Smart Paper Discovery
- **Real-time Updates**: Get the latest papers from arXiv API
- **Intelligent Ranking**: Papers are ranked by a custom "hotness score" combining:
  - Recency (40% weight)
  - Citation count (30% weight)
  - Download count (20% weight)
  - Social media shares (10% weight)

### 📊 Multiple Time Periods
- **Today**: Latest papers from the last 24 hours
- **This Week**: Papers from the last 7 days
- **This Month**: Papers from the last 30 days

### 🔍 Advanced Filtering & Search
- **Category Filtering**: Filter by AI subcategories:
  - `cs.AI` - Artificial Intelligence
  - `cs.LG` - Machine Learning
  - `cs.CL` - Computational Linguistics
  - `cs.CV` - Computer Vision
  - `cs.NE` - Neural Computing
  - `stat.ML` - Statistics & Machine Learning
- **Search Functionality**: Search through titles, abstracts, and authors
- **Multiple Sort Options**: Sort by hotness, citations, downloads, or date

### 🚀 Enhanced User Experience
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Paper Cards**: Rich paper information with abstracts and metadata
- **Hot Badges**: Visual indicators for trending papers
- **Click to Open**: Direct links to arXiv papers and PDFs
- **Floating Action Button**: Quick access on research-related pages

### 💾 Smart Caching
- **Background Updates**: Automatic paper updates every 30 minutes
- **Local Storage**: Cached data for faster loading
- **Offline Support**: Access previously loaded papers without internet

## 🛠️ Installation

### Method 1: Load Unpacked Extension (Recommended for Development)

1. **Download/Clone** this repository to your local machine
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top right
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store for easy installation.

## 📱 Usage

### Basic Usage
1. **Click the extension icon** in your Chrome toolbar
2. **Select a time period** (Today/Week/Month)
3. **Browse hot papers** ranked by popularity
4. **Click on any paper** to open it on arXiv

### Advanced Features
- **Use filters** to narrow down by category
- **Search** for specific topics or authors
- **Sort papers** by different metrics
- **Refresh data** manually when needed

### Page Integration
- **Floating Button**: On research-related pages, a floating 🔥 button appears
- **Paper Detection**: Automatically detects and highlights papers mentioned on web pages
- **Context Awareness**: Provides relevant paper suggestions based on page content

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Built with the latest Chrome extension standards
- **Service Worker**: Background processing for data fetching and caching
- **Content Scripts**: Page integration and paper detection
- **Modern JavaScript**: ES6+ features and async/await patterns

### APIs Used
- **arXiv API**: Primary source for research papers
- **Semantic Scholar API**: Enhanced metrics (citations, downloads, social shares)
- **Chrome Extension APIs**: Storage, tabs, and runtime management

### Data Sources
- **Real-time arXiv feeds** for latest papers
- **Citation metrics** from Semantic Scholar
- **Social engagement data** for popularity scoring
- **Local caching** for performance optimization

## 🎨 Customization

### Settings
The extension stores user preferences locally:
- Auto-refresh intervals
- Category preferences
- Notification settings
- UI theme options

### Hotness Score Weights
You can modify the hotness score calculation by editing the weights in the code:
```javascript
paper.hotnessScore = (
    recencyScore * 0.4 +      // Recency weight
    citationScore * 0.3 +     // Citation weight
    downloadScore * 0.2 +     // Download weight
    socialScore * 0.1         // Social media weight
);
```

## 🚀 Development

### Project Structure
```
Assignment-1-ChromePlugin-VibeCoding/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.css             # Styling for popup
├── popup.js              # Main popup logic
├── background.js         # Service worker
├── content.js            # Content script for page integration
├── icons/                # Extension icons
└── README.md             # This file
```

### Building from Source
1. **Clone the repository**
2. **Install dependencies** (if any)
3. **Make modifications** as needed
4. **Load the extension** in Chrome using "Load unpacked"

### Contributing
Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📈 Performance

### Optimization Features
- **Lazy Loading**: Papers are loaded on-demand
- **Smart Caching**: 30-minute cache duration for API responses
- **Background Updates**: Non-blocking data refresh
- **Efficient DOM**: Minimal DOM manipulation for smooth UI

### Memory Usage
- **Lightweight**: Minimal memory footprint
- **Efficient Storage**: Optimized local storage usage
- **Cleanup**: Automatic cleanup of old cached data

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: All data is stored locally in your browser
- **No Tracking**: No user behavior tracking or analytics
- **API Limits**: Respects arXiv and Semantic Scholar rate limits
- **Secure**: Only communicates with trusted APIs

### Permissions
The extension requires minimal permissions:
- `activeTab`: Access to current tab for paper detection
- `storage`: Local data caching
- `https://arxiv.org/*`: Access to arXiv API
- `https://api.semanticscholar.org/*`: Access to Semantic Scholar API

## 🐛 Troubleshooting

### Common Issues

**Extension not loading papers:**
- Check your internet connection
- Verify that arXiv and Semantic Scholar are accessible
- Try refreshing the extension

**Papers not updating:**
- Click the refresh button manually
- Check if background updates are enabled
- Restart the extension

**Performance issues:**
- Clear browser cache and cookies
- Disable other extensions temporarily
- Check available system memory

### Debug Mode
Enable debug mode by:
1. Opening Chrome DevTools
2. Going to the Console tab
3. Looking for extension-related logs

## 📚 Future Enhancements

### Planned Features
- **Email Notifications**: Daily/weekly paper digests
- **Paper Collections**: Save and organize favorite papers
- **Collaborative Features**: Share paper lists with colleagues
- **Advanced Analytics**: Paper trend analysis and insights
- **Mobile Support**: Responsive design for mobile devices
- **Dark Mode**: Alternative UI theme
- **Export Options**: Export paper lists to various formats

### API Integrations
- **Google Scholar**: Additional citation data
- **ResearchGate**: Social engagement metrics
- **Twitter**: Real-time paper discussions
- **Reddit**: Community engagement tracking

## 🤝 Support

### Getting Help
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check this README for common solutions
- **Community**: Join our discussion forum (coming soon)

### Reporting Issues
When reporting issues, please include:
- Chrome version
- Extension version
- Steps to reproduce
- Error messages (if any)
- System information

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **arXiv**: For providing the research paper API
- **Semantic Scholar**: For enhanced paper metrics
- **Chrome Extensions Team**: For the excellent extension platform
- **Open Source Community**: For inspiration and tools

---

**Made with ❤️ for the AI research community**

*Stay updated with the hottest AI research papers! 🔥📚*
