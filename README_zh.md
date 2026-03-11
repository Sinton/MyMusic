# MyMusic (Sinton/MyMusic)

<p align="center">
  <img src="./src-tauri/icons/icon.png" width="128" height="128" />
</p>

<p align="center">
  <b>基于 Tauri 2.0 开发的现代化、高性能桌面音乐播放器</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-2.0-blue?style=flat-square&logo=tauri" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Rust-2021-000000?style=flat-square&logo=rust" />
  <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

[English Documentation](./README.md) | [中文说明](./README_zh.md)

MyMusic 是一款追求极致速度、轻量化与美感的多平台桌面音乐应用。通过 **Tauri 2.0** 与 **Rust** 的强强联合，它在提供原生性能的同时，保持了极小的系统资源占用。

## ✨ 功能特性

- 📂 **本地音乐管理**: 智能扫描本地目录，支持元数据（ID3 标签、专辑封面）解析。
- 🎵 **多平台集成**: 深度集成 QQ 音乐（支持评论查看、热门榜单等）。
- 🛡️ **Tauri 2.0 驱动**: 基于最新的 Tauri 框架，更安全、更高效。
- 🎨 **现代化 UI**: 使用 Framer Motion 动效与 Tailwind CSS 打造的高级视觉体验。
- 🌍 **国际化**: 通过 i18next 提供完整的语言切换支持。
- ⚡ **极致体验**: Zustand 状态管理与 React Query 数据请求，确保交互流畅无阻。

## 🛠️ 技术栈

### 前端
- **框架**: [React 18](https://reactjs.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **数据请求**: [TanStack Query](https://tanstack.com/query)

### 后端
- **核心**: [Rust](https://www.rust-lang.org/)
- **运行时**: [Tauri 2.0](https://tauri.app/)
- **网络**: [Reqwest](https://github.com/seanmonstar/reqwest)
- **存储**: 集成 Tauri 插件的本地持久化。

## 🚀 快速开始

### 环境依赖
- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://www.rust-lang.org/tools/install)
- [pnpm](https://pnpm.io/installation) (推荐)

### 安装过程
1. 克隆仓库:
   ```bash
   git clone https://github.com/Sinton/MyMusic.git
   cd MyMusic
   ```

2. 安装依赖:
   ```bash
   pnpm install
   ```

### 开发环境
启动开发模式:
```bash
pnpm tauri dev
```

### 项目构建
构建当前平台的安装包:
```bash
pnpm tauri build
```

## 🤝 参与贡献

我们非常欢迎任何形式的贡献！在开始之前，请阅读 [CONVENTIONS.md](./CONVENTIONS.md) 以了解我们的代码规范、分支管理以及提交说明。

## 📜 开源协议

本项目采用 [MIT License](./LICENSE) 许可协议。
