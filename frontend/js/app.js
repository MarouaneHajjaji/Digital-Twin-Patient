/**
 * Main Application Orchestrator for Patient Digital Twin AI
 * Manages full view navigation, state sync, simulation, charts, and API integration.
 */

class DigitalTwinApp {
    constructor() {
        this.currentPatient = null;
        this.currentHour = 0;
        this.charts = new ClinicalCharts();
        this.simulation = null;
        this.currentView = "overview";
        this.alerts = [];
        this.predictionHistory = [];
        this.labObservations = [
            { time: "08:00", hr: 78, rr: 16, bp: "120/78", temp: 36.8, spo2: 98, lactate: 1.1 },
            { time: "10:00", hr: 86, rr: 18, bp: "116/74", temp: 37.3, spo2: 96, lactate: 1.5 },
            { time: "12:00", hr: 98, rr: 22, bp: "108/68", temp: 38.2, spo2: 92, lactate: 3.2 }
        ];
    }

    async init() {
        this.startClock();
        this.charts.init();
        
        this.simulation = new SimulationEngine((hour) => {
            this.onHourChange(hour);
        });
        this.simulation.init();

        await this.checkSystemHealth();
        await this.loadPatientData("PAT-0001");
        await this.loadGlobalExplainability();

        this.setupNavigation();
        this.setupEventListeners();
        this.setupScenarioPresets();
        this.setupLabInferenceLaboratory();
    }

    startClock() {
        const update = () => {
            const el = document.getElementById("headerClock");
            if (el) {
                const now = new Date();
                el.textContent = now.toTimeString().split(" ")[0] + " UTC";
            }
        };
        update();
        setInterval(update, 1000);
    }

    setupNavigation() {
        const navItems = document.querySelectorAll(".nav-item");
        navItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                const targetView = item.dataset.view;
                if (!targetView) return;

                navItems.forEach(n => n.classList.remove("active"));
                item.classList.add("active");

                const views = document.querySelectorAll(".view-section");
                views.forEach(v => v.classList.remove("active"));

                const targetEl = document.getElementById(`view-${targetView}`);
                if (targetEl) {
                    targetEl.classList.add("active");
                }
                this.currentView = targetView;
            });
        });
    }

    async checkSystemHealth() {
        const health = await ApiClient.checkHealth();
        const aiEl = document.getElementById("aiStatus");
        const apiEl = document.getElementById("apiStatus");

        if (health && health.status === "online") {
            if (aiEl) aiEl.className = "status-indicator online";
            if (apiEl) apiEl.className = "status-indicator online";
        } else {
            if (aiEl) aiEl.className = "status-indicator offline";
            if (apiEl) apiEl.className = "status-indicator offline";
        }
    }

    async loadPatientData(patientId) {
        const data = await ApiClient.getPatient(patientId);
        if (!data) return;

        this.currentPatient = data;
        this.updatePatientMeta();
        
        this.simulation.reset();
        this.onHourChange(0);
    }

    updatePatientMeta() {
        const p = this.currentPatient;
        if (!p) return;

        document.getElementById("patAdmission").textContent = `Admission: ${p.admission_id}`;
        document.getElementById("patUnit").textContent = p.unit;
        document.getElementById("patDiagnosis").textContent = p.primary_diagnosis;
        document.getElementById("patDemographics").textContent = `${p.age} ${p.gender}`;
        document.getElementById("patAdmType").textContent = p.admission_type;
        document.getElementById("patComorbidity").textContent = `${p.comorbidity_index} / 10`;
        document.getElementById("patDuration").textContent = `${p.monitoring_duration_hours} Hours`;

        const dtPatId = document.getElementById("dtPatId");
        if (dtPatId) dtPatId.textContent = p.id;
        const dtAdmId = document.getElementById("dtAdmId");
        if (dtAdmId) dtAdmId.textContent = p.admission_id;
        const dtDemo = document.getElementById("dtDemo");
        if (dtDemo) dtDemo.textContent = `${p.age} ${p.gender}`;
        const dtDiagnosis = document.getElementById("dtDiagnosis");
        if (dtDiagnosis) dtDiagnosis.textContent = p.primary_diagnosis;
        const dtUnit = document.getElementById("dtUnit");
        if (dtUnit) dtUnit.textContent = p.unit;
    }

    onHourChange(hour) {
        this.currentHour = hour;
        if (!this.currentPatient || !this.currentPatient.timeline) return;

        const timeline = this.currentPatient.timeline;
        const currentStep = timeline[hour];
        if (!currentStep) return;

        const riskScore = currentStep.risk_score || 0.0;
        const stateCode = currentStep.clinical_state_code || "stable";
        const stateText = currentStep.clinical_state || "STABLE";

        DigitalTwinVisualizer.update(currentStep, riskScore, stateCode);
        this.updateRadialRiskGauge(riskScore, stateText, stateCode);
        this.updateTrendAnalysis(timeline, hour);
        this.charts.updateData(timeline, hour);
        this.generateClinicalAlerts(timeline, hour);
        this.populateInputFields(currentStep);
        this.updateFactorBars(currentStep.contributing_factors || []);
        this.updateDigitalTwinView(currentStep, riskScore, stateText, stateCode);
        this.updateTemporalMonitoringView(timeline, hour);
        this.updateSimulationView(currentStep, riskScore, stateText);
    }

    updateRadialRiskGauge(riskScore, stateText, stateCode) {
        const elVal = document.getElementById("riskScoreVal");
        const elState = document.getElementById("riskStateTag");
        const elMeter = document.getElementById("riskMeter");

        if (elVal) elVal.textContent = riskScore.toFixed(1);
        if (elState) {
            elState.textContent = stateText;
            elState.className = `risk-state-tag state-${stateCode}`;
        }

        if (elMeter) {
            const maxOffset = 534;
            const offset = maxOffset - (riskScore / 100.0) * maxOffset;
            elMeter.style.strokeDashoffset = offset;

            let strokeColor = "#10b981";
            if (riskScore >= 70) strokeColor = "#ef4444";
            else if (riskScore >= 45) strokeColor = "#f97316";
            else if (riskScore >= 20) strokeColor = "#f59e0b";
            elMeter.style.stroke = strokeColor;
        }
    }

    updateDigitalTwinView(step, riskScore, stateText, stateCode) {
        const elState = document.getElementById("dtState");
        if (elState) elState.textContent = `${stateText} ${stateCode === 'stable' ? '🟢' : (stateCode === 'high_risk' ? '🔴' : '🟡')}`;
        
        const elLast = document.getElementById("dtLastUpdate");
        if (elLast) elLast.textContent = `Hour ${this.currentHour} (Live)`;

        const elHR = document.getElementById("dtHRVal");
        if (elHR) elHR.textContent = `${step.heart_rate} BPM`;
        const elRR = document.getElementById("dtRRVal");
        if (elRR) elRR.textContent = `${step.respiratory_rate} /min`;
        const elBP = document.getElementById("dtBPVal");
        if (elBP) elBP.textContent = `${step.systolic_bp}/${step.diastolic_bp} mmHg`;
        const elTemp = document.getElementById("dtTempVal");
        if (elTemp) elTemp.textContent = `${step.temperature_c.toFixed(1)} °C`;
        const elSpo2 = document.getElementById("dtSpo2Val");
        if (elSpo2) elSpo2.textContent = `${step.spo2_pct} %`;
    }

    updateTemporalMonitoringView(timeline, currentHour) {
        const banner = document.getElementById("temporalMatrixBanner");
        if (!banner) return;

        const slice = timeline.slice(Math.max(0, currentHour - 4), currentHour + 1);
        banner.innerHTML = slice.map((s, idx) => `
            <div class="flow-node">
                <i class="ri-pulse-line"></i>
                t-${slice.length - 1 - idx} (H${s.hour_from_admission}): HR ${s.heart_rate} | SpO₂ ${s.spo2_pct}% | RR ${s.respiratory_rate}
            </div>
        `).join('<i class="ri-arrow-right-line flow-arrow"></i>');
    }

    updateSimulationView(step, riskScore, stateText) {
        const curHR = document.getElementById("simCurHR");
        const curSpo2 = document.getElementById("simCurSpo2");
        const curRisk = document.getElementById("simCurRisk");

        if (curHR) curHR.textContent = `${step.heart_rate} BPM`;
        if (curSpo2) curSpo2.textContent = `${step.spo2_pct}%`;
        if (curRisk) curRisk.textContent = `${riskScore.toFixed(1)}% (${stateText})`;

        const simRisk = document.getElementById("simSimRisk");
        if (simRisk) simRisk.textContent = `${riskScore.toFixed(1)}%`;
        const simState = document.getElementById("simSimState");
        if (simState) simState.textContent = stateText;
    }

    updateTrendAnalysis(timeline, currentHour) {
        const slice = timeline.slice(Math.max(0, currentHour - 2), currentHour + 1);
        
        const hrHist = slice.map(s => s.heart_rate).join(" → ");
        document.getElementById("histHR").textContent = hrHist;
        this.setTrendBadge("badgeTrendHR", slice.map(s => s.heart_rate), "high");

        const spo2Hist = slice.map(s => s.spo2_pct).join(" → ");
        document.getElementById("histSpo2").textContent = spo2Hist;
        this.setTrendBadge("badgeTrendSpo2", slice.map(s => s.spo2_pct), "low");

        const rrHist = slice.map(s => s.respiratory_rate).join(" → ");
        document.getElementById("histRR").textContent = rrHist;
        this.setTrendBadge("badgeTrendRR", slice.map(s => s.respiratory_rate), "high");

        const lacHist = slice.map(s => s.lactate.toFixed(1)).join(" → ");
        document.getElementById("histLactate").textContent = lacHist;
        this.setTrendBadge("badgeTrendLactate", slice.map(s => s.lactate), "high");
    }

    setTrendBadge(elementId, values, badDirection) {
        const el = document.getElementById(elementId);
        if (!el || values.length < 2) return;

        const first = values[0];
        const last = values[values.length - 1];
        const diff = last - first;

        if (Math.abs(diff) < 1.0) {
            el.className = "trend-badge stable";
            el.innerHTML = '<i class="ri-subtract-line"></i> Stable';
        } else if ((diff > 0 && badDirection === "high") || (diff < 0 && badDirection === "low")) {
            el.className = "trend-badge critical";
            el.innerHTML = '<i class="ri-arrow-up-line"></i> Deteriorating';
        } else {
            el.className = "trend-badge rising";
            el.innerHTML = '<i class="ri-arrow-down-line"></i> Improving';
        }
    }

    generateClinicalAlerts(timeline, currentHour) {
        const step = timeline[currentHour];
        const alertList = document.getElementById("alertList");
        const alertsTable = document.getElementById("alertsTableBody");

        let items = [];

        if (step.risk_score >= 70) {
            items.push({
                type: "critical",
                title: "HIGH CLINICAL DETERIORATION RISK",
                desc: `Risk score reached ${step.risk_score.toFixed(1)}%. Immediate clinical evaluation required.`,
                time: `Hour ${currentHour}`,
                vital: "Risk Score",
                current: `${step.risk_score.toFixed(1)}%`,
                prev: `${(timeline[Math.max(0, currentHour-1)].risk_score || 0).toFixed(1)}%`,
                trend: "↑ Increasing",
                status: "Active"
            });
        } else if (step.risk_score >= 45) {
            items.push({
                type: "warning",
                title: "Deterioration Risk Elevated (At Risk)",
                desc: `Risk score elevated to ${step.risk_score.toFixed(1)}%.`,
                time: `Hour ${currentHour}`,
                vital: "Risk Score",
                current: `${step.risk_score.toFixed(1)}%`,
                prev: `${(timeline[Math.max(0, currentHour-1)].risk_score || 0).toFixed(1)}%`,
                trend: "↑ Increasing",
                status: "Active"
            });
        }

        if (step.spo2_pct < 92) {
            items.push({
                type: "critical",
                title: "Hypoxia Warning (SpO₂ < 92%)",
                desc: `SpO₂ decreased to ${step.spo2_pct}%. Oxygen flow requirement: ${step.oxygen_flow} L/min.`,
                time: `Hour ${currentHour}`,
                vital: "SpO₂",
                current: `${step.spo2_pct}%`,
                prev: `${timeline[Math.max(0, currentHour-1)].spo2_pct}%`,
                trend: "↓ Worsening",
                status: "Active"
            });
        }

        if (step.heart_rate > 110) {
            items.push({
                type: "warning",
                title: "Tachycardia Alert",
                desc: `Heart rate increased to ${step.heart_rate} BPM.`,
                time: `Hour ${currentHour}`,
                vital: "Heart Rate",
                current: `${step.heart_rate} BPM`,
                prev: `${timeline[Math.max(0, currentHour-1)].heart_rate} BPM`,
                trend: "↑ High",
                status: "Active"
            });
        }

        if (items.length === 0) {
            items.push({
                type: "info",
                title: "Patient State Stable",
                desc: `Physiological parameters within normal limits. Risk score: ${step.risk_score.toFixed(1)}%.`,
                time: `Hour ${currentHour}`,
                vital: "All Vitals",
                current: "Normal",
                prev: "Normal",
                trend: "→ Stable",
                status: "Resolved"
            });
        }

        if (alertList) {
            alertList.innerHTML = items.map(item => `
                <div class="alert-item ${item.type}">
                    <i class="${item.type === 'critical' ? 'ri-error-warning-line' : (item.type === 'warning' ? 'ri-alert-line' : 'ri-checkbox-circle-line')} alert-icon"></i>
                    <div class="alert-content">
                        <div class="alert-title">${item.title}</div>
                        <div class="alert-desc">${item.desc}</div>
                        <div class="alert-time">${item.time}</div>
                    </div>
                </div>
            `).join("");
        }

        if (alertsTable) {
            alertsTable.innerHTML = items.map(item => `
                <tr>
                    <td><span class="trend-badge ${item.type === 'critical' ? 'critical' : (item.type === 'warning' ? 'falling' : 'stable')}">${item.type.toUpperCase()}</span></td>
                    <td style="font-weight: 600;">${item.title}</td>
                    <td>${item.time}</td>
                    <td>${item.vital}</td>
                    <td>${item.current}</td>
                    <td>${item.trend}</td>
                    <td><span class="status-pill ${item.status === 'Active' ? 'active-monitoring' : ''}">${item.status}</span></td>
                </tr>
            `).join("");
        }

        const badge = document.getElementById("alertCountBadge");
        if (badge) badge.textContent = items.filter(i => i.type !== "info").length;
    }

    populateInputFields(step) {
        document.getElementById("inHR").value = step.heart_rate;
        document.getElementById("inSpo2").value = step.spo2_pct;
        document.getElementById("inRR").value = step.respiratory_rate;
        document.getElementById("inSysBP").value = step.systolic_bp;
        document.getElementById("inDiaBP").value = step.diastolic_bp;
        document.getElementById("inTemp").value = step.temperature_c;
        document.getElementById("inLactate").value = step.lactate;
        document.getElementById("inWBC").value = step.wbc_count;
        document.getElementById("inCreatinine").value = step.creatinine;
        document.getElementById("inCRP").value = step.crp_level;
        document.getElementById("inO2Device").value = step.oxygen_device || "none";
        document.getElementById("inO2Flow").value = step.oxygen_flow || 0.0;
    }

    updateFactorBars(factors) {
        const container = document.getElementById("factorBars");
        if (!container) return;

        if (!factors || factors.length === 0) {
            container.innerHTML = '<div class="alert-desc">All vitals near normal baseline limits.</div>';
            return;
        }

        container.innerHTML = factors.map(f => `
            <div class="factor-bar-item">
                <div class="factor-meta">
                    <span>${f.label} (${f.value} ${f.unit})</span>
                    <span>${f.percentage}% Impact</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${Math.min(100, f.percentage)}%;"></div>
                </div>
            </div>
        `).join("");
    }

    async loadGlobalExplainability() {
        const explain = await ApiClient.getExplainability();
        if (!explain || !explain.feature_importances) return;

        const tagsContainers = [
            document.getElementById("globalImportanceTags"),
            document.getElementById("fullModelImportanceTags")
        ];

        const html = explain.feature_importances.map(imp => `
            <span class="imp-tag">${imp.label} (${imp.percentage}%)</span>
        `).join("");

        tagsContainers.forEach(container => {
            if (container) container.innerHTML = html;
        });
    }

    setupScenarioPresets() {
        const scenarioA = document.getElementById("scenarioBtnA");
        const scenarioB = document.getElementById("scenarioBtnB");
        const scenarioC = document.getElementById("scenarioBtnC");
        const scenarioD = document.getElementById("scenarioBtnD");

        if (scenarioA) scenarioA.addEventListener("click", () => this.runScenarioPreset("A"));
        if (scenarioB) scenarioB.addEventListener("click", () => this.runScenarioPreset("B"));
        if (scenarioC) scenarioC.addEventListener("click", () => this.runScenarioPreset("C"));
        if (scenarioD) scenarioD.addEventListener("click", () => this.runScenarioPreset("D"));
    }

    async runScenarioPreset(preset) {
        if (!this.currentPatient || !this.currentPatient.timeline) return;

        let sample = { ...this.currentPatient.timeline[this.currentHour] };

        if (preset === "A") {
            sample.heart_rate = 74; sample.spo2_pct = 98; sample.respiratory_rate = 15; sample.lactate = 1.0;
        } else if (preset === "B") {
            sample.heart_rate = 122; sample.spo2_pct = 88; sample.respiratory_rate = 28; sample.lactate = 5.2; sample.crp_level = 140;
        } else if (preset === "C") {
            sample.spo2_pct = 84; sample.respiratory_rate = 32; sample.oxygen_flow = 15; sample.oxygen_device = "mask";
        } else if (preset === "D") {
            sample.heart_rate = 142; sample.respiratory_rate = 26; sample.systolic_bp = 92;
        }

        const pred = await ApiClient.predict(sample);
        if (pred) {
            const curRisk = this.currentPatient.timeline[this.currentHour].risk_score || 0;
            const simRisk = pred.risk_score;
            const delta = simRisk - curRisk;

            document.getElementById("simSimRisk").textContent = `${simRisk.toFixed(1)}%`;
            document.getElementById("simSimState").textContent = pred.clinical_state;

            const deltaEl = document.getElementById("simRiskDelta");
            if (deltaEl) {
                deltaEl.textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% Delta`;
                deltaEl.className = `delta-pill ${delta > 0 ? 'risk-up' : 'risk-down'}`;
            }
        }
    }

    /* =========================================================================
       INTERACTIVE ML INFERENCE LABORATORY (RISK PREDICTION PAGE)
       ========================================================================= */
    setupLabInferenceLaboratory() {
        this.renderObservationsList();

        const btnAdd = document.getElementById("btnAddObservation");
        if (btnAdd) {
            btnAdd.addEventListener("click", () => {
                const hour = this.labObservations.length * 2;
                const timeStr = `${String(8 + hour).padStart(2, '0')}:00`;
                this.labObservations.push({
                    time: timeStr,
                    hr: 105,
                    rr: 24,
                    bp: "104/64",
                    temp: 38.6,
                    spo2: 90,
                    lactate: 4.1
                });
                this.renderObservationsList();
            });
        }

        const labForm = document.getElementById("labPredictionForm");
        if (labForm) {
            labForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.executeLabPrediction();
            });
        }

        const btnReset = document.getElementById("btnResetLab");
        if (btnReset) {
            btnReset.addEventListener("click", () => {
                document.getElementById("emptyPredictionState").style.display = "flex";
                document.getElementById("activePredictionResult").style.display = "none";
            });
        }

        const btnClearHist = document.getElementById("btnClearHistory");
        if (btnClearHist) {
            btnClearHist.addEventListener("click", () => {
                this.predictionHistory = [];
                this.renderPredictionHistory();
            });
        }
    }

    renderObservationsList() {
        const list = document.getElementById("observationsList");
        if (!list) return;

        list.innerHTML = this.labObservations.map((obs, idx) => `
            <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.35rem 0.65rem; font-size: 0.75rem; white-space: nowrap; display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 700; color: var(--cyan-accent);">Obs ${idx+1} (${obs.time})</span>
                <span style="color: var(--text-secondary);">HR ${obs.hr} | SpO₂ ${obs.spo2}%</span>
            </div>
        `).join('<i class="ri-arrow-right-line" style="color: var(--text-muted); align-self: center;"></i>');
    }

    async executeLabPrediction() {
        const hr = parseFloat(document.getElementById("labHR").value);
        const rr = parseFloat(document.getElementById("labRR").value);
        const sysBP = parseFloat(document.getElementById("labSysBP").value);
        const diaBP = parseFloat(document.getElementById("labDiaBP").value);
        const temp = parseFloat(document.getElementById("labTemp").value);
        const spo2 = parseFloat(document.getElementById("labSpo2").value);
        const lactate = parseFloat(document.getElementById("labLactate").value);
        const wbc = parseFloat(document.getElementById("labWBC").value);
        const creatinine = parseFloat(document.getElementById("labCreatinine").value);
        const crp = parseFloat(document.getElementById("labCRP").value);
        const age = parseInt(document.getElementById("labAge").value, 10);
        const gender = document.getElementById("labGender").value;
        const admType = document.getElementById("labAdmType").value;
        const comorb = parseInt(document.getElementById("labComorb").value, 10);
        const o2Device = document.getElementById("labO2Device").value;

        const inputPayload = {
            hour_from_admission: 11,
            heart_rate: hr,
            respiratory_rate: rr,
            systolic_bp: sysBP,
            diastolic_bp: diaBP,
            temperature_c: temp,
            spo2_pct: spo2,
            lactate: lactate,
            wbc_count: wbc,
            creatinine: creatinine,
            crp_level: crp,
            age: age,
            gender: gender,
            admission_type: admType,
            comorbidity_index: comorb,
            oxygen_device: o2Device,
            oxygen_flow: 4.0,
            mobility_score: 1,
            nurse_alert: 1,
            hemoglobin: 12.0,
            sepsis_risk_score: lactate > 3.0 ? 0.75 : 0.20
        };

        const result = await ApiClient.predict(inputPayload);
        if (!result) return;

        // Hide empty state, show active result
        document.getElementById("emptyPredictionState").style.display = "none";
        document.getElementById("activePredictionResult").style.display = "block";

        const riskVal = document.getElementById("labRiskVal");
        const riskTag = document.getElementById("labRiskTag");
        const riskMeter = document.getElementById("labRiskMeter");

        const score = result.risk_score;
        const stateText = result.clinical_state;
        const stateCode = result.clinical_state_code;

        if (riskVal) riskVal.textContent = score.toFixed(1);
        if (riskTag) {
            riskTag.textContent = stateText;
            riskTag.className = `risk-state-tag state-${stateCode}`;
        }
        if (riskMeter) {
            const offset = 534 - (score / 100.0) * 534;
            riskMeter.style.strokeDashoffset = offset;
            riskMeter.style.stroke = score >= 70 ? "#ef4444" : (score >= 45 ? "#f97316" : (score >= 20 ? "#f59e0b" : "#10b981"));
        }

        // Summary diagram
        document.getElementById("sumHR").textContent = hr;
        document.getElementById("sumSpo2").textContent = spo2;
        document.getElementById("sumLac").textContent = lactate;
        document.getElementById("sumRisk").textContent = `${score.toFixed(1)}%`;

        // Factors list
        const factorsContainer = document.getElementById("labFactorsList");
        if (factorsContainer && result.contributing_factors) {
            factorsContainer.innerHTML = result.contributing_factors.map(f => `
                <div class="factor-bar-item">
                    <div class="factor-meta">
                        <span>${f.label} (${f.value} ${f.unit})</span>
                        <span>${f.percentage}% Impact</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${Math.min(100, f.percentage)}%;"></div>
                    </div>
                </div>
            `).join("");
        }

        // =====================================================================
        // PATIENT STATE INTERPRETATION — Fully Dynamic Generation
        // =====================================================================
        this.generatePatientStateInterpretation({
            hr, rr, sysBP, diaBP, temp, spo2, lactate, wbc, creatinine, crp,
            age, gender, o2Device, score, stateText, stateCode,
            factors: result.contributing_factors || []
        });

        // Add to Session History
        const now = new Date().toTimeString().split(" ")[0];
        this.predictionHistory.unshift({
            time: now,
            category: stateText,
            stateCode: stateCode,
            score: score.toFixed(1) + "%",
            vitals: `HR ${hr} | SpO₂ ${spo2}% | Lac ${lactate}`,
            obsCount: this.labObservations.length
        });
        this.renderPredictionHistory();
    }

    // =========================================================================
    // PATIENT STATE INTERPRETATION ENGINE
    // =========================================================================

    generatePatientStateInterpretation({ hr, rr, sysBP, diaBP, temp, spo2, lactate, wbc, creatinine, crp, age, gender, o2Device, score, stateText, stateCode, factors }) {

        // ------ Reference ranges for parameter classification ------
        const refs = {
            hr:         { low: 50,   high: 100,  unit: "bpm"    },
            rr:         { low: 12,   high: 20,   unit: "/min"   },
            sysBP:      { low: 90,   high: 140,  unit: "mmHg"   },
            diaBP:      { low: 60,   high: 90,   unit: "mmHg"   },
            temp:       { low: 36.0, high: 37.5, unit: "°C"     },
            spo2:       { low: 95,   high: 100,  unit: "%"      },
            lactate:    { low: 0.0,  high: 2.0,  unit: "mmol/L" },
            wbc:        { low: 4.0,  high: 11.0, unit: "x10⁹/L"},
            creatinine: { low: 0.0,  high: 1.2,  unit: "mg/dL"  },
            crp:        { low: 0.0,  high: 10.0, unit: "mg/L"   }
        };

        // Classify each parameter
        const classify = (val, ref) => {
            if (val < ref.low)  return "low";
            if (val > ref.high) return "high";
            return "normal";
        };

        const paramStatuses = {
            hr:         classify(hr, refs.hr),
            rr:         classify(rr, refs.rr),
            sysBP:      classify(sysBP, refs.sysBP),
            diaBP:      classify(diaBP, refs.diaBP),
            temp:       classify(temp, refs.temp),
            spo2:       classify(spo2, refs.spo2),
            lactate:    classify(lactate, refs.lactate),
            wbc:        classify(wbc, refs.wbc),
            creatinine: classify(creatinine, refs.creatinine),
            crp:        classify(crp, refs.crp)
        };

        const abnormalParams = Object.entries(paramStatuses).filter(([, s]) => s !== "normal");

        // ------ 1. Clinical Narrative (dynamic text) ------
        const narrativeEl = document.getElementById("narrativeText");
        if (narrativeEl) {
            narrativeEl.innerHTML = this._buildNarrative(score, stateCode, paramStatuses, hr, rr, spo2, sysBP, lactate, o2Device);
        }

        // ------ 2. Key Parameter Analysis Table ------
        const paramTableBody = document.getElementById("paramAnalysisBody");
        if (paramTableBody) {
            paramTableBody.innerHTML = this._buildParamTable(hr, rr, sysBP, diaBP, temp, spo2, lactate, wbc, creatinine, crp, paramStatuses, refs);
        }

        // ------ 3. Temporal Trend Interpretation ------
        const trendList = document.getElementById("temporalTrendInterpretationList");
        if (trendList) {
            trendList.innerHTML = this._buildTemporalTrends(hr, rr, spo2, lactate);
        }

        // ------ 4. Risk Explanation (Why this prediction?) ------
        const explainEl = document.getElementById("riskExplanationText");
        if (explainEl) {
            explainEl.innerHTML = this._buildRiskExplanation(stateCode, factors, paramStatuses, hr, rr, spo2, lactate);
        }

        // ------ 5. Monitoring Recommendation ------
        const monitorEl = document.getElementById("monitoringRecommendationText");
        if (monitorEl) {
            monitorEl.textContent = this._buildMonitoringRecommendation(stateCode);
        }

        // ------ 6. AI Patient State Summary Box ------
        this._buildSummaryBox(stateText, score, stateCode, abnormalParams, paramStatuses, hr, rr, spo2, lactate);
    }

    _buildNarrative(score, stateCode, ps, hr, rr, spo2, sysBP, lactate, o2Device) {
        const stateEmoji = { stable: "🟢", watch: "🟡", at_risk: "🟠", high_risk: "🔴" };
        const emoji = stateEmoji[stateCode] || "🟡";

        let parts = [];

        // Opening sentence based on risk level
        if (stateCode === "stable") {
            parts.push("The patient is currently in a <strong>stable physiological state</strong>.");
        } else if (stateCode === "watch") {
            parts.push("The patient's physiological parameters indicate a state that <strong>requires monitoring</strong>.");
        } else if (stateCode === "at_risk") {
            parts.push("The patient shows signs of <strong>physiological deterioration</strong> across several vital parameters.");
        } else {
            parts.push("The patient is currently in a <strong>high-risk physiological state</strong> with multiple abnormal parameters detected.");
        }

        // Parameter-specific observations
        const observations = [];
        if (ps.spo2 === "low")    observations.push("a reduced oxygen saturation (SpO₂ " + spo2 + "%)");
        if (ps.rr === "high")     observations.push("an elevated respiratory rate (" + rr + " breaths/min)");
        if (ps.hr === "high")     observations.push("an increased heart rate (" + hr + " bpm)");
        if (ps.sysBP === "low")   observations.push("a low systolic blood pressure (" + sysBP + " mmHg)");
        if (ps.lactate === "high") observations.push("elevated blood lactate (" + lactate + " mmol/L)");
        if (ps.hr === "low")      observations.push("a bradycardic heart rate (" + hr + " bpm)");
        if (ps.spo2 === "normal" && ps.hr === "normal" && ps.rr === "normal") {
            observations.push("vital signs that remain within reference ranges");
        }

        if (observations.length > 0) {
            const joined = observations.length === 1
                ? observations[0]
                : observations.slice(0, -1).join(", ") + " and " + observations[observations.length - 1];
            parts.push(`The assessment identifies ${joined}.`);
        }

        if (o2Device !== "none") {
            parts.push(`Supplemental oxygen support is currently in use (<em>${o2Device}</em>).`);
        }

        // Temporal context if multiple observations
        if (this.labObservations.length > 1) {
            parts.push(`This assessment is based on <strong>${this.labObservations.length} temporal observations</strong>, providing a trajectory-informed risk estimate.`);
        }

        // AI model conclusion
        parts.push(`The AI model estimates a risk probability of <strong>${score.toFixed(1)}%</strong>, classified as <strong>${emoji} ${stateCode.replace("_", " ").toUpperCase()}</strong>.`);

        return parts.join(" ");
    }

    _statusBadge(status) {
        if (status === "high")   return `<span style="color:#f97316;font-weight:700;">↑ Elevated</span>`;
        if (status === "low")    return `<span style="color:#00bbf9;font-weight:700;">↓ Reduced</span>`;
        return `<span style="color:#10b981;font-weight:700;">→ Normal</span>`;
    }

    _paramInterpretation(key, status, val) {
        const interpretations = {
            hr: {
                high: "Heart rate is above the reference range — increased cardiac demand detected.",
                low:  "Heart rate is below the reference range — bradycardia detected.",
                normal: "Heart rate is within the expected reference range."
            },
            rr: {
                high: "Respiratory rate is above the expected reference range — increased breathing effort observed.",
                low:  "Respiratory rate is below the expected reference range.",
                normal: "Respiratory rate is within the expected reference range."
            },
            sysBP: {
                high: "Systolic blood pressure is above the reference range — elevated arterial pressure detected.",
                low:  "Systolic blood pressure is below the reference range — hypotension detected.",
                normal: "Systolic blood pressure is within the expected reference range."
            },
            diaBP: {
                high: "Diastolic pressure is above the reference range.",
                low:  "Diastolic pressure is below the reference range.",
                normal: "Diastolic pressure is within the expected reference range."
            },
            temp: {
                high: "Temperature is above 37.5 °C — a febrile state is detected.",
                low:  "Temperature is below the expected normal range — possible hypothermia.",
                normal: "No significant temperature abnormality detected."
            },
            spo2: {
                high: "Oxygen saturation is within the normal range.",
                low:  "Reduced oxygen saturation detected — below the expected reference threshold.",
                normal: "Oxygen saturation is within the expected reference range."
            },
            lactate: {
                high: "Blood lactate is elevated above 2.0 mmol/L — increased metabolic burden observed.",
                low:  "Blood lactate is within the normal range.",
                normal: "Blood lactate is within the expected reference range."
            },
            wbc: {
                high: "White blood cell count is elevated — an inflammatory or infectious process may be present.",
                low:  "White blood cell count is below the reference range.",
                normal: "White blood cell count is within the expected reference range."
            },
            creatinine: {
                high: "Creatinine is above the reference range — possible renal function variation detected.",
                low:  "Creatinine is within or below the normal range.",
                normal: "Creatinine is within the expected reference range."
            },
            crp: {
                high: "CRP is elevated above 10 mg/L — an inflammatory response pattern is observed.",
                low:  "CRP is within the normal range.",
                normal: "CRP is within the expected reference range."
            }
        };
        return (interpretations[key] && interpretations[key][status]) || "Value assessed.";
    }

    _buildParamTable(hr, rr, sysBP, diaBP, temp, spo2, lactate, wbc, creatinine, crp, ps, refs) {
        const rows = [
            { key: "spo2",       label: "SpO₂",              val: spo2,       unit: refs.spo2.unit,       status: ps.spo2 },
            { key: "hr",         label: "Heart Rate",         val: hr,         unit: refs.hr.unit,         status: ps.hr },
            { key: "rr",         label: "Respiratory Rate",   val: rr,         unit: refs.rr.unit,         status: ps.rr },
            { key: "sysBP",      label: "Systolic BP",        val: sysBP,      unit: refs.sysBP.unit,      status: ps.sysBP },
            { key: "diaBP",      label: "Diastolic BP",       val: diaBP,      unit: refs.diaBP.unit,      status: ps.diaBP },
            { key: "temp",       label: "Temperature",        val: temp,       unit: refs.temp.unit,       status: ps.temp },
            { key: "lactate",    label: "Lactate",            val: lactate,    unit: refs.lactate.unit,    status: ps.lactate },
            { key: "wbc",        label: "WBC Count",          val: wbc,        unit: refs.wbc.unit,        status: ps.wbc },
            { key: "creatinine", label: "Creatinine",         val: creatinine, unit: refs.creatinine.unit, status: ps.creatinine },
            { key: "crp",        label: "CRP",                val: crp,        unit: refs.crp.unit,        status: ps.crp }
        ];

        return rows.map(r => `
            <tr style="${r.status !== 'normal' ? 'background: rgba(249, 115, 22, 0.06);' : ''}">
                <td style="font-weight: 600; color: var(--text-primary);">${r.label}</td>
                <td style="font-family: var(--font-mono); color: var(--cyan-accent);">${r.val} <small style="color:var(--text-muted);">${r.unit}</small></td>
                <td>${this._statusBadge(r.status)}</td>
                <td style="font-size: 0.78rem; color: var(--text-secondary);">${this._paramInterpretation(r.key, r.status, r.val)}</td>
            </tr>
        `).join("");
    }

    _buildTemporalTrends(currentHR, currentRR, currentSpo2, currentLactate) {
        const obs = this.labObservations;
        const n = obs.length;

        if (n < 2) {
            return `<div style="background: rgba(30,41,59,0.4); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem; font-size: 0.8rem; color: var(--text-muted);">
                Only one observation available. Add more observations via the Temporal Sequence Builder to see trend analysis.
            </div>`;
        }

        const trendAnalysis = (values, currentVal, label, unit, badDir) => {
            const all = [...values, currentVal];
            const seq = all.join(" → ");
            const first = all[0], last = all[all.length - 1];
            const delta = last - first;
            const threshold = label === "SpO₂" ? 1 : (label === "Lactate" ? 0.3 : 2);
            let trendIcon, trendLabel, trendClass, interpretation;

            if (Math.abs(delta) < threshold) {
                trendIcon = "→"; trendLabel = "Stable"; trendClass = "color:#10b981";
                interpretation = `${label} has remained relatively stable across the observation window.`;
            } else if (delta > 0) {
                trendIcon = "↑"; trendLabel = "Progressive increase"; 
                trendClass = badDir === "high" ? "color:#ef4444" : "color:#10b981";
                interpretation = badDir === "high"
                    ? `${label} shows a progressive <strong>increasing trend</strong> across the recorded observations.`
                    : `${label} shows a progressive increasing trend — an improving pattern.`;
            } else {
                trendIcon = "↓"; trendLabel = "Progressive decrease";
                trendClass = badDir === "low" ? "color:#ef4444" : "color:#10b981";
                interpretation = badDir === "low"
                    ? `${label} shows a progressive <strong>decreasing trend</strong> across the recorded observations.`
                    : `${label} shows a progressive decreasing trend — an improving direction.`;
            }

            return `
                <div style="background: rgba(30,41,59,0.4); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 0.9rem; font-size: 0.8rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                        <span style="font-weight: 700; color: var(--text-primary);">${label}</span>
                        <span style="${trendClass}; font-weight: 700;">${trendIcon} ${trendLabel}</span>
                    </div>
                    <div style="font-family: var(--font-mono); color: var(--cyan-accent); font-size: 0.78rem; margin-bottom: 0.3rem;">${seq} ${unit}</div>
                    <div style="color: var(--text-secondary);">${interpretation}</div>
                </div>
            `;
        };

        const hrVals    = obs.map(o => o.hr);
        const spo2Vals  = obs.map(o => o.spo2);
        const rrVals    = obs.map(o => o.rr);
        const lacVals   = obs.map(o => o.lactate);

        return [
            trendAnalysis(spo2Vals,  currentSpo2,   "SpO₂",       "%",        "low"),
            trendAnalysis(hrVals,    currentHR,     "Heart Rate",  "bpm",      "high"),
            trendAnalysis(rrVals,    currentRR,     "Resp. Rate",  "/min",     "high"),
            trendAnalysis(lacVals,   currentLactate,"Lactate",     "mmol/L",   "high")
        ].join("");
    }

    _buildRiskExplanation(stateCode, factors, ps, hr, rr, spo2, lactate) {
        // If model provided contributing factors, use them
        if (factors && factors.length > 0) {
            const topFactors = factors.slice(0, 3);
            const factorDesc = topFactors.map(f => `<strong>${f.label}</strong> (${f.value} ${f.unit}, ${f.percentage}% model impact)`).join(", ");
            return `Based on the ML model's contributing factor analysis, the predicted risk is primarily associated with: ${factorDesc}. 
            <br><br><em style="color:var(--text-muted); font-size:0.75rem;">These impact values are derived from the model's local feature contribution analysis applied to the current patient observation.</em>`;
        }

        // Fallback: use observed abnormalities
        const abnormalObs = [];
        if (ps.spo2 === "low")     abnormalObs.push("reduced SpO₂ (" + spo2 + "%)");
        if (ps.rr === "high")      abnormalObs.push("elevated respiratory rate (" + rr + " /min)");
        if (ps.hr === "high")      abnormalObs.push("elevated heart rate (" + hr + " bpm)");
        if (ps.lactate === "high") abnormalObs.push("elevated blood lactate (" + lactate + " mmol/L)");

        const n = this.labObservations.length;
        const temporalNote = n > 1 ? ` observed across ${n} temporal measurement points` : "";

        if (abnormalObs.length === 0) {
            return `No major parameter abnormalities were detected. The AI model estimated a risk score based on the combination of all entered clinical parameters and patient demographics.
            <br><br><em style="color:var(--text-muted); font-size:0.75rem;">Observed factors associated with the current patient state (no explainability method available).</em>`;
        }

        const joined = abnormalObs.slice(0, -1).join(", ") + (abnormalObs.length > 1 ? " and " : "") + abnormalObs[abnormalObs.length - 1];
        return `The predicted risk is primarily associated with the combination of ${joined}${temporalNote}.
        <br><br><em style="color:var(--text-muted); font-size:0.75rem;">Observed factors associated with the current patient state (no formal SHAP/explainability method available — based on detected parameter abnormalities).</em>`;
    }

    _buildMonitoringRecommendation(stateCode) {
        const recommendations = {
            stable:    "Continue routine monitoring and observe future changes in vital signs. No urgent variation detected at this time.",
            watch:     "Closer monitoring of the observed vital-sign variations is recommended. Trend evolution should be tracked at regular intervals.",
            at_risk:   "The temporal evolution indicates that the patient should be closely monitored for further physiological deterioration. Vital-sign frequency review is advised.",
            high_risk: "The current AI risk estimation indicates the need for increased clinical attention and close monitoring. Continuous vital-sign surveillance is advised."
        };
        return recommendations[stateCode] || recommendations.watch;
    }

    _buildSummaryBox(stateText, score, stateCode, abnormalParams, ps, hr, rr, spo2, lactate) {
        // State label element
        const sumBoxState = document.getElementById("sumBoxState");
        const sumBoxScore = document.getElementById("sumBoxScore");
        const sumBoxLevel = document.getElementById("sumBoxLevel");
        const sumBoxObsList = document.getElementById("sumBoxObsList");

        if (sumBoxState) sumBoxState.textContent = stateText;
        if (sumBoxScore) {
            sumBoxScore.textContent = score.toFixed(1) + "%";
            sumBoxScore.style.color = score >= 70 ? "#ef4444" : (score >= 45 ? "#f97316" : (score >= 20 ? "#f59e0b" : "#10b981"));
        }

        const monitoringLevels = {
            stable:    "Routine monitoring",
            watch:     "Closer monitoring recommended",
            at_risk:   "Increased monitoring recommended",
            high_risk: "Continuous monitoring — high clinical attention"
        };
        if (sumBoxLevel) {
            sumBoxLevel.textContent = monitoringLevels[stateCode] || "Monitoring recommended";
            sumBoxLevel.style.color = stateCode === "stable" ? "#10b981" : (stateCode === "high_risk" ? "#ef4444" : "#f59e0b");
        }

        // Temporal pattern description
        const n = this.labObservations.length;
        const trendItems = [];

        if (n > 1) {
            const firstSpo2 = this.labObservations[0].spo2, lastSpo2 = spo2;
            const firstHR   = this.labObservations[0].hr,   lastHR   = hr;
            const firstRR   = this.labObservations[0].rr,   lastRR   = rr;
            const firstLac  = this.labObservations[0].lactate, lastLac = lactate;

            if (lastSpo2 < firstSpo2 - 1) trendItems.push("SpO₂ decreasing trend");
            if (lastHR   > firstHR   + 2) trendItems.push("Heart rate increasing trend");
            if (lastRR   > firstRR   + 1) trendItems.push("Respiratory rate increasing trend");
            if (lastLac  > firstLac  + 0.3) trendItems.push("Lactate increasing trend");
        }

        // Current abnormal parameters
        const paramLabels = { hr: "Heart rate elevated", rr: "Respiratory rate elevated", spo2: "SpO₂ reduced",
            sysBP: "Systolic BP low", temp: "Temperature abnormal", lactate: "Lactate elevated",
            wbc: "WBC elevated", creatinine: "Creatinine elevated", crp: "CRP elevated" };
        const abnormalObs = abnormalParams.map(([key]) => paramLabels[key] || key).slice(0, 4);
        const allObs = [...new Set([...abnormalObs, ...trendItems])].slice(0, 5);

        if (sumBoxObsList) {
            if (allObs.length === 0) {
                sumBoxObsList.innerHTML = "<li>All vital signs within reference range</li>";
            } else {
                sumBoxObsList.innerHTML = allObs.map(o => `<li>${o}</li>`).join("");
            }
        }

        // Temporal pattern summary box
        let temporalPatternEl = document.getElementById("sumBoxTemporalPattern");
        if (temporalPatternEl) {
            if (n < 2) {
                temporalPatternEl.textContent = "Single observation — no temporal trend available";
            } else if (trendItems.length === 0) {
                temporalPatternEl.textContent = "Stable physiological pattern across observations";
            } else if (trendItems.length >= 2) {
                temporalPatternEl.textContent = "Progressive multi-parameter physiological change";
            } else {
                temporalPatternEl.textContent = "Isolated parameter variation detected";
            }
        }
    }

    renderPredictionHistory() {
        const body = document.getElementById("historyTableBody");
        if (!body) return;

        if (this.predictionHistory.length === 0) {
            body.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No predictions recorded in this session.</td></tr>';
            return;
        }

        body.innerHTML = this.predictionHistory.map(item => `
            <tr>
                <td style="font-family: var(--font-mono);">${item.time}</td>
                <td><span class="risk-state-tag state-${item.stateCode}">${item.category}</span></td>
                <td style="font-weight: 700; font-family: var(--font-mono);">${item.score}</td>
                <td>${item.vitals}</td>
                <td>${item.obsCount} Observations</td>
            </tr>
        `).join("");
    }

    setupEventListeners() {
        const dropdown = document.getElementById("patientSelect");
        if (dropdown) {
            dropdown.addEventListener("change", (e) => {
                this.loadPatientData(e.target.value);
            });
        }

        const form = document.getElementById("inputForm");
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.handleManualOverride();
            });
        }
    }

    async handleManualOverride() {
        if (!this.currentPatient || !this.currentPatient.timeline) return;

        const hr = parseFloat(document.getElementById("inHR").value);
        const spo2 = parseFloat(document.getElementById("inSpo2").value);
        const rr = parseFloat(document.getElementById("inRR").value);
        const sysBP = parseFloat(document.getElementById("inSysBP").value);
        const diaBP = parseFloat(document.getElementById("inDiaBP").value);
        const temp = parseFloat(document.getElementById("inTemp").value);
        const lactate = parseFloat(document.getElementById("inLactate").value);
        const wbc = parseFloat(document.getElementById("inWBC").value);
        const creatinine = parseFloat(document.getElementById("inCreatinine").value);
        const crp = parseFloat(document.getElementById("inCRP").value);
        const o2Dev = document.getElementById("inO2Device").value;
        const o2Flow = parseFloat(document.getElementById("inO2Flow").value);

        const currentStep = this.currentPatient.timeline[this.currentHour];
        
        const overrideData = {
            ...currentStep,
            heart_rate: hr,
            spo2_pct: spo2,
            respiratory_rate: rr,
            systolic_bp: sysBP,
            diastolic_bp: diaBP,
            temperature_c: temp,
            lactate: lactate,
            wbc_count: wbc,
            creatinine: creatinine,
            crp_level: crp,
            oxygen_device: o2Dev,
            oxygen_flow: o2Flow
        };

        const pred = await ApiClient.predict(overrideData);
        if (pred) {
            overrideData.risk_score = pred.risk_score;
            overrideData.raw_probability = pred.raw_probability;
            overrideData.clinical_state = pred.clinical_state;
            overrideData.clinical_state_code = pred.clinical_state_code;
            overrideData.contributing_factors = pred.contributing_factors;

            this.currentPatient.timeline[this.currentHour] = overrideData;
            this.onHourChange(this.currentHour);
        }
    }
}

// Instantiate and launch on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    window.app = new DigitalTwinApp();
    window.app.init();
});
