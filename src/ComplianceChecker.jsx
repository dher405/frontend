import React, { useState } from "react";

const ComplianceChecker = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkCompliance = async () => {
    setLoading(true);
    setError("");
    setComplianceData(null);

    try {
      const response = await fetch(
        `https://tcr-api-bzn4.onrender.com/check_compliance?website_url=${encodeURIComponent(websiteUrl)}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setComplianceData(data.complianceAnalysis); // ✅ Extract the correct key
    } catch (err) {
      setError("Failed to check compliance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>TCR Compliance Checker</h1>
      <input
        type="text"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        placeholder="Enter website URL"
      />
      <button onClick={checkCompliance} disabled={loading}>
        {loading ? "Checking..." : "Check Compliance"}
      </button>

      {error && <p className="error">{error}</p>}

      {complianceData && (
        <div className="results">
          <h2>Compliance Report</h2>

          {/* ✅ Check if privacyPolicy exists before accessing */}
          {complianceData.privacyPolicy ? (
            <div className="report-section">
              <h3>📜 Privacy Policy</h3>
              <p><strong>SMS Consent Data Sharing:</strong> {complianceData.privacyPolicy.smsConsentDataSharing}</p>
              <p><strong>Data Collection & Usage:</strong> {complianceData.privacyPolicy.dataCollectionAndUsageExplanation}</p>
            </div>
          ) : (
            <p className="error">⚠️ Privacy policy data is missing.</p>
          )}

          {/* ✅ Check if termsAndConditions exists before accessing */}
          {complianceData.termsAndConditions ? (
            <div className="report-section">
              <h3>📄 Terms & Conditions</h3>
              <p><strong>Message Types:</strong> {complianceData.termsAndConditions.messageTypes}</p>
              <p><strong>Mandatory Disclosures:</strong> {complianceData.termsAndConditions.mandatoryDisclosures}</p>
            </div>
          ) : (
            <p className="error">⚠️ Terms & Conditions data is missing.</p>
          )}
        </div>
      )}

      <style>{`
        .container {
          text-align: center;
          max-width: 600px;
          margin: auto;
          padding: 20px;
        }
        input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        button {
          padding: 10px 15px;
          border: none;
          background: #007bff;
          color: white;
          cursor: pointer;
          border-radius: 5px;
        }
        button:disabled {
          background: #aaa;
          cursor: not-allowed;
        }
        .results {
          text-align: left;
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background: #f9f9f9;
        }
        .report-section {
          margin-bottom: 15px;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .error {
          color: #dc3545;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default ComplianceChecker;
