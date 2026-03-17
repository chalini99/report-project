import pytest
from app.services.deidentifier import deidentify


class TestPhoneNumberRedaction:
    def test_dashes_format(self):
        assert "[REDACTED]" in deidentify("Call 555-123-4567 for info.")
        assert "555-123-4567" not in deidentify("Call 555-123-4567 for info.")

    def test_parentheses_format(self):
        result = deidentify("Phone: (555) 123-4567")
        assert "[REDACTED]" in result
        assert "(555) 123-4567" not in result

    def test_country_code_format(self):
        result = deidentify("Contact +1-555-123-4567")
        assert "[REDACTED]" in result
        assert "+1-555-123-4567" not in result

    def test_ten_digit_no_separator(self):
        result = deidentify("Number: 5551234567")
        assert "[REDACTED]" in result
        assert "5551234567" not in result


class TestNameRedaction:
    def test_patient_label(self):
        result = deidentify("Patient: John Doe\nHemoglobin: 12.5")
        assert "[REDACTED]" in result
        assert "John Doe" not in result

    def test_name_label(self):
        result = deidentify("Name: Jane Smith")
        assert "[REDACTED]" in result
        assert "Jane Smith" not in result

    def test_case_insensitive(self):
        result = deidentify("PATIENT: Alice Brown")
        assert "[REDACTED]" in result
        assert "Alice Brown" not in result


class TestNoPIIUnchanged:
    def test_no_pii_text_unchanged(self):
        text = "Hemoglobin: 12.5 g/dL. WBC: 6.0."
        assert deidentify(text) == text

    def test_empty_string(self):
        assert deidentify("") == ""
