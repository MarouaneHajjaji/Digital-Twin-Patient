/**
 * Digital Twin Component Visualizer
 * Manages organ node animations, floating vital badges, aura glow, and clinical state machine updates.
 */

const DigitalTwinVisualizer = {
    update(stepData, riskScore, stateCode) {
        if (!stepData) return;

        // 1. Update Floating Vital Badges
        const elHR = document.getElementById("valHR");
        const elSpo2 = document.getElementById("valSpo2");
        const elRR = document.getElementById("valRR");
        const elBP = document.getElementById("valBP");
        const elTemp = document.getElementById("valTemp");
        const elO2 = document.getElementById("valO2");

        if (elHR) elHR.innerHTML = `${stepData.heart_rate} <small>BPM</small>`;
        if (elSpo2) elSpo2.innerHTML = `${stepData.spo2_pct} <small>%</small>`;
        if (elRR) elRR.innerHTML = `${stepData.respiratory_rate} <small>/min</small>`;
        if (elBP) elBP.innerHTML = `${stepData.systolic_bp}/${stepData.diastolic_bp} <small>mmHg</small>`;
        if (elTemp) elTemp.innerHTML = `${stepData.temperature_c.toFixed(1)} <small>°C</small>`;
        
        const device = stepData.oxygen_device || "none";
        const flow = stepData.oxygen_flow || 0.0;
        if (elO2) elO2.innerHTML = `${flow.toFixed(1)} <small>L/min (${device})</small>`;

        // 2. Update Aura Glow Class
        const aura = document.getElementById("twinAura");
        if (aura) {
            aura.className = `twin-aura-glow state-${stateCode}`;
        }

        // 3. Dynamic Organ Highlight & Pulse Speed
        const hr = stepData.heart_rate || 75;
        const pulseDuration = Math.max(0.4, 60.0 / hr); // Pulse matching HR
        
        const nodeHeart = document.getElementById("nodeHeart");
        if (nodeHeart) {
            nodeHeart.style.animationDuration = `${pulseDuration}s`;
            nodeHeart.style.fill = stepData.heart_rate > 110 ? "#ef4444" : (stepData.heart_rate > 90 ? "#f97316" : "#ef4444");
        }

        const nodeLungL = document.getElementById("nodeLungL");
        const nodeLungR = document.getElementById("nodeLungR");
        const lungColor = stepData.spo2_pct < 90 ? "#ef4444" : (stepData.spo2_pct < 94 ? "#f59e0b" : "#00bbf9");
        if (nodeLungL) nodeLungL.style.fill = lungColor;
        if (nodeLungR) nodeLungR.style.fill = lungColor;

        const nodeKidneyL = document.getElementById("nodeKidneyL");
        const nodeKidneyR = document.getElementById("nodeKidneyR");
        const kidneyColor = (stepData.creatinine || 0.9) > 2.0 ? "#ef4444" : ((stepData.creatinine || 0.9) > 1.3 ? "#f59e0b" : "#f59e0b");
        if (nodeKidneyL) nodeKidneyL.style.fill = kidneyColor;
        if (nodeKidneyR) nodeKidneyR.style.fill = kidneyColor;

        // 4. Update State Machine Steps
        const steps = ["Stable", "Watch", "AtRisk", "HighRisk"];
        steps.forEach(s => {
            const el = document.getElementById(`stateStep${s}`);
            if (el) el.classList.remove("active");
        });

        if (stateCode === "stable") {
            document.getElementById("stateStepStable")?.classList.add("active");
        } else if (stateCode === "watch") {
            document.getElementById("stateStepWatch")?.classList.add("active");
        } else if (stateCode === "at_risk") {
            document.getElementById("stateStepAtRisk")?.classList.add("active");
        } else if (stateCode === "high_risk") {
            document.getElementById("stateStepHighRisk")?.classList.add("active");
        }
    }
};

window.DigitalTwinVisualizer = DigitalTwinVisualizer;
