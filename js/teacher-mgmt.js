/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - TEACHER MANAGEMENT
 * Teacher directory, CRUD, Subject & Section assignments
 */

const TeacherMgmt = {
  searchQuery: '',

  render(container) {
    let teachers = window.store.getTeachers();
    const subjects = window.store.getSubjects();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      teachers = teachers.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.email.toLowerCase().includes(q) || 
        t.department.toLowerCase().includes(q)
      );
    }

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="graduation-cap" style="color: var(--primary);"></i> Faculty & Teacher Management
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">Manage faculty members, assign subjects, schedules, and departments</p>
          </div>
          <button class="btn btn-primary" onclick="TeacherMgmt.openAddTeacherModal()">
            <i data-lucide="user-plus"></i> Add New Faculty
          </button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div class="search-bar" style="width: 320px;">
            <i data-lucide="search"></i>
            <input type="text" class="form-control" placeholder="Search faculty by name, department..." value="${this.searchQuery}" oninput="TeacherMgmt.handleSearch(this.value)" />
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            Total Faculty: <strong>${teachers.length} Active</strong>
          </div>
        </div>
      </div>

      <!-- Teachers Table -->
      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Faculty Member</th>
              <th>Department</th>
              <th>Assigned Courses</th>
              <th>Cabin / Office</th>
              <th>Contact Phone</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${teachers.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                  No faculty members found.
                </td>
              </tr>
            ` : teachers.map(teacher => {
              const teacherSubs = subjects.filter(s => s.teacherId === teacher.id || (teacher.subjects && teacher.subjects.includes(s.id)));
              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img src="${teacher.avatar}" alt="${teacher.name}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" />
                      <div>
                        <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary);">
                          ${teacher.name}
                        </div>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">${teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>${teacher.department}</td>
                  <td>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                      ${teacherSubs.map(s => `<span class="badge badge-primary">${s.code}</span>`).join('') || '<span style="color: var(--text-muted); font-size: 0.78rem;">None</span>'}
                    </div>
                  </td>
                  <td>${teacher.cabin || 'Room 401'}</td>
                  <td>${teacher.phone || '+1 (555) 000-0000'}</td>
                  <td><span class="badge badge-success">${teacher.status || 'Active'}</span></td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.4rem;">
                      <button class="btn btn-outline btn-sm" title="Assign Subjects" onclick="TeacherMgmt.openAssignSubjectsModal('${teacher.id}')">
                        <i data-lucide="book-plus"></i>
                      </button>
                      <button class="btn btn-outline btn-sm" title="Edit Faculty" onclick="TeacherMgmt.openEditTeacherModal('${teacher.id}')">
                        <i data-lucide="edit-3"></i>
                      </button>
                      <button class="btn btn-outline btn-sm" style="color: var(--danger);" title="Remove Faculty" onclick="TeacherMgmt.deleteTeacherPrompt('${teacher.id}')">
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
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.render(document.getElementById('view-container'));
  },

  openAddTeacherModal() {
    const modal = document.getElementById('add-teacher-modal');
    if (modal) modal.classList.add('active');
  },

  handleAddTeacherSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('new-teacher-name').value;
    const email = document.getElementById('new-teacher-email').value;
    const dept = document.getElementById('new-teacher-dept').value;
    const cabin = document.getElementById('new-teacher-cabin').value;
    const phone = document.getElementById('new-teacher-phone').value;

    if (!name || !email) {
      Utils.showToast("Missing Fields", "Name and email are required.", "danger");
      return;
    }

    window.store.addTeacher({ name, email, department: dept, cabin, phone });
    Utils.showToast("Faculty Added", `${name} added to faculty directory.`, "success");
    document.getElementById('add-teacher-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  },

  openEditTeacherModal(teacherId) {
    const teacher = window.store.getTeacherById(teacherId);
    if (!teacher) return;
    const modal = document.getElementById('edit-teacher-modal');
    if (!modal) return;

    document.getElementById('edit-teacher-id').value = teacher.id;
    document.getElementById('edit-teacher-name').value = teacher.name;
    document.getElementById('edit-teacher-email').value = teacher.email;
    document.getElementById('edit-teacher-dept').value = teacher.department;
    document.getElementById('edit-teacher-cabin').value = teacher.cabin || '';
    document.getElementById('edit-teacher-phone').value = teacher.phone || '';

    modal.classList.add('active');
  },

  handleEditTeacherSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById('edit-teacher-id').value;
    const name = document.getElementById('edit-teacher-name').value;
    const email = document.getElementById('edit-teacher-email').value;
    const dept = document.getElementById('edit-teacher-dept').value;
    const cabin = document.getElementById('edit-teacher-cabin').value;
    const phone = document.getElementById('edit-teacher-phone').value;

    window.store.updateTeacher(id, { name, email, department: dept, cabin, phone });
    Utils.showToast("Faculty Updated", "Faculty record updated successfully.", "success");
    document.getElementById('edit-teacher-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  },

  deleteTeacherPrompt(teacherId) {
    const teacher = window.store.getTeacherById(teacherId);
    if (!teacher) return;
    if (confirm(`Are you sure you want to remove faculty member "${teacher.name}"?`)) {
      window.store.deleteTeacher(teacherId);
      Utils.showToast("Faculty Removed", `${teacher.name} was removed.`, "info");
      if (window.App) window.App.refreshCurrentView();
    }
  },

  openAssignSubjectsModal(teacherId) {
    const teacher = window.store.getTeacherById(teacherId);
    if (!teacher) return;
    const modal = document.getElementById('assign-subjects-modal');
    if (!modal) return;

    const subjects = window.store.getSubjects();
    document.getElementById('assign-teacher-id').value = teacher.id;
    document.getElementById('assign-teacher-name-display').textContent = teacher.name;

    const listContainer = document.getElementById('assign-subjects-checkbox-list');
    listContainer.innerHTML = subjects.map(sub => {
      const isAssigned = sub.teacherId === teacher.id || (teacher.subjects && teacher.subjects.includes(sub.id));
      return `
        <label style="display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem; background: var(--bg-input); border-radius: var(--radius-md); border: 1px solid var(--border-color); cursor: pointer;">
          <input type="checkbox" name="assigned_subject" value="${sub.id}" ${isAssigned ? 'checked' : ''} />
          <div>
            <div style="font-weight: 700; font-size: 0.88rem;">${sub.code}: ${sub.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${sub.department} • ${sub.schedule}</div>
          </div>
        </label>
      `;
    }).join('');

    modal.classList.add('active');
  },

  handleAssignSubjectsSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const teacherId = document.getElementById('assign-teacher-id').value;
    const checkboxes = document.querySelectorAll('input[name="assigned_subject"]:checked');
    const selectedSubIds = Array.from(checkboxes).map(c => c.value);

    // Update teacher's assigned subjects
    window.store.updateTeacher(teacherId, { subjects: selectedSubIds });

    // Update subjects teacherId
    window.store.getSubjects().forEach(s => {
      if (selectedSubIds.includes(s.id)) {
        s.teacherId = teacherId;
      }
    });
    window.store.saveState();

    Utils.showToast("Assignment Updated", "Assigned subjects updated successfully.", "success");
    document.getElementById('assign-subjects-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  }
};

if (typeof window !== 'undefined') {
  window.TeacherMgmt = TeacherMgmt;
}
