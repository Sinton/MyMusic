# MyMusic Development Conventions

To ensure a seamless collaboration experience and maintain codebase quality, all contributors are expected to follow these guidelines.

## 🌿 Branching Model

We use a **Feature Branch** workflow:

- `main`: Production-ready code. No direct commits allowed.
- `develop`: Integration branch for features.
- `feat/*`: For new features (e.g., `feat/qq-integration`).
- `fix/*`: For bug fixes (e.g., `fix/player-crash`).
- `refactor/*`: For code refactoring.

**PR Process**: Create a branch from `develop` -> Commit changes -> Open PR to `develop` -> Code Review -> Merge.

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

Format: `<type>(scope): <description>`

**Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

Example: `feat(ui): add heartbeat animation to drag-and-drop area`

## 💻 Coding Standards

### Frontend (React/TypeScript)
- **Component Pattern**: Use Functional Components with Hooks.
- **State Management**: 
  - Use `Zustand` for global UI/App state.
  - Use `React Query` for server-side/network data state.
- **UI Components**: Follow the existing atomic design pattern in `src/components`.
- **Naming**: 
  - Components: PascalCase (e.g., `MusicPlayer.tsx`).
  - Functions/Variables: camelCase (e.g., `handlePlay`).
- **Styles**: Use Tailwind CSS utility classes. Avoid inline styles unless dynamic.

### Backend (Rust / Tauri)
- **Commands**: Name Tauri commands in `snake_case`. Return `Result<T, E>` to handle errors gracefully.
- **Error Handling**: Use `thiserror` (already in dependencies) for custom error types.
- **Code Style**: Run `cargo fmt` before every commit.

## 🛠️ Tooling
- **Linting**: Run `pnpm lint` to check for frontend issues.
- **Formatting**: We use Prettier for frontend and `rustfmt` for backend.
- **Package Manager**: Strictly use `pnpm`. Do not check in `package-lock.json` or `yarn.lock`.

## 📦 Pull Request Guidelines
1. Ensure the code builds locally (`pnpm tauri build`).
2. Update documentation (README or inline comments) if necessary.
3. Keep PRs small and focused on a single task.
4. Add screenshots for UI changes.

---

# MyMusic 开发规范 (中文版)

## 🌿 分支管理

我们采用 **Feature Branch** 工作流：

- `main`: 生产分支，严禁直接提交代码。
- `develop`: 开发主分支，用于集成所有特性。
- `feat/*`: 新功能开发分支。
- `fix/*`: 修复 Bug 分支。
- `refactor/*`: 代码重构分支。

**PR 流程**: 从 `develop` 拉取新分支 -> 提交代码 -> 发起 PR 到 `develop` -> 代码审查 -> 合并。

## 📝 Commit 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

格式: `<type>(作用域): <描述>`

**常用类型**:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式（不影响代码逻辑）
- `refactor`: 重构（既不是修复 Bug 也不是新增功能）
- `perf`: 性能优化
- `chore`: 构建过程或辅助工具的变动

示例: `feat(ui): 为拖拽区域添加心跳动画`

## 💻 代码标准

### 前端 (React/TypeScript)
- **组件模式**: 坚持使用函数式组件与 Hooks。
- **状态管理**: 
  - 使用 `Zustand` 管理全局应用状态。
  - 使用 `React Query` 管理服务端/网络数据。
- **命名规范**: 
  - 组件: PascalCase (如 `MusicPlayer.tsx`)。
  - 函数/变量: camelCase (如 `handlePlay`)。
- **样式**: 使用 Tailwind CSS，除非必要，避免行内样式。

### 后端 (Rust / Tauri)
- **Commands**: Tauri 命令使用 `snake_case` 命名。必须返回 `Result` 以妥善处理异常。
- **错误处理**: 充分利用 `thiserror` 定义业务错误。
- **代码格式**: 提交前请运行 `cargo fmt`。

## 🛠️ 工具链
- **Lint**: 运行 `pnpm lint` 检查前端代码。
- **格式化**: 前端使用 Prettier，后端使用 `rustfmt`。
- **包管理**: 强制使用 `pnpm`。

## 📦 Pull Request 指南
1. 确保代码在本地构建通过 (`pnpm tauri build`)。
2. 保持 PR 聚焦，一个 PR 只解决一个问题或增加一个功能。
3. 涉及 UI 变更时，请附带截图。
