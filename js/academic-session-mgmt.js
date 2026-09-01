/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - ACADEMIC SESSIONS MANAGEMENT
 * Manage university academic semesters, date ranges, and active terms
 */

const AcademicSessionMgmt = {
  render(container) {
    const sessions = window.store.getAcademicSessions();

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="calendar" style="color: var(--primary);"></i> Academic Sessions Management
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">Configure academic calendars, terms, date spans, and active registration windows</p>
          </div>
          <button class="btn btn-primary" onclick="AcademicSessionMgmt.openAddSessionModal()">
            <i data-lucide="calendar-plus"></i> Add New Academic Session
          </button>
        </div>
      </div>

      <!-- Sessions Grid -->
      <div class="metrics-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
        ${sessions.map(sess => `
          <div class="card ${sess.isCurrent ? 'success' : ''}" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span class="badge ${sess.isCurrent ? 'badge-success' : 'badge-primary'}">
                  ${sess.isCurrent ? '⭐ Active Current Term' : sess.status}
                </span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">${sess.id}</span>
              </div>

              <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem;">${sess.name}</h3>
              
              <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                <div>🗓️ <strong>Start Date:</strong> ${sess.startDate}</div>
                <div>🏁 <strong>End Date:</strong> ${sess.endDate}</div>
              </div>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
              ${sess.isCurrent ? `
                <span style="color: var(--success); font-weight: 700; font-size: 0.84rem;">
                  <i data-lucide="check-circle" style="width: 16px; height: 16px; vertical-align: -3px;"></i> System Default
                </span>
              ` : `
                <button class="btn btn-outline btn-sm" onclick="AcademicSessionMgmt.setAsActive('${sess.id}')">
                  Set As Active Session
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  setAsActive(sessionId) {
    window.store.setActiveSession(sessionId);
    Utils.showToast("Active Term Updated", "Platform active academic session changed.", "success");
    if (window.App) window.App.refreshCurrentView();
  },

  openAddSessionModal() {
    const modal = document.getElementById('add-session-modal');
    if (modal) modal.classList.add('active');
  },

  handleAddSessionSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('new-session-name').value;
    const startDate = document.getElementById('new-session-start').value;
    const endDate = document.getElementById('new-session-end').value;
    const isCurrent = document.getElementById('new-session-current').checked;

    if (!name || !startDate || !endDate) {
      Utils.showToast("Missing Fields", "Please specify term title and dates.", "danger");
      return;
    }

    window.store.addAcademicSession({ name, startDate, endDate, isCurrent });
    Utils.showToast("Session Added", `${name} added to academic calendar.`, "success");
    document.getElementById('add-session-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  }
};

if (typeof window !== 'undefined') {
  window.AcademicSessionMgmt = AcademicSessionMgmt;
}
