/**
 * Real-Time Simulation Engine & Time-Series Slider Scrubber
 */

class SimulationEngine {
    constructor(onHourChange) {
        this.currentHour = 0;
        this.maxHours = 11;
        this.isPlaying = false;
        this.speed = 1;
        this.intervalId = null;
        this.onHourChange = onHourChange;
    }

    init() {
        this.renderSliderTicks();
        this.setupEventListeners();
    }

    renderSliderTicks() {
        const ticksContainer = document.getElementById("sliderTicks");
        if (!ticksContainer) return;

        ticksContainer.innerHTML = "";
        for (let i = 0; i <= this.maxHours; i++) {
            const tick = document.createElement("span");
            tick.className = `slider-tick ${i === this.currentHour ? "active" : ""}`;
            tick.textContent = `H${i}`;
            tick.addEventListener("click", () => this.setHour(i));
            ticksContainer.appendChild(tick);
        }
    }

    setupEventListeners() {
        const slider = document.getElementById("timelineSlider");
        if (slider) {
            slider.addEventListener("input", (e) => {
                this.setHour(parseInt(e.target.value, 10));
            });
        }

        const btnPlay = document.getElementById("btnPlaySim");
        const btnPause = document.getElementById("btnPauseSim");
        const btnReset = document.getElementById("btnResetSim");

        if (btnPlay) btnPlay.addEventListener("click", () => this.start());
        if (btnPause) btnPause.addEventListener("click", () => this.pause());
        if (btnReset) btnReset.addEventListener("click", () => this.reset());

        const speedBtns = document.querySelectorAll(".speed-btn");
        speedBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                speedBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.speed = parseInt(btn.dataset.speed, 10);
                if (this.isPlaying) {
                    this.pause();
                    this.start();
                }
            });
        });
    }

    setHour(hour) {
        this.currentHour = Math.max(0, Math.min(hour, this.maxHours));
        
        const slider = document.getElementById("timelineSlider");
        if (slider) slider.value = this.currentHour;

        const label = document.getElementById("currentHourLabel");
        if (label) label.textContent = `Hour ${this.currentHour} of ${this.maxHours}`;

        // Update tick highlight
        const ticks = document.querySelectorAll(".slider-tick");
        ticks.forEach((tick, idx) => {
            tick.classList.toggle("active", idx === this.currentHour);
        });

        if (this.onHourChange) {
            this.onHourChange(this.currentHour);
        }
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        const btnPlay = document.getElementById("btnPlaySim");
        const btnPause = document.getElementById("btnPauseSim");
        if (btnPlay) btnPlay.disabled = true;
        if (btnPause) btnPause.disabled = false;

        const stepDelay = 1500 / this.speed;

        this.intervalId = setInterval(() => {
            if (this.currentHour >= this.maxHours) {
                this.pause();
                return;
            }
            this.setHour(this.currentHour + 1);
        }, stepDelay);
    }

    pause() {
        this.isPlaying = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        const btnPlay = document.getElementById("btnPlaySim");
        const btnPause = document.getElementById("btnPauseSim");
        if (btnPlay) btnPlay.disabled = false;
        if (btnPause) btnPause.disabled = true;
    }

    reset() {
        this.pause();
        this.setHour(0);
    }
}

window.SimulationEngine = SimulationEngine;
