"""
Health Tips Generator service.

Maps abnormal lab results to predefined health tip strings.
"""

from typing import List

TIPS: dict[tuple[str, str], str] = {
    ("Hemoglobin", "Low"): "Increase consumption of iron-rich foods such as spinach, lentils, and red meat.",
    ("Hemoglobin", "High"): "Consult your doctor about elevated hemoglobin levels.",
    ("WBC Count", "Low"): "Low WBC may indicate immune issues; consult your doctor.",
    ("WBC Count", "High"): "High WBC may indicate infection or inflammation; seek medical advice.",
    ("Platelets", "Low"): "Low platelets can affect clotting; avoid injury and consult your doctor.",
    ("Platelets", "High"): "High platelets may increase clotting risk; consult your doctor.",
    ("Blood Sugar", "Low"): "Eat regular meals and include complex carbohydrates to stabilize blood sugar.",
    ("Blood Sugar", "High"): "Reduce sugar intake, exercise regularly, and consult your doctor.",
    ("Cholesterol", "Low"): "Consult your doctor about low cholesterol levels.",
    ("Cholesterol", "High"): "Reduce consumption of fatty foods and increase physical activity.",
}


def generate_tips(lab_results: list[dict]) -> List[str]:
    """
    Generate health tips based on lab results.

    Iterates lab_results and collects tips for any result with status "Low" or "High".
    If all results are "Normal" (or the list is empty), returns a message indicating
    all values are within normal ranges.

    Args:
        lab_results: List of dicts with keys "test", "value", "status", "normal_range".

    Returns:
        List of health tip strings.
    """
    tips: List[str] = []

    for result in lab_results:
        test_name = result.get("test", "")
        status = result.get("status", "")

        if status in ("Low", "High"):
            tip = TIPS.get((test_name, status))
            if tip:
                tips.append(tip)

    if not tips:
        return ["All lab values are within normal ranges."]

    return tips
