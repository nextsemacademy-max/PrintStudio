# Contributing to A4 Print Studio

Thank you for your interest in contributing to **A4 Print Studio**! We welcome bug reports, feature suggestions, and code contributions.

---

## 🛠️ Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Verify TypeScript & Production Build**:
   ```bash
   npm run build
   ```

---

## 📱 Working with Android (Capacitor)

1. **Sync web build into Android project**:
   ```bash
   npm run cap:sync
   ```

2. **Open the project in Android Studio**:
   ```bash
   npm run cap:open
   ```

3. **Build Debug APK via CLI**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

---

## 📝 Commit Guidelines

We recommend following [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: ...` for new features or presets
- `fix: ...` for bug fixes in filters or PDF rendering
- `docs: ...` for documentation updates
- `perf: ...` for canvas / WebGL performance optimizations

---

## 📄 License
By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
