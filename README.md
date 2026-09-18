# MediCare+ MERN Stack Project

## Overview
A full‑stack web application for a healthcare platform where **Patients**, **Doctors**, and **Admins** can manage appointments, medical records, and communications.

## Project Structure
```
/hospital-management-system
├─ backend/      # Express API
│  ├─ src/
│  │  ├─ config/          # DB connection
│  │  ├─ controllers/     # Business logic (auth, patient, doctor, admin)
│  │  ├─ middleware/      # auth, upload, role checks
│  │  ├─ models/          # Mongoose schemas (User, Appointment, MedicalReport, Prescription)
│  │  └─ routes/          # API routers
│  ├─ .env.example        # Environment variables template
│  └─ package.json        # npm scripts (dev, start)
├─ frontend/     # React Vite app
│  ├─ src/
│  │  ├─ pages/           # Login, Register, dashboards
│  │  ├─ routes/          # AppRoutes (protected routes)
│  │  ├─ services/        # API service (Axios)
│  │  └─ contexts/        # AuthContext
│  ├─ vite.config.js      # dev server on port 5175
│  └─ package.json        # npm scripts (dev, build)
├─ README.md      # **THIS** file – project overview & run guide
└─ .env.example   # Backend environment template
```

## Prerequisites
- **Node.js** (v20.12 or newer) – the project works with Node 20; newer versions are fine.
- **npm** (comes with Node) – used for both backend and frontend.
- **MongoDB** – a local or remote instance. You can run MongoDB locally via Docker:
  ```bash
  docker run -d -p 27017:27017 --name mongodb mongo:latest
  ```

## Setup & Run (Local Development)
### 1. Clone the repository (if you haven't already)
```bash
git clone <repo‑url> hospital-management-system
cd hospital-management-system
```
### 2. Backend
```bash
cd backend
# Install dependencies
npm install
# Copy the env template and fill in values
cp .env.example .env
# Edit .env (MongoDB URI, JWT secret, CLIENT_URL)
# Example values:
# MONGODB_URI=mongodb://localhost:27017/medi_care_plus
# JWT_SECRET=supersecretkey
# CLIENT_URL=http://localhost:5175
# PORT=5000

# Start dev server (nodemon watches for changes)
npm run dev
```
The API will be available at `http://localhost:5000/api/...`.

### 3. Frontend
```bash
cd ../frontend
npm install
# The Vite dev server is pre‑configured to run on port 5175
npm run dev
```
Open **http://localhost:5175** in your browser.

### 4. Authentication Flow
- Register via **/register** (patient or doctor). Doctors need admin approval.
- Login via **/login** – a HttpOnly `token` cookie is set.
- The frontend `AuthContext` automatically calls `/api/auth/me` to load the current user.
- Protected routes (`/patient/*`, `/doctor/*`, `/admin/*`) are guarded both on the client (React) and server (JWT middleware).

## Production Build (Optional)
### Frontend
```bash
npm run build   # creates ./dist
```
You can serve the static files with any web server (e.g., Nginx) or let Express serve them by adding:
```js
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html')));
```
### Backend
```bash
npm start   # runs `node server.js`
```
Make sure environment variables point to your production MongoDB and proper `CLIENT_URL`.

## Important Notes
- **Ports**: Backend runs on **5000**, frontend dev server on **5175** (as requested – we avoid 3000, 5173, 5174). Adjust `CLIENT_URL` in `.env` if you change the port.
- **File uploads**: Medical reports are stored under `uploads/` (created automatically). In production consider a cloud bucket (e.g., AWS S3).
- **Doctor approval**: Admin must PATCH `/api/admin/doctors/:id/approve` before a doctor can log in.
- **Security**: JWT secret must be strong; in production enable `secure` flag on cookies.

## License & Credits
This is a demo project created for the MediCare+ use case. Feel free to extend, refactor, or integrate with additional services (email, SMS, tele‑health, etc.).
