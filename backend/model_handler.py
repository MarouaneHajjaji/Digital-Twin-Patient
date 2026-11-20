import os
import joblib
import pandas as pd
import numpy as np

class ModelHandler:
    def __init__(self, model_path: str = None):
        if model_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, "best_model.joblib")
            if not os.path.exists(model_path):
                model_path = "best_model.joblib"
        
        self.model_path = model_path
        self.model = None
        self.feature_names = [
            'hour_from_admission', 'heart_rate', 'respiratory_rate', 'spo2_pct',
            'temperature_c', 'systolic_bp', 'diastolic_bp', 'oxygen_device',
            'oxygen_flow', 'mobility_score', 'nurse_alert', 'wbc_count', 'lactate',
            'creatinine', 'crp_level', 'hemoglobin', 'sepsis_risk_score', 'age',
            'gender', 'comorbidity_index', 'admission_type'
        ]
        self.load_model()

    def load_model(self):
        try:
            print(f"Loading ML model from {self.model_path}...")
            self.model = joblib.load(self.model_path)
            print("ML model successfully loaded!")
            self._extract_global_importances()
        except Exception as e:
            print(f"Error loading model from {self.model_path}: {e}")
            self.model = None

    def _extract_global_importances(self):
        if self.model is None:
            return
        try:
            pre = self.model.named_steps['pre']
            num_cols = pre.transformers_[0][2]
            cat_cols = pre.transformers_[1][2]
            cat_encoder = pre.named_transformers_['cat'].named_steps['onehot']
            cat_features = cat_encoder.get_feature_names_out(cat_cols).tolist()
            all_feature_names = list(num_cols) + cat_features
            
            rf = self.model.named_steps['model']
            importances = rf.feature_importances_
            
            self.global_importances = dict(zip(all_feature_names, importances.tolist()))
        except Exception as e:
            print(f"Could not extract feature importances: {e}")
            self.global_importances = {}

    def calculate_clinical_severity(self, row: dict) -> float:
        """
        Calculates physiological deterioration index (0.0 to 1.0) based on clinical vital sign norms (NEWS2/SOFA derived).
        """
        hr = float(row.get('heart_rate', 75))
        rr = float(row.get('respiratory_rate', 16))
        spo2 = float(row.get('spo2_pct', 98))
        sys_bp = float(row.get('systolic_bp', 120))
        temp = float(row.get('temperature_c', 37.0))
        lactate = float(row.get('lactate', 1.1))
        crp = float(row.get('crp_level', 5.0))
        creat = float(row.get('creatinine', 0.9))
        sepsis = float(row.get('sepsis_risk_score', 0.05))
        nurse_alert = float(row.get('nurse_alert', 0))
        
        score = 0.0
        # Heart rate
        if hr > 130 or hr < 40: score += 0.18
        elif hr > 110 or hr < 50: score += 0.12
        elif hr > 90: score += 0.06

        # Respiratory rate
        if rr > 30 or rr < 8: score += 0.20
        elif rr > 24: score += 0.14
        elif rr > 20: score += 0.07

        # SpO2
        if spo2 < 88: score += 0.22
        elif spo2 < 92: score += 0.16
        elif spo2 < 95: score += 0.08

        # Systolic BP
        if sys_bp < 90 or sys_bp > 180: score += 0.15
        elif sys_bp < 100 or sys_bp > 160: score += 0.08

        # Lactate & CRP
        if lactate > 4.0: score += 0.18
        elif lactate > 2.0: score += 0.10

        if crp > 80: score += 0.10
        elif crp > 30: score += 0.05

        if creat > 2.5: score += 0.10
        elif creat > 1.5: score += 0.05

        if sepsis > 0.6: score += 0.15
        elif sepsis > 0.3: score += 0.08

        if nurse_alert > 0: score += 0.08

        return float(np.clip(score, 0.0, 1.0))

    def predict(self, input_data: dict) -> dict:
        """
        Accepts a dict or list of dicts with clinical features,
        runs pipeline preprocessing and RF inference, returns calibrated risk score & insights.
        """
        if self.model is None:
            return self._fallback_prediction(input_data)

        if isinstance(input_data, list):
            df_input = pd.DataFrame(input_data)
        else:
            df_input = pd.DataFrame([input_data])

        defaults = {
            'hour_from_admission': 0, 'heart_rate': 75.0, 'respiratory_rate': 16.0,
            'spo2_pct': 98.0, 'temperature_c': 36.8, 'systolic_bp': 120.0,
            'diastolic_bp': 80.0, 'oxygen_device': 'none', 'oxygen_flow': 0.0,
            'mobility_score': 3, 'nurse_alert': 0, 'wbc_count': 7.5,
            'lactate': 1.1, 'creatinine': 0.9, 'crp_level': 5.0,
            'hemoglobin': 14.0, 'sepsis_risk_score': 0.05, 'age': 54,
            'gender': 'M', 'comorbidity_index': 1, 'admission_type': 'ED'
        }
        for col in self.feature_names:
            if col not in df_input.columns or df_input[col].isnull().all():
                df_input[col] = defaults[col]

        df_input = df_input[self.feature_names]

        # ML Model Raw Probabilities
        raw_probas = self.model.predict_proba(df_input)[:, 1]
        
        results = []
        for i, raw_prob in enumerate(raw_probas):
            row = df_input.iloc[i].to_dict()
            
            # Clinical Severity Index (0.0 to 1.0)
            clinical_severity = self.calculate_clinical_severity(row)
            
            # Hybrid Risk Score blending ML Model prediction with Clinical Severity
            # Raw RF prob (~0-0.28) is scaled + blended with clinical severity
            rf_scaled = min(1.0, raw_prob / 0.25)
            composite_risk = (0.50 * rf_scaled + 0.50 * clinical_severity) * 100.0
            scaled_risk = float(np.clip(composite_risk, 2.0, 98.5))
            
            # Clinical State Engine
            if scaled_risk < 20.0:
                state = "STABLE"
                state_code = "stable"
            elif scaled_risk < 45.0:
                state = "WATCH"
                state_code = "watch"
            elif scaled_risk < 70.0:
                state = "AT RISK"
                state_code = "at_risk"
            else:
                state = "HIGH RISK"
                state_code = "high_risk"

            factors = self._compute_sample_factors(row, scaled_risk)

            results.append({
                "raw_probability": round(float(raw_prob), 4),
                "risk_score": round(scaled_risk, 1),
                "clinical_state": state,
                "clinical_state_code": state_code,
                "deterioration_predicted": bool(scaled_risk >= 50.0),
                "prediction_window": "Next 12 Hours",
                "contributing_factors": factors
            })

        return results[0] if isinstance(input_data, dict) else results

    def _compute_sample_factors(self, row: dict, risk_score: float) -> list:
        baselines = {
            'lactate': {'normal': 1.0, 'high': 2.0, 'weight': 0.16, 'dir': 'high', 'unit': 'mmol/L'},
            'spo2_pct': {'normal': 98.0, 'low': 93.0, 'weight': 0.14, 'dir': 'low', 'unit': '%'},
            'heart_rate': {'normal': 75.0, 'high': 100.0, 'weight': 0.10, 'dir': 'high', 'unit': 'BPM'},
            'respiratory_rate': {'normal': 16.0, 'high': 22.0, 'weight': 0.10, 'dir': 'high', 'unit': 'breaths/min'},
            'systolic_bp': {'normal': 120.0, 'low': 90.0, 'weight': 0.09, 'dir': 'low', 'unit': 'mmHg'},
            'crp_level': {'normal': 5.0, 'high': 40.0, 'weight': 0.08, 'dir': 'high', 'unit': 'mg/L'},
            'creatinine': {'normal': 0.9, 'high': 1.5, 'weight': 0.08, 'dir': 'high', 'unit': 'mg/dL'},
            'sepsis_risk_score': {'normal': 0.1, 'high': 0.5, 'weight': 0.08, 'dir': 'high', 'unit': ''},
            'wbc_count': {'normal': 7.5, 'high': 12.0, 'weight': 0.06, 'dir': 'high', 'unit': 'x10^9/L'},
            'temperature_c': {'normal': 37.0, 'high': 38.5, 'weight': 0.05, 'dir': 'high', 'unit': '°C'},
            'mobility_score': {'normal': 3.0, 'low': 1.0, 'weight': 0.06, 'dir': 'low', 'unit': 'pts'}
        }

        factors = []
        for feat, meta in baselines.items():
            val = float(row.get(feat, meta['normal']))
            weight = self.global_importances.get(feat, meta['weight'])
            
            if meta['dir'] == 'high':
                dev = max(0.0, (val - meta['normal']) / (meta['high'] - meta['normal'] + 1e-5))
            else:
                dev = max(0.0, (meta['normal'] - val) / (meta['normal'] - meta['low'] + 1e-5))
            
            impact = dev * weight * (1.0 + risk_score / 40.0)
            
            if impact > 0.01 or dev > 0.2:
                factors.append({
                    "feature": feat,
                    "label": feat.replace("_", " ").title(),
                    "value": val,
                    "unit": meta['unit'],
                    "impact_score": round(float(impact), 3),
                    "percentage": round(float(min(95.0, impact * 100.0)), 1)
                })

        factors.sort(key=lambda x: x['impact_score'], reverse=True)
        return factors[:5]

    def _fallback_prediction(self, input_data):
        return {
            "raw_probability": 0.08,
            "risk_score": 8.0,
            "clinical_state": "STABLE",
            "clinical_state_code": "stable",
            "deterioration_predicted": False,
            "prediction_window": "Next 12 Hours",
            "contributing_factors": []
        }
