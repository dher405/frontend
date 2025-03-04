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
      console.log("Sending request to API...");
      const response = await fetch(
        `https://tcr-api-bzn4.onrender.com/check_compliance?website_url=${encodeURIComponent(websiteUrl)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !data.compliance_analysis) {
        throw new Error("Invalid API response format.");
      }

      setComplianceData(data.compliance_analysis);
      console.log("API Response:", data);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Failed to check compliance: ${err.message}`);
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

          {/* ✅ Display Privacy Policy Data */}
          {complianceData.privacy_policy ? (
            <div className="report-section">
              <h3>📜 Privacy Policy</h3>
              <p><strong>SMS Consent Data Sharing:</strong> {complianceData.privacy_policy.sms_consent_data}</p>
              <p><strong>Data Collection & Usage:</strong> {complianceData.privacy_policy.data_collection_explanation}</p>
            </div>
          ) : (
            <p className="error">⚠️ Privacy policy data is missing.</p>
          )}

          {/* ✅ Display Terms & Conditions Data */}
          {complianceData.terms_conditions ? (
            <div className="report-section">
              <h3>📄 Terms & Conditions</h3>
              <p><strong>Message Types:</strong> {complianceData.terms_conditions.message_types}</p>
              <p><strong>Mandatory Disclosures:</strong> {complianceData.terms_conditions.mandatory_disclosures}</p>
            </div>
          ) : (
            <p className="error">⚠️ Terms & Conditions data is missing.</p>
          )}

          {/* ✅ Display Overall Compliance Summary */}
          {complianceData.overall_compliance ? (
            <div className="report-section">
              <h3>🔎 Overall Compliance Status</h3>
              <p><strong>Status:</strong> {complianceData.overall_compliance.status}</p>
              {complianceData.overall_compliance.recommendations?.length > 0 && (
                <>
                  <p><strong>Recommendations:</strong></p>
                  <ul>
                    {complianceData.overall_compliance.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <p className="error">⚠️ Compliance summary is missing.</p>
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
