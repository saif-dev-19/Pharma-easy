# Multi-Branch Pharmacy Management System

A role-based, multi-branch pharmacy management web application for managing medicines, batches, inventory, purchases, sales, suppliers, stock transfers, and basic reports.

## Features

* JWT Authentication & Role-Based Access
* Multi-Branch Management
* Medicine & Batch Management
* Inventory & Stock Tracking
* QR Code for Medicine/Batch Lookup
* Sales / POS
* Purchase Management
* Supplier Management
* Stock Transfer Between Branches
* Low Stock & Expiry Tracking
* Dashboard & Basic Reports

## User Roles

| Role        | Access                                 |
| ----------- | -------------------------------------- |
| **Admin**   | Full system access                     |
| **Manager** | Manage assigned branch                 |
| **Staff**   | Sales/POS and stock-related operations |

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* SQLite3
* JWT Authentication
* Redis
* Celery

### Frontend

* React
* Vite
* JavaScript
* Axios
* React Router

## Project Structure

```text
pharmacy-management/
├── backend/
│   ├── config/
│   ├── apps/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    ├── package.json
    └── .env
```

# Setup & Installation

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_FOLDER>
```

# Backend Setup

Go to the backend directory:

```bash
cd backend
```

### Create Virtual Environment

```bash
python3 -m venv venv
```

Activate it:

### Linux / macOS

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True

FRONTEND_URL=http://localhost:5173
```

> SQLite3 is used as the database, so no separate database server is required.

### Run Migrations

```bash
python manage.py migrate
```

### Create Admin User

```bash
python manage.py createsuperuser
```

Follow the prompts to create the initial admin account.

### Start Backend

```bash
python manage.py runserver
```

Backend will run at:

```text
http://127.0.0.1:8000/
```

API base URL:

```text
http://127.0.0.1:8000/api/
```

# Frontend Setup

Open a new terminal and go to the frontend directory:

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Start Frontend

```bash
npm run dev
```

Frontend will normally run at:

```text
http://localhost:5173/
```

# Running the Project

You need two terminals.

### Terminal 1 — Backend

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173/
```

Login using the admin account created with:

```bash
python manage.py createsuperuser
```

## API

Main API modules:

```text
/auth/
/branches/
/medicines/
/batches/
/inventory/
/suppliers/
/purchases/
/sales/
/transfers/
/dashboard/
/qr/
```

## Database

The project uses **SQLite3** as the database.

Main relationships:

```text
Medicine
   ↓
Batch
   ↓
Inventory
   ↓
Branch

Purchase → PurchaseItem → Batch
Sale → SaleItem → Batch
StockTransfer → StockTransferItem → Batch
```

## Notes

* No separate database server is required.
* Employee registration is handled by Admin.
* Manager and Staff users are assigned to a specific branch.
* Admin has access to all branches.
* Manager and Staff are restricted to their assigned branch.
* QR lookup is publicly accessible for medicine information.

## Future Improvements

* Online pharmacy / customer portal
* Advanced reporting & analytics
* Payment integration
* Sales/Purchase returns
* Automated notifications
* Cloud deployment
