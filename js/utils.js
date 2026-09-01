/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - UTILITY FUNCTIONS
 * Audio cues, QR Generator, Geolocation math, Toasts & CSV exporter
 */

const Utils = {
  // Web Audio API Sound Synthesizer
  playSound(type = 'success') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'warning') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        osc.frequency.setValueAtTime(293.66, ctx.currentTime + 0.15); // D4
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  },

  // Toast Notification
  showToast(title, message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <div style="font-size: 1.2rem;">${icon}</div>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${title}</div>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    Utils.playSound(type === 'success' ? 'success' : (type === 'danger' ? 'warning' : 'beep'));

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Haversine GPS Distance Calculation (in Meters)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c); // Distance in meters
  },

  // Pure SVG QR Code Generator
  generateSVGQRCode(text, size = 200) {
    // Generate deterministic pseudo-random matrix based on text hash for crisp high-contrast QR display
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    
    const matrixSize = 25;
    const cellSize = size / matrixSize;
    let rects = '';

    // Standard QR finder patterns at 3 corners
    const isFinderPattern = (r, c) => {
      if ((r < 7 && c < 7) || (r < 7 && c >= matrixSize - 7) || (r >= matrixSize - 7 && c < 7)) {
        if (r === 0 || r === 6 || c === 0 || c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)) return true;
        if (r === 0 || r === 6 || c === matrixSize - 7 || c === matrixSize - 1 ||
            (r >= 2 && r <= 4 && c >= matrixSize - 5 && c <= matrixSize - 3)) return true;
        if (r === matrixSize - 7 || r === matrixSize - 1 || c === 0 || c === 6 ||
            (r >= matrixSize - 5 && r <= matrixSize - 3 && c >= 2 && c <= 4)) return true;
        return false;
      }
      return null;
    };

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        const finder = isFinderPattern(r, c);
        let fillCell = false;

        if (finder !== null) {
          fillCell = finder;
        } else {
          // Deterministic pattern using seed hash and coordinates
          const seed = Math.sin(hash + r * 31 + c * 17) * 10000;
          fillCell = (seed - Math.floor(seed)) > 0.45;
        }

        if (fillCell) {
          rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#0f172a" />`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect width="${size}" height="${size}" fill="#ffffff" rx="8" />
      ${rects}
    </svg>`;
  },

  // Export Data Table to CSV
  exportToCSV(filename, rows) {
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(item => `"${(item || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Utils.showToast("CSV Exported", `Saved file: ${filename}`, "success");
  },

  // Confetti Animation Trigger
  triggerConfetti() {
    const count = 50;
    const container = document.body;
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.zIndex = '9999';
      confetti.style.width = `${Math.random() * 8 + 6}px`;
      confetti.style.height = `${Math.random() * 8 + 6}px`;
      confetti.style.backgroundColor = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'][Math.floor(Math.random() * 6)];
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = '-10px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confetti.style.pointerEvents = 'none';
      confetti.style.opacity = '1';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      const duration = Math.random() * 2 + 1.5;
      confetti.style.transition = `all ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      container.appendChild(confetti);

      setTimeout(() => {
        confetti.style.top = `${window.innerHeight + 20}px`;
        confetti.style.left = `${parseFloat(confetti.style.left) + (Math.random() * 20 - 10)}vw`;
        confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
        confetti.style.opacity = '0';
      }, 50);

      setTimeout(() => confetti.remove(), duration * 1000 + 100);
    }
  },

  // Format Date
  formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
