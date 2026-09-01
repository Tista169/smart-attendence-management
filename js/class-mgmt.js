/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - CLASS & SECTION MANAGEMENT
 * Manage university courses, class sections, credits, schedules, and instructor assignments
 */

const ClassMgmt = {
  render(container) {
    const subjects = window.store.getSubjects();
    const teachers = window.store.getTeachers();
    const students = window.store.getStudents();

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="book-open" style="color: var(--primary);"></i> Classes & Sections Management
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">Configure academic courses, classroom sections, credits, and teacher assignments</p>
          </div>
          <button class="btn btn-primary" onclick="ClassMgmt.openAddClassModal()">
            <i data-lucide="plus-circle"></i> Create New Class / Course
          </button>
        </div>
      </div>

      <!-- Classes Grid -->
      <div class="metrics-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        ${subjects.map(sub => {
          const instructor = teachers.find(t => t.id === sub.teacherId) || { name: "Unassigned", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" };
          return `
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                  <div>
                    <span class="badge badge-primary">${sub.code}</span>
                    <span class="badge badge-info">${sub.credits} Credits</span>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <button class="btn btn-outline btn-sm" title="Edit Course" onclick="ClassMgmt.openEditClassModal('${sub.id}')">
                      <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" style="color: var(--danger);" title="Delete Course" onclick="ClassMgmt.deleteClassPrompt('${sub.id}')">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </div>
                </div>

                <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.35rem;">${sub.name}</h3>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">
                  ${sub.department} • Room: <strong>${sub.room || 'Hall 101'}</strong>
                </p>

                <!-- Sections Pill -->
                <div style="margin-bottom: 1rem;">
                  <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Active Sections:</div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${(sub.sections || ["Section A"]).map(sec => `
                      <span class="badge badge-success" style="font-size: 0.72rem;">${sec}</span>
                    `).join('')}
                  </div>
                </div>

                <!-- Instructor Card -->
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                  <img src="${instructor.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Assigned Faculty</div>
                    <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">${instructor.name}</div>
                  </div>
                </div>
              </div>

              <!-- Schedule & Total Lectures Footer -->
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 0.85rem; margin-top: 1.25rem;">
                <span><i data-lucide="clock" style="width: 14px; height: 14px; vertical-align: -2px;"></i> ${sub.schedule}</span>
                <span><strong>${sub.totalLectures}</strong> Lectures</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  openAddClassModal() {
    const modal = document.getElementById('add-class-modal');
    if (!modal) return;
    const teachers = window.store.getTeachers();
    const select = document.getElementById('new-class-teacher');
    if (select) {
      select.innerHTML = teachers.map(t => `<option value="${t.id}">${t.name} (${t.department})</option>`).join('');
    }
    modal.classList.add('active');
  },

  handleAddClassSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const code = document.getElementById('new-class-code').value;
    const name = document.getElementById('new-class-name').value;
    const dept = document.getElementById('new-class-dept').value;
    const credits = document.getElementById('new-class-credits').value;
    const teacherId = document.getElementById('new-class-teacher').value;
    const schedule = document.getElementById('new-class-schedule').value;
    const room = document.getElementById('new-class-room').value;

    if (!code || !name) {
      Utils.showToast("Missing Fields", "Course code and title are required.", "danger");
      return;
    }

    window.store.addClass({
      code,
      name,
      department: dept,
      credits,
      teacherId,
      schedule,
      room,
      sections: ["Section A", "Section B"],
      totalLectures: 30
    });

    Utils.showToast("Class Created", `${code}: ${name} created successfully.`, "success");
    document.getElementById('add-class-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  },

  openEditClassModal(classId) {
    const cls = window.store.getSubjectById(classId);
    if (!cls) return;
    const modal = document.getElementById('edit-class-modal');
    if (!modal) return;

    document.getElementById('edit-class-id').value = cls.id;
    document.getElementById('edit-class-code').value = cls.code;
    document.getElementById('edit-class-name').value = cls.name;
    document.getElementById('edit-class-dept').value = cls.department || 'Computer Science';
    document.getElementById('edit-class-schedule').value = cls.schedule || '';
    document.getElementById('edit-class-room').value = cls.room || '';

    const teachers = window.store.getTeachers();
    const select = document.getElementById('edit-class-teacher');
    if (select) {
      select.innerHTML = teachers.map(t => `<option value="${t.id}" ${t.id === cls.teacherId ? 'selected' : ''}>${t.name}</option>`).join('');
    }

    modal.classList.add('active');
  },

  handleEditClassSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById('edit-class-id').value;
    const code = document.getElementById('edit-class-code').value;
    const name = document.getElementById('edit-class-name').value;
    const dept = document.getElementById('edit-class-dept').value;
    const teacherId = document.getElementById('edit-class-teacher').value;
    const schedule = document.getElementById('edit-class-schedule').value;
    const room = document.getElementById('edit-class-room').value;

    window.store.updateClass(id, { code, name, department: dept, teacherId, schedule, room });
    Utils.showToast("Course Updated", "Course parameters updated successfully.", "success");
    document.getElementById('edit-class-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  },

  deleteClassPrompt(classId) {
    const cls = window.store.getSubjectById(classId);
    if (!cls) return;
    if (confirm(`Are you sure you want to delete course "${cls.code}: ${cls.name}"?`)) {
      window.store.deleteClass(classId);
      Utils.showToast("Class Removed", `${cls.code} was deleted.`, "info");
      if (window.App) window.App.refreshCurrentView();
    }
  }
};

if (typeof window !== 'undefined') {
  window.ClassMgmt = ClassMgmt;
}
