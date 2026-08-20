# 🎓 Enterprise Learning Platform

> **Learn • Connect • Grow**

SkillSphere Nexus is a modern full-stack Learning Management System (LMS) developed as part of the **Infosys Virtual Internship**.

The platform provides separate dashboards for **Students, Mentors, and Administrators** with secure authentication, role-based authorization, and a modern responsive interface.

---

# 📌 Project Overview

SkillSphere Nexus is designed to bridge the gap between students and mentors by providing an interactive platform for:

- Learning
- Mentoring
- Assessments
- Progress Tracking
- User Management
- Platform Administration

The application follows a **React + Spring Boot** architecture with:

- JWT Authentication
- Spring Security
- Role-Based Authorization
- REST APIs
- Hibernate / JPA
- MySQL Database

---

# ✨ Features

## 👨‍🎓 Student

- Student Registration
- Secure Login
- JWT Authentication
- Personalized Dashboard
- Learning Progress
- Session Tracking
- Achievements
- Settings

## 👨‍🏫 Mentor

- Mentor Dashboard
- Student Management
- Session Management
- Student Progress Monitoring
- Analytics
- Resources
- Messages

## 👨‍💼 Admin

- User Management
- Role Management
- Platform Analytics
- Dashboard Overview
- Settings
- System Management

---

# 🔐 Security Features

- JWT Authentication
- Spring Security
- BCrypt Password Encryption
- Role-Based Authorization
- Protected Routes
- Secure REST APIs
- Password Validation
- Email Validation
- Authentication Filters
- Unauthorized Access Prevention

---

# 💻 Tech Stack

## Frontend

- React.js
- React Router
- Axios
- HTML5
- CSS3
- JavaScript (ES6+)
- React Icons

## Backend

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven

## Database

- MySQL

## Development Tools

- IntelliJ IDEA
- VS Code
- Postman
- Git
- GitHub
- MySQL Workbench

---

# 📂 Project Structure

```text
SkillSphere-Nexus
│
├── skillsphere-frontend
│   ├── src
│   ├── public
│   ├── components
│   ├── pages
│   ├── layouts
│   ├── services
│   ├── assets
│   └── App.jsx
│
├── skillsphere-backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── config
│   ├── security
│   ├── exception
│   └── application.properties
│
└── README.md
🏗️ System Architecture
┌─────────────────────────┐
│     React Frontend      │
│                         │
│ React Router            │
│ Axios                   │
│ HTML / CSS / JavaScript │
└────────────┬────────────┘
             │
             │ REST API
             ▼
┌─────────────────────────┐
│    Spring Boot Backend  │
│                         │
│ Spring Security         │
│ JWT Authentication      │
│ Spring Data JPA         │
│ Hibernate               │
└────────────┬────────────┘
             │
             │ Database Connection
             ▼
┌─────────────────────────┐
│          MySQL          │
└─────────────────────────┘
🔄 Application Flow
Landing Page
      │
      ▼
Register / Login
      │
      ▼
Spring Security
      │
      ▼
JWT Authentication
      │
      ▼
Role Validation
      │
      ├──────────────────┬──────────────────┐
      │                  │                  │
      ▼                  ▼                  ▼
 Student Dashboard   Mentor Dashboard   Admin Dashboard
📡 REST APIs
Authentication APIs
Method	Endpoint
POST	/api/auth/register
POST	/api/auth/login
👥 User Roles
Student

Students can:

View Dashboard
Track Learning Progress
View Sessions
View Achievements
Manage Profile
Mentor

Mentors can:

Manage Students
Conduct Sessions
View Analytics
Manage Resources
Admin

Administrators can:

Manage Users
Assign Roles
View Platform Analytics
Configure the System
🗄️ Database

The main user table is:

users
Important Fields           Field	Description
id	                             User ID
full_name                        Full name
username	                       Username
email	                           Email address
password	                       Encrypted password
college	                         College name
department	                     Department
year	                           Academic year
phone_number	                   Phone number
role	                           User role
created_at	Account creation time
🔑 Authentication Process
User Login
    │
    ▼
Authentication Manager
    │
    ▼
Spring Security
    │
    ▼
Password Verification
    │
    ▼
JWT Token Generation
    │
    ▼
Token Returned
    │
    ▼
Frontend Stores Token
    │
    ▼
Protected APIs
🚀 Installation & Setup
Prerequisites

Before running the project, make sure the following are installed:

Java 17
Maven
Node.js
npm
MySQL
Git

Recommended development tools:

VS Code
IntelliJ IDEA
MySQL Workbench
Postman
1️⃣ Clone the Repository

Open a terminal and run:

git clone https://github.com/Anekka29/TeamA_SkillSphere-learning-nexus-fsd.git

Then move into the project directory:

cd TeamA_SkillSphere-learning-nexus-fsd
2️⃣ Backend Setup

The backend is developed using Java 17 and Spring Boot.

Step 1 — Open Backend Folder

From the project root:

cd skillsphere-backend
Step 2 — Configure MySQL

Open:

skillsphere-backend/application.properties

Configure the MySQL database connection according to your local MySQL setup.

The backend uses MySQL for storing application data.

Make sure your MySQL server is running before starting the backend.

Step 3 — Build the Backend

Run:

mvn clean install

This will:

Download required Maven dependencies
Compile the backend
Run the build process
Generate the backend application
Step 4 — Start the Backend

Run:

mvn spring-boot:run

The Spring Boot backend will run at:

http://localhost:8080
3️⃣ Frontend Setup

The frontend is developed using React.js.

Step 1 — Open a New Terminal

Keep the backend terminal running.

Open another terminal and go to the project root:

cd TeamA_SkillSphere-learning-nexus-fsd

Then enter the frontend folder:

cd skillsphere-frontend
Step 2 — Install Dependencies

Run:

npm install

This installs all the dependencies defined in the frontend package.json.

Step 3 — Start the Frontend

Run:

npm run dev

The React/Vite development server will start.

The frontend will normally be available at:

http://localhost:5173
🔗 Running Frontend and Backend Together

The frontend and backend should run simultaneously.

Terminal 1 — Backend
cd skillsphere-backend
mvn spring-boot:run

Backend URL:

http://localhost:8080
Terminal 2 — Frontend
cd skillsphere-frontend
npm install
npm run dev

Frontend URL:

http://localhost:5173
🔄 Frontend–Backend Communication

The application follows this communication flow:

                    USER
                      │
                      ▼
              React Frontend
                      │
                      │ Axios
                      │ REST API
                      ▼
              Spring Boot Backend
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
   Spring Security           Controllers
          │                       │
          ▼                       ▼
    JWT Authentication        Services
                                  │
                                  ▼
                             Repositories
                                  │
                                  ▼
                               MySQL
🔐 Login and JWT Flow

When a user logs into the application:

User enters Email + Password
             │
             ▼
       React Login Page
             │
             ▼
   POST /api/auth/login
             │
             ▼
      Spring Boot Backend
             │
             ▼
      Spring Security
             │
             ▼
     Password Verification
             │
             ▼
       JWT Token Created
             │
             ▼
       Token Returned
             │
             ▼
     Frontend Stores Token
             │
             ▼
       Protected APIs
             │
             ▼
      Role Validation
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
   Student Mentor  Admin
   Dashboard Dashboard Dashboard
🧪 API Testing

The REST APIs can be tested using Postman.

Register
POST
/api/auth/register
Login
POST
/api/auth/login

The login response provides the authentication information required for accessing protected APIs.

The following features are planned for future versions:

Google OAuth Login
Email Verification
Forgot Password
OTP Verification
Dark Mode
Course Enrollment
Quiz Module
Assignment Submission
Certificate Generation
Notifications
AI Career Recommendation
Chat System
Video Sessions
Attendance Management
Cloud Deployment
📖 Learning Outcomes

This project demonstrates practical implementation of:

Full Stack Development
React Development
Spring Boot
REST APIs
Authentication
Authorization
JWT Security
Database Integration
Responsive UI Design
MVC Architecture
Version Control using Git & GitHub
📂 Repository

Repository Name:

TeamA_SkillSphere-learning-nexus-fsd

GitHub Repository:

https://github.com/Anekka29/TeamA_SkillSphere-learning-nexus-fsd

👩‍💻 Team Members
Anekka T.S.
Chandni Singh
B. Rajya Lakshmi
G. S. Bharanidharan
CH. G. V. Sindhusha
⭐ Project

SkillSphere Nexus

Learn • Connect • Grow

If you found this project useful, don't forget to ⭐ star the repository!
