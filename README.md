# 🇸🇱 SL-GOVCHAT — Sierra Leone Government Digital Services Hub

A modern, full-stack web platform that provides Sierra Leonean citizens with easy access to government information, services, and real-time AI-powered assistance. Built with **React + Vite** on the frontend and **Express + SQLite** on the backend.

---

## ✨ Features

| Module | Description |
|---|---|
| **Dashboard** | Overview of government activity — latest news, project progress, and key statistics |
| **News & Updates** | CRUD management for government news articles, filterable by category |
| **Public Officials** | Directory of government officials with bios, tenure, and institutional info |
| **Government Projects** | Track ongoing, completed, and past government projects with budgets and progress |
| **Publications** | Browse and manage official government publications and policy documents |
| **Documents** | Upload, categorize, search, and download government documents with full-text content |
| **AI Assistant (Chatbot)** | AI-powered chatbot backed by a knowledge base of government services and FAQs |
| **Analytics** | Visualize platform usage data with interactive charts (Recharts) |
| **User Management** | Role-based access control (Admin, Editor, Viewer) with full user CRUD |
| **Authentication** | JWT-based login system with bcrypt password hashing |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — Component-based UI
- **Vite 7** — Lightning-fast dev server and build tool
- **React Router 7** — Client-side routing
- **Lucide React** — Beautiful, consistent icons
- **Recharts** — Responsive chart components
- **Vanilla CSS** — Custom design system with modern aesthetics

### Backend
- **Express 5** — Minimal and flexible Node.js web framework
- **better-sqlite3** — Fast, synchronous SQLite3 driver
- **JSON Web Tokens (JWT)** — Secure authentication
- **bcryptjs** — Password hashing
- **Multer** — File upload handling
- **CORS** — Cross-origin resource sharing

---

## 📁 Project Structure

```
SL-GOVCHAT/
├── public/                  # Static assets
├── src/
│   ├── context/             # React context (AuthContext)
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Dashboard
│   │   ├── News.jsx         # News management
│   │   ├── Officials.jsx    # Public officials directory
│   │   ├── Projects.jsx     # Government projects
│   │   ├── Publications.jsx # Publications browser
│   │   ├── Documents.jsx    # Document management
│   │   ├── Chatbot.jsx      # AI assistant
│   │   ├── Analytics.jsx    # Analytics dashboard
│   │   ├── UserManagement.jsx
│   │   └── Login.jsx        # Auth page
│   ├── utils/               # Helper utilities
│   ├── App.jsx              # Main app layout & routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── server/
│   ├── routes/              # Express API routes
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── news.js          # News CRUD
│   │   ├── officials.js     # Officials CRUD
│   │   ├── projects.js      # Projects CRUD
│   │   ├── publications.js  # Publications CRUD
│   │   ├── documents.js     # Document management
│   │   ├── chatbot.js       # AI chatbot logic
│   │   └── analytics.js     # Analytics data
│   ├── uploads/             # Uploaded files storage
│   ├── db.js                # Database setup & schema
│   ├── seed.js              # Seed data script
│   └── index.js             # Express server entry
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/bsaccoh/SL-GOVCHAT.git
cd SL-GOVCHAT

# Install dependencies
npm install
```

### Running the Application

You need to start both the **backend server** and the **frontend dev server**:

```bash
# Terminal 1 — Start the API server (runs on http://localhost:5001)
node server/index.js

# Terminal 2 — Start the Vite dev server (runs on http://localhost:5173)
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Seeding the Database

To populate the database with sample data:

```bash
node server/seed.js
```

### Building for Production

```bash
npm run build
```

The optimized output will be in the `dist/` directory.

---

## 🔌 API Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/login` | User login |
| `GET /api/news` | List all news articles |
| `GET /api/officials` | List public officials |
| `GET /api/projects` | List government projects |
| `GET /api/publications` | List publications |
| `GET /api/documents` | List uploaded documents |
| `POST /api/chatbot` | Send a message to the AI chatbot |
| `GET /api/analytics` | Retrieve analytics data |

> All CRUD routes support `GET`, `POST`, `PUT`, and `DELETE` where applicable. Authentication is required for write operations.

---

## 🔐 Default Credentials

After seeding, you can log in with:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@govchat.sl` | `admin123` |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for Sierra Leone 🇸🇱
</p>
