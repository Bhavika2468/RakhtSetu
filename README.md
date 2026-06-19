# RakhtSetu 🩸❤️

RakhtSetu is a blood donation & emergency blood request web application. Users can sign up/login, trigger **SOS alerts** for urgent blood needs 🚨, and donors/hospitals can manage requests and blood inventory 🏥.


## Features

- **Authentication**: Login/Signup + OTP verification + quick-access (demo guest flow)
- **SOS Emergency**: Send an SOS alert to notify matching available donors
- **Blood Requests**: Request blood for a specific blood group (matched to hospitals)
- **Donor Dashboard**: View donations, availability, and alerts
- **Hospital Dashboard**: Manage blood inventory and incoming requests
- **Alerts & SOS History**

## Local Setup

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on **http://localhost:5000**.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**.

> Vite is configured to proxy `/api` to `http://localhost:5000`.

## Authentication (No API Keys)

This project does **not** use any external API key.

Authentication is done via **JWT**:
- Frontend stores `token` in `localStorage` after login
- Requests include header: `Authorization: Bearer <token>`

Your backend supports an optional env var:
- `JWT_SECRET` (if not set, it falls back to a default value in code)

## API

- `GET /api/health` (health check)

> Most other endpoints are under `/api/*` and require a valid JWT.

## Deployment Notes

For live deployment, ensure:

- Backend is hosted and accessible publicly
- Frontend is built and served
- CORS is configured properly
- Set `JWT_SECRET` in your backend hosting environment

## Demo Users (Seeded)

On startup the backend seeds demo users (if no data exists), including:

- `donor@demo.com`
- `user@demo.com`
- `hospital@demo.com`

Default password in seed: `password123`

---

Made with love ❤️ by **Bhavika**.


