# QuickServe

A multi-provider slot-booking marketplace (salons, repair services, tutoring, fitness trainers) — a portfolio project demonstrating React Native, React.js, Node.js, and MongoDB.

## Structure

```
quickserve/
├── backend/          Node.js + Express + TypeScript API
├── web-provider/     React.js provider dashboard (not yet built)
├── mobile-customer/  React Native/Expo customer app (not yet built)
├── docs/             Project documentation
└── README.md
```

## Backend

See [backend/README.md](backend/README.md) (or the code under `backend/src`) to get the API running locally.

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev
```
