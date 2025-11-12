 

---

# 🏫 Campus Exchange – Project Components Edition

### 👨‍💻 Author: Adarsh L (PES2UG23CS025)

---

## 📘 Overview

**Campus Exchange** is a web-based platform designed for students to **buy and sell project components** within their campus.
The system allows users to:

* Post project parts for sale (microcontrollers, sensors, modules, etc.)
* Browse available components
* Purchase components securely
* Leave feedback for sellers
* Manage all activities through an interactive dashboard

This platform digitizes how students exchange electronic and mechanical parts used in academic projects.

---

## 🧩 Features

### 👥 User Management

* Login and Signup using email and password
* Role-based access (student/admin)
* Department tagging for categorization

### 💰 Marketplace

* Post new components under your project
* Browse all available parts with seller details
* Automatic update of item status to “Sold” after purchase
* Component price validation ensures correct payment amount

### ⭐ Feedback System

* Buyers can rate sellers after a successful purchase
* Feedback is visible to sellers in their dashboard

### 📊 Seller Dashboard

* Displays all feedback received
* Shows buyer names, comments, and ratings

### ⚙️ Backend Logic

* Purchase validation (exact payment required)
* Prevents resale of sold components
* Transaction-safe operations with rollback
* MySQL Triggers, Stored Procedures, and Views for data integrity

---

## 🏗️ Tech Stack

| Layer                  | Technology                           |
| ---------------------- | ------------------------------------ |
| **Frontend**           | HTML, CSS, JavaScript                |
| **Backend**            | Node.js + Express.js                 |
| **Database**           | MySQL 8+                             |
| **Hosting (Optional)** | Localhost / XAMPP / Netlify + Render |
| **Form Handling**      | Express API routes                   |
| **Data Validation**    | Stored Procedures & SQL Triggers     |

---

## 🗄️ Database Schema (MySQL)

### Main Tables

1. **Users** – Stores login and user info
2. **Projects** – Represents student projects
3. **Components** – Contains all listed project parts
4. **Transactions** – Records every purchase
5. **Feedback** – Stores ratings and comments

### Supporting Logic

* **Triggers**

  * Prevents double sale of sold components
  * Automatically updates component status to “Sold”
* **Stored Procedures**

  * `PurchaseComponent()` → Validates exact payment and handles transaction safely
  * `AddFeedback()` → Adds feedback after valid purchase
* **Views**

  * `v_ComponentStatus` → Overview of all components
  * `v_TransactionsDetailed` → Detailed transaction report
  * `v_FeedbackDetailed` → Feedback summary for dashboards

---

## ⚡ How to Run Locally

### 🧰 Prerequisites

* [Node.js](https://nodejs.org/en/) installed
* [MySQL Workbench or XAMPP](https://dev.mysql.com/downloads/workbench/)
* Any modern browser (Chrome/Edge)

---

### 🪜 Step 1: Setup Database

1. Open **MySQL Workbench**
2. Copy and paste the file `campus_exchange.sql` (final SQL provided)
3. Click **Execute All (⚡)**
4. Confirm all tables and views are created successfully:

   ```sql
   SHOW TABLES;
   SELECT * FROM Users;
   ```

---

### 🪜 Step 2: Setup Backend

1. Extract your backend folder (e.g., `campus-exchange-backend11`)
2. Open a terminal in that folder
3. Run these commands:

   ```bash
   npm install
   npm start
   ```
4. The server should display:

   ```
   ✅ Connected to DB
   Server listening on port 5000
   ```

---

### 🪜 Step 3: Setup Frontend

1. Open the frontend folder in VS Code
2. Open `index.html` and edit the backend API URL if needed
3. Run the file using **Live Server** or open directly in your browser

---

## 🧠 Demo Flow

| Step | Description                                         |
| ---- | --------------------------------------------------- |
| 1️⃣  | Student logs in or signs up                         |
| 2️⃣  | Seller posts new project components                 |
| 3️⃣  | Buyer browses marketplace and purchases a component |
| 4️⃣  | Backend validates price and updates stock           |
| 5️⃣  | Buyer leaves feedback                               |
| 6️⃣  | Seller views feedback in dashboard                  |

---

## 📸 Screens / Modules

1. **Login / Signup Page**
   → User authentication and registration

2. **Marketplace Page**
   → Displays all available components

3. **Sell Component Page**
   → Form to post new components

4. **Dashboard Page**
   → Shows received feedback and buyer details

---

## 🔐 Validation Summary

| Validation                         | Implemented In       |
| ---------------------------------- | -------------------- |
| Prevent selling already sold items | SQL Trigger          |
| Prevent wrong payment amount       | Stored Procedure     |
| Auto status update after purchase  | SQL Trigger          |
| Feedback only from buyers          | Procedure + UI logic |

---

## 🧪 Testing Commands (MySQL)

```sql
-- Successful purchase
CALL PurchaseComponent(3, 2, 120.00, 'UPI');

-- Underpayment (fails)
CALL PurchaseComponent(3, 3, 50.00, 'Cash');

-- Overpayment (fails)
CALL PurchaseComponent(3, 4, 999.00, 'Card');

-- Add feedback
CALL AddFeedback(3, 1, 5, 'Great condition!');
```

---

## 🧾 Future Enhancements

* Add “FailedTransactions” table for logging rejected purchases
* Implement JWT authentication for secure login
* Add email notifications for successful sales
* Enable image upload for components

---

## 🧑‍🏫 Credits

**Developed By:**
👨‍💻 *Adarsh L* (PES2UG23CS025)
Department of Computer Science & Engineering
PES University

---

## 🏁 Final Status

✅ Database setup successful
✅ Frontend + Backend integration working
✅ Secure purchase & feedback system implemented
 

 
