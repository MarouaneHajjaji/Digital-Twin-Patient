# Patient Digital Twin — Intelligent Patient Monitoring & Clinical Deterioration Prediction

> **Engineering-level PFA Project**  
> AI-powered Patient Digital Twin interface integrating continuous temporal physiological monitoring, multi-parameter vital sign trajectories, and real-time machine learning deterioration prediction.

---

## 1. System Overview & Architecture

The **Patient Digital Twin System** models the temporal physiological state of hospital patients over time. Rather than relying on static snapshot vital signs, the system continuously tracks 12-hour physiological trajectories and uses a trained **Scikit-Learn RandomForest Pipeline** (`best_model.joblib`) to predict the probability of clinical deterioration in the next 12 hours.

```
┌────────────────────────────────────────────────────────┐
│             Frontend (HTML5, CSS3, Vanilla JS)         │
│  - Digital Twin SVG Organ Map & Pulsing Aura           │
│  - Time Scrubber (Hour 0 to Hour 11) & Simulation Engine│
│  - Chart.js Temporal Vitals & Risk Evolution           │
│  - State Machine Engine & Dynamic Alert Panel          │
│  - Manual Override Clinical Input Form                 │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API (fetch)
┌──────────────────────────▼─────────────────────────────┐
│             Backend API Server (FastAPI / Uvicorn)     │
│  - Model Handler (`best_model.joblib` integration)    │
│  - Calibrated Hybrid Risk Scoring Engine               │
│  - Local & Global Feature Importance Explainability    │
│  - Patient Clinical Cohorts Dataset                    │
└──────────────────────────┬─────────────────────────────┘
                           │ Preprocessor + Estimator
┌──────────────────────────▼─────────────────────────────┐
│             Existing ML Model (`best_model.joblib`)    │
│  - Pipeline: SimpleImputer, StandardScaler, OneHot     │
│  - Estimator: RandomForestClassifier (300 estimators)  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Key Features

1. **Central Patient Digital Twin Component**:
   - SVG organ node visualization (Heart, Lungs, Brain, Kidneys) with pulse speeds scaling dynamically with Heart Rate.
   - Background aura glow indicating current risk level (`STABLE` 🟢, `WATCH` 🟡, `AT RISK` 🟠, `HIGH RISK` 🔴).
   - Floating vital badges (Heart Rate, SpO2, Respiratory Rate, BP, Temp, O2 Support) updated in real-time.

2. **Temporal Evolution Scrubber & Simulation Engine**:
   - Scrubber slider traversing `Hour 0` to `Hour 11`.
   - Playback controls (`Start Simulation`, `Pause`, `Reset`) with speed toggles (`1x`, `2x`, `5x`).
   - Auto-invokes model prediction at every time step.

3. **Temporal Vital Sign & Risk Evolution Charts**:
   - Interactive Chart.js charts for Heart Rate, SpO2, Respiratory Rate, Blood Pressure (Systolic/Diastolic), Temperature, Blood Lactate, WBC, CRP, and 12-hour Risk Score evolution.

4. **State Machine & Clinical Alert System**:
   - Automated clinical state transitions: `STABLE` (<20%) → `WATCH` (20-44%) → `AT RISK` (45-69%) → `HIGH RISK` (≥70%).
   - Rule-based + AI alert generator detecting hypoxia drops, tachycardia spikes, hyperlactatemia, and multi-vital worsening.

5. **Clinical Input Panel & Manual Override**:
   - Allows clinicians to manually adjust vital signs or lab parameters and run instant model inference to observe Digital Twin updates.

6. **Model Insights & Explainability**:
   - Displays top contributing risk factors for the selected time step along with global RandomForest feature importances.

---

## 3. Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Dark Navy Medical Aesthetic), Vanilla JavaScript (ES6 Modules).
- **Visualization Libraries**: Chart.js v4 (Line Charts), Remix Icons (Medical/UI Icons).
- **Backend**: FastAPI (Python 3.13), Uvicorn ASGI Server.
- **Machine Learning**: Scikit-Learn (`sklearn.pipeline.Pipeline`), Joblib (`best_model.joblib`), Pandas, NumPy.

---

## 4. Installation & Quick Start

### Prerequisites
- Python 3.9+
- Installed packages: `fastapi`, `uvicorn`, `pydantic`, `scikit-learn`, `joblib`, `pandas`, `numpy`

### Launch Command
To launch both the FastAPI backend and serve the frontend interface in a single command:

```bash
python run_app.py
```

Open your browser and navigate to:
```text
http://127.0.0.1:8000
```

---

## 5. API Endpoints

- `GET /api/health` — System status, API connectivity, and model diagnostics.
- `GET /api/patients` — List of patient profiles and trajectory summaries.
- `GET /api/patient/{id}` — Retrieve full 12-hour temporal dataset enriched with model predictions.
- `POST /api/predict` — Submit clinical parameters for real-time model inference.
- `GET /api/explain` — Retrieve top feature importances from the trained model.

---

## 6. Model Integration Details

The application directly loads `best_model.joblib` without retraining. The model pipeline expects 21 features:
- **Numerical (18)**: `hour_from_admission`, `heart_rate`, `respiratory_rate`, `spo2_pct`, `temperature_c`, `systolic_bp`, `diastolic_bp`, `oxygen_flow`, `mobility_score`, `nurse_alert`, `wbc_count`, `lactate`, `creatinine`, `crp_level`, `hemoglobin`, `sepsis_risk_score`, `age`, `comorbidity_index`.
- **Categorical (3)**: `oxygen_device` (`none`, `nasal`, `mask`, `hfnc`, `niv`), `gender` (`M`, `F`), `admission_type` (`ED`, `Elective`, `Transfer`).

The backend handles feature ordering, missing value defaults, and calibrates raw probability outputs to a 0–100% Clinical Deterioration Risk Score.

---

## 7. Project Limitations & Clinical Disclaimer

- **Simulation Scope**: Designed as an engineering prototype for PFA demonstration.
- **Medical Use**: Not intended for direct clinical diagnostic or therapeutic decision-making without independent medical validation.
