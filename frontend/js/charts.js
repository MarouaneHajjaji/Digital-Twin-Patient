/**
 * Temporal Charts Engine (Chart.js wrapper)
 * Manages Vitals Trajectories, Risk Evolution, and Dedicated View Line Charts.
 */

class ClinicalCharts {
    constructor() {
        this.riskChart = null;
        this.vitalsChart = null;
        this.hrTimelineChart = null;
        this.spo2TimelineChart = null;
        this.currentTab = "vitals";
        this.timelineData = [];
        this.selectedHour = 0;
    }

    init() {
        this.initRiskChart();
        this.initVitalsChart();
        this.initDedicatedTimelineCharts();
        this.setupTabs();
    }

    initRiskChart() {
        const ctx = document.getElementById("riskEvolutionChart")?.getContext("2d");
        if (!ctx) return;

        this.riskChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: Array.from({ length: 12 }, (_, i) => `H${i}`),
                datasets: [{
                    label: "Risk Score (%)",
                    data: new Array(12).fill(0),
                    borderColor: "#00f5d4",
                    borderWidth: 3,
                    fill: true,
                    backgroundColor: (context) => {
                        const bg = context.chart.ctx.createLinearGradient(0, 0, 0, 150);
                        bg.addColorStop(0, "rgba(0, 245, 212, 0.3)");
                        bg.addColorStop(1, "rgba(0, 245, 212, 0.0)");
                        return bg;
                    },
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: "#00f5d4"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        titleColor: "#00f5d4",
                        bodyFont: { family: "JetBrains Mono" }
                    }
                },
                scales: {
                    x: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#94a3b8", font: { size: 10 } }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#94a3b8", font: { size: 10 } }
                    }
                }
            }
        });
    }

    initVitalsChart() {
        const ctx = document.getElementById("temporalVitalsChart")?.getContext("2d");
        if (!ctx) return;

        this.vitalsChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: Array.from({ length: 12 }, (_, i) => `H${i}`),
                datasets: [
                    {
                        label: "Heart Rate (BPM)",
                        data: new Array(12).fill(75),
                        borderColor: "#ef4444",
                        backgroundColor: "transparent",
                        tension: 0.3
                    },
                    {
                        label: "SpO₂ (%)",
                        data: new Array(12).fill(98),
                        borderColor: "#00bbf9",
                        backgroundColor: "transparent",
                        tension: 0.3
                    },
                    {
                        label: "Resp. Rate (/min)",
                        data: new Array(12).fill(16),
                        borderColor: "#00f5d4",
                        backgroundColor: "transparent",
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: {
                        labels: { color: "#f8fafc", font: { size: 11 } }
                    },
                    tooltip: {
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderWidth: 1,
                        bodyFont: { family: "JetBrains Mono" }
                    }
                },
                scales: {
                    x: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#94a3b8" }
                    },
                    y: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#94a3b8" }
                    }
                }
            }
        });
    }

    initDedicatedTimelineCharts() {
        const ctxHR = document.getElementById("chartHRTimeline")?.getContext("2d");
        if (ctxHR) {
            this.hrTimelineChart = new Chart(ctxHR, {
                type: "line",
                data: {
                    labels: Array.from({ length: 12 }, (_, i) => `H${i}`),
                    datasets: [{
                        label: "Heart Rate (BPM)",
                        data: new Array(12).fill(75),
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8" } },
                        y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8" } }
                    }
                }
            });
        }

        const ctxSpo2 = document.getElementById("chartSpo2Timeline")?.getContext("2d");
        if (ctxSpo2) {
            this.spo2TimelineChart = new Chart(ctxSpo2, {
                type: "line",
                data: {
                    labels: Array.from({ length: 12 }, (_, i) => `H${i}`),
                    datasets: [
                        {
                            label: "SpO₂ (%)",
                            data: new Array(12).fill(98),
                            borderColor: "#00bbf9",
                            backgroundColor: "rgba(0, 187, 249, 0.1)",
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: "Resp Rate (/min)",
                            data: new Array(12).fill(16),
                            borderColor: "#00f5d4",
                            backgroundColor: "transparent",
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8" } },
                        y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#94a3b8" } }
                    }
                }
            });
        }
    }

    setupTabs() {
        // SCOPED STRICTLY TO CHART TABS WITH data-chart ATTRIBUTE
        const chartTabs = document.querySelectorAll(".chart-tab[data-chart]");
        chartTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                chartTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                this.currentTab = tab.dataset.chart || "vitals";
                this.updateVitalsChart();
            });
        });
    }

    updateData(timeline, selectedHour = 0) {
        if (!timeline || !timeline.length) return;
        this.timelineData = timeline;
        this.selectedHour = selectedHour;
        this.updateRiskChart();
        this.updateVitalsChart();
        this.updateDedicatedTimelineCharts();
    }

    updateRiskChart() {
        if (!this.riskChart || !this.timelineData.length) return;

        const risks = this.timelineData.map(step => step.risk_score || 0);
        this.riskChart.data.datasets[0].data = risks;

        const currentRisk = risks[this.selectedHour] || 0;
        let color = "#10b981";
        if (currentRisk >= 70) color = "#ef4444";
        else if (currentRisk >= 45) color = "#f97316";
        else if (currentRisk >= 20) color = "#f59e0b";

        this.riskChart.data.datasets[0].borderColor = color;
        this.riskChart.data.datasets[0].pointBackgroundColor = risks.map((_, i) => i === this.selectedHour ? "#ffffff" : color);
        this.riskChart.data.datasets[0].pointRadius = risks.map((_, i) => i === this.selectedHour ? 7 : 3);
        
        this.riskChart.update();
    }

    updateVitalsChart() {
        if (!this.vitalsChart || !this.timelineData.length) return;

        const labels = this.timelineData.map(step => `H${step.hour_from_admission}`);

        let datasets = [];
        const activeTab = this.currentTab || "vitals";

        if (activeTab === "vitals") {
            datasets = [
                {
                    label: "Heart Rate (BPM)",
                    data: this.timelineData.map(s => s.heart_rate),
                    borderColor: "#ef4444",
                    backgroundColor: "transparent",
                    tension: 0.3
                },
                {
                    label: "SpO₂ (%)",
                    data: this.timelineData.map(s => s.spo2_pct),
                    borderColor: "#00bbf9",
                    backgroundColor: "transparent",
                    tension: 0.3
                },
                {
                    label: "Resp. Rate (/min)",
                    data: this.timelineData.map(s => s.respiratory_rate),
                    borderColor: "#00f5d4",
                    backgroundColor: "transparent",
                    tension: 0.3
                }
            ];
        } else if (activeTab === "bp") {
            datasets = [
                {
                    label: "Systolic BP (mmHg)",
                    data: this.timelineData.map(s => s.systolic_bp),
                    borderColor: "#a855f7",
                    backgroundColor: "transparent",
                    tension: 0.3
                },
                {
                    label: "Diastolic BP (mmHg)",
                    data: this.timelineData.map(s => s.diastolic_bp),
                    borderColor: "#6366f1",
                    backgroundColor: "transparent",
                    tension: 0.3
                },
                {
                    label: "Temp (°C)",
                    data: this.timelineData.map(s => s.temperature_c),
                    borderColor: "#f59e0b",
                    backgroundColor: "transparent",
                    tension: 0.3
                }
            ];
        } else if (activeTab === "labs") {
            datasets = [
                {
                    label: "Lactate (mmol/L)",
                    data: this.timelineData.map(s => s.lactate),
                    borderColor: "#f97316",
                    backgroundColor: "transparent",
                    tension: 0.3
                },
                {
                    label: "WBC (x10⁹/L)",
                    data: this.timelineData.map(s => s.wbc_count),
                    borderColor: "#3b82f6",
                    backgroundColor: "transparent",
                    tension: 0.3
                },
                {
                    label: "CRP (mg/L)",
                    data: this.timelineData.map(s => s.crp_level),
                    borderColor: "#ec4899",
                    backgroundColor: "transparent",
                    tension: 0.3
                }
            ];
        } else {
            // Default fallback if any unexpected value
            datasets = [
                {
                    label: "Heart Rate (BPM)",
                    data: this.timelineData.map(s => s.heart_rate),
                    borderColor: "#ef4444",
                    backgroundColor: "transparent",
                    tension: 0.3
                }
            ];
        }

        this.vitalsChart.data.labels = labels;
        this.vitalsChart.data.datasets = datasets;
        this.vitalsChart.update();
    }

    updateDedicatedTimelineCharts() {
        if (!this.timelineData.length) return;

        const labels = this.timelineData.map(s => `H${s.hour_from_admission}`);

        if (this.hrTimelineChart) {
            this.hrTimelineChart.data.labels = labels;
            this.hrTimelineChart.data.datasets[0].data = this.timelineData.map(s => s.heart_rate);
            this.hrTimelineChart.update();
        }

        if (this.spo2TimelineChart) {
            this.spo2TimelineChart.data.labels = labels;
            this.spo2TimelineChart.data.datasets[0].data = this.timelineData.map(s => s.spo2_pct);
            this.spo2TimelineChart.data.datasets[1].data = this.timelineData.map(s => s.respiratory_rate);
            this.spo2TimelineChart.update();
        }
    }
}

window.ClinicalCharts = ClinicalCharts;
