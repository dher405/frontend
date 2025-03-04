import { useState } from "react";

export default function ComplianceChecker() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ensureHttps = (inputUrl) => {
    if (!inputUrl.startsWith("http")) {
      return "https://" + inputUrl;
    }
    return inputUrl;
  };

  const handleCheckCompliance = async () => {
    if (!url) {
      setError("Please enter a valid website URL.");
      return;
    }

    const formattedUrl = ensureHttps(url);
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch(
        `https://tcr-api-bzn4.onrender.com/check_compliance?website_url=${encodeURIComponent(formattedUrl)}`
      );

      if (!response.ok) {
        throw new Error("Failed to retrieve compliance report.");
      }

      const data = await response.json();
      console.log("API Response:", data); // Debugging line

      setReport(data);
    } catch (err) {
      console.error("Fetch Error:", err); // Debugging line
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-center">TCR Website Compliance Checker</h1>
      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="p-2 border rounded w-80"
      />
      <button
        onClick={handleCheckCompliance}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Compliance"}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {report && (
        <div className="w-full max-w-2xl p-4 border rounded mt-4 bg-gray-100">
          <h2 className="text-lg font-semibold">Compliance Report</h2>

          {/* Privacy Policy Section */}
          <div className="mt-3 p-3 bg-white rounded shadow">
            <h3 className="text-md font-semibold">Privacy Policy Compliance</h3>
            <p>
              <strong>Status:</strong> {report.privacy_policy.found ? (
                <span className="text-green-600">✅ Found</span>
              ) : (
                <span className="text-red-600">❌ Not Found</span>
              )}
            </p>

            {/* Privacy Policy Compliance Details */}
            <div className="mt-2">
              <h4 className="font-semibold">Compliance Details:</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {report.privacy_policy.compliance_report}
              </p>
            </div>
          </div>

          {/* Terms & Conditions Section */}
          <div className="mt-3 p-3 bg-white rounded shadow">
            <h3 className="text-md font-semibold">Terms & Conditions Compliance</h3>
            <p>
              <strong>Status:</strong> {report.terms_conditions.found ? (
                <span className="text-green-600">✅ Found</span>
              ) : (
                <span className="text-red-600">❌ Not Found</span>
              )}
            </p>

            {/* Terms & Conditions Compliance Details */}
            <div className="mt-2">
              <h4 className="font-semibold">Compliance Details:</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {report.terms_conditions.compliance_report}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
