import os
import sys

# Ensure project root is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app import app
from fastapi.staticfiles import StaticFiles

# Mount static frontend directory
frontend_dir = os.path.join(BASE_DIR, "frontend")
if os.path.exists(frontend_dir):
    try:
        app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")
    except Exception:
        pass  # Already mounted if module was reloaded

if __name__ == "__main__":
    import uvicorn
    print("=" * 70)
    print("  PATIENT DIGITAL TWIN — INTELLIGENT CLINICAL MONITORING SYSTEM")
    print("=" * 70)
    print("  Backend API & Model Server: Loaded best_model.joblib")
    print("  Frontend UI URL:            http://127.0.0.1:8080")
    print("  REST API Health Endpoint:   http://127.0.0.1:8080/api/health")
    print("  API Documentation (Swagger): http://127.0.0.1:8080/docs")
    print("=" * 70)

    uvicorn.run(app, host="127.0.0.1", port=8080, log_level="info")
