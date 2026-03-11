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
