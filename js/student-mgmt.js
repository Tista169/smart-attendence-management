/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - STUDENT MANAGEMENT
 * Comprehensive student profiles (DOB, Guardian, Contacts), search, sorting, filtering & pagination
 */

const StudentMgmt = {
  activeFilter: 'all',
  searchQuery: '',
  sortBy: 'rollNo', // 'rollNo', 'name', 'attendance'
  sortDirection: 'asc',
  currentPage: 1,
  pageSize: 10,

  render(container) {
    let students = window.store.getStudents();

    // 1. Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      students = students.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.rollNo.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(q))
      );
    }

    // 2. Filter by Eligibility / Defaulter status
    if (this.activeFilter === 'defaulters') {
      students = students.filter(s => s.attendancePercentage < 75);
    } else if (this.activeFilter === 'eligible') {
      students = students.filter(s => s.attendancePercentage >= 75);
    }

    // 3. Multi-Column Sorting
    students.sort((a, b) => {
      let comparison = 0;
      if (this.sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (this.sortBy === 'attendance') {
        comparison = a.attendancePercentage - b.attendancePercentage;
      } else { // default rollNo
        comparison = a.rollNo.localeCompare(b.rollNo);
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    // 4. Pagination
    const totalRecords = students.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginatedStudents = students.slice(startIndex, startIndex + this.pageSize);

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="users" style="color: var(--primary);"></i> Student Management Directory
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">Manage student enrollments, biometrics, profiles, guardian contacts, and attendance records</p>
          </div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="StudentMgmt.openAddStudentModal()">
              <i data-lucide="user-plus"></i> Add New Student
            </button>
            <button class="btn btn-secondary" onclick="StudentMgmt.triggerBatchImport()">
              <i data-lucide="upload-cloud"></i> Batch CSV Import
            </button>
          </div>
        </div>

        <!-- Search, Filter & Sort Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div class="search-bar" style="width: 320px;">
            <i data-lucide="search"></i>
            <input type="text" class="form-control" placeholder="Search name, roll no, department..." value="${this.searchQuery}" oninput="StudentMgmt.handleSearch(this.value)" />
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <!-- Sort dropdown -->
            <div style="display: flex; align-items: center; gap: 4px;">
              <label class="form-label" style="margin-bottom: 0; font-size: 0.78rem;">Sort By:</label>
              <select class="form-control" style="width: 140px; padding: 4px 8px; font-size: 0.82rem;" onchange="StudentMgmt.handleSortChange(this.value)">
                <option value="rollNo" ${this.sortBy === 'rollNo' ? 'selected' : ''}>Roll Number</option>
                <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Student Name</option>
                <option value="attendance" ${this.sortBy === 'attendance' ? 'selected' : ''}>Attendance %</option>
              </select>
              <button class="btn btn-outline btn-sm" title="Toggle Sort Direction" onclick="StudentMgmt.toggleSortDirection()">
                ${this.sortDirection === 'asc' ? '▲' : '▼'}
              </button>
            </div>

            <!-- Role filter tabs -->
            <div class="role-pill-group">
              <button class="role-btn ${this.activeFilter === 'all' ? 'active' : ''}" onclick="StudentMgmt.setFilter('all')">
                All (${window.store.getStudents().length})
              </button>
              <button class="role-btn ${this.activeFilter === 'eligible' ? 'active' : ''}" onclick="StudentMgmt.setFilter('eligible')">
                Eligible ≥75% (${window.store.getStudents().filter(s => s.attendancePercentage >= 75).length})
              </button>
              <button class="role-btn ${this.activeFilter === 'defaulters' ? 'active' : ''}" onclick="StudentMgmt.setFilter('defaulters')">
                Defaulters <75% (${window.store.getStudents().filter(s => s.attendancePercentage < 75).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Table -->
      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Student Details</th>
              <th>Roll Number</th>
              <th>Date of Birth</th>
              <th>Guardian / Contact</th>
              <th>Attendance Rate</th>
              <th>Biometric AI</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${paginatedStudents.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                  No students found matching current criteria.
                </td>
              </tr>
            ` : paginatedStudents.map(student => {
              const isDefaulter = student.attendancePercentage < 75;
              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img src="${student.avatar}" alt="${student.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
                      <div>
                        <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); cursor: pointer;" onclick="StudentMgmt.openProfileDrawer('${student.id}')">
                          ${student.name}
                        </div>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">${student.department} • ${student.section}</div>
                      </div>
                    </div>
                  </td>
                  <td><strong>${student.rollNo}</strong></td>
                  <td><span style="font-size: 0.82rem; color: var(--text-secondary);">${student.dob || '2004-06-14'}</span></td>
                  <td>
                    <div style="font-size: 0.84rem; font-weight: 600;">${student.guardianName || 'Robert Johnson'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${student.guardianPhone || '+1 (555) 101-2002'}</div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span class="badge ${isDefaulter ? 'badge-danger' : 'badge-success'}">
                        ${student.attendancePercentage}%
                      </span>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">(${student.attendedClasses}/${student.totalClasses})</span>
                    </div>
                  </td>
                  <td>
                    ${student.faceEnrolled 
                      ? `<span class="badge badge-info"><i data-lucide="check"></i> Enrolled</span>` 
                      : `<span class="badge badge-warning"><i data-lucide="alert-circle"></i> Pending</span>`}
                  </td>
                  <td>
                    <span class="badge badge-success">${student.status}</span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.4rem;">
                      <button class="btn btn-outline btn-sm" title="View Full Profile" onclick="StudentMgmt.openProfileDrawer('${student.id}')">
                        <i data-lucide="eye"></i>
                      </button>
                      <button class="btn btn-outline btn-sm" title="Edit Student" onclick="StudentMgmt.openEditStudentModal('${student.id}')">
                        <i data-lucide="edit-3"></i>
                      </button>
                      <button class="btn btn-outline btn-sm" style="color: var(--danger);" title="Delete Student" onclick="StudentMgmt.deleteStudentPrompt('${student.id}')">
                        <i data-lucide="trash-2"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary); flex-wrap: wrap; gap: 0.75rem;">
        <div>
          Showing <strong>${startIndex + 1}</strong> to <strong>${Math.min(startIndex + this.pageSize, totalRecords)}</strong> of <strong>${totalRecords}</strong> students
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button class="btn btn-outline btn-sm" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="StudentMgmt.changePage(${this.currentPage - 1})">
            Previous
          </button>
          <span>Page <strong>${this.currentPage}</strong> of <strong>${totalPages}</strong></span>
          <button class="btn btn-outline btn-sm" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="StudentMgmt.changePage(${this.currentPage + 1})">
            Next
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.currentPage = 1;
    this.render(document.getElementById('view-container'));
  },

  setFilter(filter) {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.render(document.getElementById('view-container'));
  },

  handleSortChange(val) {
    this.sortBy = val;
    this.render(document.getElementById('view-container'));
  },

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.render(document.getElementById('view-container'));
  },

  changePage(newPage) {
    this.currentPage = newPage;
    this.render(document.getElementById('view-container'));
  },

  // Open Detailed Student Profile Drawer
  openProfileDrawer(studentId) {
    const student = window.store.getStudentById(studentId);
    if (!student) return;

    const drawer = document.getElementById('student-profile-drawer');
    const drawerBody = document.getElementById('profile-drawer-body');
    if (!drawer || !drawerBody) return;

    const isDefaulter = student.attendancePercentage < 75;
    const logs = window.store.getAttendanceLogs().filter(l => l.studentId === student.id);
    const notifications = (window.store.getAbsenceQueue() || []).filter(n => n.studentId === student.id);

    drawerBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <img src="${student.avatar}" alt="${student.name}" style="width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); box-shadow: 0 4px 14px var(--primary-glow); margin-bottom: 0.75rem;" />
        <h3 style="font-size: 1.3rem; font-weight: 800;">${student.name}</h3>
        <p style="font-size: 0.84rem; color: var(--text-muted);">${student.rollNo} • ${student.department}</p>
        <div style="margin-top: 0.5rem;">
          <span class="badge ${isDefaulter ? 'badge-danger' : 'badge-success'}" style="font-size: 0.85rem;">
            Overall Attendance: ${student.attendancePercentage}% (${student.attendedClasses}/${student.totalClasses})
          </span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
        <button class="btn btn-outline btn-sm" onclick="StudentMgmt.openParentNotificationModal('${student.id}')">
          <i data-lucide="message-square"></i> Alert Guardian
        </button>
        <button class="btn btn-outline btn-sm" onclick="StudentMgmt.toggleFaceEnrollment('${student.id}')">
          <i data-lucide="scan-face"></i> ${student.faceEnrolled ? 'Reset Face AI' : 'Enroll Face AI'}
        </button>
      </div>

      <!-- Comprehensive Academic & Personal Info -->
      <div class="card" style="margin-bottom: 1.25rem; background: var(--bg-surface-elevated);">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Student Academic Record</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
          <div>🆔 <strong>Student ID:</strong> ${student.id}</div>
          <div>🎓 <strong>Roll Number:</strong> ${student.rollNo}</div>
          <div>🏫 <strong>Class & Section:</strong> ${student.department} (${student.section || 'Section A'})</div>
          <div>📅 <strong>Date of Birth:</strong> ${student.dob || '2004-06-14'}</div>
          <div>🗓️ <strong>Admission Date:</strong> ${student.admissionDate || '2023-08-15'}</div>
          <div>📍 <strong>Address:</strong> ${student.address || '742 Evergreen Terrace, Sector 4'}</div>
          <div>📧 <strong>Student Email:</strong> ${student.email}</div>
          <div>📞 <strong>Student Phone:</strong> ${student.phone}</div>
        </div>
      </div>

      <!-- Guardian & Emergency Contacts -->
      <div class="card" style="margin-bottom: 1.25rem; background: var(--bg-surface-elevated);">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Guardian & Emergency</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
          <div>👨‍👧 <strong>Guardian Name:</strong> ${student.guardianName || 'Robert Johnson'} (${student.guardianRelationship || 'Father'})</div>
          <div>📱 <strong>Guardian Phone:</strong> ${student.guardianPhone || '+1 (555) 101-2002'}</div>
          <div>✉️ <strong>Guardian Email:</strong> ${student.guardianEmail || 'r.johnson@family.com'}</div>
          <div>🚨 <strong>Emergency Contact:</strong> ${student.emergencyContact || '+1 (555) 101-2099'}</div>
        </div>
      </div>

      <!-- Automated Absence Alert History -->
      ${notifications.length > 0 ? `
        <div class="card" style="margin-bottom: 1.25rem; background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2);">
          <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--danger); text-transform: uppercase; letter-spacing: 0.05em;">Automated Absence Notices</h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${notifications.map(n => `
              <div style="padding: 0.5rem; background: var(--bg-input); border-radius: var(--radius-sm); font-size: 0.78rem;">
                <div style="font-weight: 700; color: var(--danger);">Marked ${n.status.toUpperCase()} on ${n.date} (${n.subjectId})</div>
                <div style="color: var(--text-muted); margin-top: 2px;">Dispatched via SMS & WhatsApp to ${n.guardianPhone} at ${n.timestamp}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Attendance History Log -->
      <div class="card" style="background: var(--bg-surface-elevated);">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Attendance History Transcript</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${logs.length === 0 ? `<p style="color: var(--text-muted); font-size: 0.82rem;">No attendance logged yet.</p>` : logs.map(log => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-input); border-radius: var(--radius-sm);">
              <div>
                <div style="font-weight: 700; font-size: 0.84rem;">${log.subjectId} • ${log.date}</div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${log.time} via ${log.method}</div>
              </div>
              <span class="badge ${log.status === 'Present' ? 'badge-success' : (log.status === 'Late' ? 'badge-warning' : 'badge-danger')}">${log.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    drawer.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  closeProfileDrawer() {
    const drawer = document.getElementById('student-profile-drawer');
    if (drawer) drawer.classList.remove('active');
  },

  // Add Student Modal
  openAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    if (modal) modal.classList.add('active');
  },

  handleAddStudentSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('new-student-name').value;
    const rollNo = document.getElementById('new-student-roll').value;
    const email = document.getElementById('new-student-email').value;
    const dept = document.getElementById('new-student-dept').value;
    const dob = document.getElementById('new-student-dob')?.value || '2004-06-14';
    const guardianName = document.getElementById('new-student-guardian-name')?.value || 'Guardian';
    const guardianPhone = document.getElementById('new-student-guardian-phone')?.value || '+1 (555) 000-0001';

    if (!name || !email) {
      Utils.showToast("Missing Information", "Please fill in student name and email.", "danger");
      return;
    }

    window.store.addStudent({
      name,
      rollNo,
      email,
      department: dept,
      dob,
      guardianName,
      guardianPhone,
      faceEnrolled: true
    });

    Utils.showToast("Student Added", `${name} added to student roster.`, "success");
    document.getElementById('add-student-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  },

  // Edit Student Modal
  openEditStudentModal(studentId) {
    const student = window.store.getStudentById(studentId);
    if (!student) return;

    const modal = document.getElementById('edit-student-modal');
    if (!modal) return;

    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-student-name').value = student.name;
    document.getElementById('edit-student-email').value = student.email;
    document.getElementById('edit-student-dept').value = student.department;

    modal.classList.add('active');
  },

  handleEditStudentSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById('edit-student-id').value;
    const name = document.getElementById('edit-student-name').value;
    const email = document.getElementById('edit-student-email').value;
    const dept = document.getElementById('edit-student-dept').value;

    window.store.updateStudent(id, { name, email, department: dept });
    Utils.showToast("Student Updated", "Student profile updated successfully.", "success");
    document.getElementById('edit-student-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  },

  deleteStudentPrompt(studentId) {
    const student = window.store.getStudentById(studentId);
    if (!student) return;
    if (confirm(`Are you sure you want to remove student "${student.name}" (${student.rollNo})?`)) {
      window.store.deleteStudent(studentId);
      Utils.showToast("Student Removed", `${student.name} was removed from directory.`, "info");
      if (window.App) window.App.refreshCurrentView();
    }
  },

  toggleFaceEnrollment(studentId) {
    const student = window.store.getStudentById(studentId);
    if (!student) return;
    const newStatus = !student.faceEnrolled;
    window.store.updateStudent(studentId, { faceEnrolled: newStatus });
    Utils.showToast("Biometrics Updated", `Face AI biometric status: ${newStatus ? 'Enrolled' : 'Reset'}`, "success");
    this.openProfileDrawer(studentId);
    if (window.App) window.App.refreshCurrentView();
  },

  openParentNotificationModal(studentId) {
    const student = window.store.getStudentById(studentId);
    if (!student) return;

    const modal = document.getElementById('parent-alert-modal');
    if (!modal) return;

    document.getElementById('parent-alert-student-name').textContent = student.name;
    document.getElementById('parent-alert-guardian-name').textContent = student.guardianName || 'Guardian';
    document.getElementById('parent-alert-guardian-phone').textContent = student.guardianPhone || '+1 (555) 101-2002';
    document.getElementById('parent-alert-guardian-email').textContent = student.guardianEmail || 'r.johnson@family.com';
    document.getElementById('parent-alert-pct').textContent = `${student.attendancePercentage}%`;
    document.getElementById('parent-alert-message').value = `Dear ${student.guardianName || 'Guardian'}, this is an official academic notice from Apex University. Your ward ${student.name} (Roll: ${student.rollNo}) currently has an attendance rate of ${student.attendancePercentage}%, which is below the mandatory 75% threshold required for end-semester examinations. Please advise them to attend upcoming classes regularly.`;

    modal.classList.add('active');
  },

  sendParentNotification() {
    Utils.showToast("Notice Dispatched! 📨", "Official SMS & WhatsApp notification sent to parent.", "success");
    document.getElementById('parent-alert-modal').classList.remove('active');
  },

  triggerBatchImport() {
    Utils.showToast("Batch Import", "Simulating CSV import: 15 students parsed & verified.", "success");
    if (window.App) window.App.refreshCurrentView();
  }
};

if (typeof window !== 'undefined') {
  window.StudentMgmt = StudentMgmt;
}
