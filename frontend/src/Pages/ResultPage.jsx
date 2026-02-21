import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, CheckCircle, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/navbar.jsx';

const ResultPage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [showFactors, setShowFactors] = useState(true);
  const [showImprovement, setShowImprovement] = useState(false);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('loanResult');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      navigate('/home');
    }
  }, [navigate]);

  const handleBackToHome = () => {
    sessionStorage.removeItem('loanFormData');
    sessionStorage.removeItem('loanResult');
    navigate('/home');
  };

  if (!result) return null;

  const isApproved = result.application?.status === 'APPROVED';
  const creditScore = result.application?.creditScore || 0;   // CreditFlow score (0–100)
  const riskScore   = result.application?.riskScore   || 0;   // raw model output
  const riskTier    = result.application?.riskTier    || 'Medium Risk';
  const loanAmount  = result.application?.loanAmount  || 0;
  const approvedAmount = result.application?.approvedAmount || 0;
  const interestRate   = result.application?.interestRate   || 0;
  const tenure = result.application?.tenure || 0;
  const emi    = result.application?.emi    || 0;
  const factors     = result.application?.factors     || { positives: [], negatives: [] };
  const improvement = result.application?.improvement || [];

  // Score gauge arc helpers
  const RADIUS = 54;
  const CIRC   = 2 * Math.PI * RADIUS;
  const scorePercent = creditScore / 100;
  const dashOffset   = CIRC * (1 - scorePercent * 0.75); // 75% arc

  const scoreColor =
    creditScore >= 70 ? '#27ae60' :
    creditScore >= 45 ? '#f39c12' : '#e74c3c';

  const tierColor =
    riskTier === 'Low Risk'    ? '#27ae60' :
    riskTier === 'Medium Risk' ? '#f39c12' : '#e74c3c';

  return (
    <div className="page">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { background: #1a1a1a; }

        .page {
          max-width: 480px; margin: 0 auto; background: #2a2a2a;
          border-radius: 20px; padding: 24px; min-height: 100vh;
          display: flex; flex-direction: column; border: 1px solid #3a3a3a;
          color: #e0e0e0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ── Status Banner ── */
        .status-banner {
          border-radius: 14px; padding: 20px; text-align: center;
          margin-bottom: 20px; display: flex; flex-direction: column;
          align-items: center; gap: 8px;
        }
        .status-banner.approved { background: linear-gradient(135deg,#1a3a1a,#2a4a2a); border:1px solid #27ae60; }
        .status-banner.declined { background: linear-gradient(135deg,#3a1a1a,#4a2222); border:1px solid #e74c3c; }
        .status-banner h2 { font-size: 18px; font-weight: 700; margin-top: 6px; }
        .status-banner.approved h2 { color: #27ae60; }
        .status-banner.declined h2 { color: #e74c3c; }

        /* ── Score Gauge ── */
        .gauge-wrap { position: relative; width: 140px; height: 100px; margin: 0 auto 4px; }
        .gauge-svg { overflow: visible; }
        .gauge-track { fill: none; stroke: #333; stroke-width: 10; stroke-linecap: round; }
        .gauge-fill  { fill: none; stroke-width: 10; stroke-linecap: round;
          transition: stroke-dashoffset 1s ease; }
        .gauge-center {
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          text-align: center; line-height: 1.1;
        }
        .gauge-num  { font-size: 28px; font-weight: 800; }
        .gauge-max  { font-size: 11px; color: #777; }

        /* ── Score Row ── */
        .score-row {
          display: flex; justify-content: center; gap: 20px;
          margin-bottom: 16px;
        }
        .score-pill {
          background: #333; border-radius: 10px; padding: 8px 16px;
          text-align: center; border: 1px solid #444;
        }
        .score-pill .label { font-size: 10px; color: #777; margin-bottom: 2px; }
        .score-pill .value { font-size: 15px; font-weight: 700; }

        /* ── Section Card ── */
        .section-card {
          background: #333; border: 1px solid #444; border-radius: 12px;
          margin-bottom: 14px; overflow: hidden;
        }
        .section-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 16px; cursor: pointer; user-select: none;
        }
        .section-header h3 { font-size: 14px; font-weight: 700; color: #e0e0e0; }
        .section-body { padding: 0 16px 14px; }

        /* ── Loan Details ── */
        .detail-row {
          display: flex; justify-content: space-between;
          padding: 8px 0; border-bottom: 1px solid #3a3a3a; font-size: 13px;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-row span { color: #888; }
        .detail-row strong { color: #e0e0e0; }

        /* ── Factor Items ── */
        .factor-item {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 10px 0; border-bottom: 1px solid #3a3a3a;
        }
        .factor-item:last-child { border-bottom: none; }
        .factor-icon { margin-top: 1px; flex-shrink: 0; }
        .factor-label { font-size: 13px; font-weight: 600; color: #e0e0e0; margin-bottom: 2px; }
        .factor-detail { font-size: 12px; color: #888; line-height: 1.4; }

        .sub-heading {
          font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
          color: #666; text-transform: uppercase; margin: 10px 0 6px;
        }

        /* ── Improvement Tips ── */
        .tip-item {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 8px 0; border-bottom: 1px solid #3a3a3a; font-size: 13px;
        }
        .tip-item:last-child { border-bottom: none; }
        .tip-num {
          width: 20px; height: 20px; border-radius: 50%; background: #e74c3c;
          color: white; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .tip-text { color: #ccc; line-height: 1.5; }

        /* ── App ID ── */
        .app-id { text-align: center; color: #555; font-size: 11px; margin-bottom: 14px; }

        /* ── Home Button ── */
        .home-btn {
          width: 100%; padding: 14px; background: transparent;
          border: 2px solid #444; border-radius: 8px; color: #e0e0e0;
          font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 14px;
          margin-top: 6px;
        }
        .home-btn:hover { border-color: #e74c3c; background: #333; }

        @media (max-width: 480px) { .page { border-radius: 0; } }
      `}</style>

      <Navbar />

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#888', fontSize: '13px' }}>CFL · Result</p>
      </div>

      {/* Status Banner + Gauge */}
      <div className={`status-banner ${isApproved ? 'approved' : 'declined'}`}>
        {isApproved
          ? <CheckCircle size={40} color="#27ae60" />
          : <XCircle size={40} color="#e74c3c" />
        }
        <h2>{isApproved ? 'Loan Approved!' : 'Application Declined'}</h2>

        {/* Gauge */}
        <div className="gauge-wrap">
          <svg className="gauge-svg" width="140" height="90" viewBox="0 0 140 90">
            {/* track arc */}
            <path
              className="gauge-track"
              d="M 14 80 A 56 56 0 1 1 126 80"
              strokeDasharray={`${CIRC * 0.75} ${CIRC}`}
              strokeDashoffset="0"
            />
            {/* fill arc */}
            <path
              className="gauge-fill"
              stroke={scoreColor}
              d="M 14 80 A 56 56 0 1 1 126 80"
              strokeDasharray={`${CIRC * 0.75} ${CIRC}`}
              strokeDashoffset={`${CIRC * 0.75 * (1 - creditScore / 100)}`}
            />
          </svg>
          <div className="gauge-center">
            <div className="gauge-num" style={{ color: scoreColor }}>{creditScore}</div>
            <div className="gauge-max">/ 100</div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#888' }}>CreditFlow Score</p>
      </div>

      {/* Score Pills */}
      <div className="score-row">
        <div className="score-pill">
          <div className="label">RISK SCORE</div>
          <div className="value" style={{ color: tierColor }}>{riskScore} / 100</div>
        </div>
        <div className="score-pill">
          <div className="label">RISK TIER</div>
          <div className="value" style={{ color: tierColor }}>{riskTier}</div>
        </div>
        <div className="score-pill">
          <div className="label">DECISION</div>
          <div className="value" style={{ color: isApproved ? '#27ae60' : '#e74c3c' }}>
            {isApproved ? 'APPROVED' : 'DECLINED'}
          </div>
        </div>
      </div>

      {/* Application ID */}
      <div className="app-id">Application ID: {result.application?.applicationId}</div>

      {/* Loan Details */}
      <div className="section-card">
        <div className="section-header" onClick={() => {}}>
          <h3>📋 Loan Details</h3>
        </div>
        <div className="section-body">
          <div className="detail-row"><span>Requested Amount</span><strong>₹{loanAmount.toLocaleString('en-IN')}</strong></div>
          {isApproved && <>
            <div className="detail-row"><span>Approved Amount</span><strong>₹{approvedAmount.toLocaleString('en-IN')}</strong></div>
            <div className="detail-row"><span>Interest Rate</span><strong>{interestRate}% p.a.</strong></div>
            <div className="detail-row"><span>Tenure</span><strong>{tenure} months</strong></div>
            <div className="detail-row"><span>Monthly EMI</span><strong>₹{emi.toLocaleString('en-IN')}</strong></div>
          </>}
          {!isApproved && <div className="detail-row"><span>Status</span><strong style={{color:'#e74c3c'}}>Declined — Score below threshold (60)</strong></div>}
        </div>
      </div>

      {/* Explainable Factors */}
      <div className="section-card">
        <div className="section-header" onClick={() => setShowFactors(v => !v)}>
          <h3>🔍 Why this score?</h3>
          {showFactors ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
        </div>
        {showFactors && (
          <div className="section-body">
            <div className="sub-heading">✅ Working in your favour</div>
            {factors.positives.map((f, i) => (
              <div className="factor-item" key={i}>
                <div className="factor-icon"><TrendingUp size={16} color="#27ae60" /></div>
                <div>
                  <div className="factor-label">{f.label}</div>
                  <div className="factor-detail">{f.detail}</div>
                </div>
              </div>
            ))}

            <div className="sub-heading" style={{ marginTop: '14px' }}>⚠️ Hurting your score</div>
            {factors.negatives.map((f, i) => (
              <div className="factor-item" key={i}>
                <div className="factor-icon"><TrendingDown size={16} color="#e74c3c" /></div>
                <div>
                  <div className="factor-label">{f.label}</div>
                  <div className="factor-detail">{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Improvement Tips */}
      <div className="section-card">
        <div className="section-header" onClick={() => setShowImprovement(v => !v)}>
          <h3>🚀 How to improve?</h3>
          {showImprovement ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
        </div>
        {showImprovement && (
          <div className="section-body">
            {improvement.map((tip, i) => (
              <div className="tip-item" key={i}>
                <div className="tip-num">{i + 1}</div>
                <div className="tip-text">{tip}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="home-btn" onClick={handleBackToHome}>BACK TO HOME</button>
    </div>
  );
};

export default ResultPage;