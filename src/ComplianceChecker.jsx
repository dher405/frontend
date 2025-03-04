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
      setComplianceData(data);
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

          <div className="report-section">
            <h3>📜 Privacy Policy</h3>
            <p>
              <strong>Status:</strong>{" "}
              {complianceData.privacy_policy.found ? (
                <span className="badge success">✅ Found</span>
              ) : (
                <span className="badge fail">❌ Not Found</span>
              )}
            </p>
            <p><strong>Assessment:</strong> {complianceData.privacy_policy.assessment}</p>
          </div>

          <div className="report-section">
            <h3>📄 Terms & Conditions</h3>
            <p>
              <strong>Status:</strong>{" "}
              {complianceData.terms_conditions.found ? (
                <span className="badge success">✅ Found</span>
              ) : (
                <span className="badge fail">❌ Not Found</span>
              )}
            </p>
            <p><strong>Assessment:</strong> {complianceData.terms_conditions.assessment}</p>
          </div>

          <div className="report-section">
            <h3>🔎 Summary of Compliance</h3>
            <p>{complianceData.summary_of_compliance}</p>
          </div>
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
        .badge {
          padding: 5px 10px;
          border-radius: 5px;
          font-weight: bold;
        }
        .success {
          background: #28a745;
          color: white;
        }
        .fail {
          background: #dc3545;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ComplianceChecker;


