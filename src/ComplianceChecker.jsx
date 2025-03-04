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
    
