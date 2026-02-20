import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.metrics import precision_score, recall_score, f1_score

# ── Load Dataset ───────────────────────────────────────────────
df = pd.read_csv('test_features.csv')

print("Dataset shape:", df.shape)
print("\nFirst 5 rows:")
print(df.head())
print("\nStatistical summary:")
print(df.describe())

# ── Features & Target ──────────────────────────────────────────
FEATURES = [
    'avg_monthly_income', 'avg_monthly_surplus', 'salary_count_6m',
    'on_time_bill_ratio', 'avg_payment_delay_days', 'emi_bounce_ratio',
    'card_min_due_ratio', 'fee_events_6m', 'low_balance_days_6m',
    'has_active_loan', 'has_credit_card', 'monthly_emi_burden_ratio',
    'spend_variability', 'months_negative_surplus',
    'sms_quality', 'email_quality', 'bank_quality'
]

X = df[FEATURES]
y = df['loan_approved']

print("\nFeatures:", list(X.columns))
print("Target  :", y.name)

# ── Train / Test Split (80:20) ─────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── Scale ──────────────────────────────────────────────────────
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

# ── Train Model ────────────────────────────────────────────────
model = LogisticRegression(random_state=42, max_iter=1000)
model.fit(X_train_scaled, y_train)

# ── Coefficients ───────────────────────────────────────────────
print("\nModel Coefficients:")
print(f"Intercept: {model.intercept_[0]:.4f}")
for feature, coef in zip(FEATURES, model.coef_[0]):
    print(f"  {feature:<30s}: {coef:+.4f}")

# ── Predictions ────────────────────────────────────────────────
y_pred       = model.predict(X_test_scaled)
y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

# ── Metrics ────────────────────────────────────────────────────
train_accuracy = model.score(X_train_scaled, y_train)
test_accuracy  = model.score(X_test_scaled,  y_test)
precision      = precision_score(y_test, y_pred)
recall         = recall_score(y_test, y_pred)
f1             = f1_score(y_test, y_pred)

print("\nModel Performance:")
print(f"Training Accuracy : {train_accuracy:.2%}")
print(f"Testing Accuracy  : {test_accuracy:.2%}")
print(f"Precision         : {precision:.2%}")
print(f"Recall            : {recall:.2%}")
print(f"F1-Score          : {f1:.2%}")

cm = confusion_matrix(y_test, y_pred)
print("\nConfusion Matrix:")
print(cm)

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Rejected', 'Approved']))

# ── Visualisation ──────────────────────────────────────────────


# ── Demo User ──────────────────────────────────────────────────
demo_user = pd.DataFrame({
    'avg_monthly_income':       [46000],   # decent income — gig/freelance worker
    'avg_monthly_surplus':      [8500],    # positive buffer — not saving much but surviving
    'salary_count_6m':          [3],       # salary only 3 of 6 months — irregular income
    'on_time_bill_ratio':       [0.55],    # pays about half on time — inconsistent
    'avg_payment_delay_days':   [12.0],    # pays late fairly often
    'emi_bounce_ratio':         [0.28],    # bounced a few EMIs — some financial stress
    'card_min_due_ratio':       [0.33],    # often pays only the minimum due
    'fee_events_6m':            [6],       # several bank penalty events
    'low_balance_days_6m':      [14],      # balance dips frequently
    'has_active_loan':          [0],       # no active loan — not over-leveraged
    'has_credit_card':          [1],       # has a card — some credit experience
    'monthly_emi_burden_ratio': [0.30],    # 30% income on EMIs — moderate
    'spend_variability':        [17000],   # spending varies a lot month to month
    'months_negative_surplus':  [3],       # overspent in 3 of 6 months
    'sms_quality':              [0.76],
    'email_quality':            [0.60],
    'bank_quality':             [0.63],
})

demo_scaled   = scaler.transform(demo_user)
prob_default = model.predict_proba(demo_scaled)[:, 1][0]
prob_approval = 1 - prob_default
risk_score    = int(round((prob_default) * 100))

if risk_score >= 75:
    risk_tier = "Low Risk"
elif risk_score >= 40:
    risk_tier = "Medium Risk"
else:
    risk_tier = "High Risk"

print("\n=============================================")
print("        DEMO USER RISK REPORT")
print("=============================================")
print(f"  Probability of Approval : {prob_approval:.2%}")
print(f"  Probability of Default  : {prob_default:.2%}")
print(f"  CreditFlow Risk Score   : {risk_score} / 100")
print(f"  Risk Tier               : {risk_tier}")
print("=============================================")