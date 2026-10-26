# 🏛️ Digital Legacy Manager

A full-stack web application to securely manage your digital information, government documents, family details, assets, insurance, medical records, and digital legacy instructions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Bootstrap 5.3, Axios, React Router 6 |
| **Backend** | Java 21+, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA |
| **Auth** | JWT (JJWT 0.12.6), BCrypt password hashing |
| **Database** | MySQL / MariaDB |
| **Build Tools** | Maven 3.9.9 (portable), Node.js v20.18.0 (portable) |

---

## 📁 Project Structure

```
digital-legacy-manager/
├── backend/          # Spring Boot REST API
│   ├── src/main/java/com/digitallegacy/
│   │   ├── controller/   # 18 REST controllers
│   │   ├── entity/       # 16 JPA entities
│   │   ├── repository/   # Spring Data JPA repos
│   │   ├── service/      # Business logic
│   │   ├── security/     # JWT + Spring Security
│   │   ├── payload/      # DTOs (request/response)
│   │   └── exception/    # Global exception handling
│   └── src/main/resources/
│       └── application.properties
├── frontend/         # React SPA
│   ├── src/
│   │   ├── pages/        # 19 page components
│   │   ├── components/   # Sidebar, Navbar, Modal, StatCard
│   │   ├── context/      # AuthContext (JWT + localStorage)
│   │   └── services/     # Axios API client
│   └── vite.config.js    # Proxies /api → localhost:8080
└── database/
    └── schema.sql        # Full MySQL schema (15 tables)
```

---

## ⚙️ Prerequisites

- **Java JDK 21+** (tested with JDK 25 at `C:\Program Files\Java\jdk-25`)
- **Maven 3.9+** (portable at `C:\Users\Admin\.gemini\antigravity\tools\apache-maven-3.9.9`)
- **Node.js v18+** (portable at `C:\Users\Admin\.gemini\antigravity\tools\node-v20.18.0-win-x64`)
- **MySQL / MariaDB** running on port 3306

---

## 🗄️ Database Setup

```sql
-- Create the database (run once)
CREATE DATABASE IF NOT EXISTS digital_legacy_db;
```

Or run the full schema:
```
mysql -u root digital_legacy_db < database/schema.sql
```

> **Note:** The root user has no password in this environment. Adjust `spring.datasource.password` in `application.properties` if needed.

---

## 🚀 Running the Application

### 1. Start the Backend (Spring Boot)

Open a terminal and run:

```cmd
set PATH=C:\Users\Admin\.gemini\antigravity\tools\apache-maven-3.9.9\bin;C:\Program Files\Java\jdk-25\bin;%PATH%
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**

### 2. Start the Frontend (React / Vite)

Open another terminal and run:

```cmd
set PATH=C:\Users\Admin\.gemini\antigravity\tools\node-v20.18.0-win-x64;%PATH%
cd frontend
npm install   # first time only
npm run dev
```

The frontend starts on **http://localhost:3000**

---

## 🌐 Accessing the App

Open your browser and go to: **http://localhost:3000**

### Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| `admin` | `Password@123` | Admin |
| `john_doe` | `Password@123` | User |

Or **register a new account** directly from the Login page.

---

## 📋 Features

### 15 Dashboard Sections
1. **My Profile** — Full user profile with photo upload
2. **Family Members** — Add/view/edit family member cards with documents
3. **Government Documents** — Aadhaar, PAN, Passport, Driving Licence, etc.
4. **Personal Documents** — Certificates, resumes, property docs, etc.
5. **Important Information** — Pinned notes, instructions, locations
6. **Assets & Property** — Property, vehicles, gold, investments
7. **Bank & Financial** — Masked account numbers, IFSC, branch details
8. **Insurance** — Policies, nominees, expiry tracking
9. **Medical & Emergency** — Blood group, allergies, emergency contacts
10. **Digital Accounts** — Email, social, cloud services (no passwords stored)
11. **Important Contacts** — Family, lawyers, doctors, advisors
12. **Legacy Instructions** — Priority-tagged future instructions
13. **Search** — Global search across all data
14. **Notifications** — Expiry alerts, system notifications
15. **Access & Privacy** — Family access permission matrix

### Admin Panel (`/admin`)
- System statistics overview
- User management (enable/disable accounts)
- Full audit log viewer
- Document category management

### Security Features
- JWT-based authentication (24-hour tokens)
- BCrypt password hashing
- Role-based access (Owner / Family Member / Admin)
- Per-section permission control for family members
- Audit logging of all actions
- Sensitive fields masked (last 4 digits of bank accounts only)

---

## 🔌 API Endpoints Summary

| Module | Base Path |
|--------|-----------|
| Authentication | `POST /auth/login`, `POST /auth/register` |
| Profile | `GET/PUT /api/profile` |
| Family Members | `GET/POST/PUT/DELETE /api/family-members` |
| Documents | `GET/POST/PUT/DELETE /api/documents` |
| Assets | `GET/POST/PUT/DELETE /api/assets` |
| Financial | `GET/POST/PUT/DELETE /api/financial` |
| Insurance | `GET/POST/PUT/DELETE /api/insurance` |
| Medical | `GET/POST/PUT/DELETE /api/medical` |
| Digital Accounts | `GET/POST/PUT/DELETE /api/digital-accounts` |
| Contacts | `GET/POST/PUT/DELETE /api/contacts` |
| Legacy Instructions | `GET/POST/PUT/DELETE /api/legacy-instructions` |
| Important Info | `GET/POST/PUT/DELETE /api/important-info` |
| Notifications | `GET /api/notifications` |
| Family Access | `GET/POST/DELETE /api/family-access` |
| Audit Logs | `GET /api/audit-logs` |
| Search | `GET /api/search/global?q={query}` |
| Dashboard | `GET /api/dashboard/stats` |
| Admin | `GET /api/admin/stats`, `GET /api/admin/users` |

---

## 📝 Notes

- **File uploads** are stored in `backend/uploads/` directory
- Supported file types: PDF, JPG, JPEG, PNG (max 50 MB)
- Vite proxy forwards `/api/*` calls to `http://localhost:8080`
- The `DataInitializer` bean seeds demo users on first startup
- Document files are never modified — only metadata is editable; use "Replace" to update the file itself
