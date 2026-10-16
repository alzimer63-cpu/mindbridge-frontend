# MindBridge — frontend + node-api

React UI + Express API (`server.js`), the patient/doctor-facing half of
MindBridge. This is one of four independently deployable pieces:

| Project | What |
|---|---|
| **this one** | React UI + Express/Firebase API (auth, Firestore, doctor approval) |
| `../mindbridge-admin` | Admin dashboard — separate deploy, same node-api |
| `../mindbridge-ml-services/clinical-api` | XGBoost clinical-data prediction |
| `../mindbridge-ml-services/mri-api` | ONNX CNN MRI classification |

## Local setup

```bash
npm install
cp .env.example .env   # fill in real Firebase creds, a random JWT_SECRET,
                        # and a real ADMIN_USERNAME/ADMIN_PASSWORD
npm run server          # Express API on :5000
npm run dev              # in a second terminal, Vite on :5173
```

Also needs `clinical-api` and `mri-api` running (see
`../mindbridge-ml-services/README.md`) for the screening flow to work end to
end, and `../mindbridge-admin` running (`npm run dev`, :5174) if you want to
use the admin dashboard — that one's optional for the patient/doctor flow.

### Seeding sample doctor accounts

```bash
npm run seed:doctors
```

Seeded doctors are pre-verified (so local testing isn't blocked by the
admin-approval gate below) — real doctor signups through the app always
start unverified.

## Doctor approval

New doctor registrations start with `verified: false` in Firestore and are
**invisible** to patients (excluded from `GET /api/doctors`) until an admin
approves them via the admin dashboard's Doctors tab
(`PUT /api/admin/doctors/:id/verify`). A doctor can still register and log
in while unverified — they just won't appear in any patient's
doctor-selection list, and their own dashboard shows a "pending approval"
notice.

**Migration note**: if you're pointing this at a Firestore project that
already has doctors created before this feature existed, they'll all show as
unverified (missing field = falsy) and disappear from patient-facing doctor
selection until approved once via the admin dashboard.

## Admin access

`POST /api/admin/login` is a single static account — not a Firestore user,
just `ADMIN_USERNAME` / `ADMIN_PASSWORD` environment variables on this
service. Change both before deploying anywhere real. See
`../mindbridge-admin/README.md` for the dashboard that uses it.

## Deploying

- **This project** (frontend + node-api) — deploy the two halves separately
  or together depending on your host. The Express API needs: real Firebase
  credentials, a strong random `JWT_SECRET` (must match both ML services'),
  `ADMIN_USERNAME`/`ADMIN_PASSWORD`, and `FRONTEND_URL` listing every origin
  that will call it — the main frontend's deployed URL **and** the admin
  panel's deployed URL, comma-separated.
- The React build needs `VITE_API_URL`, `VITE_CLINICAL_API_URL`, and
  `VITE_MRI_API_URL` set to each backend's deployed URL before running
  `npm run build` (Vite bakes these in at build time).
- See `../mindbridge-ml-services/README.md` and `../mindbridge-admin/README.md`
  for deploying those two pieces.

## Security notes

- `.env` holds real secrets here (Firebase key, JWT secret, admin password) —
  never commit it. `.env.example` has placeholders only.
- `JWT_SECRET` must be identical across this service, `clinical-api`, and
  `mri-api`.
