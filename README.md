# QuickServe

A multi-provider slot-booking marketplace for salons, repair services, tutors, and fitness trainers. Providers manage services and availability; customers browse and book open slots.

## Live demo

- Provider dashboard: https://web-provider-rmws.onrender.com
- API: https://quickserve-lrj2.onrender.com/health

The API runs on Render's free tier, so the first request after a period of inactivity can take up to a minute while it wakes up.

Demo provider login: `glow.salon@quickserve.demo` / `Passw0rd!123`

## Status

| App | Stack | Status |
|---|---|---|
| `backend` | Node.js, Express, TypeScript, MongoDB (Mongoose) | Done, deployed |
| `web-provider` | React, Vite, TypeScript, Redux Toolkit, Tailwind CSS | Done, deployed |
| `mobile-customer` | React Native (Expo) | In progress |

## Features

- JWT auth with separate customer and provider roles, enforced by middleware
- Atomic slot booking: a conditional `findOneAndUpdate` stops two customers booking the same slot, and the loser gets a `409`
- Booking lifecycle: customers cancel (the slot reopens), providers mark bookings complete
- Paginated list endpoints
- 40 Jest and Supertest tests against an in-memory MongoDB, including a concurrent double-booking test
- Seed script with demo data across four service categories

## Structure

```
quickserve/
├── backend/          REST API
├── web-provider/     Provider dashboard
├── mobile-customer/  Customer mobile app
└── docs/             Postman collection and decisions log
```

## Run locally

Backend (needs a MongoDB connection string):

```bash
cd backend
npm install
cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm run seed           # optional demo data
npm run dev
```

Web dashboard:

```bash
cd web-provider
npm install
cp .env.example .env   # VITE_API_URL points at the backend
npm run dev
```

Backend tests: `cd backend && npm test`

## Docs

- [Postman collection](docs/QuickServe.postman_collection.json) covering every endpoint
- [Decisions log](docs/decisions.md)
