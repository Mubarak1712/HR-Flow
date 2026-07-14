# HRFlow - Full Stack HR Management System

HRFlow is a modern Full Stack HR Management System built using the MERN Stack. It streamlines workforce management by providing secure role-based access for administrators and employees, enabling efficient management of employees, tasks, attendance, leave requests, payroll, notifications, and reports through an intuitive web interface.

---

## Features

### Authentication & Authorization
- Secure JWT Authentication
- Role-Based Access Control (Admin & Employee)
- Protected Routes
- Password Hashing with bcrypt

### Admin Module
- Dashboard with workforce overview
- Employee Management
- Department Management
- Task Assignment
- Attendance Monitoring
- Leave Approval
- Salary Management
- Reports & Analytics
- Notification Management
- Application Settings

### Employee Module
- Personal Dashboard
- View Assigned Tasks
- Attendance Tracking
- Leave Requests
- Salary Details
- Profile Management
- Notifications

### HR Management
- Employee Records
- Department Organization
- Task Management
- Attendance Tracking
- Leave Management
- Payroll Management

---

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- CSS / Modern UI Components

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcrypt

---

## Project Structure

```
HRFlow/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/Mubarak1712/HR-Flow.git
```

### Navigate to the project

```bash
cd HR-Flow
```

### Install dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd ../server
npm install
```

### Configure Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

---

## Screens

- Login
- Register
- Admin Dashboard
- Employee Dashboard
- Employee Management
- Task Management
- Attendance
- Leave Management
- Salary
- Notifications
- Reports
- Settings

---

## Security

- JWT Authentication
- Password Hashing
- Protected API Routes
- Role-Based Authorization
- Secure MongoDB Integration

---

## Future Improvements

- Email Notifications
- Performance Dashboard
- Document Management
- Calendar Integration
- Advanced Analytics
- Mobile Responsive Enhancements
- Export Reports (PDF / Excel)
- Audit Logs

---

## Author

**Pataan Mubarak**

GitHub: https://github.com/Mubarak1712
---
## License
This project is developed for educational and portfolio purposes.
