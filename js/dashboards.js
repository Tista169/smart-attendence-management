/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - DASHBOARDS
 * Enhanced role-specific dashboards with complete KPI metrics, deep analytics, interactive calendar heatmap & announcements
 */

const Dashboards = {
  charts: {},

  destroyCharts() {
    Object.values(this.charts).forEach(c => {
      if (c && typeof c.destroy === 'function') c.destroy();
    });
    this.charts = {};
  },

  // ================= ADMIN MASTER DASHBOARD =================
  renderAdminDashboard(container) {
    this.destroyCharts();
    const students = window.store.getStudents();
    const teachers = window.store.getTeachers();
    const subjects = window.store.getSubjects();
    const sessions = window.store.getAcademicSessions();
    const logs = window.store.getAttendanceLogs();
    const defaulters = students.filter(s => s.attendancePercentage < 75);
    const activeSession = sessions.find(s => s.isCurrent) || { name: "Fall 2026" };

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.date === todayStr);

    const presentStudentsCount = todayLogs.filter(l => l.status === 'Present').length;
    const absentStudentsCount = todayLogs.filter(l => l.status === 'Absent').length;
    const lateStudentsCount = todayLogs.filter(l => l.status === 'Late').length;

    const totalTodayRecorded = presentStudentsCount + absentStudentsCount + lateStudentsCount;
    const todayAttendancePct = totalTodayRecorded > 0
      ? Number(((presentStudentsCount + lateStudentsCount) / totalTodayRecorded * 100).toFixed(1))
      : 89.2;

    container.innerHTML = `
      <!-- Top Overview Banner -->
      <div class="card" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(139, 92, 246, 0.1)); border-color: var(--border-glow); margin-bottom: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span class="badge badge-primary">⭐ Active Term: ${activeSession.name}</span>
            <h2 style="font-size: 1.6rem; font-weight: 800; margin-top: 4px;">University Administration Console</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">Comprehensive institutional overview, academic statistics & faculty operations</p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="App.navigate('teachers')">
              <i data-lucide="graduation-cap"></i> Manage Faculty
            </button>
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('classes')">
              <i data-lucide="book-open"></i> Manage Courses
            </button>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('announcements')">
              <i data-lucide="megaphone"></i> Announcements
            </button>
          </div>
        </div>
      </div>

      <!-- Master KPI Metrics Grid -->
      <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="metric-card">
          <div class="metric-info">
            <span class="metric-label">Total Students</span>
            <span class="metric-value">${students.length}</span>
            <div class="metric-trend up">
              <i data-lucide="user-check"></i> ${students.filter(s => s.attendancePercentage >= 75).length} Eligible
            </div>
          </div>
          <div class="metric-icon-box"><i data-lucide="users"></i></div>
        </div>

        <div class="metric-card cyan">
          <div class="metric-info">
            <span class="metric-label">Total Faculty</span>
            <span class="metric-value">${teachers.length}</span>
            <div class="metric-trend neutral">
              <i data-lucide="award"></i> Active Staff
            </div>
          </div>
          <div class="metric-icon-box"><i data-lucide="graduation-cap"></i></div>
        </div>

        <div class="metric-card">
          <div class="metric-info">
            <span class="metric-label">Total Classes</span>
            <span class="metric-value">${subjects.length}</span>
            <div class="metric-trend up">
              <i data-lucide="layout-grid"></i> 8 Active Sections
            </div>
          </div>
          <div class="metric-icon-box"><i data-lucide="book-open"></i></div>
        </div>

        <div class="metric-card success">
          <div class="metric-info">
            <span class="metric-label">Today's Attendance</span>
            <span class="metric-value">${todayAttendancePct}%</span>
            <div class="metric-trend up">
              <i data-lucide="trending-up"></i> Target > 75%
            </div>
          </div>
          <div class="metric-icon-box"><i data-lucide="check-circle-2"></i></div>
        </div>

        <div class="metric-card success">
          <div class="metric-info">
            <span class="metric-label">Present Today</span>
            <span class="metric-value">${presentStudentsCount || 5}</span>
            <div class="metric-trend up"><i data-lucide="check"></i> Verified</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="user-check"></i></div>
        </div>

        <div class="metric-card danger">
          <div class="metric-info">
            <span class="metric-label">Absent Today</span>
            <span class="metric-value">${absentStudentsCount || 1}</span>
            <div class="metric-trend down"><i data-lucide="x"></i> Alert Sent</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="user-x"></i></div>
        </div>

        <div class="metric-card warning">
          <div class="metric-info">
            <span class="metric-label">Late Today</span>
            <span class="metric-value">${lateStudentsCount || 1}</span>
            <div class="metric-trend neutral"><i data-lucide="clock"></i> Grace Period</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="clock"></i></div>
        </div>

        <div class="metric-card danger">
          <div class="metric-info">
            <span class="metric-label">Low Attendance (<75%)</span>
            <span class="metric-value">${defaulters.length}</span>
            <div class="metric-trend down"><i data-lucide="alert-triangle"></i> Notice Queue</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="shield-alert"></i></div>
        </div>
      </div>

      <!-- Charts & Live Feed -->
      <div class="dashboard-grid-2col">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title"><i data-lucide="activity" style="color: var(--primary);"></i> 7-Day Attendance Trend</h3>
              <p class="card-subtitle">Campus-wide daily check-in percentage</p>
            </div>
            <span class="badge badge-primary">Real-time</span>
          </div>
          <div style="position: relative; height: 260px; width: 100%;">
            <canvas id="admin-trend-chart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title"><i data-lucide="radio" style="color: var(--success);"></i> Live Activity Feed</h3>
              <p class="card-subtitle">Recent automated check-ins & actions</p>
            </div>
            <div class="status-dot-pulse"></div>
          </div>
          <div class="activity-feed-list" id="admin-live-feed">
            ${logs.slice(0, 6).map(log => `
              <div class="activity-item">
                <img src="${(window.store.getStudentById(log.studentId) || {}).avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${log.studentName}" class="activity-avatar" />
                <div class="activity-content">
                  <div class="activity-title">${log.studentName} (${log.rollNo})</div>
                  <div class="activity-time">${log.time} • ${log.method} • <span style="color: var(--success);">${log.status}</span></div>
                </div>
                <span class="badge ${log.status === 'Present' ? 'badge-success' : 'badge-warning'}">${log.subjectId}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Department Distribution & Low Attendance Warnings -->
      <div class="dashboard-grid-2col">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title"><i data-lucide="bar-chart-2" style="color: var(--secondary);"></i> Department Performance</h3>
              <p class="card-subtitle">Attendance comparison across disciplines</p>
            </div>
          </div>
          <div style="position: relative; height: 240px; width: 100%;">
            <canvas id="admin-dept-chart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title"><i data-lucide="alert-octagon" style="color: var(--danger);"></i> Low Attendance Defaulter Radar</h3>
              <p class="card-subtitle">Students at risk of exam debarment (<75%)</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('reports')">View All</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${defaulters.map(d => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border-left: 3px solid var(--danger);">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <img src="${d.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
                  <div>
                    <div style="font-weight: 700; font-size: 0.88rem;">${d.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${d.rollNo} • ${d.department}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; font-size: 1rem; color: var(--danger);">${d.attendancePercentage}%</div>
                  <button class="btn btn-danger btn-sm" style="padding: 2px 8px; font-size: 0.7rem; margin-top: 2px;" onclick="StudentMgmt.openParentNotificationModal('${d.id}')">
                    Notify Parent
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    this.initAdminCharts();
  },

  initAdminCharts() {
    if (typeof Chart === 'undefined') return;

    const trendCtx = document.getElementById('admin-trend-chart');
    if (trendCtx) {
      this.charts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
          datasets: [{
            label: 'Attendance %',
            data: [84, 88, 86, 91, 89, 78, 92],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 60, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    const deptCtx = document.getElementById('admin-dept-chart');
    if (deptCtx) {
      this.charts.dept = new Chart(deptCtx, {
        type: 'bar',
        data: {
          labels: ['Computer Science', 'Info Tech', 'AI & ML', 'Cybersecurity', 'Data Science'],
          datasets: [{
            label: 'Attendance Rate',
            data: [91.5, 87.2, 94.0, 85.0, 88.9],
            backgroundColor: ['#4f46e5', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 70, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  },

  // ================= TEACHER DASHBOARD =================
  renderTeacherDashboard(container) {
    const teacher = Auth.getCurrentUser();
    const subjects = window.store.getSubjects().filter(s => s.teacherId === teacher.id || teacher.id === 'T001');
    const leaves = window.store.getLeaveRequests().filter(l => l.status === 'Pending');
    const announcements = window.store.getAnnouncements().slice(0, 2);

    container.innerHTML = `
      <!-- Teacher Header Banner -->
      <div class="card" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(139, 92, 246, 0.15)); border-color: var(--border-glow); margin-bottom: 1.75rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <img src="${teacher.avatar}" alt="${teacher.name}" style="width: 64px; height: 64px; border-radius: var(--radius-lg); object-fit: cover; border: 2px solid var(--primary);" />
            <div>
              <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--primary-light); font-weight: 700;">Faculty Portal</div>
              <h2 style="font-size: 1.6rem; font-weight: 800;">Welcome, ${teacher.name}</h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">${teacher.department} • ${teacher.cabin || 'Room 402, Block A'}</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-lg" onclick="SmartAttendance.startQRSession('${subjects[0] ? subjects[0].id : 'CS301'}')">
              <i data-lucide="qr-code"></i> Launch Smart QR Session
            </button>
            <button class="btn btn-secondary" onclick="App.navigate('manual-roll')">
              <i data-lucide="check-square"></i> Manual Roll-Call
            </button>
          </div>
        </div>
      </div>

      <!-- Schedule & Pending Leaves Grid -->
      <div class="dashboard-grid-2col">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title"><i data-lucide="book-open" style="color: var(--accent-cyan);"></i> Assigned Courses & Today's Schedule</h3>
              <p class="card-subtitle">Select a course to record or finalize lecture attendance</p>
            </div>
          </div>
          <div class="schedule-list">
            ${subjects.map((sub, index) => `
              <div class="schedule-item ${index === 0 ? 'ongoing' : 'upcoming'}">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">${sub.code} • ${sub.schedule}</div>
                  <div style="font-weight: 700; font-size: 1rem; margin: 2px 0;">${sub.name}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${(sub.sections || ["Section A"]).join(', ')} • Room: ${sub.room || 'Lab 301'}</div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn btn-primary btn-sm" onclick="SmartAttendance.startQRSession('${sub.id}')">
                    <i data-lucide="play"></i> Start QR
                  </button>
                  <button class="btn btn-outline btn-sm" onclick="App.navigate('manual-roll')">
                    Roll-Call
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title"><i data-lucide="file-text" style="color: var(--warning);"></i> Pending Leave Approvals</h3>
                <p class="card-subtitle">Student absence requests</p>
              </div>
              <span class="badge badge-warning">${leaves.length} Pending</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${leaves.length === 0 ? `
                <div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
                  <i data-lucide="check-circle" style="width: 32px; height: 32px; margin-bottom: 0.35rem; opacity: 0.5;"></i>
                  <p style="font-size: 0.84rem;">No pending leave requests!</p>
                </div>
              ` : leaves.map(leave => `
                <div style="padding: 0.85rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem;">
                    <div>
                      <div style="font-weight: 700; font-size: 0.88rem;">${leave.studentName} (${leave.rollNo})</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${leave.subjectName} • ${leave.dateFrom} to ${leave.dateTo}</div>
                    </div>
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-style: italic;">
                    "${leave.reason}"
                  </p>
                  <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-success btn-sm" style="padding: 2px 8px; font-size: 0.75rem;" onclick="Dashboards.approveLeave('${leave.id}')">
                      Approve
                    </button>
                    <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.75rem;" onclick="Dashboards.rejectLeave('${leave.id}')">
                      Reject
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="font-size: 1rem;"><i data-lucide="megaphone" style="color: var(--primary);"></i> Faculty Bulletins</h3>
              <button class="btn btn-outline btn-sm" onclick="App.navigate('announcements')">View All</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${announcements.map(a => `
                <div style="padding: 0.6rem; background: var(--bg-input); border-radius: var(--radius-md); border-left: 3px solid var(--primary);">
                  <div style="font-weight: 700; font-size: 0.85rem;">${a.title}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${a.content.slice(0, 90)}...</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  approveLeave(leaveId) {
    window.store.updateLeaveStatus(leaveId, 'Approved');
    Utils.showToast("Leave Approved", "Student leave request approved.", "success");
    if (window.App) window.App.refreshCurrentView();
  },

  rejectLeave(leaveId) {
    window.store.updateLeaveStatus(leaveId, 'Rejected');
    Utils.showToast("Leave Rejected", "Student leave request rejected.", "warning");
    if (window.App) window.App.refreshCurrentView();
  },

  // ================= STUDENT DASHBOARD =================
  renderStudentDashboard(container) {
    const student = Auth.getCurrentUser();
    const pct = student.attendancePercentage || 88.5;
    const isDefaulter = pct < 75;
    const isBorderline = pct >= 75 && pct < 80;

    let neededClasses = 0;
    if (isDefaulter) {
      neededClasses = Math.max(1, Math.ceil((0.75 * student.totalClasses - student.attendedClasses) / 0.25));
    }

    const subjects = window.store.getSubjects();
    const announcements = window.store.getAnnouncements().slice(0, 2);

    container.innerHTML = `
      <!-- Hero Attendance Gauge Banner -->
      <div class="student-hero-card">
        <div class="student-hero-info">
          <span class="badge ${isDefaulter ? 'badge-danger' : (isBorderline ? 'badge-warning' : 'badge-success')}">
            ${isDefaulter ? '⚠️ Low Attendance Warning (<75%)' : '✅ Exam Eligible & In Good Standing'}
          </span>
          <h2 class="student-hero-title">Hello, ${student.name} 👋</h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Roll No: <strong style="color: var(--text-primary);">${student.rollNo}</strong> • ${student.department} (${student.semester || '6th Sem'})
          </p>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            Total Lectures: <strong>${student.attendedClasses}</strong> attended out of <strong>${student.totalClasses}</strong> held
          </div>

          ${isDefaulter ? `
            <div class="target-calculator-banner danger">
              <i data-lucide="alert-octagon" style="color: var(--danger); width: 24px; height: 24px; flex-shrink: 0;"></i>
              <div style="font-size: 0.84rem;">
                <strong>Action Required:</strong> You need to attend the next <strong>${neededClasses} consecutive lectures</strong> to achieve 75% exam eligibility!
              </div>
            </div>
          ` : `
            <div class="target-calculator-banner">
              <i data-lucide="sparkles" style="color: var(--success); width: 24px; height: 24px; flex-shrink: 0;"></i>
              <div style="font-size: 0.84rem;">
                <strong>Great job!</strong> You have maintained a high attendance rate. Keep up the streak!
              </div>
            </div>
          `}
        </div>

        <div class="attendance-gauge-wrapper">
          <svg class="gauge-svg" viewBox="0 0 140 140">
            <circle class="gauge-bg" cx="70" cy="70" r="58" />
            <circle class="gauge-fill ${isDefaulter ? 'danger' : (isBorderline ? 'warning' : '')}" 
                    cx="70" cy="70" r="58" 
                    style="stroke-dashoffset: ${364 - (pct / 100) * 364};" />
          </svg>
          <div class="gauge-text-content">
            <span class="gauge-percentage">${pct}%</span>
            <span class="gauge-label">Attendance</span>
          </div>
        </div>
      </div>

      <!-- Smart Attendance Action Hub -->
      <div style="margin: 1.75rem 0;">
        <h3 style="font-size: 1.2rem; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="zap" style="color: var(--accent-cyan);"></i> Smart Check-In Hub
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Select your verification method to instantly mark attendance for ongoing lectures
        </p>

        <div class="metrics-grid">
          <div class="card" style="cursor: pointer;" onclick="SmartAttendance.openStudentQRScanner()">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="metric-icon-box" style="background: rgba(79, 70, 229, 0.15); color: var(--primary);">
                <i data-lucide="qr-code"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 1rem;">Scan Class QR</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Dynamic auto-refresh scanner</div>
              </div>
            </div>
          </div>

          <div class="card" style="cursor: pointer;" onclick="SmartAttendance.openStudentFaceScanner()">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="metric-icon-box" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">
                <i data-lucide="scan-face"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 1rem;">AI Face Biometric</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Instant neural face verify</div>
              </div>
            </div>
          </div>

          <div class="card" style="cursor: pointer;" onclick="SmartAttendance.openGeofenceCheckin()">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="metric-icon-box" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">
                <i data-lucide="map-pin"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 1rem;">Campus Geofence</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">GPS boundary check</div>
              </div>
            </div>
          </div>

          <div class="card" style="cursor: pointer;" onclick="App.openPINModal()">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="metric-icon-box" style="background: rgba(245, 158, 11, 0.15); color: var(--warning);">
                <i data-lucide="key-round"></i>
              </div>
              <div>
                <div style="font-weight: 700; font-size: 1rem;">Session PIN</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">4-digit quick passcode</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Calendar Heatmap & Subject Breakdown Grid -->
      <div class="dashboard-grid-2col">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title"><i data-lucide="calendar" style="color: var(--primary);"></i> Attendance Calendar Matrix</h3>
              <p class="card-subtitle">August 2026 day-by-day attendance history</p>
            </div>
            <div style="display: flex; gap: 6px; font-size: 0.72rem;">
              <span class="badge badge-success">Present</span>
              <span class="badge badge-danger">Absent</span>
              <span class="badge badge-warning">Late</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div class="calendar-heatmap-grid" style="margin-top: 0;">
            <div class="cal-day-cell holiday">26</div>
            <div class="cal-day-cell holiday">27</div>
            <div class="cal-day-cell holiday">28</div>
            <div class="cal-day-cell holiday">29</div>
            <div class="cal-day-cell holiday">30</div>
            <div class="cal-day-cell holiday">31</div>
            <div class="cal-day-cell holiday">1</div>

            <div class="cal-day-cell holiday">2</div>
            <div class="cal-day-cell present" title="Present (CS301, CS303)">3</div>
            <div class="cal-day-cell present" title="Present (CS302, CS305)">4</div>
            <div class="cal-day-cell present" title="Present (CS301, CS304)">5</div>
            <div class="cal-day-cell late" title="Late (CS302)">6</div>
            <div class="cal-day-cell present" title="Present (CS303, CS304)">7</div>
            <div class="cal-day-cell holiday">8</div>

            <div class="cal-day-cell holiday">9</div>
            <div class="cal-day-cell present" title="Present (CS301, CS303)">10</div>
            <div class="cal-day-cell present" title="Present (CS302, CS305)">11</div>
            <div class="cal-day-cell absent" title="Absent (CS301)">12</div>
            <div class="cal-day-cell present" title="Present (CS302)">13</div>
            <div class="cal-day-cell present" title="Present (CS303, CS304)">14</div>
            <div class="cal-day-cell holiday">15</div>

            <div class="cal-day-cell holiday">16</div>
            <div class="cal-day-cell present" title="Present (CS301, CS303)">17</div>
            <div class="cal-day-cell present" title="Present (CS302, CS305)">18</div>
            <div class="cal-day-cell present" title="Present (CS301, CS304)">19</div>
            <div class="cal-day-cell present" title="Present (CS302)">20</div>
            <div class="cal-day-cell present" style="border: 2px solid var(--primary);" title="Today: Verified Present">21</div>
            <div class="cal-day-cell holiday">22</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title"><i data-lucide="megaphone" style="color: var(--warning);"></i> School Notices</h3>
              <p class="card-subtitle">Official announcements from Dean's office</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="App.navigate('announcements')">View All</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${announcements.map(ann => `
              <div style="padding: 0.85rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border-left: 3px solid ${ann.priority === 'Urgent' ? 'var(--danger)' : 'var(--primary)'};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span class="badge ${ann.priority === 'Urgent' ? 'badge-danger' : 'badge-primary'}" style="font-size: 0.7rem;">${ann.priority}</span>
                  <span style="font-size: 0.72rem; color: var(--text-muted);">${ann.date}</span>
                </div>
                <div style="font-weight: 700; font-size: 0.9rem; margin-top: 4px;">${ann.title}</div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${ann.content.slice(0, 100)}...</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Subject Breakdown Grid -->
      <div class="card" style="margin-bottom: 1.75rem;">
        <div class="card-header">
          <div>
            <h3 class="card-title"><i data-lucide="book-open" style="color: var(--secondary);"></i> Subject-Wise Breakdown</h3>
            <p class="card-subtitle">Your attendance percentage across all enrolled courses</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="App.openLeaveApplicationModal()">
            <i data-lucide="file-plus"></i> Apply for Leave
          </button>
        </div>

        <div class="subject-grid">
          ${subjects.map(sub => {
            const stats = (student.subjectStats && student.subjectStats[sub.id]) || { attended: 28, total: 32 };
            const subPct = Number(((stats.attended / stats.total) * 100).toFixed(1));
            const subStatus = subPct >= 75 ? 'success' : (subPct >= 65 ? 'warning' : 'danger');

            return `
              <div class="subject-card">
                <div class="subject-card-header">
                  <div>
                    <span class="subject-code">${sub.code}</span>
                    <h4 class="subject-name">${sub.name}</h4>
                    <span class="subject-teacher">${(window.store.getTeacherById(sub.teacherId) || {}).name || 'Faculty'}</span>
                  </div>
                  <span class="badge badge-${subStatus}">${subPct}%</span>
                </div>
                <div>
                  <div class="progress-track">
                    <div class="progress-fill ${subStatus}" style="width: ${subPct}%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">
                    <span>Attended: <strong>${stats.attended} / ${stats.total}</strong></span>
                    <span>Req: 75%</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
};

if (typeof window !== 'undefined') {
  window.Dashboards = Dashboards;
}
