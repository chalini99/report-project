"""Unit tests for the health_tips service."""

import pytest
from app.services.health_tips import TIPS, generate_tips


class TestTipsDict:
    def test_contains_all_required_entries(self):
        required = [
            ("Hemoglobin", "Low"),
            ("Hemoglobin", "High"),
            ("WBC Count", "Low"),
            ("WBC Count", "High"),
            ("Platelets", "Low"),
            ("Platelets", "High"),
            ("Blood Sugar", "Low"),
            ("Blood Sugar", "High"),
            ("Cholesterol", "Low"),
            ("Cholesterol", "High"),
        ]
        for key in required:
            assert key in TIPS, f"Missing tip for {key}"

    def test_hemoglobin_low_tip_mentions_iron(self):
        tip = TIPS[("Hemoglobin", "Low")]
        assert "iron" in tip.lower()

    def test_cholesterol_high_tip_mentions_fatty_foods(self):
        tip = TIPS[("Cholesterol", "High")]
        assert "fatty" in tip.lower()

    def test_all_tips_are_non_empty_strings(self):
        for key, tip in TIPS.items():
            assert isinstance(tip, str) and len(tip) > 0, f"Empty tip for {key}"


class TestGenerateTips:
    def test_empty_list_returns_all_normal_message(self):
        result = generate_tips([])
        assert result == ["All lab values are within normal ranges."]

    def test_all_normal_returns_all_normal_message(self):
        lab_results = [
            {"test": "Hemoglobin", "value": 14.0, "status": "Normal", "normal_range": "12-16"},
            {"test": "WBC Count", "value": 7.0, "status": "Normal", "normal_range": "4-11"},
        ]
        result = generate_tips(lab_results)
        assert result == ["All lab values are within normal ranges."]

    def test_low_hemoglobin_returns_iron_tip(self):
        lab_results = [
            {"test": "Hemoglobin", "value": 9.0, "status": "Low", "normal_range": "12-16"},
        ]
        result = generate_tips(lab_results)
        assert len(result) == 1
        assert "iron" in result[0].lower()

    def test_high_cholesterol_returns_fatty_foods_tip(self):
        lab_results = [
            {"test": "Cholesterol", "value": 250.0, "status": "High", "normal_range": "0-200"},
        ]
        result = generate_tips(lab_results)
        assert len(result) == 1
        assert "fatty" in result[0].lower()

    def test_multiple_abnormal_returns_multiple_tips(self):
        lab_results = [
            {"test": "Hemoglobin", "value": 9.0, "status": "Low", "normal_range": "12-16"},
            {"test": "Cholesterol", "value": 250.0, "status": "High", "normal_range": "0-200"},
        ]
        result = generate_tips(lab_results)
        assert len(result) == 2

    def test_mixed_normal_and_abnormal_returns_only_abnormal_tips(self):
        lab_results = [
            {"test": "Hemoglobin", "value": 14.0, "status": "Normal", "normal_range": "12-16"},
            {"test": "WBC Count", "value": 15.0, "status": "High", "normal_range": "4-11"},
        ]
        result = generate_tips(lab_results)
        assert len(result) == 1
        assert "WBC" in result[0] or "infection" in result[0].lower()

    def test_unknown_test_name_with_abnormal_status_returns_no_tip(self):
        # Unknown test not in TIPS dict — no tip added, falls back to all-normal message
        lab_results = [
            {"test": "UnknownTest", "value": 999.0, "status": "High", "normal_range": "0-10"},
        ]
        result = generate_tips(lab_results)
        assert result == ["All lab values are within normal ranges."]

    def test_returns_list_of_strings(self):
        lab_results = [
            {"test": "Blood Sugar", "value": 50.0, "status": "Low", "normal_range": "70-100"},
        ]
        result = generate_tips(lab_results)
        assert isinstance(result, list)
        assert all(isinstance(tip, str) for tip in result)
