import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar.jsx';

// ─────────────────────────────────────────────
// DEMO RESULT — hardcoded from model_actual.py
// Demo user risk profile (gig worker, irregular income)
// prob_default ≈ 0.52  →  riskScore = 52  →  "Medium Risk"
// creditflowScore = 100 - 52 = 48  →  DECLINED (threshold: 60)
// ─────────────────────────────────────────────
const DEMO_RESULT = {
  success: false,
  message: "Sorry, your loan application has been declined.",
  application: {
    applicationId: "LFN" + Date.now().toString(36).toUpperCase(),
    loanType: "Personal",
    status: "DECLINED",
    creditScore: 52,          // creditflowScore = 100 - riskScore
    riskScore: 52,            // from model_actual.py demo user
    riskTier: "Medium Risk",  // 40 ≤ riskScore < 75
    approvedAmount: 0,
    interestRate: 14.0,
    // ── Explainable factors (hardcoded for demo) ──────────
    factors: {
      positives: [
        { label: "Active Credit Card", detail: "Shows credit experience and access to revolving credit" },
        { label: "No Active Loan", detail: "Not over-leveraged; manageable existing debt obligations" },
        { label: "Positive Monthly Surplus", detail: "₹8,500 average surplus indicates basic cash-flow stability" },
        { label: "Decent Monthly Income", detail: "₹46,000 avg income places you above minimum threshold" },
      ],
      negatives: [
        { label: "Irregular Salary Credits", detail: "Only 3 of 6 months showed salary — signals income instability" },
        { label: "High EMI Bounce Ratio", detail: "28% EMI bounces detected — lenders view this as high default risk" },
        { label: "Low On-Time Bill Ratio", detail: "Only 55% bills paid on time; consistent delays hurt creditworthiness" },
        { label: "Frequent Low Balance Days", detail: "14 low-balance days in 6 months indicates cash-flow stress" },
        { label: "Multiple Fee Events", detail: "6 penalty/fee events in 6 months signals poor account management" },
        { label: "Negative Surplus Months", detail: "Overspent in 3 of 6 months — repayment capacity is uncertain" },
      ],
    },
    improvement: [
      "Maintain salary credits for at least 5 consecutive months",
      "Reduce EMI bounces to zero over the next 3 months",
      "Pay all bills before due dates — set auto-pay where possible",
      "Keep a minimum buffer of ₹5,000 in your account at all times",
      "Avoid penalty/fee-triggering transactions",
    ],
  },
};

const ReviewApplicationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    pan: '',
    aadhaar: '',
    mobile: '',
    email: '',
    address: '',
    employmentType: '',
    bankAccount: '',
    bankName: '',
    ifsc: '',
    permissionsGranted: false,
    loanAmount: 20000,
    tenure: 6,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedData = sessionStorage.getItem('loanFormData');
    if (savedData) {
      setFormData((prev) => ({ ...prev, ...JSON.parse(savedData) }));
    }
  }, []);

  const calculateEMI = () => {
    const rate = 0.12;
    const principal = Number(formData.loanAmount);
    const months = Number(formData.tenure);
    if (!principal || !months) return 0;
    const monthlyRate = rate / 12;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const handleBack = () => navigate('/emi-start-date');

  const handleSubmit = async () => {
    setLoading(true);

    // Inject current form values into the demo result
    const result = {
      ...DEMO_RESULT,
      application: {
        ...DEMO_RESULT.application,
        applicationId: "LFN" + Date.now().toString(36).toUpperCase(),
        loanAmount: Number(formData.loanAmount),
        tenure: Number(formData.tenure),
        emi: calculateEMI(),
        emiStartDate: '2025-03-24',
      },
    };

    // Simulate a brief processing delay (feels real)
    await new Promise((r) => setTimeout(r, 600));

    sessionStorage.setItem('loanResult', JSON.stringify(result));
    setLoading(false);
    navigate('/processing', { state: { result } });
  };

  const emi = calculateEMI();

  return (
    <div className="page">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { background: #1a1a1a; }
        .page {
          max-width: 480px; margin: 0 auto; background: #2a2a2a;
          border-radius: 20px; padding: 24px; min-height: 100vh;
          display: flex; flex-direction: column; border: 1px solid #3a3a3a;
          color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .header-simple { margin-bottom: 24px; }
        .header-simple h3 { color: #888; font-size: 14px; margin-bottom: 8px; }
        .header-simple h2 { font-size: 20px; color: #ffffff; }
        .review-container { flex: 1; margin-bottom: 24px; overflow-y: auto; }
        .review-section {
          background: #333; border: 1px solid #444; border-radius: 12px;
          padding: 20px; margin-bottom: 16px;
        }
        .review-section h3 { color: #e74c3c; font-size: 16px; margin-bottom: 16px; font-weight: 600; }
        .review-item {
          display: flex; justify-content: space-between; padding: 8px 0;
          border-bottom: 1px solid #444; font-size: 14px;
        }
        .review-item:last-child { border-bottom: none; }
        .review-item span { color: #888; }
        .review-item strong { color: #e0e0e0; word-break: break-word; }
        .nav-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .primary-btn {
          width: 100%; padding: 14px; background: #e74c3c; border: none;
          border-radius: 8px; color: white; font-weight: 600; cursor: pointer;
          transition: all 0.3s; font-size: 14px;
        }
        .primary-btn:hover { background: #c0392b; }
        .primary-btn:disabled { background: #666; cursor: not-allowed; opacity: 0.6; }
        .secondary-btn {
          width: 100%; padding: 14px; background: transparent; border: 2px solid #444;
          border-radius: 8px; color: #e0e0e0; font-weight: 600; cursor: pointer;
          transition: all 0.3s; font-size: 14px;
        }
        .secondary-btn:hover { border-color: #e74c3c; background: #333; }
        @media (max-width: 480px) { .page { border-radius: 0; } .review-container { max-height: 60vh; } }
      `}</style>

      <Navbar />

      <div className="header-simple">
        <h3>CFL 7/7</h3>
        <h2>Review Application</h2>
      </div>

      <div className="review-container">
        <div className="review-section">
          <h3>Personal Details</h3>
          <div className="review-item"><span>Full Name:</span><strong>{formData.fullName || 'Not provided'}</strong></div>
          <div className="review-item"><span>DOB:</span><strong>{formData.dob || 'Not provided'}</strong></div>
          <div className="review-item"><span>Gender:</span><strong>{formData.gender || 'Not provided'}</strong></div>
          <div className="review-item"><span>PAN:</span><strong>{formData.pan || 'Not provided'}</strong></div>
          <div className="review-item"><span>Aadhaar:</span><strong>{formData.aadhaar || 'Not provided'}</strong></div>
        </div>

        <div className="review-section">
          <h3>Contact Details</h3>
          <div className="review-item"><span>Mobile:</span><strong>{formData.mobile || 'Not provided'}</strong></div>
          <div className="review-item"><span>Email:</span><strong>{formData.email || 'Not provided'}</strong></div>
          <div className="review-item"><span>Address:</span><strong>{formData.address || 'Not provided'}</strong></div>
        </div>

        <div className="review-section">
          <h3>Employment Details</h3>
          <div className="review-item"><span>Employment Type:</span><strong>{formData.employmentType || 'Not provided'}</strong></div>
          <div className="review-item"><span>Bank Account:</span><strong>{formData.bankAccount || 'Not provided'}</strong></div>
          <div className="review-item"><span>Bank Name:</span><strong>{formData.bankName || 'Not provided'}</strong></div>
          <div className="review-item"><span>IFSC Code:</span><strong>{formData.ifsc || 'Not provided'}</strong></div>
        </div>

        <div className="review-section">
          <h3>Loan Details</h3>
          <div className="review-item"><span>Loan Amount:</span><strong>₹{Number(formData.loanAmount).toLocaleString('en-IN')}</strong></div>
          <div className="review-item"><span>Tenure:</span><strong>{formData.tenure} months</strong></div>
          <div className="review-item"><span>Interest Rate:</span><strong>12% per annum</strong></div>
          <div className="review-item"><span>Monthly EMI:</span><strong>₹{emi.toLocaleString('en-IN')}</strong></div>
        </div>
      </div>

      <div className="nav-buttons">
        <button className="secondary-btn" onClick={handleBack} disabled={loading}>BACK</button>
        <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit & Analyze'}
        </button>
      </div>
    </div>
  );
};

export default ReviewApplicationPage;