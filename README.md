# RakhtSetu 🩸❤️

RakhtSetu is a blood donation & emergency blood request web application. Users can sign up/login, trigger SOS alerts for urgent blood needs 🚨, and donors/hospitals can manage requests and blood inventory 🏥.


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


## Deployment Notes

For live deployment, ensure:

- Backend is hosted and accessible publicly
- Frontend is built and served
- CORS is configured properly
- Set `JWT_SECRET` in your backend hosting environment

---

Made with love ❤️ by **Bhavika**.


