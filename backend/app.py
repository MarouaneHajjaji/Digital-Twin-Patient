import os
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from backend.model_handler import ModelHandler
from backend.patient_data import get_all_patients, get_patient_by_id

app = FastAPI(
    title="Patient Digital Twin API",
    description="Intelligent Patient Monitoring & Clinical Deterioration Prediction REST API",
    version="1.0.0"
)

# Enable CORS for local development & browser fetch calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Model Handler
handler = ModelHandler()

class VitalsInput(BaseModel):
    hour_from_admission: Optional[int] = 0
    heart_rate: Optional[float] = 75.0
    respiratory_rate: Optional[float] = 16.0
    spo2_pct: Optional[float] = 98.0
    temperature_c: Optional[float] = 36.8
    systolic_bp: Optional[float] = 120.0
    diastolic_bp: Optional[float] = 80.0
    oxygen_device: Optional[str] = "none"
    oxygen_flow: Optional[float] = 0.0
    mobility_score: Optional[int] = 3
    nurse_alert: Optional[int] = 0
    wbc_count: Optional[float] = 7.5
    lactate: Optional[float] = 1.1
    creatinine: Optional[float] = 0.9
    crp_level: Optional[float] = 5.0
    hemoglobin: Optional[float] = 14.0
    sepsis_risk_score: Optional[float] = 0.05
    age: Optional[int] = 54
    gender: Optional[str] = "M"
    comorbidity_index: Optional[int] = 1
    admission_type: Optional[str] = "ED"

class SequenceInput(BaseModel):
    sequence: List[VitalsInput]

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "api_status": "connected",
        "model_loaded": handler.model is not None,
        "model_type": "Scikit-Learn Pipeline (RandomForestClassifier)",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/patients")
def list_patients():
    return get_all_patients()

@app.get("/api/patient/{patient_id}")
def get_patient(patient_id: str):
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Run predictions across all timeline hours to enrich patient object
    timeline = patient["timeline"]
    predictions = handler.predict(timeline)
    
    enriched_timeline = []
    for idx, step in enumerate(timeline):
        pred = predictions[idx] if isinstance(predictions, list) else predictions
        enriched_step = dict(step)
        enriched_step.update({
            "risk_score": pred["risk_score"],
            "raw_probability": pred["raw_probability"],
            "clinical_state": pred["clinical_state"],
            "clinical_state_code": pred["clinical_state_code"],
            "contributing_factors": pred["contributing_factors"]
        })
        enriched_timeline.append(enriched_step)
        
    patient_copy = dict(patient)
    patient_copy["timeline"] = enriched_timeline
    return patient_copy

@app.post("/api/predict")
def predict_vitals(input_data: VitalsInput):
    result = handler.predict(input_data.dict())
    return result

@app.post("/api/predict-sequence")
def predict_sequence(input_data: SequenceInput):
    seq_dicts = [item.dict() for item in input_data.sequence]
    results = handler.predict(seq_dicts)
    return {"predictions": results}

@app.get("/api/explain")
def get_model_insights():
    if not hasattr(handler, "global_importances") or not handler.global_importances:
        return {"explainability_available": False, "feature_importances": []}
    
    importances_list = [
        {
            "feature": k,
            "label": k.replace("_", " ").title(),
            "importance": round(v, 4),
            "percentage": round(v * 100, 1)
        }
        for k, v in sorted(handler.global_importances.items(), key=lambda x: x[1], reverse=True)
    ]
    return {
        "explainability_available": True,
        "method": "RandomForest Feature Importance & Local Multi-Factor Deviation Analysis",
        "feature_importances": importances_list[:10]
    }
