import express from "express";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test data once
const callLogs = JSON.parse(
  readFileSync(join(__dirname, '../data/test-data/callLogs.json'), 'utf-8')
);
const smsData = JSON.parse(
  readFileSync(join(__dirname, '../data/test-data/smsData.json'), 'utf-8')
);
const locationData = JSON.parse(
  readFileSync(join(__dirname, '../data/test-data/locationData.json'), 'utf-8')
);
const installedApps = JSON.parse(
  readFileSync(join(__dirname, '../data/test-data/installedApps.json'), 'utf-8')
);

const generateApplicationId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `LFN${timestamp}${random}`.toUpperCase();
};

const calculateEMI = (principal, annualRate, tenureMonths) => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
               (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
};

// No auth middleware — open route
router.post("/apply-loan", async (req, res) => {
  try {
    const {
      loanAmount,
      tenure,
      loanType,
      emiStartDate,
      employmentType,
      companyName,
      designation,
      monthlyIncome,
      workExperienceYears,
      accountNumber,
      bankName,
      ifscCode
    } = req.body;

    // Validate required fields
    if (!loanAmount || !tenure || !employmentType || !monthlyIncome || !accountNumber || !bankName || !ifscCode) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    // Call ML service
    const mlServiceUrl = "http://localhost:5001/predict-score";

    let creditScore;
    try {
      const mlResponse = await fetch(mlServiceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callLogs,
          smsData,
          locationData,
          installedApps
        })
      });

      if (!mlResponse.ok) {
        throw new Error("ML service returned error");
      }

      const mlData = await mlResponse.json();
      creditScore = mlData.creditflowScore;
    } catch (mlError) {
      console.error("ML Service Error:", mlError.message);
      return res.status(500).json({
        error: "Failed to calculate credit score. Please try again."
      });
    }

    // Determine approval
    const isApproved = creditScore >= 60;
    const status = isApproved ? "APPROVED" : "DECLINED";

    // Calculate interest rate
    let interestRate;
    if (creditScore >= 80) interestRate = 10.5;
    else if (creditScore >= 70) interestRate = 11.5;
    else if (creditScore >= 60) interestRate = 12.5;
    else interestRate = 14.0;

    const approvedAmount = isApproved ? loanAmount : 0;
    const emi = isApproved ? calculateEMI(loanAmount, interestRate, tenure) : 0;

    const application = {
      applicationId: generateApplicationId(),
      loanType: loanType || "Personal",
      loanAmount,
      approvedAmount,
      interestRate,
      tenure,
      emi,
      emiStartDate: emiStartDate || null,
      status,
      creditScore,
      appliedAt: new Date(),
      processedAt: new Date()
    };

    // Return response — no DB save needed
    res.status(200).json({
      success: true,
      message: isApproved
        ? "Congratulations! Your loan has been approved."
        : "Sorry, your loan application has been declined.",
      application
    });

  } catch (error) {
    console.error("Apply Loan Error:", error);
    res.status(500).json({
      error: "Failed to process loan application. Please try again."
    });
  }
});

export default router;