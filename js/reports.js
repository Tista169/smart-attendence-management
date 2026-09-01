/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - REPORTS & MASTER ANALYTICS
 * Comprehensive reporting engine: Daily, Weekly, Monthly, Student-wise, Class-wise, Subject-wise, Date-range & PDF/CSV export
 */

const Reports = {
  activeReportType: 'daily', // 'daily', 'weekly', 'monthly', 'student', 'class', 'subject', 'daterange'
  filterSubject: 'all',
  filterSection: 'all',
  filterStatus: 'all',
  filterStudentId: 'all',
  startDate: '',
  endDate: '',
  filterDefaultersOnly: false,

  render(container) {
    let logs = window.store.getAttendanceLogs();
    const students = window.store.getStudents();
    const subjects = window.store.getSubjects();
    const role = Auth.getCurrentRole();

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter by Report Type
    if (this.activeReportType === 'daily') {
      logs = logs.filter(l => l.date === todayStr);
    } else if (this.activeReportType === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekStr = oneWeekAgo.toISOString().split('T')[0];
      logs = logs.filter(l => l.date >= weekStr);
    } else if (this.activeReportType === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      const monthStr = oneMonthAgo.toISOString().split('T')[0];
      logs = logs.filter(l => l.date >= monthStr);
    } else if (this.activeReportType === 'daterange') {
      if (this.startDate) logs = logs.filter(l => l.date >= this.startDate);
      if (this.endDate) logs = logs.filter(l => l.date <= this.endDate);
    } else if (this.activeReportType === 'student' && this.filterStudentId !== 'all') {
      logs = logs.filter(l => l.studentId === this.filterStudentId);
    } else if (this.activeReportType === 'subject' && this.filterSubject !== 'all') {
      logs = logs.filter(l => l.subjectId === this.filterSubject);
    }

    // Additional Criteria Filters
    if (this.filterSubject !== 'all' && this.activeReportType !== 'subject') {
      logs = logs.filter(l => l.subjectId === this.filterSubject);
    }

    if (this.filterStatus !== 'all') {
      logs = logs.filter(l => l.status === this.filterStatus);
    }

    if (this.filterDefaultersOnly) {
      const defaulterIds = students.filter(s => s.attendancePercentage < 75).map(s => s.id);
      logs = logs.filter(l => defaulterIds.includes(l.studentId));
    }

    const presentCount = logs.filter(l => l.status === 'Present').length;
    const absentCount = logs.filter(l => l.status === 'Absent').length;
    const lateCount = logs.filter(l => l.status === 'Late').length;
    const excusedCount = logs.filter(l => l.status === 'Excused').length;

    const totalRecords = logs.length;
    const attendancePct = totalRecords > 0 ? Number(((presentCount + lateCount) / totalRecords * 100).toFixed(1)) : 0;

    container.innerHTML = `
      <!-- Header & Export Actions -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="file-bar-chart" style="color: var(--primary);"></i> Attendance Reports & Master Records
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">Generate institutional attendance summaries, transcripts, audit logs & printable sheets</p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="Reports.downloadCSV()">
              <i data-lucide="download"></i> Export CSV
            </button>
            <button class="btn btn-primary" onclick="Reports.openPrintableReport()">
              <i data-lucide="printer"></i> Print Official Sheet / PDF
            </button>
          </div>
        </div>

        <!-- Report Type Tabs -->
        <div class="role-pill-group" style="margin-top: 1.25rem; overflow-x: auto; max-width: 100%;">
          <button class="role-btn ${this.activeReportType === 'daily' ? 'active' : ''}" onclick="Reports.setReportType('daily')">
            Daily Report
          </button>
          <button class="role-btn ${this.activeReportType === 'weekly' ? 'active' : ''}" onclick="Reports.setReportType('weekly')">
            Weekly Report
          </button>
          <button class="role-btn ${this.activeReportType === 'monthly' ? 'active' : ''}" onclick="Reports.setReportType('monthly')">
            Monthly Report
          </button>
          <button class="role-btn ${this.activeReportType === 'student' ? 'active' : ''}" onclick="Reports.setReportType('student')">
            Student-Wise
          </button>
          <button class="role-btn ${this.activeReportType === 'class' ? 'active' : ''}" onclick="Reports.setReportType('class')">
            Class-Wise
          </button>
          <button class="role-btn ${this.activeReportType === 'subject' ? 'active' : ''}" onclick="Reports.setReportType('subject')">
            Subject-Wise
          </button>
          <button class="role-btn ${this.activeReportType === 'daterange' ? 'active' : ''}" onclick="Reports.setReportType('daterange')">
            Date-Range
          </button>
        </div>

        <!-- Filter Controls Bar -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1.25rem;">
          ${this.activeReportType === 'student' ? `
            <div>
              <label class="form-label">Select Student</label>
              <select class="form-control" onchange="Reports.setStudentFilter(this.value)">
                <option value="all">All Students</option>
                ${students.map(s => `<option value="${s.id}" ${this.filterStudentId === s.id ? 'selected' : ''}>${s.name} (${s.rollNo})</option>`).join('')}
              </select>
            </div>
          ` : ''}

          ${this.activeReportType === 'daterange' ? `
            <div>
              <label class="form-label">Start Date</label>
              <input type="date" class="form-control" value="${this.startDate}" onchange="Reports.setDateRange(this.value, Reports.endDate)" />
            </div>
            <div>
              <label class="form-label">End Date</label>
              <input type="date" class="form-control" value="${this.endDate}" onchange="Reports.setDateRange(Reports.startDate, this.value)" />
            </div>
          ` : ''}

          <div>
            <label class="form-label">Filter by Course / Subject</label>
            <select class="form-control" onchange="Reports.setSubjectFilter(this.value)">
              <option value="all">All Subjects</option>
              ${subjects.map(s => `<option value="${s.id}" ${this.filterSubject === s.id ? 'selected' : ''}>${s.code} - ${s.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label">Filter by Status</label>
            <select class="form-control" onchange="Reports.setStatusFilter(this.value)">
              <option value="all" ${this.filterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="Present" ${this.filterStatus === 'Present' ? 'selected' : ''}>Present Only</option>
              <option value="Absent" ${this.filterStatus === 'Absent' ? 'selected' : ''}>Absent Only</option>
              <option value="Late" ${this.filterStatus === 'Late' ? 'selected' : ''}>Late Arrivals</option>
              <option value="Excused" ${this.filterStatus === 'Excused' ? 'selected' : ''}>Excused / Leave</option>
            </select>
          </div>

          <div style="display: flex; align-items: flex-end; padding-bottom: 0.25rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 600; cursor: pointer;">
              <input type="checkbox" ${this.filterDefaultersOnly ? 'checked' : ''} onchange="Reports.toggleDefaulters(this.checked)" />
              Show Defaulters (<75%) Only
            </label>
          </div>
        </div>
      </div>

      <!-- Quick Summary Statistics Breakdown -->
      <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        <div class="metric-card">
          <div class="metric-info">
            <span class="metric-label">Total Records</span>
            <span class="metric-value">${totalRecords}</span>
            <div class="metric-trend up">${attendancePct}% Attendance Rate</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="database"></i></div>
        </div>

        <div class="metric-card success">
          <div class="metric-info">
            <span class="metric-label">Present</span>
            <span class="metric-value">${presentCount}</span>
            <div class="metric-trend up"><i data-lucide="check"></i> Regular</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="check-circle-2"></i></div>
        </div>

        <div class="metric-card danger">
          <div class="metric-info">
            <span class="metric-label">Absent</span>
            <span class="metric-value">${absentCount}</span>
            <div class="metric-trend down"><i data-lucide="x"></i> Unexcused</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="x-circle"></i></div>
        </div>

        <div class="metric-card warning">
          <div class="metric-info">
            <span class="metric-label">Late</span>
            <span class="metric-value">${lateCount}</span>
            <div class="metric-trend neutral"><i data-lucide="clock"></i> Delayed</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="clock"></i></div>
        </div>

        <div class="metric-card cyan">
          <div class="metric-info">
            <span class="metric-label">Excused / Leave</span>
            <span class="metric-value">${excusedCount}</span>
            <div class="metric-trend neutral"><i data-lucide="file-check"></i> Approved</div>
          </div>
          <div class="metric-icon-box"><i data-lucide="file-text"></i></div>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Student Details</th>
              <th>Course / Section</th>
              <th>Verification Method</th>
              <th>GPS / Anti-Proxy</th>
              <th>Status</th>
              ${role === 'admin' ? '<th style="text-align: right;">Authorized Override</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${logs.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                  No attendance records found matching filters.
                </td>
              </tr>
            ` : logs.map(log => `
              <tr>
                <td>
                  <div><strong>${log.date}</strong></div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${log.time}</div>
                </td>
                <td>
                  <div style="font-weight: 700;">${log.studentName}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${log.rollNo}</div>
                </td>
                <td>
                  <span class="badge badge-primary">${log.subjectId}</span>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${log.section || 'Sec A'}</div>
                </td>
                <td>
                  <span style="font-size: 0.85rem;">${log.method}</span>
                  ${log.authorizedEdit ? `
                    <div style="font-size: 0.72rem; color: var(--accent-cyan); margin-top: 2px;" title="Overridden by ${log.authorizedEdit.authorizedBy}: ${log.authorizedEdit.reason}">
                      ✏️ Overridden
                    </div>
                  ` : ''}
                </td>
                <td>
                  ${log.geofenceVerified 
                    ? `<span class="badge badge-success"><i data-lucide="shield-check"></i> Verified</span>` 
                    : `<span class="badge badge-warning">Unchecked</span>`}
                </td>
                <td>
                  <span class="badge ${log.status === 'Present' ? 'badge-success' : (log.status === 'Late' ? 'badge-warning' : (log.status === 'Excused' ? 'badge-info' : 'badge-danger'))}">
                    ${log.status}
                  </span>
                </td>
                ${role === 'admin' ? `
                  <td style="text-align: right;">
                    <button class="btn btn-outline btn-sm" onclick="Reports.openOverrideModal('${log.id}')">
                      <i data-lucide="edit-2"></i> Edit
                    </button>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  setReportType(type) {
    this.activeReportType = type;
    this.render(document.getElementById('view-container'));
  },

  setSubjectFilter(val) {
    this.filterSubject = val;
    this.render(document.getElementById('view-container'));
  },

  setStudentFilter(val) {
    this.filterStudentId = val;
    this.render(document.getElementById('view-container'));
  },

  setDateRange(start, end) {
    this.startDate = start;
    this.endDate = end;
    this.render(document.getElementById('view-container'));
  },

  setStatusFilter(val) {
    this.filterStatus = val;
    this.render(document.getElementById('view-container'));
  },

  toggleDefaulters(val) {
    this.filterDefaultersOnly = val;
    this.render(document.getElementById('view-container'));
  },

  openOverrideModal(logId) {
    const log = window.store.getAttendanceLogs().find(l => l.id === logId);
    if (!log) return;
    const modal = document.getElementById('attendance-override-modal');
    if (!modal) return;

    document.getElementById('override-log-id').value = log.id;
    document.getElementById('override-student-name').textContent = `${log.studentName} (${log.rollNo})`;
    document.getElementById('override-subject-date').textContent = `${log.subjectId} on ${log.date}`;
    document.getElementById('override-new-status').value = log.status;
    document.getElementById('override-reason').value = '';

    modal.classList.add('active');
  },

  handleOverrideSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const logId = document.getElementById('override-log-id').value;
    const newStatus = document.getElementById('override-new-status').value;
    const reason = document.getElementById('override-reason').value;
    const admin = Auth.getCurrentUser();

    if (!reason) {
      Utils.showToast("Reason Required", "Please provide an administrative reason for override.", "danger");
      return;
    }

    window.store.overrideAttendance({
      logId,
      newStatus,
      reason,
      authorizedBy: admin ? admin.name : "Dean Arthur Vance"
    });

    Utils.showToast("Attendance Overridden", "Record updated and logged to audit trail.", "success");
    document.getElementById('attendance-override-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  },

  downloadCSV() {
    const logs = window.store.getAttendanceLogs();
    const headers = ['Log ID', 'Date', 'Time', 'Student ID', 'Student Name', 'Roll Number', 'Subject', 'Section', 'Status', 'Method', 'Geofence Verified', 'Device', 'Audit Override'];
    const rows = [headers];

    logs.forEach(l => {
      rows.push([
        l.id,
        l.date,
        l.time,
        l.studentId,
        l.studentName,
        l.rollNo,
        l.subjectId,
        l.section || 'Section A',
        l.status,
        l.method,
        l.geofenceVerified ? 'YES' : 'NO',
        l.device || 'N/A',
        l.authorizedEdit ? `Overridden by ${l.authorizedEdit.authorizedBy}: ${l.authorizedEdit.reason}` : 'N/A'
      ]);
    });

    Utils.exportToCSV(`Apex_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`, rows);
  },

  openPrintableReport() {
    const modal = document.getElementById('printable-report-modal');
    if (!modal) return;

    const students = window.store.getStudents();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('print-date-display').textContent = today;
    document.getElementById('print-body-content').innerHTML = `
      <div style="margin-bottom: 1.5rem; text-align: center; border-bottom: 2px solid #000000; padding-bottom: 1rem;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #000000;">APEX UNIVERSITY OF TECHNOLOGY</h2>
        <p style="font-size: 0.9rem; color: #333333; font-weight: 600;">OFFICIAL ACADEMIC ATTENDANCE & ELIGIBILITY REPORT</p>
        <p style="font-size: 0.8rem; color: #666666;">Generated on ${today} • Academic Session 2026</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; color: #000000; margin-bottom: 2rem;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 1px solid #000000;">
            <th style="padding: 6px; text-align: left;">Roll No</th>
            <th style="padding: 6px; text-align: left;">Student Name</th>
            <th style="padding: 6px; text-align: left;">Department</th>
            <th style="padding: 6px; text-align: center;">Attended</th>
            <th style="padding: 6px; text-align: center;">Total</th>
            <th style="padding: 6px; text-align: center;">%</th>
            <th style="padding: 6px; text-align: center;">Exam Status</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px;">${s.rollNo}</td>
              <td style="padding: 6px; font-weight: 600;">${s.name}</td>
              <td style="padding: 6px;">${s.department}</td>
              <td style="padding: 6px; text-align: center;">${s.attendedClasses}</td>
              <td style="padding: 6px; text-align: center;">${s.totalClasses}</td>
              <td style="padding: 6px; text-align: center; font-weight: 700;">${s.attendancePercentage}%</td>
              <td style="padding: 6px; text-align: center;">
                <span style="font-weight: 700; color: ${s.attendancePercentage >= 75 ? '#059669' : '#dc2626'};">
                  ${s.attendancePercentage >= 75 ? 'ELIGIBLE' : 'DEBARRED (<75%)'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; margin-top: 3rem; font-size: 0.85rem; color: #000000;">
        <div style="text-align: center; border-top: 1px solid #000000; width: 200px; padding-top: 6px;">
          Course Coordinator Signature
        </div>
        <div style="text-align: center; border-top: 1px solid #000000; width: 200px; padding-top: 6px;">
          Dean of Academics
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  printReport() {
    window.print();
  }
};

if (typeof window !== 'undefined') {
  window.Reports = Reports;
}
