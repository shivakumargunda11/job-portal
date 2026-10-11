# CareerConnect — Jobs, Internships & Opportunities Portal

A full-stack career platform built with **React + Vite** (frontend) and **Java Spring Boot** (backend), backed by **MySQL**.

## Features

- 🔐 JWT Authentication (register/login as Student or Recruiter)
- 💼 Browse & filter Jobs, Internships, Hackathons, Competitions, Scholarships
- 📄 Resume upload (PDF/DOC/DOCX, max 5 MB) when applying
- 📋 Student dashboard — track application status & download uploaded resumes
- 🧑‍💼 Recruiter dashboard — post opportunities, view & download applicant resumes
- 🔖 Bookmark opportunities for later
- 🛡️ Role-based access control (STUDENT / RECRUITER / ADMIN)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Vanilla CSS (dark theme) |
| Backend | Java 17 + Spring Boot 3 |
| Auth | Spring Security + JWT |
| Database | MySQL 8 + Spring Data JPA |
| File Storage | Local filesystem (`uploads/resumes/`) |

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8

### Database Setup

```sql
CREATE DATABASE careerconnect;
CREATE USER 'career'@'localhost' IDENTIFIED BY 'career123';
GRANT ALL PRIVILEGES ON careerconnect.* TO 'career'@'localhost';
FLUSH PRIVILEGES;
```

### Backend

```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Environment Variables

Copy `backend/src/main/resources/application.properties` and override:

```
DB_USERNAME=career
DB_PASSWORD=career123
JWT_SECRET=your-32-char-secret-key-here
```

## API Highlights

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/opportunities` | List/search/filter opportunities |
| POST | `/api/applications/apply/{id}` | Apply with resume (multipart) |
| GET | `/api/applications/my` | My applications (student) |
| GET | `/api/applications/{id}/resume` | Download resume |
| PUT | `/api/applications/{id}/status` | Update status (recruiter) |
| POST | `/api/bookmarks/{id}` | Bookmark an opportunity |

## File Upload Details

- Accepts **PDF, DOC, DOCX** only
- Max size: **5 MB** (configurable via `app.upload.max-file-size`)
- Files stored in `backend/uploads/resumes/` with UUID-prefixed names
- File content validated via magic bytes (not just extension)
- Resume metadata stored in MySQL; binary files stay on disk
