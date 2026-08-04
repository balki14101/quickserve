# QuickServe Backend

Node.js + Express + TypeScript API for QuickServe, backed by MongoDB/Mongoose.

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev             # ts-node-dev, restarts on change
```

Other scripts: `npm run build` (compile to `dist/`), `npm start` (run compiled output).

## Routes

| Method | Path                          | Auth               | Description                              |
|--------|-------------------------------|---------------------|-------------------------------------------|
| POST   | /auth/signup                  | none                | Create a user, returns JWT                |
| POST   | /auth/login                   | none                | Verify credentials, returns JWT           |
| GET    | /providers                    | none                | List providers, optional `?category=`     |
| GET    | /providers/:id                | none                | Provider profile + its services           |
| GET    | /providers/:id/availability   | none                | Open (unbooked) slots for a provider      |
| POST   | /provider/services            | provider            | Create a service                          |
| POST   | /provider/availability        | provider            | Add an availability slot                  |
| GET    | /provider/bookings            | provider            | List bookings for the logged-in provider  |
| POST   | /bookings                     | customer            | Book a slot (atomic, race-safe)           |
| GET    | /customer/bookings            | customer            | List the logged-in customer's bookings    |

Send `Authorization: Bearer <token>` on protected routes.

Note: `/provider/services` and `/provider/availability` look up the caller's `ProviderProfile` by `userId`. There is currently no endpoint to create a `ProviderProfile` — add one (e.g. `POST /provider/profile`) before wiring up the provider dashboard.
