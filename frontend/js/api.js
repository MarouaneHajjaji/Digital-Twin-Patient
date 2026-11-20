/**
 * REST API Client for Digital Twin Patient Monitoring Backend
 */

const API_BASE_URL = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? window.location.origin
    : "http://127.0.0.1:8000";

const ApiClient = {
    async checkHealth() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/health`);
            if (!res.ok) throw new Error("Health check failed");
            return await res.json();
        } catch (err) {
            console.warn("API Offline, using local client mode:", err);
            return { status: "offline", api_status: "disconnected", model_loaded: false };
        }
    },

    async getPatients() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/patients`);
            if (!res.ok) throw new Error("Failed to fetch patients");
            return await res.json();
        } catch (err) {
            console.error("Error fetching patients:", err);
            return null;
        }
    },

    async getPatient(patientId) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/patient/${patientId}`);
            if (!res.ok) throw new Error(`Failed to fetch patient ${patientId}`);
            return await res.json();
        } catch (err) {
            console.error(`Error fetching patient ${patientId}:`, err);
            return null;
        }
    },

    async predict(vitalsData) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(vitalsData)
            });
            if (!res.ok) throw new Error("Prediction API call failed");
            return await res.json();
        } catch (err) {
            console.error("Error calling predict API:", err);
            return null;
        }
    },

    async getExplainability() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/explain`);
            if (!res.ok) throw new Error("Explainability API failed");
            return await res.json();
        } catch (err) {
            console.error("Error fetching explainability:", err);
            return null;
        }
    }
};

window.ApiClient = ApiClient;
