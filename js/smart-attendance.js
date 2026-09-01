/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - SMART ATTENDANCE ENGINE
 * Dynamic QR with 10s Token Refresh, Camera Scanner, AI Face Recognition HUD, Geofencing, Fast Roll Call & Finalize Lock
 */

const SmartAttendance = {
  activeSession: null,
  qrInterval: null,
  qrCountdown: 10,
  videoStream: null,

  // Start Dynamic QR Session (Teacher)
  startQRSession(subjectId = 'CS301', section = 'Section A', date = null) {
    const subject = window.store.getSubjectById(subjectId) || window.store.getSubjects()[0];
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const sessionDate = date || new Date().toISOString().split('T')[0];

    this.activeSession = {
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      section: section,
      date: sessionDate,
      pin: pin,
      startTime: new Date().toLocaleTimeString(),
      token: `AUTH-${subject.id}-${Date.now().toString(36).toUpperCase()}`,
      attendees: []
    };

    this.qrCountdown = 10;
    this.renderQRPresenterModal();
    this.startQRRotation();
  },

  // QR Code Token Rotation Timer (10 Seconds)
  startQRRotation() {
    if (this.qrInterval) clearInterval(this.qrInterval);

    const updateQRDisplay = () => {
      if (!this.activeSession) return;
      
      if (this.qrCountdown <= 0) {
        this.qrCountdown = 10;
        this.activeSession.token = `SEC-${this.activeSession.subjectId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }

      const qrContainer = document.getElementById('active-qr-canvas');
      const hashDisplay = document.getElementById('active-token-hash');
      const timerProgress = document.getElementById('qr-timer-progress');
      const timerNumber = document.getElementById('qr-timer-number');

      if (qrContainer && hashDisplay && timerProgress && timerNumber) {
        const qrPayload = JSON.stringify({
          subjectId: this.activeSession.subjectId,
          section: this.activeSession.section,
          token: this.activeSession.token,
          pin: this.activeSession.pin,
          timestamp: Date.now()
        });

        qrContainer.innerHTML = Utils.generateSVGQRCode(qrPayload, 230);
        hashDisplay.textContent = this.activeSession.token;
        timerNumber.textContent = this.qrCountdown;
        
        const offset = 100 - (this.qrCountdown / 10) * 100;
        timerProgress.style.strokeDashoffset = offset;
        
        if (this.qrCountdown <= 3) {
          timerProgress.style.stroke = 'var(--danger)';
        } else {
          timerProgress.style.stroke = 'var(--accent-cyan)';
        }
      }

      this.qrCountdown--;
    };

    updateQRDisplay();
    this.qrInterval = setInterval(updateQRDisplay, 1000);
  },

  stopSession() {
    if (this.qrInterval) {
      clearInterval(this.qrInterval);
      this.qrInterval = null;
    }
    this.activeSession = null;
    this.stopCamera();
  },

  renderQRPresenterModal() {
    if (!this.activeSession) return;
    const modal = document.getElementById('qr-presenter-modal');
    if (!modal) return;

    const subject = window.store.getSubjectById(this.activeSession.subjectId);

    document.getElementById('modal-session-title').textContent = `${subject.code}: ${subject.name} (${this.activeSession.section})`;
    document.getElementById('modal-session-pin').textContent = this.activeSession.pin;
    
    this.updateModalAttendees();
    modal.classList.add('active');
  },

  updateModalAttendees() {
    const listContainer = document.getElementById('modal-scanned-attendees');
    const countBadge = document.getElementById('modal-scanned-count');
    if (!listContainer || !countBadge) return;

    const today = (this.activeSession && this.activeSession.date) ? this.activeSession.date : new Date().toISOString().split('T')[0];
    const todayLogs = window.store.getAttendanceLogs().filter(
      l => l.subjectId === (this.activeSession ? this.activeSession.subjectId : 'CS301') && l.date === today && l.status === 'Present'
    );

    countBadge.textContent = `${todayLogs.length} Checked In`;
    listContainer.innerHTML = todayLogs.slice(0, 8).map(log => {
      const student = window.store.getStudentById(log.studentId);
      const avatar = student ? student.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
      return `<img src="${avatar}" alt="${log.studentName}" title="${log.studentName} (${log.time})" />`;
    }).join('');
  },

  // Student Smart Check-in (QR Code Scan)
  openStudentQRScanner() {
    const modal = document.getElementById('student-qr-modal');
    if (!modal) return;
    modal.classList.add('active');
    this.startCamera('student-qr-video');
  },

  // Student AI Biometric Face Recognition
  openStudentFaceScanner() {
    const modal = document.getElementById('student-face-modal');
    if (!modal) return;
    modal.classList.add('active');
    this.startCamera('student-face-video');
    this.simulateFaceRecognitionScan();
  },

  // Geolocation Validation Modal
  openGeofenceCheckin() {
    const modal = document.getElementById('student-geofence-modal');
    if (!modal) return;
    modal.classList.add('active');
    this.runGeofenceVerification();
  },

  // Camera Management (WebRTC)
  async startCamera(videoElementId) {
    const video = document.getElementById(videoElementId);
    if (!video) return;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        this.videoStream = stream;
        video.srcObject = stream;
        video.play();
      }
    } catch (err) {
      console.warn("Camera access unavailable, running simulation fallback:", err);
      video.poster = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
    }
  },

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  },

  simulateFaceRecognitionScan() {
    const statusText = document.getElementById('face-scan-status-text');
    const gaugeFill = document.getElementById('face-confidence-fill');
    const confidenceText = document.getElementById('face-confidence-text');
    const student = Auth.getCurrentUser();

    if (!statusText || !gaugeFill || !confidenceText) return;

    statusText.textContent = "Detecting face landmarks & depth mesh...";
    gaugeFill.style.width = "25%";
    confidenceText.textContent = "25%";

    setTimeout(() => {
      statusText.textContent = "Analyzing liveness & eye blink patterns...";
      gaugeFill.style.width = "65%";
      confidenceText.textContent = "65%";
    }, 1000);

    setTimeout(() => {
      statusText.textContent = `Matching biometric profile with ${student.name}...`;
      gaugeFill.style.width = "99.4%";
      confidenceText.textContent = "99.4% (Verified)";
    }, 2000);

    setTimeout(() => {
      this.recordSuccessfulCheckIn({
        method: 'AI Face Scan',
        confidence: 99.4,
        status: 'Present'
      });
      document.getElementById('student-face-modal').classList.remove('active');
      this.stopCamera();
    }, 2800);
  },

  runGeofenceVerification() {
    const statusEl = document.getElementById('geofence-status-text');
    const distanceEl = document.getElementById('geofence-distance-text');
    const campusConfig = window.store.getGeofence();

    if (!statusEl || !distanceEl) return;

    statusEl.textContent = "Acquiring high-accuracy GPS coordinates...";
    
    setTimeout(() => {
      const mockUserLat = campusConfig.centerLat + 0.00012;
      const mockUserLng = campusConfig.centerLng + 0.00010;
      const distance = Utils.calculateDistance(campusConfig.centerLat, campusConfig.centerLng, mockUserLat, mockUserLng);

      distanceEl.textContent = `${distance}m from classroom center (Allowed: ${campusConfig.radiusMeters}m)`;

      if (distance <= campusConfig.radiusMeters) {
        statusEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">✅ In Campus Radius (${campusConfig.campusName})</span>`;
      } else {
        statusEl.innerHTML = `<span style="color: var(--danger); font-weight: 700;">❌ Outside Campus Geofence Boundary</span>`;
      }
    }, 1200);
  },

  recordSuccessfulCheckIn({ method = 'Dynamic QR', confidence = 99.0, status = 'Present' } = {}) {
    const currentUser = Auth.getCurrentUser();
    const studentId = currentUser.id || 'S101';
    const subjectId = (this.activeSession && this.activeSession.subjectId) ? this.activeSession.subjectId : 'CS301';
    const section = (this.activeSession && this.activeSession.section) ? this.activeSession.section : 'Section A';

    const log = window.store.markAttendance({
      studentId,
      subjectId,
      section,
      status,
      method,
      geofenceVerified: true,
      confidence
    });

    Utils.playSound('success');
    Utils.triggerConfetti();
    Utils.showToast("Attendance Confirmed! 🎉", `Marked ${status} for ${subjectId} via ${method}`, "success");

    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    this.stopCamera();
    this.updateModalAttendees();

    if (window.App && typeof window.App.refreshCurrentView === 'function') {
      window.App.refreshCurrentView();
    }
  },

  // Teacher Fast Manual Roll-Call View Renderer
  renderManualRollCall(containerId, subjectId = 'CS301', section = 'Section A', date = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const subjects = window.store.getSubjects();
    const students = window.store.getStudents();
    const selectedDate = date || new Date().toISOString().split('T')[0];
    const todayLogs = window.store.getAttendanceLogs().filter(l => l.subjectId === subjectId && l.date === selectedDate);
    const isLocked = todayLogs.length > 0 && todayLogs.every(l => l.isFinalized);

    let html = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="check-square" style="color: var(--primary);"></i> Lecture Roll-Call & Attendance Session
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">Select Class, Section, Subject, and Date to record attendance records</p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            ${isLocked ? `
              <span class="badge badge-success" style="font-size: 0.88rem; padding: 8px 14px;">
                <i data-lucide="lock"></i> Session Locked & Finalized
              </span>
            ` : `
              <button class="btn btn-primary" onclick="SmartAttendance.finalizeSession('${subjectId}', '${section}', '${selectedDate}')">
                <i data-lucide="lock"></i> Finalize & Lock Attendance
              </button>
            `}
            <button class="btn btn-secondary" onclick="SmartAttendance.startQRSession('${subjectId}', '${section}', '${selectedDate}')">
              <i data-lucide="qr-code"></i> Launch QR Code
            </button>
          </div>
        </div>

        <!-- Class, Section, Subject & Date Filters -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.25rem;">
          <div>
            <label class="form-label">Subject / Course</label>
            <select class="form-control" id="roll-subject-select" onchange="SmartAttendance.updateRollFilters()">
              ${subjects.map(s => `<option value="${s.id}" ${s.id === subjectId ? 'selected' : ''}>${s.code}: ${s.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Section</label>
            <select class="form-control" id="roll-section-select" onchange="SmartAttendance.updateRollFilters()">
              <option value="Section A" ${section === 'Section A' ? 'selected' : ''}>Section A</option>
              <option value="Section B" ${section === 'Section B' ? 'selected' : ''}>Section B</option>
              <option value="Section C" ${section === 'Section C' ? 'selected' : ''}>Section C</option>
            </select>
          </div>
          <div>
            <label class="form-label">Attendance Date</label>
            <input type="date" class="form-control" id="roll-date-input" value="${selectedDate}" onchange="SmartAttendance.updateRollFilters()" />
          </div>
          <div style="display: flex; align-items: flex-end; gap: 0.5rem;">
            <button class="btn btn-success btn-sm" onclick="SmartAttendance.markAllStudents('${subjectId}', '${section}', 'Present')">
              Mark All Present
            </button>
            <button class="btn btn-outline btn-sm" onclick="SmartAttendance.markAllStudents('${subjectId}', '${section}', 'Absent')">
              All Absent
            </button>
          </div>
        </div>
      </div>

      <div class="roll-call-grid">
    `;

    students.forEach(student => {
      const studentLog = todayLogs.find(l => l.studentId === student.id);
      const currentStatus = studentLog ? studentLog.status : 'Unrecorded';

      html += `
        <div class="roll-call-card">
          <div class="student-mini-info">
            <img src="${student.avatar}" alt="${student.name}" class="student-mini-avatar" />
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                ${student.name}
              </div>
              <div style="font-size: 0.76rem; color: var(--text-muted);">${student.rollNo} • ${student.attendancePercentage}%</div>
            </div>
          </div>
          <div class="status-toggle-group">
            <button class="status-toggle-btn present ${currentStatus === 'Present' ? 'active' : ''}" onclick="SmartAttendance.setStudentStatus('${student.id}', '${subjectId}', '${section}', 'Present')">P</button>
            <button class="status-toggle-btn late ${currentStatus === 'Late' ? 'active' : ''}" onclick="SmartAttendance.setStudentStatus('${student.id}', '${subjectId}', '${section}', 'Late')">L</button>
            <button class="status-toggle-btn absent ${currentStatus === 'Absent' ? 'active' : ''}" onclick="SmartAttendance.setStudentStatus('${student.id}', '${subjectId}', '${section}', 'Absent')">A</button>
            <button class="status-toggle-btn excused ${currentStatus === 'Excused' ? 'active' : ''}" onclick="SmartAttendance.setStudentStatus('${student.id}', '${subjectId}', '${section}', 'Excused')">E</button>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  },

  updateRollFilters() {
    const sub = document.getElementById('roll-subject-select').value;
    const sec = document.getElementById('roll-section-select').value;
    const date = document.getElementById('roll-date-input').value;
    this.renderManualRollCall('manual-roll-call-container', sub, sec, date);
  },

  setStudentStatus(studentId, subjectId, section, status) {
    window.store.markAttendance({
      studentId,
      subjectId,
      section,
      status,
      method: 'Teacher Manual Roll-Call',
      geofenceVerified: true,
      confidence: 100
    });
    const date = document.getElementById('roll-date-input')?.value || new Date().toISOString().split('T')[0];
    this.renderManualRollCall('manual-roll-call-container', subjectId, section, date);
    Utils.showToast("Updated", `Marked ${status}`, "info", 1200);
  },

  markAllStudents(subjectId, section, status) {
    const students = window.store.getStudents();
    students.forEach(s => {
      window.store.markAttendance({
        studentId: s.id,
        subjectId,
        section,
        status,
        method: 'Batch Manual Roll-Call',
        geofenceVerified: true,
        confidence: 100
      });
    });
    const date = document.getElementById('roll-date-input')?.value || new Date().toISOString().split('T')[0];
    this.renderManualRollCall('manual-roll-call-container', subjectId, section, date);
    Utils.showToast("Batch Updated", `All students marked as ${status}`, "success");
  },

  finalizeSession(subjectId, section, date) {
    const teacher = Auth.getCurrentUser();
    window.store.finalizeAttendanceSession({ subjectId, section, date, teacherId: teacher.id });
    Utils.showToast("Session Finalized! 🔒", "Attendance locked and recorded in system audit log.", "success");
    this.renderManualRollCall('manual-roll-call-container', subjectId, section, date);
  }
};

if (typeof window !== 'undefined') {
  window.SmartAttendance = SmartAttendance;
}
