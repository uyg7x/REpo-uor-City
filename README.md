# REpo-uor-City

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,50:764ba2,100:f093fb&height=220&section=header&text=REpo-uor-City&fontSize=55&fontColor=ffffff&animation=fadeIn&fontAlignY=35" width="100%"/>
</p>

<p align="center">
  <b>Turn your GitHub profile into a living 3D city.</b>
</p>

<p align="center">
  <i>Repositories become buildings. Activity becomes light. Your GitHub becomes a city.</i>
</p>

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)

![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js&logoColor=white)

![GitHub API](https://img.shields.io/badge/GitHub-API-181717?style=for-the-badge&logo=github&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</p>

---

## 🌆 What is REpo-uor-City?

**REpo-uor-City** is an interactive 3D visualization tool that transforms a GitHub profile into an explorable **isometric city**.

Instead of looking at repositories as a simple list, the project creates a visual city where:

```text
 Repository  →  Building
 Repository Size  →  Building Height
 Commit Activity  →  Building Lights
 Region  →  Environment & Weather
 GitHub Profile  →  Complete City
```

Explore your repositories in a completely different way — **as a city built from your code.**

---

## ✨ Features

###  3D Repository City

Every GitHub repository is represented as a unique building.

Larger repositories can be represented by taller structures, creating a visual representation of your GitHub portfolio.

###  Climate-Aware Environments

The city can adapt its visual environment based on regional context.

| Region | Visual Style |
|---|---|
| 🇩🇪 Germany | Traditional pitched-roof architecture |
| 🇯🇵 Japan | Cherry blossoms & pagoda-inspired structures |
| 🇮🇳 India | Dome-inspired architecture |
| 🇺🇸 USA | Modern cyberpunk aesthetic |
| 🇬🇧 UK | Classic brick architecture |

###  Dynamic Weather Effects

The environment can include regional atmospheric effects such as:

-  Rain
-  Cherry blossoms
-  Environmental particles
-  Atmospheric effects

###  Commit Activity Visualization

Repository activity is represented visually through dynamic building windows.

More activity can create a more active-looking cityscape.

###  Interactive 3D Navigation

Explore the city naturally:

-  Click + Drag → Rotate
-  Scroll → Zoom
-  Right Click + Drag → Pan
-  Hover → Highlight repository
-  Click → Explore repository

###  Real-Time GitHub Data

The application retrieves repository information directly from GitHub and generates the city dynamically.

No manually created building data is required.

---

##  Concept

<p align="center">

```text
              GITHUB PROFILE
                    │
                    ▼
          ┌──────────────────┐
          │   GitHub API     │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │ Repository Data  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │  City Generator  │
          └────────┬─────────┘
                   │
                   ▼
          ┌──────────────────┐
          │  3D Renderer     │
          │    Three.js      │
          └────────┬─────────┘
                   │
                   ▼
               YOUR CITY
```

</p>

---

##  Installation

### Prerequisites

Make sure you have:

- **Node.js 18 or newer**
- A modern browser
- Internet connection
- WebGL support

The project requires Node.js `18+` for native `fetch` support.

### 1. Clone the repository

```bash
git clone https://github.com/uyg7x/REpo-uor-City.git
```

### 2. Enter the project

```bash
cd REpo-uor-City
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the project

```bash
node index.js https://github.com/uyg7x
```

The application starts a local server and opens the visualization in your browser.

Default address:

```text
http://localhost:8765
```

---

##  Quick Start

You can also run the project through the CLI:

```bash
repo-city https://github.com/uyg7x
```

Or:

```bash
node index.js https://github.com/uyg7x
```

The application:

```text
1. Fetches GitHub repositories
        ↓
2. Processes repository information
        ↓
3. Generates 3D buildings
        ↓
4. Applies environment/theme
        ↓
5. Starts the local server
        ↓
6. Opens the 3D city
```

---

## 🛠️ Technology Stack

<p align="center">

| Technology | Purpose |
|---|---|
|  JavaScript | Core application logic |
|  Node.js | Runtime environment |
|  Three.js | 3D rendering |
|  GitHub API | Repository information |
|  Commander.js | CLI interface |
|  WebGL | Browser-based 3D graphics |

</p>

The current project uses Node.js, Commander.js, GitHub API integration, and a Three.js-based renderer.

---

##  Project Structure

```text
REpo-uor-City/
│
├── index.js
│   └── Main CLI entry point
│
├── src/
│   ├── api.js
│   │   └── GitHub API communication
│   │
│   ├── server.js
│   │   └── Local HTTP server
│   │
│   └── renderer.js
│       └── Three.js 3D visualization
│
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

---

##  Controls

| Action | Control |
|---|---|
|  Rotate | Click + Drag |
|  Zoom | Mouse Wheel |
|  Pan | Right Click + Drag |
|  Highlight | Hover |
|  Explore | Click Building |

---

##  GitHub API Configuration

By default, GitHub's API allows limited unauthenticated requests.

You can optionally configure a GitHub token to increase API rate limits.

### Windows

```powershell
$env:GITHUB_TOKEN="your_github_token"
```

### Linux / macOS

```bash
export GITHUB_TOKEN="your_github_token"
```

The project recognizes the `GITHUB_TOKEN` environment variable for higher API limits.

>  Never commit your GitHub token to the repository.

---

##  Visual Experience

REpo-uor-City is designed around the idea of turning boring repository lists into an interactive visual experience.

```text
Traditional GitHub

Repository A
Repository B
Repository C
Repository D


             ↓


REpo-uor-City

             🏢
        🏢         🏢
     🏢    🏙️       🏢
        🏢      🏢
    🌳     🛣️     🌳
       🌧️  ✨  🌸

        YOUR CODE
        YOUR CITY
```

---

## How It Works

### Step 1 — GitHub Profile

The user provides a GitHub profile URL.

```text
https://github.com/username
```

### Step 2 — Repository Collection

The application communicates with GitHub and retrieves repository information.

### Step 3 — Data Processing

Repository information is converted into visualization parameters.

For example:

```text
Repository
     │
     ├── Name
     ├── Size
     ├── Activity
     ├── Location/Region
     └── Metadata
            │
            ▼
       City Building
```

### Step 4 — 3D Generation

The renderer converts the processed data into a 3D city.

### Step 5 — Interactive Exploration

The generated environment can then be explored directly in the browser.

---

##  Repository Visualization

A repository can influence multiple visual properties:

```text
                 Repository
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Size        Activity     Region
          │           │           │
          ▼           ▼           ▼
      Building      Lights      Theme
       Height
          │           │           │
          └───────────┼───────────┘
                      ▼
                    CITY
```

---

##  Why REpo-uor-City?

GitHub normally presents your work as:

> repositories → files → commits → statistics

REpo-uor-City presents the same concept visually:

> repositories → buildings → neighborhoods → cities

It transforms your development activity into a **visual digital landscape**.

---

##  Development

Install the project locally:

```bash
git clone https://github.com/uyg7x/REpo-uor-City.git
cd REpo-uor-City
npm install
```

Run:

```bash
npm start
```

The project also defines an npm test command:

```bash
npm test
```

---

##  Roadmap

Future improvements could include:

- [ ]  Public hosted demo
- [ ]  More regional architecture
- [ ]  Larger city environments
- [ ]  Multiple GitHub profile comparison
- [ ]  Advanced repository analytics
- [ ]  GitHub contribution heatmap
- [ ]  Searchable repository map
- [ ]  Day/night cycle
- [ ]  Advanced weather simulation
- [ ]  Animated traffic
- [ ]  Animated citizens
- [ ]  Developer achievement buildings
- [ ]  Mobile optimization

---

##  Known Limitations

- GitHub API requests are subject to rate limits.
- The default GitHub API configuration has limited unauthenticated requests.
- The current visualization depends on internet access.
- WebGL-compatible browser support is required.
- The current implementation displays up to the repositories returned by the GitHub API configuration.

---

##  Contributing

Contributions are welcome!

### 1. Fork the project

```bash
git clone https://github.com/uyg7x/REpo-uor-City.git
```

### 2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make your changes

```bash
git add .
```

### 4. Commit

```bash
git commit -m "feat: add amazing feature"
```

### 5. Push

```bash
git push origin feature/amazing-feature
```

### 6. Open a Pull Request

Describe what you changed and why.

---

##  License

This project is licensed under the **MIT License**.

See the [`LICENSE`](./LICENSE) file for details.

---

##  Acknowledgements

Built using:

-  GitHub API
-  Three.js
-  Commander.js
-  Node.js

---

##  Support the Project

If you like **REpo-uor-City**, consider:

 Starring the repository  
 Forking the project  
 Reporting issues  
 Suggesting features  
 Contributing improvements

---

<p align="center">

###  Your GitHub. Your Code. Your City.

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:f093fb,50:764ba2,100:667eea&height=120&section=footer&animation=fadeIn" width="100%"/>

</p>

<p align="center">
  <b>Built with ❤️ for developers who want to visualize their code.</b>
</p>
