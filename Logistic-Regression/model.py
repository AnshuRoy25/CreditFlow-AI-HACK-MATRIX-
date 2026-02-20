
#importing necessary libraries
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.metrics import precision_score, recall_score, f1_score
import joblib

#loading dataset
df = pd.read_csv('data.csv')

#printing properties of the dataset
print("\nDataset shape:")
print(df.shape)

print("\nFirst 5 rows:")
print(df.head())

print("\nStatistical summary:")
print(df.describe())

# Separate Features and Target
X = df.drop(['loan_id', 'approved'], axis=1)  
y = df['approved']

print("\nFeatures:", list(X.columns))
print("Target:", y.name)

# Split into Training and Testing Sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


# Feature Scaling (Standardization)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

df_scaled = pd.DataFrame(X_train_scaled, columns=X.columns)

print("\nScaled Feature Summary:")
print(df_scaled.describe().round(6))

# Train Logistic Regression Model
model = LogisticRegression(random_state=42, max_iter=1000)
model.fit(X_train_scaled, y_train)

# Model Coefficients
print("\nModel Coefficients:")
print(f"Intercept: {model.intercept_[0]:.4f}")
for feature, coef in zip(X.columns, model.coef_[0]):
    print(f"  {feature:20s}: {coef:+.4f}")

# Make Predictions
y_pred = model.predict(X_test_scaled)
y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]    

# Evaluate Model
train_accuracy = model.score(X_train_scaled, y_train)
test_accuracy = model.score(X_test_scaled, y_test)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\nModel Performance:")
print(f"Training Accuracy: {train_accuracy:.2%}")
print(f"Testing Accuracy:  {test_accuracy:.2%}")
print(f"Precision:         {precision:.2%}")
print(f"Recall:            {recall:.2%}")
print(f"F1-Score:          {f1:.2%}")

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
print("\nConfusion Matrix:")
print(cm)

# Classification Report
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Rejected', 'Approved']))

# Visualisation

# Feature Importance DataFrame
feature_importance = pd.DataFrame({
    'Feature': X.columns,
    'Coefficient': model.coef_[0]
})
feature_importance['Abs_Coefficient'] = feature_importance['Coefficient'].abs()
feature_importance = feature_importance.sort_values('Abs_Coefficient', ascending=False)

# Probability DataFrame
prob_df = pd.DataFrame({
    'Probability': y_pred_proba,
    'Actual': ['Approved' if x == 1 else 'Rejected' for x in y_test]
})

# Create 2x2 subplot grid
fig, axes = plt.subplots(2, 2, figsize=(20, 14))

# ========== TOP LEFT: Confusion Matrix ==========
sns.heatmap(cm, annot=True, fmt='d', cmap='Reds', 
            xticklabels=['Rejected', 'Approved'],
            yticklabels=['Rejected', 'Approved'],
            cbar_kws={'label': 'Count'},
            ax=axes[0, 0])
axes[0, 0].set_xlabel('Predicted Label', fontsize=11)
axes[0, 0].set_ylabel('True Label', fontsize=11)
axes[0, 0].set_title('Confusion Matrix', fontsize=12, fontweight='bold')

# ========== TOP RIGHT: Feature Importance ==========
colors = ['red' if x < 0 else 'green' for x in feature_importance['Coefficient']]
sns.barplot(data=feature_importance, y='Feature', x='Coefficient', 
            palette=colors, hue='Feature', legend=False,
            ax=axes[0, 1])
axes[0, 1].axvline(x=0, color='black', linestyle='--', linewidth=2)
axes[0, 1].set_xlabel('Coefficient Value', fontsize=11)
axes[0, 1].set_ylabel('Features', fontsize=11)
axes[0, 1].set_title('Feature Importance', fontsize=12, fontweight='bold')
axes[0, 1].grid(axis='x', alpha=0.3)

# ========== BOTTOM LEFT: Probability Distribution ==========
sns.histplot(data=prob_df, x='Probability', hue='Actual', 
             bins=30, palette={'Rejected': 'red', 'Approved': 'green'}, 
             alpha=0.6, edgecolor='black',
             ax=axes[1, 0])
axes[1, 0].axvline(x=0.5, color='blue', linestyle='--', linewidth=2, label='Threshold (0.5)')
axes[1, 0].set_xlabel('Predicted Probability of Approval', fontsize=11)
axes[1, 0].set_ylabel('Frequency', fontsize=11)
axes[1, 0].set_title('Distribution of Predicted Probabilities', fontsize=12, fontweight='bold')
axes[1, 0].legend(fontsize=10)
axes[1, 0].grid(alpha=0.3)

# ========== BOTTOM RIGHT: Scatter Plot ==========
sns.scatterplot(data=df, x='annual_income', y='cibil_score', 
                hue='approved',
                palette={0: 'red', 1: 'green'},
                s=80, alpha=0.6, edgecolor='black', linewidth=0.5,
                ax=axes[1, 1])
axes[1, 1].set_xlabel('Annual Income', fontsize=11)
axes[1, 1].set_ylabel('CIBIL Score', fontsize=11)
axes[1, 1].set_title('CIBIL Score vs Annual Income', fontsize=12, fontweight='bold')
axes[1, 1].legend(title='', labels=['Approved', 'Rejected'], fontsize=10)
axes[1, 1].grid(alpha=0.3)

# Main title
fig.suptitle('Loan Approval Model - Performance Dashboard', 
             fontsize=16, fontweight='bold', y=0.98)

# Proper spacing
plt.subplots_adjust(left=0.08, right=0.95, top=0.93, bottom=0.05, hspace=0.4, wspace=0.3)

plt.show()


demo_user = pd.DataFrame({
    'annual_income': [75000],
    'cibil_score': [700],
    'educated': [1],
    'employment_length': [5],
    'dti_ratio': [0.5],
})

demo_user_scaled = scaler.transform(demo_user)
demo_prediction_proba = model.predict_proba(demo_user_scaled)[:, 1][0]
print(f"\nPredicted Probability of Loan Approval for Demo User: {demo_prediction_proba:.2%}")
