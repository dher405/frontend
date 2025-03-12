import React, { useState } from "react";

const ComplianceChecker = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiUrl, setApiUrl] = useState("");

  const checkCompliance = async () => {
    setLoading(true);
    setError("");
    setComplianceData(null);

    try {
      // Extract domain using a regular expression
      const domainRegex = /^(https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/;
      const match = websiteUrl.match(domainRegex);
      const websiteDomain = match ? match[2] : null;

      if (!websiteDomain) {
        throw new Error("Invalid website URL format.");
      }

      const apiUrl = `https://tcr-api-bzn4.onrender.com/check_compliance?website_url=${encodeURIComponent(
        "https://" + websiteDomain
      )}`;

      setApiUrl(apiUrl);

      console.log("Sending request to API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
      });

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
      <h1>📋 TCR Website Compliance Checker</h1>
      <input
        type="text"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        placeholder="Enter website URL (e.g., https://example.com)"
      />
      <button onClick={checkCompliance} disabled={loading}>
        {loading ? "Checking..." : "Check Compliance"}
      </button>

      {error && <p className="error">{error}</p>}

      {complianceData && (
        <div className="results">
          <h2>✅ Compliance Report</h2>

          {/* Privacy Policy Section */}
          <div className="report-section">
            <h3>📜 Privacy Policy</h3>
            <p>
              <strong>SMS Consent Statement:</strong>{" "}
              {complianceData.privacy_policy?.sms_consent_statement?.status === "found" ? (
                <>
                  {complianceData.privacy_policy.sms_consent_statement.statement}{" "}
                  <a
                    href={complianceData.privacy_policy.sms_consent_statement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (Source)
                  </a>
                </>
              ) : (
                <>
                  ❌ Not found <br />
                  <strong>Detected:</strong>{" "}
                  {complianceData.privacy_policy?.sms_consent_statement?.detected_candidates?.join(
                    ", "
                  ) || "None"}{" "}
                  <br />
                  <strong>Reason:</strong>{" "}
                  {complianceData.privacy_policy?.sms_consent_statement?.rejection_reason || "N/A"}
                </>
              )}
            </p>

            <p>
              <strong>Data Usage Explanation:</strong>{" "}
              {complianceData.privacy_policy?.data_usage_explanation?.status === "found" ? (
                <>
                  {complianceData.privacy_policy.data_usage_explanation.statement}{" "}
                  <a
                    href={complianceData.privacy_policy.data_usage_explanation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (Source)
                  </a>
                </>
              ) : (
                <>
                  ❌ Not found <br />
                  <strong>Detected:</strong>{" "}
                  {complianceData.privacy_policy?.data_usage_explanation?.detected_candidates?.join(
                    ", "
                  ) || "None"}{" "}
                  <br />
                  <strong>Reason:</strong>{" "}
                  {complianceData.privacy_policy?.data_usage_explanation?.rejection_reason || "N/A"}
                </>
              )}
            </p>
          </div>

          {/* Terms & Conditions Section */}
          <div className="report-section">
            <h3>📄 Terms & Conditions</h3>
            <p>
              <strong>Message Types Specified:</strong>{" "}
              {complianceData.terms_conditions?.message_types_specified?.status === "found" ? (
                <>
                  {complianceData.terms_conditions.message_types_specified.statement}{" "}
                  <a
                    href={complianceData.terms_conditions.message_types_specified.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (Source)
                  </a>
                </>
              ) : (
                <>
                  ❌ Not found <br />
                  <strong>Detected:</strong>{" "}
                  {complianceData.terms_conditions?.message_types_specified?.detected_candidates?.join(
                    ", "
                  ) || "None"}{" "}
                  <br />
                  <strong>Reason:</strong>{" "}
                  {complianceData.terms_conditions?.message_types_specified?.rejection_reason || "N/A"}
                </>
              )}
            </p>

            <p>
              <strong>Mandatory Disclosures:</strong>{" "}
              {complianceData.terms_conditions?.mandatory_disclosures?.status === "found" ? (
                <>
                  {complianceData.terms_conditions.mandatory_disclosures.statement}{" "}
                  <a
                    href={complianceData.terms_conditions.mandatory_disclosures.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (Source)
                  </a>
                </>
              ) : (
                <>
                  ❌ Not found <br />
                  <strong>Detected:</strong>{" "}
                  {complianceData.terms_conditions?.mandatory_disclosures?.detected_candidates?.join(
                    ", "
                  ) || "None"}{" "}
                  <br />
                  <strong>Reason:</strong>{" "}
                  {complianceData.terms_conditions?.mandatory_disclosures?.rejection_reason || "N/A"}
                </>
              )}
            </p>
          </div>

          {/* Overall Compliance Status */}
          <div className="report-section">
            <h3>🔎 Overall Compliance Status</h3>
            <p>
              <strong>Status:</strong> {complianceData.overall_compliance || "Unknown"}
            </p>
          </div>

          {/* Recommendations Section */}
          {complianceData.recommendations &&
            complianceData.recommendations.length > 0 && (
              <div className="report-section">
                <h3>🛠 Recommendations</h3>
                <ul>
                  {complianceData.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      <style>{`
        .container {
          text-align: center;
          max-width: 700px;
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
