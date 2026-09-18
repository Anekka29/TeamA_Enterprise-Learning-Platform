# Enterprise Learning Platform — Internship Repository

This repository contains my **internship work, learning materials, assignments, notes, and project development work** completed during my internship.

The main project in this repository is an **Enterprise Learning Platform**, developed as a full-stack web application using **React.js on the frontend** and **Spring Boot on the backend**.

The repository is maintained as a personal internship and learning repository to track development progress, implementation work, and technical learning.

---

## 📌 Repository Overview

This repository is organized into three main sections:

```text
Chandni_Enterprise-Learning-Platform/
│
├── Enterprise Learning Platform/
│   ├── Project Backend/
│   └── Project Frontend/
│
├── Internship Assignments/
│
├── Internship Notes/
│
└── LICENSE
```

### Enterprise Learning Platform

Contains the main full-stack project.

### Internship Assignments

Contains assignments completed as part of the internship.

### Internship Notes

Contains technical notes and learning material created during the internship.

### LICENSE

This repository is licensed under the **MIT License**.

---

# 🎓 Enterprise Learning Platform

The Enterprise Learning Platform is the main development project in this repository.

It consists of two separate applications:

```text
Enterprise Learning Platform
│
├── Project Frontend
│   └── React.js + Vite
│
└── Project Backend
    └── Spring Boot + MySQL
```

The backend project is named **SkillSphere Backend** in its Maven configuration.

---

# 🚀 Project Features

The current project includes functionality around:

* User authentication
* JWT-based authentication
* Spring Security
* Role-based application flow
* OAuth2 client support
* Password recovery
* Email support
* Student dashboard
* Mentor dashboard
* Admin dashboard
* Student course details
* Profile management
* Role management

These features are represented by the current backend dependencies and frontend project structure.

---

# 👥 User Roles

The application is structured around different user roles.

### 👨‍🎓 Student

The project contains a dedicated student dashboard and student course-details functionality.

### 👨‍🏫 Mentor

The project contains a dedicated mentor dashboard.

### 👨‍💼 Admin

The project contains an admin dashboard and role-management functionality.

---

# 🔐 Authentication & Security

The backend uses **Spring Security** and **JWT** for authentication and authorization.

The backend also includes support for:

* JWT authentication
* Spring Security
* OAuth2 Client
* Request validation
* Email functionality

The project uses **JJWT 0.12.5** for JWT functionality.

### Authentication Flow

```text
User
  │
  ▼
Login / Registration
  │
  ▼
Authentication
  │
  ▼
JWT Token
  │
  ▼
Spring Security
  │
  ▼
Role-Based Access
  │
  ├── Student
  ├── Mentor
  └── Admin
```

---

# 🛠️ Technology Stack

## Frontend

The frontend is built using:

* React.js
* Vite
* JavaScript / JSX
* Axios
* React Router
* Bootstrap
* Bootstrap Icons
* React Markdown
* React Syntax Highlighter
* AOS

The frontend is maintained separately inside the `Project Frontend` directory.

---

## Backend

The backend uses:

* Java 17
* Spring Boot 3.2.5
* Spring Web
* Spring Data JPA
* Hibernate
* Spring Security
* JWT / JJWT
* OAuth2 Client
* Spring Validation
* Spring Mail
* MySQL
* Lombok
* Maven

These technologies are defined in the backend Maven configuration.

---

# 🏗️ Backend Architecture

The backend follows a layered structure.

```text
Controller
     │
     ▼
  Service
     │
     ▼
 Repository
     │
     ▼
   MySQL
```

The backend source is organized into packages including:

```text
com.skillsphere/
│
├── ai/
│   └── provider/
│
├── config/
├── controller/
├── converter/
├── dto/
├── entity/
├── enums/
├── exception/
├── repository/
├── security/
└── service/
```

This structure separates API controllers, business logic, persistence, security, data-transfer objects, entities, exceptions, and configuration.

---

# 🖥️ Frontend Architecture

The frontend is maintained separately from the backend.

```text
Project Frontend/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   └── utils/
│
├── public/
├── package.json
└── vite.config.js
```

This separation helps keep UI components, pages, routing, API communication, services, hooks, contexts, and styling organized.

---

# 📚 Internship Work

This repository is not limited to the main project.

It also contains work completed during the internship.

## Internship Assignments

The `Internship Assignments` directory contains assignments completed as part of the internship.

These assignments represent practical work and exercises completed while learning and applying different development concepts.

## Internship Notes

The `Internship Notes` directory contains notes and learning material maintained during the internship.

These notes document concepts, implementation approaches, and technical learning from the internship.

---

# ⚙️ Running the Project Locally

## Prerequisites

Install the following before running the project:

* Java 17+
* Maven
* Node.js
* npm
* MySQL
* Git

---

# 🔹 Backend Setup

Navigate to the backend:

```bash
cd "Enterprise Learning Platform/Project Backend"
```

Build the project:

```bash
mvn clean install
```

Run the application:

```bash
mvn spring-boot:run
```

The project also includes Maven wrapper files, so the wrapper can be used if required:

### Windows

```bash
mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

The backend is configured as a Spring Boot 3.2.5 application targeting Java 17.

---

# 🔹 Database Setup

The backend uses **MySQL**.

Make sure MySQL is installed and running before starting the backend.

Create the database according to the database configuration used by the application.

Example:

```sql
CREATE DATABASE skillsphere;
```

Then configure the required database properties in the backend configuration.

> Never commit real database passwords, JWT secrets, OAuth credentials, or email credentials to the repository.

---

# 🔹 Frontend Setup

Open a new terminal and navigate to:

```bash
cd "Enterprise Learning Platform/Project Frontend"
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# 🔄 Application Flow

```text
                 ┌───────────────────┐
                 │      User         │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Login / Register  │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Authentication    │
                 │       + JWT       │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │   Role Handling   │
                 └─────────┬─────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
         Student        Mentor         Admin
             │             │             │
             ▼             ▼             ▼
         Dashboard     Dashboard     Dashboard
```

---

# 🗂️ Repository Structure

```text
Chandni_Enterprise-Learning-Platform/
│
├── Enterprise Learning Platform/
│   │
│   ├── Project Backend/
│   │   ├── src/
│   │   ├── pom.xml
│   │   ├── mvnw
│   │   └── mvnw.cmd
│   │
│   └── Project Frontend/
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── package-lock.json
│       └── vite.config.js
│
├── Internship Assignments/
│
├── Internship Notes/
│
└── LICENSE
```

The current repository structure shows the main project alongside the internship assignments, notes, and MIT license.

---

# 🎯 Purpose of This Repository

The purpose of this repository is to:

* Document my internship journey
* Store internship assignments
* Maintain technical notes
* Develop and maintain the Enterprise Learning Platform
* Practice full-stack development
* Apply Java and Spring Boot concepts
* Apply React.js development concepts
* Learn backend security and authentication
* Maintain project development history using Git and GitHub

---

# 📈 Learning Outcomes

Through this internship project, I am working with:

* Full-stack web application development
* React.js frontend development
* REST API development
* Spring Boot
* Spring Security
* JWT authentication
* OAuth2
* JPA / Hibernate
* MySQL
* Maven
* Git and GitHub
* Frontend-backend integration
* Role-based application design

---

# 🚧 Future Improvements

Possible future improvements include:

* More complete course-management workflows
* Learning progress tracking
* Additional student and mentor features
* Improved admin management
* Additional testing
* Better documentation of APIs
* Deployment configuration
* CI/CD integration
* Additional learning and assessment functionality

> These are future improvements, not claims about functionality currently implemented in the repository.

---

# 👩‍💻 Author

**Chandni Singh**

GitHub: [chandnisingh-ops](https://github.com/chandnisingh-ops)

This is a personal repository maintained as part of my internship and software development learning journey.

---

# 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for the complete license text.

---

## ⭐ Repository

[Chandni Enterprise Learning Platform](https://github.com/chandnisingh-ops/Chandni_Enterprise-Learning-Platform)

---

### Internship Repository

This repository is maintained for **learning, development, documentation, and internship work**.
