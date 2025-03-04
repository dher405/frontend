import os
import requests
from bs4 import BeautifulSoup
import openai
import re
import warnings
import json
from fastapi import FastAPI, HTTPException
from urllib.parse import urljoin, urlparse, unquote
from fastapi.middleware.cors import CORSMiddleware
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from concurrent.futures import ThreadPoolExecutor

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore", category=UserWarning)

# Load OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API key! Set OPENAI_API_KEY as an environment variable.")

client = openai.OpenAI(api_key=OPENAI_API_KEY)

# FastAPI setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend to call backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_https(url: str) -> str:
    """Ensure the URL starts with https://, adding it if necessary."""
    url = unquote(url)
    if not url.startswith("http"):
        return "https://" + url
    return url

def extract_text_from_url(url):
    """Extract text from a webpage using requests first, then fallback to Selenium if needed."""
    if not url:
        return ""

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, timeout=10, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        text = "\n".join(p.get_text() for p in soup.find_all(['p', 'li', 'span', 'div', 'body']))
        text = re.sub(r'\s+', ' ', text.strip())

        return text if text.strip() else "No content extracted."

    except requests.RequestException:
        return "Request failed."

@app.get("/check_compliance")
def check_compliance_endpoint(website_url: str):
    """Check if a website's Privacy Policy and Terms & Conditions comply with TCR SMS requirements using ChatGPT."""
    website_url = ensure_https(website_url)
    
    privacy_text = extract_text_from_url(website_url + "/privacy-policy")
    terms_text = extract_text_from_url(website_url + "/terms-of-service")

    compliance_results = check_tcr_compliance_with_chatgpt(privacy_text, terms_text)
    return compliance_results

def check_tcr_compliance_with_chatgpt(privacy_text, terms_text):
    """Use ChatGPT to check if the extracted policies meet TCR SMS compliance with enhanced accuracy."""

    compliance_prompt = f"""
    You are an expert in SMS compliance regulations. Your task is to analyze the given Privacy Policy and Terms & Conditions 
    from a website and determine if they comply with TCR SMS compliance requirements.

    **Privacy Policy Content:**
    {privacy_text[:4000]}

    **Terms and Conditions Content:**
    {terms_text[:4000]}

    **TCR SMS Compliance Standards:**
    - Privacy Policy must explicitly state that information obtained via SMS consent will not be shared with third parties.
    - Privacy Policy must explain how consumer information is collected, used, and shared.
    - Terms must describe the **types of messages users will receive**.
    - Terms must include required messaging disclosures.

    **Return the results in structured JSON format:**
    ```json
    {{
      "privacy_policy": {{
        "assessment": "Summary of privacy policy compliance, including missing elements."
      }},
      "terms_conditions": {{
        "assessment": "Summary of terms and conditions compliance, including missing elements."
      }},
      "summary_of_compliance": "Overall compliance status, requirements met, and key recommendations."
    }}
    ```
    """

    # Call OpenAI API for response
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": compliance_prompt}],
        max_tokens=1000
    )

    try:
        # Parse ChatGPT response into JSON
        chatgpt_response = response.choices[0].message.content.strip()
        parsed_response = json.loads(chatgpt_response)  # Convert string to dictionary

        return {
            "privacy_policy": {
                "text_length": len(privacy_text),
                "found": bool(privacy_text.strip()),
                "assessment": parsed_response.get("privacy_policy", {}).get("assessment", "No details available.")
            },
            "terms_conditions": {
                "text_length": len(terms_text),
                "found": bool(terms_text.strip()),
                "assessment": parsed_response.get("terms_conditions", {}).get("assessment", "No details available.")
            },
            "summary_of_compliance": parsed_response.get("summary_of_compliance", "No summary available.")
        }

    except json.JSONDecodeError:
        return {
            "error": "Failed to parse AI response. Check OpenAI output format.",
            "raw_response": response.choices[0].message.content.strip()
        }
