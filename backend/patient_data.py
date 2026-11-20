"""
Patient Cohort & Temporal Clinical Trajectories
Defines preset patient clinical histories over 12 hourly steps (Hour 0 -> Hour 11).
Each timeline step contains full feature metadata for ML pipeline inference.
"""

PATIENT_PROFILES = [
    {
        "id": "PAT-0001",
        "admission_id": "ADM-8492",
        "name": "Marcus Vance",
        "age": 64,
        "gender": "M",
        "admission_type": "ED",
        "comorbidity_index": 4,
        "primary_diagnosis": "Severe Sepsis / Pulmonary Infection",
        "unit": "Medical Intensive Care Unit (MICU-04)",
        "monitoring_duration_hours": 12,
        "trajectory_name": "Septic Shock Trajectory (Severe Deterioration)",
        "hours": list(range(12)),
        "timeline": [
            # Hour 0
            {"hour_from_admission": 0, "heart_rate": 76, "respiratory_rate": 15, "spo2_pct": 98, "temperature_c": 36.8, "systolic_bp": 122, "diastolic_bp": 78, "oxygen_device": "none", "oxygen_flow": 0.0, "mobility_score": 3, "nurse_alert": 0, "wbc_count": 7.8, "lactate": 1.1, "creatinine": 0.9, "crp_level": 12.0, "hemoglobin": 13.8, "sepsis_risk_score": 0.08, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 1
            {"hour_from_admission": 1, "heart_rate": 79, "respiratory_rate": 16, "spo2_pct": 97, "temperature_c": 37.1, "systolic_bp": 119, "diastolic_bp": 76, "oxygen_device": "none", "oxygen_flow": 0.0, "mobility_score": 3, "nurse_alert": 0, "wbc_count": 8.2, "lactate": 1.2, "creatinine": 0.9, "crp_level": 15.0, "hemoglobin": 13.6, "sepsis_risk_score": 0.10, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 2
            {"hour_from_admission": 2, "heart_rate": 83, "respiratory_rate": 17, "spo2_pct": 96, "temperature_c": 37.4, "systolic_bp": 116, "diastolic_bp": 75, "oxygen_device": "nasal", "oxygen_flow": 1.5, "mobility_score": 2, "nurse_alert": 0, "wbc_count": 9.1, "lactate": 1.4, "creatinine": 1.0, "crp_level": 22.0, "hemoglobin": 13.5, "sepsis_risk_score": 0.14, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 3
            {"hour_from_admission": 3, "heart_rate": 87, "respiratory_rate": 17, "spo2_pct": 96, "temperature_c": 37.6, "systolic_bp": 114, "diastolic_bp": 73, "oxygen_device": "nasal", "oxygen_flow": 2.0, "mobility_score": 2, "nurse_alert": 0, "wbc_count": 10.4, "lactate": 1.6, "creatinine": 1.1, "crp_level": 30.0, "hemoglobin": 13.2, "sepsis_risk_score": 0.18, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 4
            {"hour_from_admission": 4, "heart_rate": 92, "respiratory_rate": 19, "spo2_pct": 95, "temperature_c": 37.9, "systolic_bp": 110, "diastolic_bp": 71, "oxygen_device": "nasal", "oxygen_flow": 3.0, "mobility_score": 2, "nurse_alert": 0, "wbc_count": 11.8, "lactate": 1.9, "creatinine": 1.2, "crp_level": 42.0, "hemoglobin": 13.0, "sepsis_risk_score": 0.24, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 5
            {"hour_from_admission": 5, "heart_rate": 96, "respiratory_rate": 20, "spo2_pct": 94, "temperature_c": 38.2, "systolic_bp": 107, "diastolic_bp": 68, "oxygen_device": "mask", "oxygen_flow": 4.0, "mobility_score": 1, "nurse_alert": 0, "wbc_count": 13.2, "lactate": 2.3, "creatinine": 1.4, "crp_level": 55.0, "hemoglobin": 12.7, "sepsis_risk_score": 0.32, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 6
            {"hour_from_admission": 6, "heart_rate": 101, "respiratory_rate": 21, "spo2_pct": 93, "temperature_c": 38.5, "systolic_bp": 104, "diastolic_bp": 66, "oxygen_device": "mask", "oxygen_flow": 5.0, "mobility_score": 1, "nurse_alert": 1, "wbc_count": 14.9, "lactate": 2.8, "creatinine": 1.6, "crp_level": 70.0, "hemoglobin": 12.4, "sepsis_risk_score": 0.41, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 7
            {"hour_from_admission": 7, "heart_rate": 105, "respiratory_rate": 23, "spo2_pct": 92, "temperature_c": 38.8, "systolic_bp": 100, "diastolic_bp": 64, "oxygen_device": "mask", "oxygen_flow": 6.0, "mobility_score": 1, "nurse_alert": 1, "wbc_count": 16.5, "lactate": 3.3, "creatinine": 1.8, "crp_level": 88.0, "hemoglobin": 12.1, "sepsis_risk_score": 0.52, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 8
            {"hour_from_admission": 8, "heart_rate": 110, "respiratory_rate": 24, "spo2_pct": 91, "temperature_c": 39.0, "systolic_bp": 96, "diastolic_bp": 61, "oxygen_device": "hfnc", "oxygen_flow": 15.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 18.2, "lactate": 3.9, "creatinine": 2.1, "crp_level": 110.0, "hemoglobin": 11.8, "sepsis_risk_score": 0.64, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 9
            {"hour_from_admission": 9, "heart_rate": 114, "respiratory_rate": 25, "spo2_pct": 90, "temperature_c": 39.2, "systolic_bp": 92, "diastolic_bp": 58, "oxygen_device": "hfnc", "oxygen_flow": 25.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 20.1, "lactate": 4.6, "creatinine": 2.4, "crp_level": 135.0, "hemoglobin": 11.4, "sepsis_risk_score": 0.75, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 10
            {"hour_from_admission": 10, "heart_rate": 118, "respiratory_rate": 27, "spo2_pct": 89, "temperature_c": 39.4, "systolic_bp": 88, "diastolic_bp": 55, "oxygen_device": "niv", "oxygen_flow": 35.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 22.4, "lactate": 5.4, "creatinine": 2.8, "crp_level": 160.0, "hemoglobin": 11.0, "sepsis_risk_score": 0.84, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"},
            # Hour 11
            {"hour_from_admission": 11, "heart_rate": 124, "respiratory_rate": 29, "spo2_pct": 87, "temperature_c": 39.6, "systolic_bp": 84, "diastolic_bp": 52, "oxygen_device": "niv", "oxygen_flow": 45.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 25.0, "lactate": 6.3, "creatinine": 3.2, "crp_level": 190.0, "hemoglobin": 10.6, "sepsis_risk_score": 0.92, "age": 64, "gender": "M", "comorbidity_index": 4, "admission_type": "ED"}
        ]
    },
    {
        "id": "PAT-0002",
        "admission_id": "ADM-3319",
        "name": "Elena Rostova",
        "age": 58,
        "gender": "F",
        "admission_type": "ED",
        "comorbidity_index": 2,
        "primary_diagnosis": "Acute Hypoxemic Respiratory Distress",
        "unit": "Intermediate Care Unit (IMCU-02)",
        "monitoring_duration_hours": 12,
        "trajectory_name": "Acute Respiratory Deterioration",
        "hours": list(range(12)),
        "timeline": [
            {"hour_from_admission": 0, "heart_rate": 78, "respiratory_rate": 16, "spo2_pct": 96, "temperature_c": 37.0, "systolic_bp": 125, "diastolic_bp": 82, "oxygen_device": "none", "oxygen_flow": 0.0, "mobility_score": 3, "nurse_alert": 0, "wbc_count": 8.0, "lactate": 1.2, "creatinine": 0.8, "crp_level": 18.0, "hemoglobin": 13.1, "sepsis_risk_score": 0.10, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 1, "heart_rate": 81, "respiratory_rate": 18, "spo2_pct": 95, "temperature_c": 37.1, "systolic_bp": 124, "diastolic_bp": 81, "oxygen_device": "nasal", "oxygen_flow": 2.0, "mobility_score": 3, "nurse_alert": 0, "wbc_count": 8.3, "lactate": 1.3, "creatinine": 0.8, "crp_level": 20.0, "hemoglobin": 13.0, "sepsis_risk_score": 0.12, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 2, "heart_rate": 86, "respiratory_rate": 20, "spo2_pct": 94, "temperature_c": 37.3, "systolic_bp": 128, "diastolic_bp": 83, "oxygen_device": "nasal", "oxygen_flow": 3.0, "mobility_score": 2, "nurse_alert": 0, "wbc_count": 8.9, "lactate": 1.5, "creatinine": 0.9, "crp_level": 25.0, "hemoglobin": 12.9, "sepsis_risk_score": 0.15, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 3, "heart_rate": 92, "respiratory_rate": 22, "spo2_pct": 93, "temperature_c": 37.5, "systolic_bp": 132, "diastolic_bp": 85, "oxygen_device": "mask", "oxygen_flow": 5.0, "mobility_score": 2, "nurse_alert": 0, "wbc_count": 9.5, "lactate": 1.7, "creatinine": 0.9, "crp_level": 32.0, "hemoglobin": 12.8, "sepsis_risk_score": 0.20, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 4, "heart_rate": 98, "respiratory_rate": 25, "spo2_pct": 91, "temperature_c": 37.7, "systolic_bp": 136, "diastolic_bp": 88, "oxygen_device": "mask", "oxygen_flow": 8.0, "mobility_score": 1, "nurse_alert": 1, "wbc_count": 10.4, "lactate": 2.0, "creatinine": 1.0, "crp_level": 42.0, "hemoglobin": 12.6, "sepsis_risk_score": 0.28, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 5, "heart_rate": 104, "respiratory_rate": 28, "spo2_pct": 90, "temperature_c": 37.9, "systolic_bp": 140, "diastolic_bp": 90, "oxygen_device": "hfnc", "oxygen_flow": 20.0, "mobility_score": 1, "nurse_alert": 1, "wbc_count": 11.2, "lactate": 2.4, "creatinine": 1.1, "crp_level": 55.0, "hemoglobin": 12.5, "sepsis_risk_score": 0.36, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 6, "heart_rate": 111, "respiratory_rate": 31, "spo2_pct": 88, "temperature_c": 38.1, "systolic_bp": 142, "diastolic_bp": 92, "oxygen_device": "hfnc", "oxygen_flow": 30.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 12.1, "lactate": 2.9, "creatinine": 1.2, "crp_level": 68.0, "hemoglobin": 12.3, "sepsis_risk_score": 0.46, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 7, "heart_rate": 116, "respiratory_rate": 33, "spo2_pct": 87, "temperature_c": 38.3, "systolic_bp": 138, "diastolic_bp": 89, "oxygen_device": "hfnc", "oxygen_flow": 40.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 13.0, "lactate": 3.4, "creatinine": 1.3, "crp_level": 82.0, "hemoglobin": 12.1, "sepsis_risk_score": 0.56, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 8, "heart_rate": 120, "respiratory_rate": 35, "spo2_pct": 86, "temperature_c": 38.4, "systolic_bp": 130, "diastolic_bp": 85, "oxygen_device": "niv", "oxygen_flow": 50.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 14.0, "lactate": 4.0, "creatinine": 1.4, "crp_level": 98.0, "hemoglobin": 11.9, "sepsis_risk_score": 0.65, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 9, "heart_rate": 123, "respiratory_rate": 36, "spo2_pct": 85, "temperature_c": 38.5, "systolic_bp": 122, "diastolic_bp": 80, "oxygen_device": "niv", "oxygen_flow": 55.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 15.1, "lactate": 4.5, "creatinine": 1.5, "crp_level": 115.0, "hemoglobin": 11.7, "sepsis_risk_score": 0.72, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 10, "heart_rate": 126, "respiratory_rate": 37, "spo2_pct": 84, "temperature_c": 38.6, "systolic_bp": 115, "diastolic_bp": 75, "oxygen_device": "niv", "oxygen_flow": 60.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 16.3, "lactate": 5.1, "creatinine": 1.7, "crp_level": 130.0, "hemoglobin": 11.5, "sepsis_risk_score": 0.79, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"},
            {"hour_from_admission": 11, "heart_rate": 128, "respiratory_rate": 38, "spo2_pct": 83, "temperature_c": 38.7, "systolic_bp": 108, "diastolic_bp": 70, "oxygen_device": "niv", "oxygen_flow": 60.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 17.5, "lactate": 5.8, "creatinine": 1.9, "crp_level": 148.0, "hemoglobin": 11.3, "sepsis_risk_score": 0.86, "age": 58, "gender": "F", "comorbidity_index": 2, "admission_type": "ED"}
        ]
    },
    {
        "id": "PAT-0003",
        "admission_id": "ADM-1024",
        "name": "Arthur Pendelton",
        "age": 71,
        "gender": "M",
        "admission_type": "Elective",
        "comorbidity_index": 1,
        "primary_diagnosis": "Post-Operative Abdominal Monitoring",
        "unit": "Surgical Recovery Unit (SRU-01)",
        "monitoring_duration_hours": 12,
        "trajectory_name": "Post-Op Stable Trajectory",
        "hours": list(range(12)),
        "timeline": [
            {"hour_from_admission": h, "heart_rate": 72 + (h % 3), "respiratory_rate": 15, "spo2_pct": 98 - (h % 2), "temperature_c": 36.7 + (h * 0.02), "systolic_bp": 120 + (h % 4), "diastolic_bp": 78 + (h % 3), "oxygen_device": "nasal" if h < 4 else "none", "oxygen_flow": 1.0 if h < 4 else 0.0, "mobility_score": 2 if h < 6 else 3, "nurse_alert": 0, "wbc_count": 7.2, "lactate": 1.0, "creatinine": 0.8, "crp_level": 8.0, "hemoglobin": 13.9, "sepsis_risk_score": 0.04, "age": 71, "gender": "M", "comorbidity_index": 1, "admission_type": "Elective"}
            for h in range(12)
        ]
    },
    {
        "id": "PAT-0004",
        "admission_id": "ADM-7711",
        "name": "Sofia Al-Mansoor",
        "age": 59,
        "gender": "F",
        "admission_type": "Transfer",
        "comorbidity_index": 5,
        "primary_diagnosis": "Decompensated Cardiac Failure & Hypoperfusion",
        "unit": "Cardiac Care Unit (CCU-03)",
        "monitoring_duration_hours": 12,
        "trajectory_name": "Cardiogenic Hypoperfusion Trajectory",
        "hours": list(range(12)),
        "timeline": [
            {"hour_from_admission": 0, "heart_rate": 84, "respiratory_rate": 18, "spo2_pct": 96, "temperature_c": 36.6, "systolic_bp": 115, "diastolic_bp": 74, "oxygen_device": "nasal", "oxygen_flow": 2.0, "mobility_score": 2, "nurse_alert": 0, "wbc_count": 8.5, "lactate": 1.4, "creatinine": 1.2, "crp_level": 14.0, "hemoglobin": 12.8, "sepsis_risk_score": 0.12, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 1, "heart_rate": 88, "respiratory_rate": 19, "spo2_pct": 95, "temperature_c": 36.5, "systolic_bp": 110, "diastolic_bp": 71, "oxygen_device": "nasal", "oxygen_flow": 2.0, "mobility_score": 2, "nurse_alert": 0, "wbc_count": 8.8, "lactate": 1.6, "creatinine": 1.3, "crp_level": 16.0, "hemoglobin": 12.6, "sepsis_risk_score": 0.15, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 2, "heart_rate": 93, "respiratory_rate": 20, "spo2_pct": 95, "temperature_c": 36.4, "systolic_bp": 105, "diastolic_bp": 68, "oxygen_device": "mask", "oxygen_flow": 4.0, "mobility_score": 1, "nurse_alert": 0, "wbc_count": 9.2, "lactate": 1.9, "creatinine": 1.4, "crp_level": 19.0, "hemoglobin": 12.5, "sepsis_risk_score": 0.20, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 3, "heart_rate": 99, "respiratory_rate": 21, "spo2_pct": 94, "temperature_c": 36.3, "systolic_bp": 101, "diastolic_bp": 65, "oxygen_device": "mask", "oxygen_flow": 4.0, "mobility_score": 1, "nurse_alert": 0, "wbc_count": 9.7, "lactate": 2.2, "creatinine": 1.6, "crp_level": 22.0, "hemoglobin": 12.3, "sepsis_risk_score": 0.26, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 4, "heart_rate": 105, "respiratory_rate": 23, "spo2_pct": 93, "temperature_c": 36.2, "systolic_bp": 96, "diastolic_bp": 61, "oxygen_device": "mask", "oxygen_flow": 6.0, "mobility_score": 1, "nurse_alert": 1, "wbc_count": 10.3, "lactate": 2.6, "creatinine": 1.8, "crp_level": 26.0, "hemoglobin": 12.1, "sepsis_risk_score": 0.35, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 5, "heart_rate": 110, "respiratory_rate": 24, "spo2_pct": 92, "temperature_c": 36.1, "systolic_bp": 91, "diastolic_bp": 58, "oxygen_device": "hfnc", "oxygen_flow": 15.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 11.0, "lactate": 3.1, "creatinine": 2.1, "crp_level": 30.0, "hemoglobin": 11.9, "sepsis_risk_score": 0.44, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 6, "heart_rate": 115, "respiratory_rate": 25, "spo2_pct": 91, "temperature_c": 36.0, "systolic_bp": 87, "diastolic_bp": 54, "oxygen_device": "hfnc", "oxygen_flow": 25.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 11.8, "lactate": 3.7, "creatinine": 2.4, "crp_level": 36.0, "hemoglobin": 11.7, "sepsis_risk_score": 0.54, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 7, "heart_rate": 119, "respiratory_rate": 26, "spo2_pct": 90, "temperature_c": 35.9, "systolic_bp": 83, "diastolic_bp": 51, "oxygen_device": "hfnc", "oxygen_flow": 35.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 12.6, "lactate": 4.3, "creatinine": 2.7, "crp_level": 42.0, "hemoglobin": 11.5, "sepsis_risk_score": 0.63, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 8, "heart_rate": 122, "respiratory_rate": 27, "spo2_pct": 89, "temperature_c": 35.8, "systolic_bp": 80, "diastolic_bp": 48, "oxygen_device": "niv", "oxygen_flow": 45.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 13.5, "lactate": 5.0, "creatinine": 3.1, "crp_level": 50.0, "hemoglobin": 11.3, "sepsis_risk_score": 0.71, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 9, "heart_rate": 125, "respiratory_rate": 28, "spo2_pct": 88, "temperature_c": 35.7, "systolic_bp": 77, "diastolic_bp": 46, "oxygen_device": "niv", "oxygen_flow": 50.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 14.4, "lactate": 5.7, "creatinine": 3.5, "crp_level": 58.0, "hemoglobin": 11.1, "sepsis_risk_score": 0.78, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 10, "heart_rate": 127, "respiratory_rate": 29, "spo2_pct": 87, "temperature_c": 35.6, "systolic_bp": 74, "diastolic_bp": 44, "oxygen_device": "niv", "oxygen_flow": 55.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 15.3, "lactate": 6.4, "creatinine": 3.9, "crp_level": 66.0, "hemoglobin": 10.9, "sepsis_risk_score": 0.84, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"},
            {"hour_from_admission": 11, "heart_rate": 130, "respiratory_rate": 30, "spo2_pct": 86, "temperature_c": 35.5, "systolic_bp": 71, "diastolic_bp": 42, "oxygen_device": "niv", "oxygen_flow": 60.0, "mobility_score": 0, "nurse_alert": 1, "wbc_count": 16.2, "lactate": 7.1, "creatinine": 4.3, "crp_level": 75.0, "hemoglobin": 10.7, "sepsis_risk_score": 0.89, "age": 59, "gender": "F", "comorbidity_index": 5, "admission_type": "Transfer"}
        ]
    }
]

def get_all_patients():
    """Returns patient summaries for selector."""
    return [
        {
            "id": p["id"],
            "admission_id": p["admission_id"],
            "name": p["name"],
            "age": p["age"],
            "gender": p["gender"],
            "admission_type": p["admission_type"],
            "comorbidity_index": p["comorbidity_index"],
            "primary_diagnosis": p["primary_diagnosis"],
            "unit": p["unit"],
            "monitoring_duration_hours": p["monitoring_duration_hours"],
            "trajectory_name": p["trajectory_name"]
        }
        for p in PATIENT_PROFILES
    ]

def get_patient_by_id(patient_id: str):
    for p in PATIENT_PROFILES:
        if p["id"] == patient_id:
            return p
    return PATIENT_PROFILES[0]
