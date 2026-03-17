# Implementation Plan: Medical Insight AI

## Overview

Incremental implementation starting with backend infrastructure, then the AI processing pipeline, then API routes, and finally the Next.js frontend. Each task builds on the previous and ends with all components wired together.

## Tasks

- [x] 1. Backend project setup and configuration
  - Create `backend/` directory structure: `app/`, `app/models/`, `app/routers/`, `app/services/`, `app/utils/`
  - Create `backend/requirements.txt` with: fastapi, uvicorn, sqlalchemy, python-jose[cryptography], python-multipart, pymupdf, pytesseract, pdf2image, Pillow, transformers, torch, reportlab, hypothesis
  - Create `app/config.py` with JWT secret, algorithm, token expiry, upload dir, and model name constants
  - Create `app/database.py` with SQLAlchemy engine, SessionLocal, Base, and `get_db` dependency
  - _Requirements: 6.1_

- [x] 2. Database model and schema
  - [x] 2.1 Create `app/models/report.py` with the `Report` SQLAlchemy ORM model
    - Fields: id (PK), filename, patient_summary, clinical_summary, overall_health_status, created_at
    - _Requirements: 6.2_
  - [ ]* 2.2 Write property test for Report model field completeness
    - **Property 2: Lab result structure completeness**
    - **Validates: Requirements 4.6**

- [x] 3. Authentication service and router
  - [x] 3.1 Create `app/services/auth_service.py`
    - Implement `create_access_token(username, role)` using python-jose
    - Implement `get_current_user(token)` dependency that decodes JWT and returns role
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 3.2 Create `app/routers/auth.py`
    - Implement `POST /auth/login` — accept `{"username": "..."}`, validate against `["doctor", "patient"]`, return token + role
    - Return 400 for any other username
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_
  - [ ]* 3.3 Write property test for JWT role round-trip
    - **Property 5: JWT role claim round-trip**
    - **Validates: Requirements 1.1, 1.2, 1.5**
  - [ ]* 3.4 Write property test for invalid username returns 400
    - **Property 9: Invalid username returns error**
    - **Validates: Requirements 1.3**

- [x] 4. Text extraction service
  - [x] 4.1 Create `app/services/text_extractor.py`
    - Implement `extract_from_pdf(file_path)` using PyMuPDF (`fitz`)
    - Implement `extract_from_image(file_path)` using pytesseract + pdf2image
    - Implement `extract_text(file_path, mime_type)` dispatcher that calls the correct extractor
    - Raise `HTTPException(422)` for unsupported file types
    - _Requirements: 2.2, 2.3, 2.4_
  - [ ]* 4.2 Write property test for text extraction non-emptiness
    - For any valid PDF or image file with text content, `extract_text` returns a non-empty string
    - **Validates: Requirements 2.2, 2.3**

- [x] 5. Deidentification service
  - [x] 5.1 Create `app/services/deidentifier.py`
    - Implement `deidentify(text)` using regex to strip phone number patterns and common name patterns
    - _Requirements: 2.5_
  - [ ]* 5.2 Write property test for PII removal
    - **Property 7: Deidentifier removes PII**
    - **Validates: Requirements 2.5**

- [x] 6. AI model loader and summarization service
  - [x] 6.1 Create `app/services/model_loader.py`
    - Load and cache `t5-small` tokenizer and model at module level (singleton pattern)
    - Expose `get_model()` and `get_tokenizer()` functions
    - _Requirements: 3.1_
  - [x] 6.2 Add summarization logic to `app/services/model_loader.py`
    - Implement `generate_patient_summary(text)` — prefix input with `"summarize for patient: "`
    - Implement `generate_clinical_summary(text)` — prefix input with `"clinical summary: "`
    - Both functions tokenize, run model inference, and decode output
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ]* 6.3 Write property test for both summaries non-empty
    - **Property 8: Upload pipeline produces both summaries**
    - **Validates: Requirements 2.6, 2.7, 3.4**

- [x] 7. Lab analyzer service
  - [x] 7.1 Create `app/services/lab_analyzer.py`
    - Define `NORMAL_RANGES` dict: Hemoglobin (12-16), WBC Count (4-11), Platelets (150-400), Blood Sugar (70-100), Cholesterol (0-200)
    - Implement `classify_value(value, low, high)` → returns `"Normal"`, `"Low"`, or `"High"`
    - Implement `analyze_labs(text)` — regex-scan text for each lab name + numeric value, return list of result dicts
    - Each result dict: `{"test": str, "value": float, "status": str, "normal_range": str}`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ]* 7.2 Write property test for lab classification correctness
    - **Property 1: Lab classification covers all values**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
  - [ ]* 7.3 Write property test for lab result structure completeness
    - **Property 2: Lab result structure completeness**
    - **Validates: Requirements 4.6**

- [x] 8. Health tips generator service
  - [x] 8.1 Create `app/services/health_tips.py`
    - Define `TIPS` dict mapping `(test_name, status)` → tip string
    - Include at minimum: `("Hemoglobin", "Low")` → iron-rich foods tip, `("Cholesterol", "High")` → reduce fatty foods tip
    - Implement `generate_tips(lab_results)` — iterate results, collect tips for Low/High statuses
    - Return list of tip strings; if all Normal, return `["All lab values are within normal ranges."]`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 8.2 Write property test for health tips coverage
    - **Property 3: Health tips non-empty for abnormal values**
    - **Validates: Requirements 5.1**
  - [ ]* 8.3 Write property test for all-normal tips response
    - **Property 4: Health tips absence for all-normal results**
    - **Validates: Requirements 5.4**

- [x] 9. Upload router and pipeline orchestration
  - [x] 9.1 Create `app/routers/upload.py`
    - Implement `POST /api/upload-report` accepting `UploadFile`
    - Save file to temp directory, detect MIME type
    - Call pipeline in order: `extract_text` → `deidentify` → `generate_patient_summary` + `generate_clinical_summary` → `analyze_labs` → `generate_tips`
    - Compute `overall_health_status`: "Normal" if all lab statuses Normal, "Attention Needed" if any Low/High, "Critical" if ≥3 abnormal
    - Persist `Report` record to DB
    - Return structured JSON response
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_
  - [ ]* 9.2 Write property test for upload pipeline response completeness
    - **Property 8: Upload pipeline produces both summaries**
    - **Validates: Requirements 2.6, 2.7, 3.4**

- [x] 10. Reports router and PDF generator
  - [x] 10.1 Create `app/routers/reports.py`
    - Implement `GET /api/reports` — query all Report records, return as list
    - Implement `POST /api/download-report` — accept `{"report_id": int}`, fetch report, call PDF_Generator, return `FileResponse`
    - Return 404 if report not found
    - _Requirements: 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_
  - [x] 10.2 Create `app/utils/pdf_generator.py`
    - Implement `generate_report_pdf(report_data, lab_results, health_tips)` using reportlab
    - PDF sections: Patient Summary, Clinical Summary, Lab Analysis Table (with status column), Health Status
    - Return PDF as bytes
    - _Requirements: 7.2, 7.3_
  - [ ]* 10.3 Write property test for report persistence round-trip
    - **Property 6: Report persistence after upload**
    - **Validates: Requirements 6.4, 6.5, 2.10**
  - [ ]* 10.4 Write property test for PDF generation produces valid output
    - **Property 10: PDF generation produces valid output**
    - **Validates: Requirements 7.2, 7.3**

- [x] 11. FastAPI app wiring and CORS
  - Create `app/main.py`
  - Register all routers: auth, upload, reports
  - Add CORS middleware allowing `http://localhost:3000`
  - Call `Base.metadata.create_all(bind=engine)` on startup to initialize DB tables
  - _Requirements: 2.1, 6.3, 7.1, 1.4_

- [x] 12. Checkpoint — backend complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify `uvicorn app.main:app --reload` starts without errors from `backend/` directory

- [x] 13. Frontend project setup
  - Create `frontend/` with Next.js 14 + TypeScript + TailwindCSS (`npx create-next-app@latest`)
  - Install dependencies: `axios` (or use native fetch)
  - Configure `tailwind.config.ts` and `globals.css`
  - Create `lib/api.ts` — centralized fetch wrapper that reads JWT from `localStorage` and attaches `Authorization: Bearer` header
  - Create `lib/auth.ts` — helpers: `getToken()`, `getRole()`, `logout()`
  - _Requirements: 10.3, 11.1, 11.2, 11.3, 11.4_

- [x] 14. Login page
  - [x] 14.1 Create `app/page.tsx` (Login Page)
    - Username input field and submit button
    - On submit: call `POST /auth/login`, store token + role in `localStorage`, redirect to `/dashboard/patient` or `/dashboard/doctor` based on role
    - Display error message on failed login
    - _Requirements: 10.1, 10.2, 1.1, 1.2_
  - [ ]* 14.2 Write unit test for login form
    - Test: submits correct payload, stores token, redirects by role
    - Test: displays error on 400 response
    - _Requirements: 10.1, 10.2_

- [x] 15. Shared UI components
  - [x] 15.1 Create `components/Sidebar.tsx`
    - Navigation links: Dashboard, Upload Report, My Reports, Health Trends
    - Highlight active route
    - Logout button that clears localStorage and redirects to login
    - _Requirements: 8.2, 9.2_
  - [x] 15.2 Create `components/LabTable.tsx`
    - Accepts `labResults` prop (array of `{test, value, status, normal_range}`)
    - Renders table with color-coded status badges: green = Normal, yellow = Low, red = High
    - _Requirements: 8.4, 9.3_
  - [x] 15.3 Create `components/ReportCard.tsx`
    - Displays report summary card: filename, overall_health_status, created_at
    - _Requirements: 8.3, 8.6_

- [x] 16. Patient dashboard
  - [x] 16.1 Create `app/dashboard/patient/page.tsx`
    - Redirect to login if no token in localStorage
    - Sidebar layout using `Sidebar` component
    - Summary cards section: total reports, latest health status, upload CTA
    - File upload form: accept PDF/image, call `POST /api/upload-report`, display results on success
    - Results section: patient summary text, `LabTable` component, health tips list, overall health status badge
    - Download button: call `POST /api/download-report`, trigger browser file download
    - Report history section: call `GET /api/reports`, render list of `ReportCard` components
    - Display user-friendly error messages on API failures
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 10.4, 11.2, 11.3, 11.4, 11.5_

- [x] 17. Doctor dashboard
  - [x] 17.1 Create `app/dashboard/doctor/page.tsx`
    - Redirect to login if no token in localStorage
    - Sidebar layout using `Sidebar` component
    - Call `GET /api/reports` on load, render report list
    - For each selected report: display clinical summary, `LabTable`, overall health status
    - _Requirements: 9.1, 9.2, 9.3, 11.4_

- [x] 18. Final checkpoint — full stack wired
  - Ensure all tests pass, ask the user if questions arise.
  - Verify frontend calls all 4 API endpoints with correct Authorization headers
  - Verify role-based routing: patient → patient dashboard, doctor → doctor dashboard
  - Verify `npm run dev` starts the frontend without errors from `frontend/` directory

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use **Hypothesis** (Python); run with `pytest` from `backend/`
- Frontend tests use **Jest** + **React Testing Library**; run with `npm test -- --watchAll=false` from `frontend/`
- Each property test must include the comment: `# Feature: medical-insight-ai, Property N: <property_text>`
- The T5 model download happens on first run; ensure internet access during initial startup
