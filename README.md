# CreditFlow – Alternative Credit Assessment System

CreditFlow is an AI-powered alternative credit assessment platform designed to improve financial inclusion by evaluating creditworthiness using behavioral financial data instead of traditional credit scores.

The system analyzes consent-based digital footprints such as SMS data, app usage, call logs, and transaction behavior to generate a risk score and lending decision.

---

## Problem Statement

Millions of individuals lack formal credit history and are excluded from traditional lending systems. Conventional credit scoring models rely heavily on past loan repayment behavior, preventing first-time borrowers from accessing formal credit.

CreditFlow addresses this challenge by evaluating real-world financial behavior patterns to determine creditworthiness.

---

## System Architecture

### Frontend
- React (Vite)
- React Router
- Custom CSS styling
- Session-based authentication
- API integration via Axios/fetch

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt password hashing

### Machine Learning
- Python
- scikit-learn
- Logistic Regression model
- Feature-based behavioral scoring

---

## Project Structure

```bash
anshuroy25-creditflow-ai-hack-matrix-/
│
├── README.md
│
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── render.yaml
│   ├── seed-demo-user.js
│   ├── .env.example
│   │
│   ├── config/
│   │   ├── config.js
│   │   └── db.js
│   │
│   ├── data/
│   │   └── test-data/
│   │       ├── callLogs.json
│   │       ├── installedApps.json
│   │       ├── locationData.json
│   │       └── smsData.json
│   │
│   ├── middleware/
│   │   └── verifytoken.js
│   │
│   ├── models/
│   │   └── user.js
│   │
│   ├── routes/
│   │   ├── apply-loan.js
│   │   ├── get-applications.js
│   │   ├── login.js
│   │   └── register.js
│   │
│   └── utils/
│       └── createtoken.js
│
├── frontend/
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── verce.json
│   ├── vite.config.js
│   ├── .env.example
│   │
│   └── src/
│       ├── App.jsx
│       ├── AppLayout.jsx
│       ├── main.jsx
│       ├── App.css
│       ├── index.css
│       │
│       ├── components/
│       │   ├── BottomTaskbar.jsx
│       │   ├── BottomTaskbar.css
│       │   ├── navbar.jsx
│       │   └── navbar.css
│       │
│       ├── config/
│       │   └── api.js
│       │
│       ├── Pages/
│       │   ├── Home.jsx
│       │   ├── Loginpage.jsx
│       │   ├── Registerpage.jsx
│       │   ├── LoanTypesPage.jsx
│       │   ├── PersonalLoanPage.jsx
│       │   ├── LoanAmountPage.jsx
│       │   ├── ContactDetailsPage.jsx
│       │   ├── EmploymentDetailsPage.jsx
│       │   ├── GrantPermissionsPage.jsx
│       │   ├── EMIStartDatePage.jsx
│       │   ├── ReviewApplicationPage.jsx
│       │   ├── ConfirmDetailsPage.jsx
│       │   ├── ProcessingPage.jsx
│       │   ├── ResultPage.jsx
│       │   └── page.jsx
│       │
│       ├── services/
│       │   └── keepAlive.js
│       │
│       └── styles/
│           ├── global.css
│           └── Home.css
│
├── Logistic-Regression/
│   ├── model_actual.py
│   └── test_model.py
│
└── test-data/
    ├── email.json
    └── sms.json
```

---

## Installation and Setup

### Prerequisites

- Node.js (v16+)
- MongoDB
- Python 3.8+
- npm

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Run the server:

```bash
node index.js
```

Optional: Seed demo user

```bash
node seed-demo-user.js
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` using `.env.example`:

```
VITE_BACKEND_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

---

## Machine Learning Model

```bash
cd Logistic-Regression
pip install pandas scikit-learn
python model_actual.py
```

The model evaluates behavioral features and outputs:

- Risk Score (0–100)
- CreditFlow Score
- Risk tier classification
- Lending decision

---

## API Routes

### Authentication
- POST `/login`
- POST `/register`

### Loan
- POST `/apply-loan`
- GET `/get-applications`

Protected routes require JWT token via `verifytoken.js`.

---

## Data Simulation

For demonstration, the system uses structured test datasets:

- SMS data
- Call logs
- Installed applications
- Location data
- Email data

These simulate real behavioral signals for scoring.

---

## Deployment

- Backend includes `render.yaml` for Render deployment.
- Frontend configured via `verce.json` for Vercel deployment.

---

## Limitations

- Uses simulated behavioral datasets
- No real device permission integration
- Basic scoring model (Logistic Regression)
- No real banking API integration

---

## Future Improvements

- Real mobile permission integration
- Advanced ensemble ML models
- Account Aggregator API integration
- Fraud detection system
- Multi-factor authentication
- Production-level security hardening

---

## License

This project is developed for hackathon and demonstration purposes. Not intended for production deployment without further compliance, security, and validation.