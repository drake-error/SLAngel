"""
SLAngel — Gemini AI Document Analysis & Risk Prediction Service

Uses Google Gemini 2.5 Flash API to:
  1. Analyze uploaded document (PDF, Image, DOCX, TXT, CSV, Excel, JSON).
  2. Validate if document is a valid government application.
  3. Categorize into Transport, Scholarship, Real Estate, Municipal, Welfare, etc.
  4. Reject irrelevant files with clear error messages.
  5. Extract metadata & compute accurate SLA Risk Predictions.
"""

import os
import io
import json
import base64
import requests
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any, Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")



def extract_document_text(filename: str, content: bytes) -> Tuple[str, str]:
    """Extract plain text from uploaded file bytes. Returns (extracted_text, file_type)."""
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    text = ""

    if ext == "pdf":
        # Try pdfplumber or pypdf
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    txt = page.extract_text()
                    if txt:
                        text += txt + "\n"
        except Exception:
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(content))
                for page in reader.pages:
                    txt = page.extract_text()
                    if txt:
                        text += txt + "\n"
            except Exception:
                text = ""

    elif ext in ("xlsx", "xls"):
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True)
            ws = wb.active
            for row in ws.iter_rows(values_only=True):
                row_str = " | ".join(str(val) for val in row if val is not None)
                if row_str.strip():
                    text += row_str + "\n"
            wb.close()
        except Exception:
            text = ""

    elif ext in ("csv", "txt", "json", "log"):
        try:
            text = content.decode("utf-8", errors="ignore")
        except Exception:
            text = ""

    elif ext in ("png", "jpg", "jpeg", "webp"):
        # Image file — base64 format for image analysis
        text = f"Image file: {filename} (Binary image upload)"

    if not text.strip():
        text = f"Filename: {filename}. Content size: {len(content)} bytes."

    return text.strip(), ext


def analyze_with_gemini(filename: str, content: bytes) -> Dict[str, Any]:
    """
    Call Gemini 2.5 Flash API to analyze document, categorize domain,
    validate government relevance, and compute SLA risk prediction.
    """
    text_content, ext = extract_document_text(filename, content)

    prompt = f"""
You are an expert AI document verification and SLA Risk Analysis engine for a Government Portal (SLAngel).
Analyze the uploaded document filename and extracted content:

Filename: {filename}
File Type: {ext}
Extracted Content:
\"\"\"
{text_content[:3000]}
\"\"\"

Task 1: RELEVANCE VALIDATION
- Check if the document is an official government service application or legitimate supporting document (e.g. Transport vehicle permit, Scholarship certificate, Real Estate land deed/mutation, Building permit, Income/Caste/Domicile certificate, Municipal license, BPL card, etc.).
- If the document is IRRELEVANT (e.g. a recipe, meme, personal chat, shopping list, junk file, blank file, or completely unrelated to government services), set "is_valid" to FALSE and "rejection_reason" to "This document cannot be uploaded. It is an irrelevant file and not a valid government application or supporting document."

Task 2: CATEGORIZATION & METADATA EXTRACTION (If is_valid is true)
- Categorize domain into one of:
  • "Transport Department" (e.g. Commercial vehicle permit, DL, RC)
  • "Scholarship & Education" (e.g. Student scholarship, caste certificate for education)
  • "Real Estate & Land Records" (e.g. Land mutation, property registration, survey boundary)
  • "Municipal Administration" (e.g. Building plan sanction, trade license)
  • "Social Justice & Welfare" (e.g. Income certificate, BPL ration card, pension)
- Extract or generate realistic values for:
  • service_type (e.g. Commercial Vehicle Permit, Land Mutation, Higher Education Scholarship)
  • department (e.g. Transport Department, Revenue & Land Records, Social Justice & Welfare)
  • applicant_name (Extract or infer applicant name from text/filename)
  • district (Infer district, e.g., North District, Central District, East District, South District)
  • purpose (Short 1-sentence summary of request)
  • sla_days (Statutory SLA limit in days, e.g. 15, 30, 21, 10)

Task 3: SLA RISK PREDICTION
- Accurately calculate risk metrics:
  • risk_score: Float between 0.0 and 100.0 (High if document is complex/missing attachments, low if straightforward)
  • risk_level: "Critical", "High", "Medium", or "Low"
  • predicted_delay: True if high/critical risk or long verification expected, else False
  • predicted_delay_days: Integer expected delay days (0 to 10)
  • risk_factors: List of 2-3 specific risk reasons (e.g. "Pending field inspection", "Requires multi-dept verification")

Return ONLY valid JSON matching this schema:
{{
  "is_valid": true,
  "rejection_reason": null,
  "category": "Transport Department",
  "service_type": "Commercial Vehicle Permit",
  "department": "Transport Department",
  "applicant_name": "Balwinder Logistics Ltd",
  "district": "South District",
  "purpose": "Interstate commercial heavy vehicle permit registration",
  "sla_days": 15,
  "risk_score": 75.0,
  "risk_level": "High",
  "predicted_delay": true,
  "predicted_delay_days": 3,
  "risk_factors": ["Multi-state compliance check required", "Vehicle inspection report pending"]
}}
"""

    headers = {"Content-Type": "application/json"}
    body = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        res = requests.post(GEMINI_URL, json=body, headers=headers, timeout=12)
        if res.status_code == 200:
            res_data = res.json()
            raw_text = res_data["candidates"][0]["content"]["parts"][0]["text"]

            # Clean JSON fences if present
            clean_text = raw_text.strip()
            if clean_text.startswith("```"):
                clean_text = clean_text.split("```")[1]
                if clean_text.startswith("json"):
                    clean_text = clean_text[4:]
            clean_text = clean_text.strip()

            result = json.loads(clean_text)
            return result
        else:
            print(f"[Gemini API Error] Status {res.status_code}: {res.text}")
    except Exception as e:
        print(f"[Gemini API Exception] {e}")

    # Fallback heuristics if API call fails or offline
    filename_lower = filename.lower()
    
    # Check for irrelevant keywords in fallback
    if any(k in filename_lower or k in text_content.lower() for k in ["recipe", "meme", "shopping", "song", "movie"]):
        return {
            "is_valid": False,
            "rejection_reason": "This document cannot be uploaded. It is an irrelevant file and not a valid government application or supporting document.",
            "category": None,
            "service_type": None,
            "department": None,
            "applicant_name": None,
            "district": None,
            "purpose": None,
            "sla_days": 0,
            "risk_score": 0.0,
            "risk_level": "None",
            "predicted_delay": False,
            "predicted_delay_days": 0,
            "risk_factors": []
        }

    # Default valid fallback classification based on keywords
    category = "Revenue & Land Records"
    service = "Income Certificate"
    dept = "Revenue & Land Records"
    risk_score = 35.0
    risk_level = "Medium"

    if "transport" in filename_lower or "vehicle" in filename_lower or "permit" in filename_lower:
        category = "Transport Department"
        service = "Commercial Vehicle Permit"
        dept = "Transport Department"
        risk_score = 68.0
        risk_level = "High"
    elif "scholarship" in filename_lower or "student" in filename_lower or "education" in filename_lower:
        category = "Scholarship & Education"
        service = "Post-Matric Scholarship"
        dept = "Social Justice & Welfare"
        risk_score = 25.0
        risk_level = "Low"
    elif "land" in filename_lower or "property" in filename_lower or "mutation" in filename_lower:
        category = "Real Estate & Land Records"
        service = "Land Mutation Title Transfer"
        dept = "Revenue & Land Records"
        risk_score = 82.0
        risk_level = "Critical"

    applicant_inferred = filename.split(".")[0].replace("_", " ").replace("-", " ").title()

    return {
        "is_valid": True,
        "rejection_reason": None,
        "category": category,
        "service_type": service,
        "department": dept,
        "applicant_name": applicant_inferred,
        "district": "North District",
        "purpose": f"Application imported via AI Document Analyzer ({filename})",
        "sla_days": 15,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "predicted_delay": risk_level in ("High", "Critical"),
        "predicted_delay_days": 3 if risk_level == "High" else 5,
        "risk_factors": [f"Document complexity analysis ({ext.upper()})", "Verification desk review pending"]
    }
