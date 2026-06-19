# RakhtSetu 🩸

## 1. Overview ✨
RakhtSetu is a blood donation & emergency blood request platform. It helps receivers raise urgent SOS requests, notify matching available donors, and enables donors and hospitals to manage blood inventory and requests in one place.

## 2. Key Features ✨
- 🔐 **Authentication**: Login/Signup + OTP verification + quick-access (demo guest flow)
- 🚨 **SOS Emergency**: Trigger SOS alerts for urgent blood needs and notify matching donors
- 🩸 **Blood Requests**: Request blood for a specific blood group and route it to hospitals
- 🧑‍⚕️ **Donor Dashboard**: Track donations, availability, and alerts
- 🏥 **Hospital Dashboard**: Update blood inventory and manage incoming requests
- 🔔 **Alerts & SOS History**: Read alerts and view SOS request history

## 3. User Flow ✨
1) **User signs up / logs in** (or uses quick-access for demo)
2) **Receiver triggers SOS** with a blood group (and optional location)
3) Backend finds **matching donors** who are available for that blood group
4) Donors receive an **emergency alert** and can respond from their dashboard
5) User can also **request blood**; hospitals can **update inventory** to fulfill requests

## 4. Future Roadmap ✨
- 📍 Real geolocation + distance-based donor prioritization
- ✅ Donation/collection status workflow (accept/decline/confirm)
- 📱 Mobile-first refinements & performance improvements
- 💳 Verification steps for donor eligibility & scheduled eligibility reminders
- 🌐 Admin panel for analytics and hospital onboarding

## 5. Impact ✨
- Faster blood matching in emergencies
- Increased donor responsiveness through availability + alerts
- Better hospital inventory management to reduce shortage times

## Local Setup ✨

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

---

Made with ❤️ by **Bhavika**


