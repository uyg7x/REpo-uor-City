# 🏙️ Repo-City

Turn any GitHub profile into an explorable 3D isometric city where repositories become buildings in a stunning visual neighborhood.

## ✨ Features

- **3D City Visualization**: Each repository becomes a building with height proportional to its size
- **Climate-Aware Themes**: Automatic environment detection with regional architecture styles:
  - 🇩🇪 Germany - Traditional pitched roofs
  - 🇯🇵 Japan - Cherry blossoms and pagoda roofs
  - 🇮🇳 India - Dome architecture
  - 🇺🇸 USA - Modern cyberpunk style
  - 🇬🇧 UK - Classic brick buildings
- **Interactive Navigation**: Hover to highlight, click to explore repositories
- **Real-Time Sync**: Auto-refreshes when repositories are updated
- **Commit Heatmaps**: Visualize file activity with dynamic window lighting
- **Weather Effects**: Regional weather particles (rain, cherry blossoms, etc.)

## 📦 Installation

```bash
npm install -g repo-city
```

Or clone and install locally:

```bash
git clone https://github.com/uyg7x/repo-city.git
cd repo-city
npm install
```

## 🚀 Usage

### As a Global CLI Tool

```bash
repo-city https://github.com/your-username
```

### Locally

```bash
node index.js https://github.com/your-username
```

The application will:
1. Fetch your GitHub repositories
2. Generate a 3D city visualization
3. Open automatically in your default browser at `http://localhost:8765`

## 🎮 Controls

- **Rotate**: Click and drag
- **Zoom**: Scroll wheel
- **Pan**: Right-click and drag
- **Explore Repo**: Hover over a building and click to enter

## 🏗️ Project Structure

```
repo-city/
├── index.js          # Main entry point and CLI
├── src/
│   ├── api.js        # GitHub API interactions
│   ├── server.js     # HTTP server and routing
│   └── renderer.js   # Three.js 3D rendering
├── package.json
├── README.md
└── .gitignore
```

## ⚙️ Configuration

### Environment Variables

- `GITHUB_TOKEN` - Optional: Increase API rate limits (60 → 5000 requests/hour)

### CDN Configuration

Edit CDN URLs in `src/renderer.js` if you need specific Three.js versions.

## 🛠️ Development

### Running in Development

```bash
npm link
repo-city https://github.com/your-username
```

### Building

No build step required - runs directly with Node.js.

## 📝 Requirements

- Node.js 18+ (for native `fetch` support)
- Modern browser with WebGL support

## 🐛 Known Limitations

- GitHub API rate limit: 60 requests/hour without token
- Maximum 30 repositories displayed (GitHub API default)
- Requires internet connection for GitHub API and CDN resources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/)
- Powered by [GitHub API](https://docs.github.com/en/rest)
- CLI framework: [Commander.js](https://github.com/tj/commander.js)
# REpo-uor-City

<img width="675" height="424" alt="Screenshot 2026-04-19 011129" src="https://github.com/user-attachments/assets/07a6d0e5-1c48-4d1b-aa5c-3fb5eb23c13d" />



