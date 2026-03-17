# Requirements Document

## Introduction

Medical Insight AI is a full-stack web application that helps patients and doctors understand medical lab reports using artificial intelligence. Patients can upload medical reports (PDF or image) and receive easy-to-understand explanations, health tips, and downloadable AI-generated summaries. Doctors receive clinical summaries and detailed lab analysis. The system uses a Next.js frontend, FastAPI backend, and HuggingFace T5 model for AI summarization.

## Glossary

- **System**: The Medical Insight AI application as a whole
- **Patient**: An end-user who uploads medical reports and receives simplified explanations
- **Doctor**: A privileged user who receives clinical-grade summaries and lab analysis
- **Report**: An uploaded medical lab report in PDF or image format
- **Lab_Analyzer**: The backend service that detects and classifies lab test values
- **Text_Extractor**: The backend service that extracts text from uploaded files using PyMuPDF or OCR
- **Deidentifier**: The backend service that removes personally identifiable information from extracted text
- **AI_Summarizer**: The backend service that uses the T5 model to generate summaries
- **Health_Tips_Generator**: The backend service that produces health recommendations based on abnormal lab values
- **Auth_Service**: The backend service that handles user authentication and JWT issuance
- **PDF_Generator**: The backend utility that produces downloadable AI-generated PDF reports
- **JWT**: JSON Web Token used for stateless authentication
- **Normal_Range**: The medically accepted reference interval for a given lab test

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user (patient or doctor), I want to log in with my username, so that I can access role-appropriate features of the application.

#### Acceptance Criteria

1. WHEN a user submits a login request with username `doctor`, THE Auth_Service SHALL assign the role `doctor` and return a signed JWT token.
2. WHEN a user submits a login request with username `patient`, THE Auth_Service SHALL assign the role `patient` and return a signed JWT token.
3. IF a login request is submitted with a username other than `doctor` or `patient`, THEN THE Auth_Service SHALL return a 400 error response with a descriptive message.
4. THE Auth_Service SHALL expose the authentication endpoint at `POST /auth/login`.
5. WHEN a JWT token is issued, THE Auth_Service SHALL include the user role as a claim within the token payload.
6. WHEN a request is made to a protected endpoint without a valid JWT token, THE System SHALL return a 401 Unauthorized response.

---

### Requirement 2: Medical Report Upload and Processing Pipeline

**User Story:** As a patient, I want to upload a medical lab report (PDF or image), so that the system can process it and return structured AI-generated insights.

#### Acceptance Criteria

1. THE System SHALL expose the upload endpoint at `POST /api/upload-report`.
2. WHEN a PDF file is uploaded, THE Text_Extractor SHALL extract text using PyMuPDF.
3. WHEN an image file is uploaded, THE Text_Extractor SHALL extract text using pytesseract OCR via pdf2image conversion.
4. IF an uploaded file is neither a valid PDF nor a supported image format, THEN THE System SHALL return a 422 error response with a descriptive message.
5. WHEN text is extracted from an uploaded file, THE Deidentifier SHALL remove personally identifiable information including patient names and phone numbers before further processing.
6. WHEN deidentified text is available, THE AI_Summarizer SHALL generate a patient-friendly summary using the `t5-small` HuggingFace model.
7. WHEN deidentified text is available, THE AI_Summarizer SHALL generate a clinical summary using medical terminology using the `t5-small` HuggingFace model.
8. WHEN summaries are generated, THE Lab_Analyzer SHALL detect and classify lab test values from the extracted text.
9. WHEN lab values are classified, THE Health_Tips_Generator SHALL generate health recommendations for each abnormal lab value.
10. WHEN all processing steps complete successfully, THE System SHALL persist the report record to the SQLite database.
11. WHEN all processing steps complete successfully, THE System SHALL return a structured JSON response containing patient summary, clinical summary, lab analysis, health tips, and overall health status.
12. THE System SHALL save the uploaded file to a temporary location before processing begins.

---

### Requirement 3: AI Summarization

**User Story:** As a user, I want AI-generated summaries of my lab report, so that I can understand the results in both plain language and clinical terms.

#### Acceptance Criteria

1. THE AI_Summarizer SHALL use the `t5-small` model from HuggingFace Transformers for all summarization tasks.
2. WHEN generating a patient summary, THE AI_Summarizer SHALL produce output in simple, non-technical language accessible to a general audience.
3. WHEN generating a clinical summary, THE AI_Summarizer SHALL produce output using standard medical terminology suitable for healthcare professionals.
4. THE AI_Summarizer SHALL generate both a patient summary and a clinical summary for every successfully processed report.

---

### Requirement 4: Lab Value Analysis

**User Story:** As a doctor or patient, I want the system to identify and classify lab test values, so that I can quickly see which results are normal, low, or high.

#### Acceptance Criteria

1. THE Lab_Analyzer SHALL detect the following lab tests from extracted text: Hemoglobin, WBC Count, Platelets, Blood Sugar, Cholesterol.
2. WHEN a lab value is detected, THE Lab_Analyzer SHALL compare it against the predefined normal range for that test.
3. WHEN a lab value falls within the normal range, THE Lab_Analyzer SHALL classify it as `Normal`.
4. WHEN a lab value falls below the normal range, THE Lab_Analyzer SHALL classify it as `Low`.
5. WHEN a lab value exceeds the normal range, THE Lab_Analyzer SHALL classify it as `High`.
6. THE Lab_Analyzer SHALL return each detected lab result as a structured object containing: `test` (name), `value` (numeric), `status` (`Normal`, `Low`, or `High`), and `normal_range` (string).

---

### Requirement 5: Health Tips Generation

**User Story:** As a patient, I want to receive actionable health tips based on my abnormal lab results, so that I can take steps to improve my health.

#### Acceptance Criteria

1. WHEN a lab value is classified as `Low` or `High`, THE Health_Tips_Generator SHALL produce at least one health recommendation for that result.
2. WHEN Hemoglobin is classified as `Low`, THE Health_Tips_Generator SHALL recommend increasing consumption of iron-rich foods.
3. WHEN Cholesterol is classified as `High`, THE Health_Tips_Generator SHALL recommend reducing consumption of fatty foods.
4. WHEN all lab values are classified as `Normal`, THE Health_Tips_Generator SHALL return a message indicating no abnormal values were detected.
5. THE Health_Tips_Generator SHALL return health tips as a list of human-readable strings.

---

### Requirement 6: Report Persistence and History

**User Story:** As a user, I want my processed reports to be saved, so that I can review them later.

#### Acceptance Criteria

1. THE System SHALL use SQLite as the database engine via SQLAlchemy ORM.
2. THE System SHALL store each processed report with the following fields: `id`, `filename`, `patient_summary`, `clinical_summary`, `overall_health_status`.
3. THE System SHALL expose the report history endpoint at `GET /api/reports`.
4. WHEN a request is made to `GET /api/reports`, THE System SHALL return a list of all stored report records.
5. WHEN a report is successfully processed and all pipeline steps complete, THE System SHALL persist the report record before returning the response.

---

### Requirement 7: Downloadable AI Report (PDF)

**User Story:** As a patient or doctor, I want to download a PDF version of the AI-generated report, so that I can share or archive the results.

#### Acceptance Criteria

1. THE System SHALL expose the download endpoint at `POST /api/download-report`.
2. WHEN a download request is received, THE PDF_Generator SHALL produce a PDF document containing: Patient Summary, Clinical Summary, Lab Analysis Table, and Health Status.
3. WHEN the PDF is generated, THE System SHALL return it as a downloadable file response with the appropriate `Content-Type` header.
4. IF the referenced report data is not found or invalid, THEN THE System SHALL return a 404 error response.

---

### Requirement 8: Patient Dashboard

**User Story:** As a patient, I want a dedicated dashboard, so that I can upload reports, view results, and manage my health history.

#### Acceptance Criteria

1. THE System SHALL provide a patient dashboard accessible after login with the `patient` role.
2. WHEN a patient logs in, THE System SHALL display a sidebar with navigation items: Dashboard, Upload Report, My Reports, Health Trends.
3. THE Patient_Dashboard SHALL display a summary section showing: recent reports, health alerts, an upload button, and summary cards.
4. WHEN a report is processed, THE Patient_Dashboard SHALL display: Patient Summary, Lab Analysis Table, Health Status, and Health Tips.
5. THE Patient_Dashboard SHALL provide a button to download the AI-generated PDF report.
6. THE Patient_Dashboard SHALL display a list of previously uploaded reports.

---

### Requirement 9: Doctor Dashboard

**User Story:** As a doctor, I want a dedicated dashboard, so that I can review clinical summaries and detailed lab analysis for patients.

#### Acceptance Criteria

1. THE System SHALL provide a doctor dashboard accessible after login with the `doctor` role.
2. WHEN a doctor logs in, THE System SHALL display a sidebar with navigation items: Dashboard, Upload Report, My Reports, Health Trends.
3. THE Doctor_Dashboard SHALL display: Clinical Summary, Lab Analysis, and Patient Health Status for each report.

---

### Requirement 10: Frontend Authentication Flow

**User Story:** As a user, I want the frontend to handle login and token storage, so that I can stay authenticated across page navigations.

#### Acceptance Criteria

1. THE Frontend SHALL provide a login page allowing the user to enter a username and submit credentials.
2. WHEN login is successful, THE Frontend SHALL store the JWT token in `localStorage`.
3. WHEN making requests to protected API endpoints, THE Frontend SHALL include the JWT token in the `Authorization` header using the `Bearer` scheme.
4. WHEN a stored JWT token is absent or invalid, THE Frontend SHALL redirect the user to the login page.

---

### Requirement 11: API Integration

**User Story:** As a developer, I want the frontend to communicate with all backend endpoints, so that the full application functions end-to-end.

#### Acceptance Criteria

1. THE Frontend SHALL connect to `POST /auth/login` for user authentication.
2. THE Frontend SHALL connect to `POST /api/upload-report` for report upload and processing.
3. THE Frontend SHALL connect to `POST /api/download-report` for PDF report download.
4. THE Frontend SHALL connect to `GET /api/reports` for fetching report history.
5. WHEN any API request fails, THE Frontend SHALL display a user-friendly error message to the user.
