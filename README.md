# 🚀 TensorGo HRMS – Leave Management System

![License](https://img.shields.io/badge/license-MIT-brightgreen)
![Hackathon](https://img.shields.io/badge/hackathon-built%20in%204%20hours-blue)
![Stack](https://img.shields.io/badge/stack-Node.js%20%2B%20React%20%2B%20SQLite-yellow)

> A modern, full-stack HRMS Leave Management System. Built at hackathon pace for real-world flexibility, scalability, and clarity.

---

## 📚 Table of Contents

- [👨‍💻 Author](#-author)
- [🚀 Overview](#-overview)
- [🏗️ Architecture & Data Flow](#️-architecture--data-flow)
- [🗄️ Data Model](#️-data-model)
- [🛠️ Features, Use Cases & Edge Cases](#️-features-use-cases--edge-cases)
- [🏁 Major Conflicts & Resolutions](#-major-conflicts--resolutions)
- [📝 Setup for Local Development](#-setup-for-local-development)
- [🎯 Contact & Credits](#-contact--credits)
- [📝 License & Attribution](#-license--attribution)

---

## 👨‍💻 Author

**Vishal Arya Dacha**  
📧 vishalaryadacha@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/vishal-arya-dacha-558084256)

---

## 🚀 Overview

**TensorGo HRMS** is a scalable, robust, and modern leave management platform built for rapid development and real-world use.

🧩 Key Highlights:

- Leave approval flows with LOP support.
- Role-based dashboards and access control.
- Real-time analytics and email notifications.
- Built with speed, but hardened for production.

---

## 🏗️ Architecture & Data Flow

### 🧱 Tech Stack

- **Frontend**: React + Tailwind CSS, Framer Motion, Recharts, EmailJS, Vite
- **Backend**: Node.js (Express), SQLite3, JWT Auth, bcrypt, REST APIs
- **Deployment**: Vercel (frontend), Render (backend), EmailJS (emails)

### 🔁 System Overview

```mermaid
graph TD
  E[User/Admin/Manager] -->|Browser| A[Frontend (React/Vite)]
  A -->|JWT Auth / REST| B[Express Backend]
  A -->|CORS| B
  B --> C[SQLite3 Database]
  B --> D[EmailJS Notifications]
```

### 📘 Flow Description

- React frontend sends authenticated requests via JWT to the backend.
- Express backend handles business logic and persists data in SQLite.
- Notifications for approvals/rejections are handled via EmailJS API.
- Backend and frontend are independently deployable.

---

## 🗄️ Data Model (ER Diagram)

```mermaid
erDiagram
  EMPLOYEE {
    string id PK
    string name
    string email
    string personal_email
    string role
    string department
    string password_hash
    string manager FK
  }
  LEAVE_TYPE {
    string id PK
    string name
    string code
    int max_days
    bool carry_forward
    string color
    string description
  }
  LEAVE_BALANCE {
    string employee_id PK FK
    string leave_type PK FK
    int allocated
    int used
    int pending
  }
  LEAVE_REQUEST {
    int id PK
    string employee_id FK
    string leave_type FK
    date start_date
    date end_date
    int days
    string status
    string reason
    int lop_days
    bool is_lop
    string approver
    string comments
    string rejection_reason
  }
  HOLIDAY {
    date date PK
    string name
    string type
  }

  EMPLOYEE ||--o| LEAVE_BALANCE : has_quota
  EMPLOYEE ||--o| LEAVE_REQUEST : applies_for
  LEAVE_TYPE ||--o| LEAVE_BALANCE : present_in
  LEAVE_TYPE ||--o| LEAVE_REQUEST : used_in
  EMPLOYEE }|--|| EMPLOYEE : manager_of
```

---

## 🛠️ Features, Use Cases & Edge Cases

### ✅ Core Features

- **🎛️ Role-based dashboards** (Employee / Manager / Admin)
- **📝 Leave request system** with validations and policy checks
- **🔁 Approval workflow** with hierarchy enforcement
- **📨 Email alerts** via EmailJS for approvals and rejections
- **📅 Leave cancellation** before start date
- **📊 Analytics & charts** with Recharts
- **🧑‍💼 Admin management** (employees, leave quotas, holidays)

### 🔍 Real-World Use Cases

- Office HR for agile teams
- Faculty/staff leave workflows in academia
- Compliance-ready leave and LOP data logs
- Payroll integration with LOP exports

### ⚠️ Edge Case Handling

- Duplicate/conflicting leave detection
- Yearly LOP limit enforcement
- No leaves for Admins (backed by role checks)
- EmailJS fallback simulation mode
- Backend & frontend route guards and permission checks

---

## 🏁 Major Conflicts & Resolutions

| Problem                                      | Solution                                                                 |
|---------------------------------------------|--------------------------------------------------------------------------|
| CORS errors across deployments               | Global CORS headers with verified origin logic                           |
| Express `path-to-regexp` crash              | Audited route parameters & avoided malformed patterns                    |
| EmailJS free tier limit                     | Combined logic using conditionals in a single dynamic template           |
| LOP shown to Admins                         | Fixed analytics logic to exclude non-eligible roles                      |
| Modal not opening for quota update          | Refactored state and UI binding logic                                    |
| `.env` not loading                          | Fallback to hardcoded keys + enforced .env setup on Render/Vercel       |
| Race condition in approval system           | Added SQL constraints + locking logic in transaction-based flow          |
| Hackathon time constraint                   | Prioritized core logic, used scaffolding for UI, commented gaps clearly  |

---

## 📝 Setup for Local Development

### 🔙 Backend

```bash
cd server
npm install
node app.js   # Runs backend on http://localhost:3001
```

### 🎨 Frontend

```bash
cd frontend   # Or project root if applicable
npm install
npm run dev   # Runs React on http://localhost:5173
```

---

## 🎯 Contact & Credits

**Project Lead:** Vishal Arya Dacha  
🔗 [LinkedIn](https://www.linkedin.com/in/vishal-arya-dacha-558084256)  
📧 vishalaryadacha@gmail.com

> *“Built in 4 hours for hackathon speed. Hardened for real-world scale.”*

---

## 📝 License & Attribution

**MIT License** – Free to use, modify, and share.

Special thanks to:

- [Render](https://render.com)
- [Vercel](https://vercel.com)
- [EmailJS](https://emailjs.com)
- Open Source community & testers!
