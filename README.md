# OneGramTechnician

A full-stack, cross-platform technical solution for OneGram ecosystem. This monorepo contains multiple applications built with modern technologies including web, mobile, and backend components.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Build & Deployment](#build--deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Project Overview

OneGramTechnician is a comprehensive technical platform designed to support the OneGram ecosystem. The project integrates multiple frontend and backend technologies to deliver a seamless experience across web and mobile platforms.

**Key Highlights:**
- 🌐 Cross-platform support (Web, Mobile, Backend)
- ⚡ Modern technology stack with TypeScript, Dart, Python, and C++
- 📱 Native mobile development with Flutter
- 💻 Responsive web application with React
- 🔧 Robust backend infrastructure
- 🏗️ Production-ready architecture

---

## 📁 Repository Structure

```
OneGramTechnician/
├── gramone-tech-web/              # Web application (React + TypeScript + Vite)
│   ├── src/                       # Source code
│   ├── public/                    # Public assets
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript configuration
│   ├── vite.config.ts             # Vite configuration
│   └── .oxlintrc.json             # Linting rules
│
├── gramone-tech-mobile/           # Mobile application (Flutter + Dart)
│   ├── lib/                       # Dart source code
│   ├── android/                   # Android native code
│   ├── ios/                       # iOS native code
│   ├── web/                       # Web support
│   ├── pubspec.yaml               # Flutter dependencies
│   ├── analysis_options.yaml      # Dart linting
│   └── README.md                  # Flutter-specific docs
│
├── backend/                       # Backend services (Python + C++ + CMake)
│   ├── src/                       # Core source code
│   ├── requirements.txt           # Python dependencies
│   ├── CMakeLists.txt            # C++ build configuration
│   └── config/                    # Configuration files
│
├── .gitignore                     # Git ignore rules
├── .github/                       # GitHub configuration
│   └── workflows/                 # CI/CD pipelines
└── README.md                      # This file
```

---

## 💻 Technology Stack

### Language Composition

| Language | Percentage | Usage |
|----------|-----------|-------|
| **TypeScript** | 27.1% | Web frontend, type-safe development |
| **Dart** | 25.0% | Mobile development with Flutter |
| **Python** | 22.2% | Backend services, data processing |
| **C++** | 17.4% | Performance-critical operations, native modules |
| **CMake** | 5.5% | Build system configuration |
| **CSS** | 1.1% | Styling and design |
| **Other** | 1.7% | Configuration and miscellaneous |

### Web Stack (gramone-tech-web)
- **Framework:** React 18+
- **Language:** TypeScript
- **Build Tool:** Vite
- **Linting:** Oxlint
- **Styling:** CSS/SCSS
- **Key Dependencies:** See `gramone-tech-web/package.json`

### Mobile Stack (gramone-tech-mobile)
- **Framework:** Flutter
- **Language:** Dart
- **Platforms:** iOS, Android, Web
- **Package Manager:** pub
- **Key Dependencies:** See `gramone-tech-mobile/pubspec.yaml`

### Backend Stack
- **Language:** Python, C++
- **Build System:** CMake
- **Runtime:** Python 3.8+
- **Performance Layer:** C++ with native bindings
- **Key Dependencies:** See `backend/requirements.txt`

---

## ✨ Features

### Web Application
- Modern, responsive user interface
- Type-safe development with TypeScript
- Fast development with Vite HMR
- Production-optimized builds
- Comprehensive linting with Oxlint

### Mobile Application
- Native performance on iOS and Android
- Beautiful, responsive Flutter UI
- Cross-platform code sharing
- Direct access to platform APIs
- State management and local storage

### Backend Services
- High-performance Python services
- C++ modules for compute-intensive tasks
- Scalable architecture
- RESTful and/or GraphQL APIs
- Data processing and business logic

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ (for web development)
- **Flutter** 3.0+ (for mobile development)
- **Python** 3.8+ (for backend)
- **Git** (for version control)
- **CMake** 3.10+ (for building C++ modules)

### Installation

#### Web Application

```bash
cd gramone-tech-web
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run preview      # Preview production build
```

#### Mobile Application

```bash
cd gramone-tech-mobile
flutter pub get      # Get dependencies
flutter run          # Run on connected device/emulator
flutter build apk    # Build Android APK
flutter build ios    # Build iOS app
```

#### Backend Services

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# For C++ modules:
mkdir build
cd build
cmake ..
make
```

---

## 👨‍💻 Development Guide

### Web Development

1. **Start Development Server**
   ```bash
   cd gramone-tech-web
   npm run dev
   ```
   Server runs on `http://localhost:5173` with hot module replacement.

2. **Code Structure**
   - Components in `src/components/`
   - Pages in `src/pages/`
   - Services/APIs in `src/services/`
   - Utilities in `src/utils/`

3. **Type Safety**
   - All files should use TypeScript (`.ts`, `.tsx`)
   - Strict mode enabled in `tsconfig.json`

4. **Linting**
   ```bash
   npm run lint
   npm run lint:fix    # Auto-fix issues
   ```

### Mobile Development

1. **Start Development**
   ```bash
   cd gramone-tech-mobile
   flutter run
   ```

2. **Project Structure**
   - Dart code in `lib/`
   - Platform-specific code in `android/` and `ios/`
   - Assets in `assets/`

3. **Hot Reload**
   - Use `r` in terminal to hot reload
   - Use `R` to hot restart

4. **Analysis**
   ```bash
   flutter analyze
   dart format lib/
   ```

### Backend Development

1. **Environment Setup**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Running Services**
   ```bash
   python main.py        # Primary service
   # or run specific modules
   ```

3. **C++ Extension Development**
   ```bash
   cd build
   cmake --build .
   make test            # Run tests
   ```

---

## 🔨 Build & Deployment

### Web Build

```bash
cd gramone-tech-web
npm run build          # Optimized production build
# Output in dist/
```

**Deployment:**
- Build artifacts can be deployed to any static hosting (Vercel, Netlify, GitHub Pages, etc.)
- Recommended: Set `VITE_API_URL` environment variable for API endpoints

### Mobile Build

**iOS:**
```bash
cd gramone-tech-mobile
flutter build ios --release
# Output: build/ios/iphoneos/Runner.app
```

**Android:**
```bash
cd gramone-tech-mobile
flutter build apk --release
# Output: build/app/outputs/flutter-app/release/app-release.apk
```

### Backend Deployment

```bash
# Using Docker (recommended):
docker build -t gramone-tech-backend .
docker run -p 8000:8000 gramone-tech-backend

# Or direct Python:
python main.py --host 0.0.0.0 --port 8000
```

---

## 🤝 Contributing

### Code Style

- **TypeScript/JavaScript:** Follow ESLint/Oxlint rules
- **Dart:** Follow Dart style guide (enforced by analyzer)
- **Python:** Follow PEP 8 guidelines
- **C++:** Follow Google C++ style guide

### Commit Guidelines

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit with meaningful messages
3. Push branch: `git push origin feature/your-feature`
4. Create pull request with clear description
5. Ensure CI/CD checks pass
6. Request code review from maintainers
7. Merge once approved

---

## 📦 Dependencies Management

### Web
```bash
npm install <package>
npm update
npm audit fix
```

### Mobile
```bash
flutter pub get
flutter pub upgrade
flutter pub outdated
```

### Backend
```bash
pip install <package>
pip freeze > requirements.txt
```

---

## 🧪 Testing

### Web
```bash
npm run test
npm run coverage
```

### Mobile
```bash
flutter test
flutter test --coverage
```

### Backend
```bash
python -m pytest
pytest --cov=src
```

---

## 📚 Documentation

- **Web:** See `gramone-tech-web/README.md`
- **Mobile:** See `gramone-tech-mobile/README.md`
- **Backend:** See `backend/README.md` (if available)
- **API Docs:** Check backend documentation for endpoints

---

## 🐛 Troubleshooting

### Web Issues
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules package-lock.json && npm install`

### Mobile Issues
- Clean build: `flutter clean`
- Rebuild: `flutter pub get && flutter run`
- iOS specific: `cd ios && pod install && cd ..`

### Backend Issues
- Virtual env issues: Recreate with `python -m venv venv`
- C++ build errors: Ensure CMake 3.10+ is installed

---

## 📝 License

This project is proprietary and private. All rights reserved.

---

## 👤 Author

**TROJAN1HAMMER**

- GitHub: [@TROJAN1HAMMER](https://github.com/TROJAN1HAMMER)
- Repository: [OneGramTechnician](https://github.com/TROJAN1HAMMER/OneGramTechnician)

---

## 📞 Support & Contact

For issues, questions, or contributions, please:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Follow the contributing guidelines above

---

**Last Updated:** August 31, 2026

**Repository Status:** Active Development

---

*This README provides a comprehensive overview of the OneGramTechnician project. For specific module details, refer to individual README files in each subdirectory.*
