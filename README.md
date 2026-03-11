# MyMusic (Sinton/MyMusic)

<p align="center">
  <img src="./src-tauri/icons/icon.png" width="128" height="128" />
</p>

<p align="center">
  <b>A modern, high-performance desktop music player built with Tauri 2.0</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.0-blue?style=flat-square&logo=tauri" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Rust-2021-000000?style=flat-square&logo=rust" />
  <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

[中文说明](./README_zh.md) | [English Documentation](./README.md)

MyMusic is a cross-platform desktop music application designed for simplicity, speed, and aesthetics. Leveraging the power of **Tauri 2.0** and **Rust**, it provides a lightweight footprint with native-level performance.

## ✨ Features

- 📂 **Local Music Management**: Intelligent scanning of local directories with metadata extraction (ID3 tags, album art).
- 🎵 **Multi-Platform Integration**: Seamless integration with QQ Music (comments, hot lists, etc.).
- 🛡️ **Tauri 2.0 Powered**: Enhanced security and efficiency with the latest Tauri framework.
- 🎨 **Modern UI**: A premium user interface built with Framer Motion animations and Tailwind CSS.
- 🌍 **Internationalization**: Full support for multiple languages via i18next.
- ⚡ **Turbocharged**: Blazing fast state management with Zustand and data fetching with React Query.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)

### Backend
- **Core**: [Rust](https://www.rust-lang.org/)
- **Runtime**: [Tauri 2.0](https://tauri.app/)
- **Networking**: [Reqwest](https://github.com/seanmonstar/reqwest)
- **Database/Storage**: Local storage integrated with Tauri plugins.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://www.rust-lang.org/tools/install)
- [pnpm](https://pnpm.io/installation) (Recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Sinton/MyMusic.git
   cd MyMusic
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development
Run the application in development mode:
```bash
pnpm tauri dev
```

### Build
Build for your current platform:
```bash
pnpm tauri build
```

## 🤝 Contributing

We welcome contributions! Please see our [CONVENTIONS.md](./docs/CONVENTIONS.md) for detailed guidelines on coding standards, branching, and commit messages.

## 📜 License

This project is licensed under the [MIT License](./LICENSE).
