# Operation Scheduler for Hospital Management

A comprehensive web application for managing hospital surgery schedules, doctors, patients, and operational resources. Features include real-time scheduling, conflict detection, email notifications, medical reporting, and role-based access control.

## 🚀 Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, React Big Calendar
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose)
*   **Authentication**: JWT (JSON Web Tokens)
*   **Notifications**: Nodemailer
*   **Reporting**: jsPDF, Chart.js

## 📋 Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16+)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local) or a [MongoDB Atlas](https://www.mongodb.com/atlas) account.
*   Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd hospital-scheduler
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

**Configuration (.env):**
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_db  # Or your Atlas Connection String
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com               # For sending notifications
EMAIL_PASS=your_email_app_password            # App Password (not login password)
```
*(Note: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).)*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

**Configuration:**
The frontend defaults to `http://localhost:5000/api`. If you change the backend port, create a `.env` file in `frontend`:
```env
VITE_API_URL=http://localhost:5000/api
```

## ▶️ Running the Application

### Start the Backend
```bash
# In backend directory
npm start
# OR (for auto-reload)
npm run dev
```
*   Server runs on: `http://localhost:5000`
*   API Endpoints: `http://localhost:5000/api`

### Start the Frontend
```bash
# In frontend directory
npm run dev
```
*   Client runs on: `http://localhost:5173` (typically) or the URL shown in terminal.

## 🧪 Quick Test Data (Optional)
1.  **Sign Up**: Go to the frontend URL and create a new account.
2.  **Doctors**: Add a doctor via the "Doctors" tab. Remember the email you use here if you want to test the specific "Doctor View" later.
3.  **Surgeries**: Go to "Surgery Scheduler" and create a new event.

## 📂 Project Structure
*   `backend/`: Express server, API routes, Models, Controllers.
*   `frontend/`: React application, Pages, Components.

## ✨ Key Features
*   **Smart Scheduling**: Automatic conflict detection for Doctors and OTs.
*   **Notifications**: Auto-emails for confirmation, rescheduling, and cancellation.
*   **Analytics**: Admin dashboard with surgery stats and outcome charts.
*   **PDF Export**: Download daily schedules.
*   **Medical Reports**: Attach files/images to surgery records (Stored locally in `backend/uploads/`).
*   **RBAC**: Doctors see only their own schedule; Admins see all.
