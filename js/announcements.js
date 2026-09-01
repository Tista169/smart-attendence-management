/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - ANNOUNCEMENTS & BROADCASTS
 * Campus-wide notices, role-targeted broadcasts & urgent academic alerts
 */

const Announcements = {
  render(container) {
    const role = Auth.getCurrentRole();
    const allAnnouncements = window.store.getAnnouncements();

    // Filter announcements by target audience
    let announcements = allAnnouncements;
    if (role === 'teacher') {
      announcements = allAnnouncements.filter(a => a.targetAudience === 'All' || a.targetAudience === 'Teachers');
    } else if (role === 'student') {
      announcements = allAnnouncements.filter(a => a.targetAudience === 'All' || a.targetAudience === 'Students');
    }

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="megaphone" style="color: var(--primary);"></i> Announcements & Official Notices
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">University broadcasts, emergency updates, exam notices, and event schedules</p>
          </div>
          ${role === 'admin' ? `
            <button class="btn btn-primary" onclick="Announcements.openCreateModal()">
              <i data-lucide="plus-circle"></i> Broadcast New Announcement
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Announcements Feed -->
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${announcements.length === 0 ? `
          <div class="card" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <i data-lucide="bell-off" style="width: 48px; height: 48px; margin-bottom: 0.75rem; opacity: 0.5;"></i>
            <p>No active announcements for your portal.</p>
          </div>
        ` : announcements.map(ann => {
          const isUrgent = ann.priority === 'Urgent';
          const isImportant = ann.priority === 'Important';
          return `
            <div class="card" style="border-left: 4px solid ${isUrgent ? 'var(--danger)' : (isImportant ? 'var(--warning)' : 'var(--primary)')};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge ${isUrgent ? 'badge-danger' : (isImportant ? 'badge-warning' : 'badge-primary')}">
                    ${ann.priority}
                  </span>
                  <span class="badge badge-info">Audience: ${ann.targetAudience}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span style="font-size: 0.78rem; color: var(--text-muted);">${ann.date}</span>
                  ${role === 'admin' ? `
                    <button class="btn btn-outline btn-sm" style="color: var(--danger); padding: 2px 6px;" onclick="Announcements.deleteAnnouncement('${ann.id}')">
                      <i data-lucide="trash-2"></i>
                    </button>
                  ` : ''}
                </div>
              </div>

              <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.5rem;">${ann.title}</h3>
              <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; margin-bottom: 0.75rem;">
                ${ann.content}
              </p>

              <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
                <i data-lucide="user-check" style="width: 14px; height: 14px;"></i> Issued by: <strong>${ann.author}</strong>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  openCreateModal() {
    const modal = document.getElementById('create-announcement-modal');
    if (modal) modal.classList.add('active');
  },

  handleCreateSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const title = document.getElementById('new-ann-title').value;
    const content = document.getElementById('new-ann-content').value;
    const targetAudience = document.getElementById('new-ann-audience').value;
    const priority = document.getElementById('new-ann-priority').value;

    if (!title || !content) {
      Utils.showToast("Missing Content", "Please fill in title and announcement text.", "danger");
      return;
    }

    window.store.addAnnouncement({ title, content, targetAudience, priority });
    Utils.showToast("Broadcast Dispatched! 📢", "Announcement published across active portals.", "success");
    document.getElementById('create-announcement-modal').classList.remove('active');
    if (window.App) window.App.refreshCurrentView();
  },

  deleteAnnouncement(annId) {
    if (confirm("Delete this announcement?")) {
      window.store.deleteAnnouncement(annId);
      Utils.showToast("Announcement Removed", "Notice deleted.", "info");
      if (window.App) window.App.refreshCurrentView();
    }
  }
};

if (typeof window !== 'undefined') {
  window.Announcements = Announcements;
}
