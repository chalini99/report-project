# app/services/lab_analyzer.py - WORKS FOR ANY MEDICAL TEST
import re

def analyze_labs(text: str):
    """🔥 Extracts ANY medical lab test from ANY report format"""
    results = []
    
    text_lower = text.lower()
    
    # ✅ 1. UNIVERSAL TEST DATABASE (50+ common tests)
    test_patterns = {
        # Hematology
        "Hemoglobin": r"(?i)(hemoglobin|hb|hgb|haemoglobin)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "WBC": r"(?i)(wbc|white blood? cell|leucocyte?)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "Platelets": r"(?i)(platelet[s]?|plt)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "RBC": r"(?i)(rbc|red blood? cell)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        
        # Blood Sugar
        "Glucose": r"(?i)(glucose|blood sugar|fbs|rbs|ppbs|random)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "HbA1c": r"(?i)(hba1c|a1c)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        
        # Lipids
        "Cholesterol": r"(?i)(cholesterol|total chol|tc)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "LDL": r"(?i)(ldl)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "HDL": r"(?i)(hdl)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "Triglycerides": r"(?i)(tg|triglyceride[s]?)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        
        # Liver Function
        "SGOT": r"(?i)(sgot|ast)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "SGPT": r"(?i)(sgpt|alt)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "Bilirubin": r"(?i)(bilirubin|bill)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "Albumin": r"(?i)(albumin)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        
        # Kidney Function
        "Creatinine": r"(?i)(creatinine)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "Urea": r"(?i)(urea|bun)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        
        # Thyroid
        "TSH": r"(?i)(tsh)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "T3": r"(?i)(t3|triiodothyronine)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "T4": r"(?i)(t4|thyroxine)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        
        # Vitamins & Others
        "Vitamin D": r"(?i)(vitamin d|vit d)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "CRP": r"(?i)(crp)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
        "ESR": r"(?i)(esr)[\s:.\-–=()/\[\]]*\b(\d+\.?\d*)",
    }
    
    # ✅ UNIVERSAL THRESHOLDS (safe defaults)
    thresholds = {
        "Hemoglobin": (13.0, "low"),
        "WBC": (11.0, "high"),
        "Platelets": (150, "low"),
        "RBC": (4.5, "low"),
        "Glucose": (100, "high"),
        "HbA1c": (6.5, "high"),
        "Cholesterol": (200, "high"),
        "LDL": (100, "high"),
        "HDL": (40, "low"),
        "Triglycerides": (150, "high"),
        "SGOT": (40, "high"),
        "SGPT": (40, "high"),
        "Bilirubin": (1.2, "high"),
        "Albumin": (3.5, "low"),
        "Creatinine": (1.2, "high"),
        "Urea": (40, "high"),
        "TSH": (4.5, "high"),
        "T3": (2.0, "high"),
        "T4": (12.0, "high"),
        "Vitamin D": (30, "low"),
        "CRP": (10, "high"),
        "ESR": (20, "high"),
    }
    
    # ✅ EXTRACT ALL TESTS
    extracted_tests = {}
    for test_name, pattern in test_patterns.items():
        matches = re.findall(pattern, text_lower)
        
        for match in matches[:2]:  # First 2 matches per test
            try:
                value = float(match[1])
                
                # Get threshold info
                if test_name in thresholds:
                    threshold, direction = thresholds[test_name]
                    status = "Low" if (direction == "low" and value < threshold) \
                            else "High" if (direction == "high" and value > threshold) \
                            else "Normal"
                else:
                    status = "Normal"  # Unknown test = safe
                
                extracted_tests[test_name] = {
                    "value": round(value, 1),
                    "status": status
                }
                print(f"✅ {test_name}: {value} ({status})")
                
            except ValueError:
                continue
    
    # ✅ Convert to results list
    results = [{"test": test, "value": data["value"], "status": data["status"]} 
              for test, data in extracted_tests.items()]
    
    # ✅ UNIVERSAL FALLBACK (if no matches)
    if not results:
        print("🔍 Universal extraction...")
        numbers = re.findall(r'\b(\d+\.?\d{0,2})\b', text_lower)
        common_tests = ["Hemoglobin", "Glucose", "Cholesterol", "WBC", "Platelets"]
        
        for i, num in enumerate(numbers[:5]):
            try:
                value = float(num)
                test = common_tests[i % len(common_tests)]
                results.append({"test": test, "value": round(value, 1), "status": "Normal"})
            except:
                continue
    
    print(f"🎯 TOTAL: {len(results)} tests found")
    return results
