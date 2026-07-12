# Transit-Ops-
<p align="center">
  <img src="docs/images/banner.png" alt="TransitOps Banner" width="100%">
</p>

<h1 align="center">🚚 TransitOps</h1>

<h3 align="center">
Smart Transport Operations Platform
</h3>

<p align="center">
A modern fleet management system that digitizes transport operations, streamlines dispatch workflows, and provides actionable operational insights.
</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql)
![License](https://img.shields.io/badge/Odoo-Hackathon-purple)

</p>

---

# 🌟 Why TransitOps?

Traditional logistics companies often rely on spreadsheets and manual logbooks to manage their transport operations. This results in scheduling conflicts, poor fleet utilization, delayed maintenance, inaccurate expense tracking, and limited operational visibility.

**TransitOps** provides a centralized platform that simplifies the entire transport lifecycle—from vehicle registration to trip dispatching, maintenance scheduling, fuel tracking, and business analytics.

---

# 🎯 Core Features

| Fleet Management | Driver Management | Trip Operations |
|------------------|-------------------|-----------------|
| Vehicle Registry | Driver Profiles | Trip Creation |
| Vehicle Status | License Monitoring | Dispatch |
| Capacity Tracking | Safety Scores | Completion |
| Fleet Availability | Driver Availability | Cancellation |

| Maintenance | Fuel & Expenses | Analytics |
|--------------|----------------|-----------|
| Service Logs | Fuel Logs | Fleet Utilization |
| Vehicle History | Expense Tracking | Vehicle ROI |
| Status Automation | Cost Analysis | Fuel Efficiency |

---

# 📸 Preview

## Dashboard

> Replace with your actual dashboard screenshot

![](docs/images/dashboard.png)

---

## Vehicle Management

![](docs/images/vehicles.png)

---

## Driver Management

![](docs/images/drivers.png)

---

## Trip Management

![](docs/images/trips.png)

---

## Reports & Analytics

![](docs/images/reports.png)

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Axios
- Recharts

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication

## Database

- PostgreSQL

---

# 🏗 System Architecture

```text
                  Users
                    │
                    ▼
       React + TypeScript Frontend
                    │
              REST API Requests
                    │
                    ▼
        Express.js + Node.js Backend
                    │
           Authentication & RBAC
                    │
          Business Logic Services
                    │
                    ▼
               Prisma ORM
                    │
                    ▼
            PostgreSQL Database
```

---

# 🔄 Business Workflow

```text
Vehicle Registration
        │
        ▼
Driver Registration
        │
        ▼
Trip Creation
        │
        ▼
Business Rule Validation
        │
        ▼
Dispatch Trip
        │
        ▼
Vehicle Status → On Trip
Driver Status → On Trip
        │
        ▼
Trip Completion
        │
        ▼
Fuel & Expense Logging
        │
        ▼
Maintenance Scheduling
        │
        ▼
Analytics Dashboard Updated
```

---

# 📦 Repository Structure

```text
TransitOps/
│
├── frontend/
│
├── backend/
│
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── database.md
│   ├── images/
│   └── diagrams/
│
├── README.md
└── LICENSE
```

---

# 📊 Dashboard KPIs

The dashboard provides real-time operational metrics including:

- 🚛 Active Vehicles
- ✅ Available Vehicles
- 🔧 Vehicles Under Maintenance
- 📦 Active Trips
- ⏳ Pending Trips
- 👨‍✈️ Drivers on Duty
- 📈 Fleet Utilization
- ⛽ Fuel Efficiency
- 💰 Vehicle ROI
- 📊 Operational Cost

---

# 🚀 Quick Start

## Clone the Repository

```bash
git clone https://github.com/your-username/TransitOps.git
```

---

## Backend

```bash
cd backend

npm install

cp .env.example .env

npx prisma generate

npx prisma migrate dev

npx prisma db seed

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📚 Documentation

| Documentation | Description |
|--------------|-------------|
| 📘 backend/README.md | Backend architecture & API |
| 🎨 frontend/README.md | Frontend architecture |
| 🗄 docs/database.md | Database schema |
| 🏗 docs/architecture.md | System architecture |
| 🔌 docs/api.md | API reference |

---

# 🛣 Roadmap

- [x] Authentication & RBAC
- [x] Fleet Management
- [x] Driver Management
- [x] Trip Dispatch
- [x] Maintenance Workflow
- [x] Fuel & Expense Tracking
- [x] Analytics Dashboard
- [ ] PDF Reports
- [ ] Email Notifications
- [ ] Dark Mode
- [ ] Live Vehicle Tracking
- [ ] Predictive Maintenance
- [ ] AI Route Optimization

---

# 👥 Meet the Team

| Member | Responsibility |
|---------|----------------|
| Zaid | Backend Development |
| Bobby Anthene | Frontend Development |
| Jabbar | Full Stack Developer |
| Hadia Madam  | Technical Lead |

---

# 📈 Project Highlights

- ✅ Modular Monorepo Architecture
- ✅ Feature-Based Backend Design
- ✅ Type-Safe Development with TypeScript
- ✅ Secure JWT Authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Automatic Business Rule Enforcement
- ✅ Scalable REST API
- ✅ Responsive User Interface
- ✅ Interactive Analytics Dashboard
- ✅ Clean Code & Modular Design

---

# 🙏 Acknowledgements

Developed for the **Odoo Hackathon 2026**.

Special thanks to the Odoo team for designing a real-world challenge that encourages innovation in transport and fleet management.

---

<p align="center">

### ⭐ If you like this project, consider giving it a star!

Made with ❤️ by Team TransitOps

</p>