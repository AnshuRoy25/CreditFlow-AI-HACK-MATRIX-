import joblib
import pandas as pd

# Load the saved model and scaler
loaded_model = joblib.load('loan_model.pkl')
loaded_scaler = joblib.load('scaler.pkl')

new_data = pd.DataFrame({
    'annual_income': [30000],
    'cibil_score': [700],
    'educated': [0],
    'employment_length': [10],
    'dti_ratio': [0.3]
})

# Scale the new data using the loaded scaler
new_data_scaled = loaded_scaler.transform(new_data)
prediction = loaded_model.predict(new_data_scaled)
prediction_proba = loaded_model.predict_proba(new_data_scaled)[:, 1]

print(f"Predicted Loan Approval: {prediction[0]}")
print(f"Probability of Approval: {prediction_proba[0]}")