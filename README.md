🏫 Campus Exchange – Project Component Marketplace
A Full-Stack MERN-style Web App (Node.js + MySQL + HTML/CSS/JS)
By Adarsh L (PES2UG23CS025) 
📌 Overview

Campus Exchange is a full-stack application that allows engineering students to buy, sell, and exchange project components within the campus.

It includes:

✔ A modern frontend (HTML, CSS, Vanilla JS)
✔ A secure Node.js + Express backend
✔ A robust MySQL database with triggers, procedures & views
✔ A powerful Admin Panel for managing users, components, transactions & feedback

 
🚀 Features
👨‍🎓 Student/Seller Features

Register & login

Post components under a project

View available components

Purchase components securely

Give feedback and rating after purchase

Dashboard to view received feedback

🧑‍💼 Admin Features

Access secured Admin Panel

View all registered users

View all available components

View all transactions + feedback

Reset component status (Testing / Error fix)

(Refund removed — final version)

🗄 SQL Features

Triggers (prevent double selling)

Stored procedures (purchase, add feedback)

Database views (for admin dashboard)

Automatic component status updates

🛠️ Tech Stack
Frontend

HTML5

CSS3 (Glass UI + Gradients)

Vanilla JavaScript

Backend

Node.js

Express.js

MySQL2

Database

MySQL (Triggers, Procedures, Views)

📁 Project Structure
campus-exchange-backend/
│── frontend/
│   ├── index.html
│   ├── admin.html
│   ├── style.css
│   ├── app.js
│   └── admin.js
│
├── server.js
├── .env
├── package.json
└── campus_exchange_final.sql

⚙️ Installation & Setup
1️⃣ Install dependencies
npm install

2️⃣ Configure .env
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=campus_exchange
SERVER_PORT=5000

3️⃣ Import SQL file

Import campus_exchange_final.sql into MySQL using:

mysql -u root -p < campus_exchange_final.sql

4️⃣ Start backend server
node server.js

5️⃣ Run frontend

Simply open:

frontend/index.html

🔐 Default Users
Name	Email	Role	Password
System Admin	admin@campus.edu
	admin	admin123
Adarsh L	adarsh@campus.edu
	student	1234
Amar Sagar	amar@campus.edu
	student	abcd
🧠 Database Highlights
✅ Important SQL Features Used:

Trigger: Prevent double-selling

Procedure: PurchaseComponent, AddFeedback, ResetComponentStatus

Views:

v_Users

v_Components

v_AvailableItems

v_AdminOverview

 
⭐ Future Enhancements

JWT-based authentication

File uploads for images (Cloudinary)

Category-wise component listing

Mobile app version

 
This project demonstrates full-stack development, database engineering, admin system design, and clean UI/UX skills — suitable for project submission, resume, and professional portfolio.
