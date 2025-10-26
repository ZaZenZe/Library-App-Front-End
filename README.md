# Library App - Interactive Book Management System (React + TypeScript)
### - Made by Sayan "Ricky" DE
- **Live Demo**: [Library-App-Front-End RSDE on Render.com](https://library-app-front-end-rsde.onrender.com) 
- **Backend API**: [Library-App-DOT-NET](https://github.com/ZaZenZe/Library-App-DOT-NET/tree/extra_features_FF)

This project was built for the Front-End Framework lecture at our University. It's a modern, interactive library management application featuring a beautiful parallax design, dynamic book/author management, and seamless ISBN import functionality. Built with React, TypeScript, GSAP, and Framer Motion for smooth, professional animations.

## 🎨 Design Philosophy

This website embraces a **cyberpunk library aesthetic** with:
- Deep black/cyan/pink/purple color palette (Sakura theme inspired)
- Multi-layered parallax scrolling backgrounds with animated text
- Dynamic floating book animations with color-shifting effects
- Neon glow effects on interactive elements
- Custom loading screen with animated book stack
- Smooth GSAP + Framer Motion powered animations
- Glass-morphism cards with backdrop blur effects

## ✨ Key Features

### 📚 Book Management
- **Browse Books**: Grid view with search and sort functionality (title, year, date added)
- **Book Details**: Modal with full information, author links, and cover images
- **Add Books**: Manual form entry with validation
- **ISBN Import**: Automatically fetch book data from Google Books API by entering ISBN
- **Real-time Updates**: Books appear instantly without page refresh
- **Search**: Filter by title, author, or ISBN

### 👤 Author Management
- **Author Profiles**: Detailed bio, nationality, and book listings
- **Add Authors**: Create author profiles with form validation
- **Auto-creation**: New authors automatically created when importing books via ISBN
- **Real-time Updates**: Authors appear instantly without page refresh

### 🌊 Advanced Parallax System
- **Multi-layer background**: Animated scrolling text, floating books, and gradient overlays
- **Section-aware**: Background adapts as you scroll through different sections
- **Smooth transitions**: GSAP-powered scroll animations and section reveals
- **Interactive elements**: Hover effects, scale animations, and neon glows
- **Hardware accelerated**: Transform-based animations for 60fps performance

### 🎭 UI/UX Features
- **Loading Screen**: Animated book stack with progress bar and fun messages
- **Toast Notifications**: Success/error messages with auto-dismiss
- **Modal System**: Smooth enter/exit animations for book/author details and forms
- **Sticky Navigation**: Fixed header with smooth scroll-to-section
- **Responsive Design**: Mobile-first approach with breakpoint optimizations
- **Glass Morphism**: Backdrop blur effects on cards and modals
- **Neon Effects**: Color-shifting borders and glowing text animations

## ⚠️ **IMPORTANT LIMITATIONS**

> **🚧 UPDATE & DELETE FEATURES ARE NOT YET IMPLEMENTED IN THE BACKEND API**
>
> The current backend API does **NOT** support:
> - ❌ Updating existing books or authors
> - ❌ Deleting books or authors
>
> These features are present in the UI but **will not function** until the backend API is updated. They are included for **future implementation** and demonstration purposes only.
>
> **Current Working Features:**
> - ✅ Fetching/viewing all books and authors
> - ✅ Adding new books (manual + ISBN import)
> - ✅ Adding new authors
> - ✅ Viewing detailed book/author information

## 📁 Project Structure

```
Library-App-Front-End/
├── public/
│   ├── library_rsde.png       # Custom library logo/icon (generated with Google Gemini)
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── AuthorCard/        # Author profile card component
│   │   ├── AuthorDetailModal/ # Author detail view modal
│   │   ├── AuthorFormModal/   # Add/Edit author form
│   │   ├── AuthorsSection/    # Authors grid section
│   │   ├── BookCard/          # Book card component
│   │   ├── BookDetailModal/   # Book detail view modal
│   │   ├── BookFormModal/     # Add/Edit book form + ISBN import
│   │   ├── BooksSection/      # Books grid section with search/sort
│   │   ├── Footer/            # Footer with credits
│   │   ├── Hero/              # Landing hero section
│   │   ├── LoadingScreen/     # Entry animation screen
│   │   ├── Navigation/        # Sticky header navigation
│   │   ├── ParallaxBackground/ # Multi-layer parallax engine
│   │   └── Toast/             # Toast notification system
│   ├── hooks/
│   │   ├── useAPI.ts          # API hooks (CRUD operations + refetch)
│   │   ├── useDebounce.ts     # Input debouncing utility
│   │   ├── useTextCycle.ts    # Text cycling animation
│   │   └── useToast.ts        # Toast notification manager
│   ├── services/
│   │   └── api.ts             # Axios API client configuration
│   ├── styles/
│   │   ├── _animations.scss   # Reusable animation keyframes
│   │   ├── _mixins.scss       # SCSS mixins and utilities
│   │   ├── _variables.scss    # Design tokens and color system
│   │   └── global.scss        # Global styles and reset
│   ├── types/
│   │   └── api.ts             # TypeScript interfaces for API
│   ├── App.css                # Main app styles
│   ├── App.tsx                # Root component with state management
│   ├── index.css              # Base CSS and font imports
│   └── main.tsx               # Application entry point
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 🔧 Technologies & Dependencies

### Core Framework
- **[React 18.3.1](https://react.dev/)** - UI library with concurrent features
- **[TypeScript 5.6.2](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite 5.4.11](https://vite.dev/)** - Lightning-fast build tool and dev server

### Animation Libraries
- **[GSAP 3.12.5](https://greensock.com/gsap/)** - Professional-grade animation engine
  - `ScrollTrigger` plugin for scroll-based animations
  - Used for hero entrance and parallax effects
- **[Framer Motion 11.15.0](https://www.framer.com/motion/)** - React animation library
  - `motion` components for declarative animations
  - `AnimatePresence` for modal enter/exit transitions
  - `whileInView` and `whileHover` for interactive effects

### Data Fetching & State Management
- **[Axios 1.7.9](https://axios-http.com/)** - HTTP client for API requests
- **React Hooks** - `useState`, `useEffect`, `useCallback` for state management
- **Custom API Hooks** - `useBooks`, `useAuthors`, `useCreateBook`, etc.

### Styling
- **[Sass 1.83.1](https://sass-lang.com/)** - CSS preprocessor with modern module system
- **CSS Modules** - Component-scoped styling
- **Modern SASS** - Using `@use` instead of deprecated `@import`
- **Custom Design System** - Sakura theme with cyan/pink/purple/teal palette

### Development Tools
- **[ESLint 9.15.0](https://eslint.org/)** - Code linting with React hooks plugin
- **[TypeScript ESLint](https://typescript-eslint.io/)** - TypeScript-specific linting rules


## 🛠️ Backend API Overview

The backend for this project is a custom RESTful API written in **C# using the .NET framework**. It exposes endpoints for managing books and authors, and also integrates with the **Google Books API** to support ISBN-based book imports. The API is designed to be clean, fast, and easy to extend, following modern C# best practices. All data operations (fetching, creating, importing) are handled by this in-house backend, which you can find here:

**Backend Repository:** [Library-App-DOT-NET (extra_features_FF branch)](https://github.com/ZaZenZe/Library-App-DOT-NET/tree/extra_features_FF)

---

## 🔌 Backend API Integration

This frontend connects to a custom C# .NET REST API that integrates with the **Google Books API** for ISBN imports.

**Backend Repository**: [Library-App-DOT-NET (extra_features_FF branch)](https://github.com/ZaZenZe/Library-App-DOT-NET/tree/extra_features_FF)

### API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/books` | GET | Fetch all books |
| `/books/{id}` | GET | Fetch single book |
| `/books` | POST | Create new book |
| `/books/import/isbn/{isbn}` | POST | Import book via ISBN (Google Books API) |
| `/authors` | GET | Fetch all authors |
| `/authors/{id}` | GET | Fetch single author |
| `/authors` | POST | Create new author |

**Note**: Update and delete endpoints are not yet implemented in the backend.

## 🚀 Run Locally

Prerequisites: **Node.js** (v18+ recommended) and **npm**.

```powershell
# Clone the repository
git clone https://github.com/ZaZenZe/Library-App-Front-End.git
cd Library-App-Front-End

# Install dependencies
npm install

# Configure API endpoint
# Edit src/services/api.ts and set your backend URL:
# const API_BASE_URL = 'http://localhost:5000/api' # or your backend URL

# Start the development server
npm run dev
```

If Windows PowerShell blocks scripts (execution policy), use:

```powershell
# Temporary bypass for this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run dev

# Or run via cmd from PowerShell
cmd /c "npm run dev"
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Build for Production

```powershell
# TypeScript compile + Vite build
npm run build

# Preview the production build locally
npm run preview
```

The optimized output will be in the `dist/` directory.

## 🎯 Technical Implementation Highlights

### Real-time Data Synchronization
- **Refetch Pattern**: Custom hooks expose `refetch()` functions
- **Instant Updates**: Books and authors refresh automatically after create operations
- **No Page Reloads**: Optimistic UI updates with automatic list refreshing
- **ISBN Import**: Fetches from Google Books API and creates book + author in one operation

### API Hook Architecture
All API operations use custom React hooks with loading/error states:

```typescript
// Example: useBooks hook
const { data: books, loading, error, refetch } = useBooks();

// Trigger refetch after operations
const handleFormSuccess = () => {
  refetchBooks(); // Instantly updates the list
  success('Book added to your library! 📚');
};
```

### Form Validation System
- **Client-side validation**: Real-time error messages
- **ISBN validation**: Regex pattern for ISBN format
- **Year validation**: Min/max bounds with current year check
- **Required fields**: Visual indicators and error states
- **Error clearing**: Errors dismiss as user types

### Modal Management
- **Stacked modals**: Detail view → Edit form flow
- **Keyboard navigation**: ESC key closes modals
- **Click-outside**: Backdrop clicks close modals
- **Scroll prevention**: Body scroll locked when modals open
- **Smooth animations**: Framer Motion scale + opacity transitions

### Parallax System Architecture
1. **Floating Text Layers**: Animated scrolling book titles at different speeds
2. **Section-aware Opacity**: Layers fade in/out based on scroll position (GSAP ScrollTrigger)
3. **Decorative Elements**: Gradient circles and diagonal lines for depth
4. **Hardware Acceleration**: Transform-only animations for 60fps performance

### Performance Optimizations
- **Debounced Search**: 300ms delay on search input to reduce re-renders
- **Memoized Sorting**: `useMemo` for filtered/sorted book lists
- **Lazy Loading**: Components render only when in viewport
- **Single API Fetch**: Data fetched once at app level, passed down via props
- **Hardware Acceleration**: `will-change: transform, opacity` on animated elements

## 🎨 Design Tokens & Color System (Sakura Theme)

The site uses SCSS variables defined in `_variables.scss`:

```scss
// Core Colors
$primary-dark: #000000      // Deep black background
$deep-blue: #001f3d         // Navy blue for cards
$foreground: #e6f7ff        // Light text
$muted-text: rgba(230, 247, 255, 0.7)

// Accent Colors (Sakura Theme)
$accent-teal: #2effd3       // Neon cyan
$accent-cyan: #6ec7d7       // Miku cyan
$accent-pink: #ea7acf       // Sakura pink
$accent-purple: #c89ad9     // Lavender purple

// Neon Effects
$border-glow: rgba(234, 122, 207, 0.3)  // Pink glow
```

## 🙌 Credits & Attributions

| Resource | Credit / License | Notes |
|----------|------------------|-------|
| **Animation Engine** | [GSAP by GreenSock](https://greensock.com/) (Standard License) | Powers scroll-based parallax and timeline animations. |
| **React Animation** | [Framer Motion](https://www.framer.com/motion/) (MIT) | Component-level animations and modal transitions. |
| **API Client** | [Axios](https://axios-http.com/) (MIT) | HTTP requests and error handling. |
| **Backend API** | [Library-App-DOT-NET](https://github.com/ZaZenZe/Library-App-DOT-NET/tree/extra_features_FF) | Custom C# .NET REST API with Google Books integration. |
| **Google Books API** | [Google Books](https://developers.google.com/books) | ISBN-based book data fetching. |
| **Framework & Tooling** | React, TypeScript, Vite, Sass | Core development stack. |
| **Fonts** | Google Fonts (SIL Open Font License) | Inter, Oswald, Orbitron for typography. |
| **Design Inspiration** | [est-est.co.jp](https://www.est-est.co.jp/) & [hadaka.jp](https://hadaka.jp/) | Japanese parallax design excellence. |

## ⚖️ Disclaimer

This is a student project created for educational purposes as part of the Front-End Framework course at our University. It is a demonstration of modern React development patterns, API integration, and interactive UI design.

All external resources and libraries used are properly credited. Book cover images and metadata are fetched from the **Google Books API** and belong to their respective publishers/authors.

If you are the owner of any referenced intellectual property and would like attribution adjusted or content removed, please open an issue and it will be addressed promptly.

---
