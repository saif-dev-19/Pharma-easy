# Pharmacy Management System

## 1. Project Overview

The **Pharmacy Management System** is a web-based pharmacy business management application designed to manage the day-to-day operations of a pharmacy with multiple branches.

The system centralizes:

* Medicine management
* Batch management
* Inventory and stock management
* Sales and POS
* Purchase management
* Supplier management
* Stock transfer between branches
* Branch management
* Employee/user management
* QR-based medicine identification
* Expiry and low-stock monitoring
* Dashboard and basic reports

The system is designed as a **role-based, multi-branch management system**, where each employee can access only the features and branch data allowed by their role.

---

# 2. Problem Statement

Managing a pharmacy manually or using separate systems can create several problems:

* Difficulty tracking medicine stock
* Difficulty identifying which batch a medicine belongs to
* Expired medicines remaining in stock
* Low-stock medicines being missed
* Manual calculation of sales and due amounts
* Difficulty tracking purchases and suppliers
* Difficulty transferring stock between branches
* No centralized view of multiple branches
* Employees having access to data they should not manage
* Difficulty identifying medicine information quickly

The system is designed to solve these problems through a centralized web application.

---

# 3. Main Objectives

The main objectives of the system are:

1. Centralize pharmacy operations in one system.
2. Manage medicines and their batches separately.
3. Track inventory branch-wise.
4. Manage sales through a POS interface.
5. Automatically update stock after purchases and sales.
6. Support stock transfers between branches.
7. Track medicine expiry dates.
8. Detect low-stock medicines.
9. Provide role-based access control.
10. Provide QR-based medicine information lookup.
11. Provide a centralized dashboard for pharmacy management.

---

# 4. System Type

The application can be classified as:

> **A Role-Based Multi-Branch Pharmacy Management System**

From a technical perspective:

> **A web-based pharmacy inventory, sales, purchase and branch management application.**

It is primarily a pharmacy-focused business management system rather than a general-purpose ERP.

---

# 5. Target Users

The system has three types of users:

### 5.1 Admin

The Admin has access to the entire system.

Responsibilities:

* Manage branches
* Manage employees/users
* Manage medicines
* Manage batches
* View global inventory
* Manage suppliers
* Manage purchases
* View sales
* Manage stock transfers
* View dashboard and reports

Admin can access data across all branches.

---

### 5.2 Manager

A Manager belongs to one specific branch.

Responsibilities:

* Manage branch inventory
* Manage purchases
* Manage suppliers
* View and manage sales
* Manage batches
* Create stock transfers
* Monitor low stock
* Monitor expired stock
* View branch-level dashboard and reports

A Manager cannot manage other branches or system users.

---

### 5.3 Staff

Staff members also belong to one specific branch.

Responsibilities:

* Operate POS
* Create sales
* Search medicines
* Search batches
* Scan/use QR codes
* View branch stock
* View basic sales information

Staff members do not have access to:

* User management
* Branch management
* Purchase management
* Supplier management
* Stock transfer management
* Global management features

---

# 6. Role-Based Access Model

The system follows the following access hierarchy:

```text
                    ADMIN
                      │
          ┌───────────┴───────────┐
          │                       │
       MANAGER                  STAFF
          │                       │
      Own Branch              Own Branch
```

### Access Principle

```text
ADMIN
→ All branches
→ All system data
→ System configuration

MANAGER
→ Own branch
→ Branch-level operations

STAFF
→ Own branch
→ Sales/POS and stock-related operations
```

This prevents users from accessing information or operations outside their responsibilities.

---

# 7. Core Modules

The system is divided into the following major modules:

1. Authentication & Authorization
2. Branch Management
3. Medicine Management
4. Batch Management
5. Inventory Management
6. QR Code Management
7. Sales / POS
8. Purchase Management
9. Supplier Management
10. Stock Transfer
11. Expiry & Low Stock Monitoring
12. Dashboard & Basic Reports

---

# 8. Authentication & Authorization

The system uses JWT-based authentication.

### Login Flow

```text
User
 │
 ▼
Login Page
 │
 ▼
Username + Password
 │
 ▼
Django Authentication
 │
 ▼
JWT Access + Refresh Token
 │
 ▼
Frontend stores authentication data
 │
 ▼
Protected Application
```

The access token is used for authenticated API requests.

The refresh token is used to obtain a new access token when the access token expires.

### Important Security Rules

* Public employee registration is not available.
* Only Admin can create Manager and Staff accounts.
* Admin users cannot be created through the user management API.
* Manager and Staff users must belong to a branch.
* Passwords are stored using Django password hashing.
* Business APIs require authentication.

---

# 9. Branch Management

A Branch represents a physical pharmacy location.

Each branch contains:

* Branch name
* Address
* Phone
* Active/inactive status
* Creation date

Only Admin can create, update or delete branches.

Branches are connected to:

* Users
* Inventory
* Purchases
* Sales
* Stock Transfers

---

# 10. Medicine Management

A Medicine represents the general medicine/product definition.

Medicine information includes:

* Name
* Generic name
* Strength
* Dosage form
* Manufacturer
* Active/inactive status

Example:

```text
Name: Napa
Generic Name: Paracetamol
Strength: 500mg
Dosage Form: Tablet
Manufacturer: Beximco
```

A medicine does not represent a specific stock entry.

The actual stock-related information is managed through batches and inventory.

---

# 11. Batch Management

A medicine can have multiple batches.

A batch stores information that can vary between different production batches.

Batch information includes:

* Medicine
* Batch number
* Expiry date
* Pack size
* Purchase price
* Selling price
* QR code
* Creation date

Relationship:

```text
Medicine
   │
   ├── Batch 001
   ├── Batch 002
   └── Batch 003
```

The combination of:

```text
Medicine + Batch Number
```

must be unique.

---

# 12. QR Code System

Each batch receives a unique QR code.

Example:

```text
MED-A6F83BB00FC2
```

The QR code does not directly store all medicine information.

Instead, it stores a URL such as:

```text
http://localhost:5173/qr/MED-A6F83BB00FC2/
```

### QR Flow

```text
QR Code
   │
   ▼
QR URL
   │
   ▼
React QR Page
   │
   ▼
Backend QR Lookup API
   │
   ▼
Find Batch
   │
   ▼
Find Related Medicine
   │
   ▼
Return Medicine Information
```

The QR page can display:

* Medicine name
* Generic name
* Strength
* Dosage form
* Manufacturer
* Batch number
* Expiry date
* Pack size
* Selling price
* Expiry status

The QR lookup endpoint is public because a customer or mobile device may scan the QR code without being logged into the management system.

---

# 13. Inventory Management

Inventory connects:

```text
Branch
   +
Batch
   =
Inventory
```

The Inventory table stores:

* Branch
* Batch
* Quantity
* Minimum stock
* Last updated time

Example:

```text
Branch: Main Branch
Batch: Napa - ABC123
Quantity: 150
Minimum Stock: 20
```

The same batch can exist in multiple branches.

Example:

```text
Napa Batch ABC123

Main Branch      → 150 units
Uttara Branch    → 80 units
Mirpur Branch    → 40 units
```

Each branch/batch combination has only one inventory record.

---

# 14. Stock Lifecycle

Stock enters the system primarily through purchases.

```text
Purchase
   │
   ▼
Purchase Items
   │
   ▼
Inventory Increase
```

When a medicine is sold:

```text
Sale
   │
   ▼
Sale Items
   │
   ▼
Inventory Decrease
```

When stock is transferred:

```text
Source Branch Inventory
          │
          ▼
    Stock Transfer
          │
          ▼
Destination Branch Inventory
```

All stock-changing operations should be handled atomically to prevent inconsistent stock data.

---

# 15. Purchase Management

Purchases represent medicines received from suppliers.

A purchase contains:

* Supplier
* Branch
* Invoice number
* Purchase date
* Total amount
* Created by
* Purchase items

Each purchase can contain multiple items.

Example:

```text
Purchase
│
├── Napa Batch A
│   ├── Quantity: 100
│   ├── Purchase Price: 80
│   └── Selling Price: 100
│
└── Seclo Batch B
    ├── Quantity: 50
    ├── Purchase Price: 50
    └── Selling Price: 70
```

### Purchase Flow

```text
Supplier
   │
   ▼
Purchase
   │
   ▼
Purchase Items
   │
   ▼
Inventory
   │
   ▼
Stock Increased
```

Managers can create purchases for their own branch.

Admins can create purchases for any branch.

---

# 16. Supplier Management

Suppliers represent companies or individuals that supply medicines.

Supplier information includes:

* Name
* Company name
* Phone
* Address
* Active/inactive status
* Creation date

A supplier can have multiple purchases.

Relationship:

```text
Supplier
   │
   ├── Purchase
   ├── Purchase
   └── Purchase
```

Admin and Manager can manage suppliers.

---

# 17. Sales / POS

The Sales module is used for selling medicines to customers.

A Sale contains:

* Invoice number
* Branch
* Sold by
* Sale date
* Total amount
* Discount
* Paid amount
* Due amount
* Sale items

Each sale can contain multiple medicines.

Example:

```text
Sale Invoice: INV-1001

Napa 500mg       × 2
Seclo 20mg       × 1
Vitamin C        × 3

Subtotal:        ৳500
Discount:        ৳20
Total:           ৳480
Paid:            ৳400
Due:             ৳80
```

---

# 18. FEFO Stock Selection

The sales system follows **FEFO (First Expired, First Out)** for batch selection.

This means when multiple batches of the same medicine are available, the system prefers the batch with the earliest expiry date.

Example:

```text
Batch A → Expiry: 2026-12-01
Batch B → Expiry: 2027-06-01
Batch C → Expiry: 2028-01-01
```

The system will use:

```text
Batch A
   ↓
Batch B
   ↓
Batch C
```

This reduces the risk of medicines remaining in inventory until expiry.

Expired batches are excluded from normal sale selection.

---

# 19. Sale Calculation

The system calculates:

```text
Subtotal
= Sum of sale item subtotals

Net Amount
= Total Amount - Discount

Due Amount
= Net Amount - Paid Amount
```

If the paid amount is greater than or equal to the net amount:

```text
Due = 0
```

---

# 20. Stock Transfer

Stock Transfer allows inventory to move from one branch to another.

A transfer contains:

* Source branch
* Destination branch
* Transfer date
* Status
* Created by
* Transfer items

Statuses:

```text
PENDING
COMPLETED
CANCELLED
```

### Transfer Flow

```text
Source Branch
     │
     ▼
Select Batch + Quantity
     │
     ▼
Stock Transfer
     │
     ▼
Decrease Source Inventory
     │
     ▼
Increase Destination Inventory
```

Managers can transfer stock from their own branch.

Admins can transfer stock between any branches.

Staff cannot perform stock transfers.

---

# 21. Expiry Management

The system tracks batch expiry dates.

A batch is considered expired when:

```text
expiry_date < current_date
```

The system provides an Expired Stock view containing:

* Medicine
* Batch
* Expiry date
* Current quantity
* Expired status

Expired stock is excluded from normal sales selection.

---

# 22. Low Stock Management

Every inventory record has a `minimum_stock` value.

Example:

```text
Current Quantity = 8
Minimum Stock = 10
```

Since:

```text
8 <= 10
```

the item is considered low stock.

The system provides a dedicated Low Stock view.

This helps pharmacy staff identify medicines that need replenishment.

---

# 23. Dashboard

The dashboard provides a quick overview of the pharmacy.

Current dashboard information includes:

* Total branches
* Total active medicines
* Total active suppliers
* Total stock quantity
* Low-stock count
* Expired-stock count
* Today's sales count
* Today's sales amount
* Recent sales

### Admin Dashboard

Admin can see global information across branches.

### Manager/Staff Dashboard

Manager and Staff see information restricted to their own branch.

---

# 24. Database Design

The system uses a relational database structure.

The core tables are:

```text
1. Users
2. Branches
3. Medicines
4. Batches
5. Inventory
6. Suppliers
7. Purchases
8. Purchase Items
9. Sales
10. Sale Items
11. Stock Transfers
12. Stock Transfer Items
```

---

# 25. Main Database Relationships

The central relationship is:

```text
Medicine
    │
    ▼
Batch
    │
    ▼
Inventory
    │
    ▼
Branch
```

Other relationships:

```text
Supplier
    │
    ▼
Purchase
    │
    ▼
Purchase Item
    │
    ▼
Batch
```

```text
Sale
    │
    ▼
Sale Item
    │
    ▼
Batch
```

```text
Stock Transfer
    │
    ▼
Stock Transfer Item
    │
    ▼
Batch
```

Users are connected to branches and operational records through the appropriate foreign keys.

---

# 26. Database Integrity Rules

Important database constraints include:

### Unique Medicine Batch

```text
Medicine + Batch Number
```

must be unique.

### Unique Inventory

```text
Branch + Batch
```

must be unique.

### Unique QR Code

Every batch QR code must be unique.

### Unique Purchase Invoice

A supplier cannot have duplicate invoice numbers.

### Unique Sale Invoice

Every sale invoice number must be unique.

These constraints prevent duplicate or inconsistent records.

---

# 27. Backend Architecture

The backend follows a layered architecture:

```text
React Frontend
       │
       ▼
REST API
       │
       ▼
Django REST Framework
       │
       ▼
View
       │
       ▼
Serializer
       │
       ▼
Service Layer
       │
       ▼
Django Models
       │
       ▼
PostgreSQL
```

For operations that modify stock:

```text
View
  ↓
Serializer
  ↓
Service
  ↓
transaction.atomic()
  ↓
Inventory / Sale / Purchase / Transfer
```

This structure keeps business logic separate from API and database definitions.

---

# 28. Technology Stack

## Backend

* Python
* Django
* Django REST Framework
* PostgreSQL
* Simple JWT
* Django ORM

## Frontend

* React
* Vite
* JavaScript
* JSX
* Axios
* React Router

## Infrastructure

* Docker
* Docker Compose

## QR

* Python QR Code library
* QR image generation
* React QR lookup page

---

# 29. Frontend Architecture

The frontend follows a modular structure:

```text
src/
│
├── api/
│   ├── axios.js
│   ├── authApi.js
│   ├── medicineApi.js
│   ├── batchApi.js
│   ├── inventoryApi.js
│   ├── purchaseApi.js
│   ├── saleApi.js
│   ├── transferApi.js
│   ├── supplierApi.js
│   ├── dashboardApi.js
│   └── userApi.js
│
├── components/
│   ├── common/
│   ├── layout/
│   └── forms/
│
├── context/
│   └── AuthContext.jsx
│
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── medicines/
│   ├── batches/
│   ├── inventory/
│   ├── sales/
│   ├── purchases/
│   ├── suppliers/
│   ├── transfers/
│   ├── branches/
│   ├── users/
│   └── qr/
│
├── routes/
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
│
├── App.jsx
├── main.jsx
└── index.css
```

---

# 30. API Structure

The backend APIs follow REST-style endpoints.

### Authentication

```text
POST /auth/login/
POST /api/token/refresh/
```

### Branches

```text
GET    /api/branches/
POST   /api/branches/
GET    /api/branches/{id}/
PUT    /api/branches/{id}/
DELETE /api/branches/{id}/
```

### Medicines

```text
GET    /api/medicines/
POST   /api/medicines/
GET    /api/medicines/{id}/
PUT    /api/medicines/{id}/
DELETE /api/medicines/{id}/
```

### Batches

```text
GET    /api/batches/
POST   /api/batches/
GET    /api/batches/{id}/
PUT    /api/batches/{id}/
DELETE /api/batches/{id}/
GET    /api/batches/{id}/qr/
```

### Inventory

```text
GET /api/inventory/
GET /api/inventory/{id}/
GET /api/inventory/low_stock/
GET /api/inventory/expired/
```

### Purchases

```text
GET    /api/purchases/
POST   /api/purchases/
GET    /api/purchases/{id}/
PUT    /api/purchases/{id}/
DELETE /api/purchases/{id}/
```

### Sales

```text
GET  /api/sales/
POST /api/sales/
GET  /api/sales/{id}/
```

### Suppliers

```text
GET    /api/suppliers/
POST   /api/suppliers/
GET    /api/suppliers/{id}/
PUT    /api/suppliers/{id}/
DELETE /api/suppliers/{id}/
```

### Transfers

```text
GET  /api/transfers/
POST /api/transfers/
GET  /api/transfers/{id}/
```

### Users

```text
GET    /api/users/
POST   /api/users/
GET    /api/users/{id}/
PUT    /api/users/{id}/
DELETE /api/users/{id}/
```

### QR Lookup

```text
GET /api/qr/{qr_code}/
```

This endpoint is intentionally public for QR scanning.

---

# 31. Frontend Route Structure

Public routes:

```text
/login
/qr/:qrCode
```

Protected routes:

```text
/dashboard

/medicines
/medicines/new
/medicines/:id/edit

/batches
/batches/new
/batches/:id/edit

/inventory
/inventory/low-stock
/inventory/expired

/sales
/sales/history
/sales/:id

/purchases
/purchases/new
/purchases/:id

/suppliers
/suppliers/new
/suppliers/:id/edit

/transfers
/transfers/new
/transfers/:id

/branches
/branches/new
/branches/:id/edit

/users
/users/new
/users/:id/edit
```

The QR route remains public because it is designed to be accessed by a mobile scanner without requiring authentication.

---

# 32. Data Flow Examples

## Purchase Flow

```text
Manager/Admin
      │
      ▼
Purchase Form
      │
      ▼
POST /api/purchases/
      │
      ▼
Purchase Service
      │
      ├── Create Purchase
      ├── Create Purchase Items
      └── Increase Inventory
      │
      ▼
Database
```

---

## Sale Flow

```text
Staff/Manager/Admin
      │
      ▼
POS
      │
      ▼
Select Medicine
      │
      ▼
Select/Determine Batch
      │
      ▼
FEFO Batch Selection
      │
      ▼
POST /api/sales/
      │
      ▼
Sale Service
      │
      ├── Create Sale
      ├── Create Sale Items
      └── Decrease Inventory
      │
      ▼
Database
```

---

## Stock Transfer Flow

```text
Manager/Admin
      │
      ▼
Transfer Form
      │
      ▼
POST /api/transfers/
      │
      ▼
Transfer Service
      │
      ├── Validate Source Stock
      ├── Decrease Source Inventory
      ├── Increase Destination Inventory
      └── Create Transfer Records
      │
      ▼
Database
```

---

## QR Flow

```text
Batch
 │
 ▼
Unique QR Code
 │
 ▼
QR Image
 │
 ▼
Mobile Scanner
 │
 ▼
/qr/{qr_code}/
 │
 ▼
React QR Page
 │
 ▼
GET /api/qr/{qr_code}/
 │
 ▼
Batch + Medicine Information
 │
 ▼
Display Medicine Information
```

---

# 33. Data Ownership and Branch Isolation

Branch-level data isolation is an important part of the system.

For example:

```text
Manager A
   │
   └── Branch A
         │
         ├── Inventory
         ├── Sales
         ├── Purchases
         └── Transfers
```

Manager A should not be able to access:

```text
Branch B Inventory
Branch B Sales
Branch B Purchases
```

The backend enforces this restriction instead of relying only on frontend hiding.

This is important because frontend restrictions alone are not sufficient for security.

---

# 34. Business Rules Summary

The system follows these major business rules:

### User Rules

```text
Admin
→ Can manage users

Manager
→ Cannot manage users

Staff
→ Cannot manage users
```

### Branch Rules

```text
Admin
→ All branches

Manager
→ Own branch

Staff
→ Own branch
```

### Purchase Rules

```text
Admin
→ Any branch

Manager
→ Own branch

Staff
→ No access
```

### Sales Rules

```text
Admin
→ All branches

Manager
→ Own branch

Staff
→ Own branch
```

### Transfer Rules

```text
Admin
→ Any branch to any branch

Manager
→ From own branch

Staff
→ No access
```

### Stock Rules

```text
Purchase
→ Increase stock

Sale
→ Decrease stock

Transfer
→ Decrease source
→ Increase destination
```

### Expiry Rules

```text
Expired batch
→ Cannot be selected for normal sale
```

### Low Stock Rule

```text
quantity <= minimum_stock
→ Low Stock
```

---

# 35. Why Medicine and Batch Are Separate

Medicine and Batch are intentionally separate entities.

For example, the same medicine can be produced multiple times:

```text
Napa 500mg
    │
    ├── Batch A001 → Expiry 2026
    ├── Batch A002 → Expiry 2027
    └── Batch A003 → Expiry 2028
```

If batch information were stored directly in the Medicine table, it would become difficult to manage:

* Multiple expiry dates
* Multiple batch numbers
* Different purchase prices
* Different selling prices
* Different stock quantities

Separating Medicine and Batch solves this problem.

---

# 36. Why Inventory Is Separate from Batch

A batch represents a batch of medicine, while Inventory represents where and how much of that batch exists.

For example:

```text
Batch A001
    │
    ├── Main Branch → 100
    ├── Uttara Branch → 50
    └── Mirpur Branch → 25
```

Therefore:

```text
Batch = What batch is it?

Inventory = Where is it and how much is available?
```

This design supports multiple branches correctly.

---

# 37. Scalability Considerations

The current architecture is designed to support future expansion.

Potential future modules could include:

* Customer management
* Sales return
* Purchase return
* Expense management
* Accounting
* Payment management
* Prescription management
* Advanced reporting
* Online pharmacy
* Delivery management
* Loyalty system
* Notification system
* AI-based features

These are intentionally outside the current core scope to keep the system focused and manageable.

---

# 38. Current Project Scope

The current project intentionally focuses on the most important pharmacy operations:

```text
Authentication
      +
Branches
      +
Medicines
      +
Batches
      +
Inventory
      +
Purchases
      +
Suppliers
      +
Sales / POS
      +
Transfers
      +
QR
      +
Expiry / Low Stock
      +
Dashboard
```

This provides a complete operational workflow without unnecessarily adding unrelated modules.

---

# 39. Overall System Architecture

```text
                         PHARMACY MANAGEMENT SYSTEM
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
        Authentication            Frontend                Backend
              │                       │                       │
              │                    React                    Django
              │                       │                       │
              │                    Axios                   DRF API
              │                       │                       │
              │                React Router                 JWT
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                                      ▼
                                  PostgreSQL
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
         Medicines                Inventory                  Sales
             │                        │                        │
          Batches                  Branches                  POS
             │                        │                        │
             └────────────────────────┼────────────────────────┘
                                      │
                         Purchases / Suppliers
                                      │
                              Stock Transfers
                                      │
                                QR Management
```

---

# 40. Final Understanding

The application is designed around a simple core concept:

> **Medicine → Batch → Inventory → Branch**

All major pharmacy operations are built around this relationship.

Purchases add stock:

```text
Supplier
   ↓
Purchase
   ↓
Batch
   ↓
Inventory +
```

Sales remove stock:

```text
POS
   ↓
Sale
   ↓
Batch
   ↓
Inventory -
```

Transfers move stock:

```text
Branch A
   ↓
Transfer
   ↓
Branch B
```

QR provides quick medicine identification:

```text
QR
 ↓
Batch
 ↓
Medicine Information
```

Dashboard provides an operational overview:

```text
Branches
Medicines
Stock
Sales
Low Stock
Expired Stock
Suppliers
```

The system therefore provides a complete, role-based, multi-branch workflow for managing the core operations of a pharmacy business.

---

# 41. Project Development Philosophy

The project follows a **business-first and modular development approach**.

The development process is based on:

1. Identify the real pharmacy workflow.
2. Define user roles and responsibilities.
3. Design the database around business entities.
4. Define relationships and constraints.
5. Implement backend APIs.
6. Add business logic through service layers.
7. Implement role-based access control.
8. Build the React frontend module by module.
9. Connect frontend with REST APIs.
10. Test complete business flows.
11. Validate branch-level data isolation.
12. Prepare the system for deployment.

The goal is not to add unnecessary complexity, but to build a practical and maintainable pharmacy management application with a clear architecture and realistic business workflow.
