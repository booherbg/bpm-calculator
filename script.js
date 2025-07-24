class BPMCalculator {
    constructor() {
        this.tapTimes = [];
        this.activeTapButton = null;
        this.tapStartTime = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateBPMTable();
        this.populateSelectOptions();
    }

    initializeElements() {
        this.currentBPMInput = document.getElementById('current-bpm');
        this.nextBPMInput = document.getElementById('next-bpm');
        this.currentTapBtn = document.getElementById('current-tap-btn');
        this.tapArea = document.getElementById('tap-area');
        this.percentageDisplay = document.getElementById('percentage-display');
        this.directionDisplay = document.getElementById('direction');
        this.tapSection = document.getElementById('tap-section');
        this.tapCount = document.getElementById('tap-count');
        this.tapBPM = document.getElementById('tap-bpm');
        this.resetTapBtn = document.getElementById('reset-tap-btn');
        this.tableBody = document.getElementById('table-body');
        this.tableCurrentSelect = document.getElementById('table-current');
        this.tableNextSelect = document.getElementById('table-next');
        this.rangeStart = document.getElementById('range-start');
        this.rangeEnd = document.getElementById('range-end');
        this.rangeStep = document.getElementById('range-step');
        this.generateTableBtn = document.getElementById('generate-table-btn');
    }

    setupEventListeners() {
        // BPM input listeners
        this.currentBPMInput.addEventListener('input', () => this.calculatePercentage());
        this.nextBPMInput.addEventListener('input', () => this.calculatePercentage());

        // Tap tempo listeners - for current track button and pitch display area
        this.currentTapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.tap();
        });

        this.tapArea.addEventListener('click', (e) => {
            e.preventDefault();
            this.tap();
        });

        // Reset button
        this.resetTapBtn.addEventListener('click', () => {
            this.resetTapTempo();
        });

        // Table controls
        this.generateTableBtn.addEventListener('click', () => this.generateBPMTable());
        this.tableCurrentSelect.addEventListener('change', () => this.filterTable());
        this.tableNextSelect.addEventListener('change', () => this.filterTable());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.tap();
            }
        });
    }

    calculatePercentage() {
        const current = parseFloat(this.currentBPMInput.value) || 0;
        const next = parseFloat(this.nextBPMInput.value) || 0;

        if (current > 0 && next > 0) {
            const percentage = ((next - current) / current) * 100;
            const roundedPercentage = Math.round(percentage * 10) / 10;
            
            this.percentageDisplay.textContent = `${roundedPercentage > 0 ? '+' : ''}${roundedPercentage}%`;
            
            if (roundedPercentage > 0) {
                this.directionDisplay.textContent = 'Speed up the incoming track';
                this.percentageDisplay.style.color = '#28a745';
            } else if (roundedPercentage < 0) {
                this.directionDisplay.textContent = 'Slow down the incoming track';
                this.percentageDisplay.style.color = '#dc3545';
            } else {
                this.directionDisplay.textContent = 'Perfect match - no adjustment needed';
                this.percentageDisplay.style.color = '#6c757d';
            }
        } else {
            this.percentageDisplay.textContent = '0%';
            this.directionDisplay.textContent = 'Set both BPMs to calculate';
            this.percentageDisplay.style.color = 'inherit';
        }
    }

    startTapTempo() {
        console.log('Starting tap tempo');
        
        this.tapTimes = [];
        this.tapStartTime = Date.now();
        this.activeTapButton = 'current';
        
        // Update button state
        this.currentTapBtn.classList.add('active');
        
        this.showTapSection();
        this.updateTapDisplay();
        
        console.log('Tap tempo started');
    }

    resetTapTempo() {
        console.log('Resetting tap tempo');
        
        this.tapTimes = [];
        this.tapStartTime = null;
        this.activeTapButton = null;
        
        // Update button state
        this.currentTapBtn.classList.remove('active');
        
        this.hideTapSection();
        this.updateTapDisplay();
    }

    tap() {
        const now = Date.now();
        
        // Check if it's been more than 3 seconds since last tap
        if (this.tapTimes.length > 0) {
            const timeSinceLastTap = now - this.tapTimes[this.tapTimes.length - 1];
            if (timeSinceLastTap > 3000) {
                console.log('More than 3 seconds since last tap, resetting');
                this.resetTapTempo();
            }
        }
        
        // Start tap tempo if not already active
        if (!this.activeTapButton) {
            this.startTapTempo();
        }
        
        this.tapTimes.push(now);
        console.log('Tap recorded, total taps:', this.tapTimes.length);
        
        // Keep only the last 8 taps for accuracy
        if (this.tapTimes.length > 8) {
            this.tapTimes = this.tapTimes.slice(-8);
        }
        
        this.updateTapDisplay();
        
        // Calculate BPM if we have at least 2 taps
        if (this.tapTimes.length >= 2) {
            const bpm = this.calculateBPM();
            console.log('Calculated BPM:', bpm);
            if (bpm > 0) {
                this.setBPM(bpm);
            }
        }
        
        // Visual feedback - briefly flash both tap areas
        this.currentTapBtn.style.transform = 'scale(0.95)';
        this.tapArea.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.currentTapBtn.style.transform = '';
            this.tapArea.style.transform = '';
        }, 100);
    }

    calculateBPM() {
        if (this.tapTimes.length < 2) return 0;
        
        // Calculate intervals between taps
        const intervals = [];
        for (let i = 1; i < this.tapTimes.length; i++) {
            intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
        }
        
        // Calculate average interval
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        
        // Convert to BPM (60 seconds / interval in milliseconds * 1000)
        const bpm = (60 * 1000) / avgInterval;
        
        // Filter out unrealistic BPM values
        if (bpm >= 60 && bpm <= 200) {
            return Math.round(bpm * 10) / 10; // Round to 1 decimal place
        }
        
        return 0;
    }

    setBPM(bpm) {
        this.currentBPMInput.value = bpm;
        this.calculatePercentage();
    }

    showTapSection() {
        this.tapSection.style.display = 'block';
    }

    hideTapSection() {
        this.tapSection.style.display = 'none';
    }

    updateTapDisplay() {
        this.tapCount.textContent = this.tapTimes.length;
        
        const bpm = this.calculateBPM();
        this.tapBPM.textContent = bpm > 0 ? bpm : '0';
    }

    generateBPMTable() {
        const start = parseInt(this.rangeStart.value) || 80;
        const end = parseInt(this.rangeEnd.value) || 140;
        const step = parseInt(this.rangeStep.value) || 1;
        
        // Validate range
        if (start >= end) {
            alert('Start BPM must be less than End BPM');
            return;
        }
        
        if (end - start > 100) {
            alert('Range too large. Please use a smaller range or larger step size.');
            return;
        }
        
        const bpmRange = [];
        for (let bpm = start; bpm <= end; bpm += step) {
            bpmRange.push(bpm);
        }

        let tableHTML = '';
        let rowCount = 0;
        
        for (let current of bpmRange) {
            for (let next of bpmRange) {
                if (current !== next) {
                    const percentage = ((next - current) / current) * 100;
                    const roundedPercentage = Math.round(percentage * 10) / 10;
                    
                    let percentageClass = 'pitch-zero';
                    if (roundedPercentage > 0) {
                        percentageClass = 'pitch-positive';
                    } else if (roundedPercentage < 0) {
                        percentageClass = 'pitch-negative';
                    }
                    
                    tableHTML += `
                        <tr data-current="${current}" data-next="${next}">
                            <td>${current}</td>
                            <td>${next}</td>
                            <td class="${percentageClass}">${roundedPercentage > 0 ? '+' : ''}${roundedPercentage}%</td>
                        </tr>
                    `;
                    rowCount++;
                    
                    // Limit table size for performance
                    if (rowCount > 1000) {
                        tableHTML += `<tr><td colspan="3" style="text-align: center; color: #666; font-style: italic;">Table truncated for performance. Use smaller range or larger step size.</td></tr>`;
                        break;
                    }
                }
            }
            if (rowCount > 1000) break;
        }
        
        this.tableBody.innerHTML = tableHTML;
        this.populateSelectOptions();
    }

    populateSelectOptions() {
        const start = parseInt(this.rangeStart.value) || 80;
        const end = parseInt(this.rangeEnd.value) || 140;
        const step = parseInt(this.rangeStep.value) || 1;
        
        const bpmOptions = [];
        for (let bpm = start; bpm <= end; bpm += step) {
            bpmOptions.push(`<option value="${bpm}">${bpm}</option>`);
        }
        
        const optionsHTML = '<option value="">All BPMs</option>' + bpmOptions.join('');
        this.tableCurrentSelect.innerHTML = optionsHTML;
        this.tableNextSelect.innerHTML = optionsHTML;
    }

    filterTable() {
        const currentFilter = this.tableCurrentSelect.value;
        const nextFilter = this.tableNextSelect.value;
        
        const rows = this.tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const currentBPM = row.getAttribute('data-current');
            const nextBPM = row.getAttribute('data-next');
            
            if (!currentBPM || !nextBPM) return; // Skip non-data rows
            
            const currentMatch = !currentFilter || currentBPM === currentFilter;
            const nextMatch = !nextFilter || nextBPM === nextFilter;
            
            if (currentMatch && nextMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BPMCalculator();
}); 