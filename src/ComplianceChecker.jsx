import React, { useState } from "react";

const ComplianceChecker = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatUrl = (url) => {
    try {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      const urlObj = new URL(url);
      return urlObj.origin; // This ensures only the domain is retained
    } catch {
      return ""; // Return empty string if URL is invalid
    }
  };

  const checkCompliance = async () => {
    setLoading(true);
    setError("");
    setComplianceData(null);

    const formattedUrl = formatUrl(websiteUrl);
    if (!formattedUrl) {
      setError("Invalid URL. Please enter a valid website.");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending request to API with:", formattedUrl);
      const response = await fetch(
        `https://tcr-api-bzn4.onrender.com/check_compliance?website_url=${encodeURIComponent(
          formattedUrl
        )}`,
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
      console.log("API Response:", data);

      if (!data || !data.json || !data.json.compliance_analysis) {
        throw new Error("Invalid API response format.");
      }

      setComplianceData(data.json.compliance_analysis);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Failed to check compliance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>TCR Website Compliance Checker</h1>
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
              <strong>SMS Consent Statement:</strong> {" "}
              {complianceData.privacy_policy?.sms_consent_statement?.status === "found"
                ? complianceData.privacy_policy.sms_consent_statement.statement
                : "Not found"}
            </p>
            <p>
              <strong>Data Usage Explanation:</strong> {" "}
              {complianceData.privacy_policy?.data_usage_explanation?.status === "found"
                ? complianceData.privacy_policy.data_usage_explanation.statement
                : "Not found"}
            </p>
          </div>

          <div className="report-section">
            <h3>📄 Terms & Conditions</h3>
            <p>
              <strong>Message Types Specified:</strong> {" "}
              {complianceData.terms_conditions?.message_types_specified?.status === "found"
                ? complianceData.terms_conditions.message_types_specified.statement
                : "Not found"}
            </p>
            <p>
              <strong>Mandatory Disclosures:</strong> {" "}
              {complianceData.terms_conditions?.mandatory_disclosures?.status === "found"
                ? complianceData.terms_conditions.mandatory_disclosures.statement
                : "Not found"}
            </p>
          </div>

          <div className="report-section">
            <h3>🔎 Overall Compliance Status</h3>
            <p>
              <strong>Status:</strong> {complianceData.overall_compliance || "Unknown"}
            </p>
          </div>

          {complianceData.recommendations && complianceData.recommendations.length > 0 && (
            <div className="report-section">
              <h3>💡 Recommendations</h3>
              <ul>
                {complianceData.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplianceChecker;
