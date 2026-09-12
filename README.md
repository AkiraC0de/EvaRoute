### Backlogs

- Cron jobs: DB Cleaning

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git

---

## Backend Setup

```bash
git clone https://github.com/AkiraC0de/EvaRoute
cd EvaRoute
```

```bash
cd backend
npm install
```

Create a `.env` file in the **backend root directory**:

```env
PORT=3000
JWT_SECRET_KEY=
DATABASE_URL=
MAILER_EMAIL_USER=
MAILER_EMAIL_PASS=
```

---

### Generate Prisma Client

```bash
npx prisma generate
```

### Start the development server

```bash
npm run dev
```

The backend should now be running at:

```text
http://localhost:3000
```
