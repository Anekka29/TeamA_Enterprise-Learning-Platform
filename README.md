# TeamA_SkillSphere-learning-nexus-fsd
# 🎓 SkillSphere Nexus

> *Learn • Connect • Grow*

SkillSphere Nexus is a modern full-stack Learning Management System (LMS) developed as part of the *Infosys Virtual Internship*. The platform provides separate dashboards for Students, Mentors, and Administrators with secure authentication, role-based authorization, and a modern responsive interface.

---

## 📌 Project Overview

SkillSphere Nexus is designed to bridge the gap between students and mentors by providing an interactive platform for learning, mentoring, assessments, and progress tracking.

The application follows a *React + Spring Boot* architecture with *JWT Authentication* and *MySQL Database*.

---

## ✨ Features

### 👨‍🎓 Student

- Student Registration
- Secure Login
- JWT Authentication
- Personalized Dashboard
- Learning Progress
- Session Tracking
- Achievements
- Settings

---

### 👨‍🏫 Mentor

- Mentor Dashboard
- Student Management
- Session Management
- Student Progress Monitoring
- Analytics
- Resources
- Messages

---

### 👨‍💼 Admin

- User Management
- Role Management
- Platform Analytics
- Dashboard Overview
- Settings
- System Management

---

## 🔐 Security Features

- JWT Authentication
- Spring Security
- BCrypt Password Encryption
- Role Based Authorization
- Protected Routes
- Secure REST APIs
- Password Validation
- Email Validation
- Authentication Filters
- Unauthorized Access Prevention

---

## 💻 Tech Stack

### Frontend

- React.js
- React Router
- Axios
- HTML5
- CSS3
- JavaScript (ES6+)
- React Icons

---

### Backend

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven

---

### Database

- MySQL

---

### Development Tools

- IntelliJ IDEA
- VS Code
- Postman
- Git
- GitHub
- MySQL Workbench

---

## 📂 Project Structure


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


---

# 🏗️ System Architecture


React Frontend
        │
        │ REST API
        ▼
Spring Boot Backend
        │
Spring Security + JWT
        │
Hibernate / JPA
        │
MySQL Database


---

# 🔄 Application Flow


Landing Page
      │
      ▼
Register/Login
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
      ├──────────────┐
      │              │
      ▼              ▼
Student Dashboard
Mentor Dashboard
Admin Dashboard


---

# 📡 REST APIs

## Authentication

| Method | Endpoint |
|----------|----------------------|
| POST | /api/auth/register |
| POST | /api/auth/login |

---

# 👥 User Roles

### Student

- View Dashboard
- Learning Progress
- Sessions
- Achievements
- Profile

---

### Mentor

- Manage Students
- Conduct Sessions
- View Analytics
- Resources

---

### Admin

- Manage Users
- Assign Roles
- Platform Analytics
- System Configuration

---

# 🗄️ Database

Main User Table


users


Important Fields

- id
- full_name
- username
- email
- password
- college
- department
- year
- phone_number
- role
- created_at

---

# 🔑 Authentication Process


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


---

# 🚀 Installation

## Clone Repository

bash
git clone https://github.com/Anekka29/TeamA_SkillSphere-learning-nexus-fsd.git


---

## Backend

bash
cd skillsphere-backend


Configure


application.properties



Run

bash
mvn clean install

mvn spring-boot:run


Backend


http://localhost:8080


---

## Frontend

bash
cd skillsphere-frontend

npm install

npm run dev


Frontend


http://localhost:5173


---

# 📷 Screenshots

- Landing Page
- Login Page
- Registration Page
- Student Dashboard
- Mentor Dashboard
- Admin Dashboard

(Add screenshots here)

---

# 🌟 Future Enhancements

- Google OAuth Login
- Email Verification
- Forgot Password
- OTP Verification
- Dark Mode
- Course Enrollment
- Quiz Module
- Assignment Submission
- Certificate Generation
- Notifications
- AI Career Recommendation
- Chat System
- Video Sessions
- Attendance Management
- Cloud Deployment

---

# 📖 Learning Outcomes

This project demonstrates

- Full Stack Development
- React Development
- Spring Boot
- REST APIs
- Authentication
- Authorization
- JWT Security
- Database Integration
- Responsive UI Design
- MVC Architecture
- Version Control using Git & GitHub

---
---

## 📂 Repository

**Repository Name:** `TeamA_SkillSphere-learning-nexus-fsd`

GitHub Repository:
https://github.com/Anekka29/TeamA_SkillSphere-learning-nexus-fsd

---

## 👩‍💻 Team Members

- Anekka T.S.
- Chandni Singh
- B. Rajya Lakshmi
- G. S. Bharanidharan
- CH. G. V. Sindhusha

---

⭐ If you found this project useful, don't forget to **star** the repository!
