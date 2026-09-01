/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - SYSTEM ACTIVITY & AUDIT LOGS
 * Complete tamper-evident audit trail of system operations, overrides, logins, and attendance sessions
 */

const AuditLogs = {
  searchQuery: '',
  categoryFilter: 'all',

  render(container) {
    let logs = window.store.getAuditLogs();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      logs = logs.filter(l => 
        l.action.toLowerCase().includes(q) || 
        l.user.toLowerCase().includes(q) || 
        l.details.toLowerCase().includes(q)
      );
    }

    if (this.categoryFilter !== 'all') {
      logs = logs.filter(l => l.category === this.categoryFilter);
    }

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="shield-alert" style="color: var(--primary);"></i> System Activity & Audit Logs
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">Comprehensive chronological audit trail of all authentication, overrides, and administrative actions</p>
          </div>
          <button class="btn btn-secondary" onclick="AuditLogs.exportAuditCSV()">
            <i data-lucide="download"></i> Export Audit Trail
          </button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div class="search-bar" style="width: 320px;">
            <i data-lucide="search"></i>
            <input type="text" class="form-control" placeholder="Search audit trail by user, action..." value="${this.searchQuery}" oninput="AuditLogs.handleSearch(this.value)" />
          </div>

          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <label class="form-label" style="margin-bottom: 0;">Category:</label>
            <select class="form-control" style="width: 180px;" onchange="AuditLogs.handleCategoryChange(this.value)">
              <option value="all" ${this.categoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
              <option value="Attendance" ${this.categoryFilter === 'Attendance' ? 'selected' : ''}>Attendance</option>
              <option value="Authentication" ${this.categoryFilter === 'Authentication' ? 'selected' : ''}>Authentication</option>
              <option value="Students" ${this.categoryFilter === 'Students' ? 'selected' : ''}>Students</option>
              <option value="Faculty" ${this.categoryFilter === 'Faculty' ? 'selected' : ''}>Faculty</option>
              <option value="Academics" ${this.categoryFilter === 'Academics' ? 'selected' : ''}>Academics</option>
              <option value="Communications" ${this.categoryFilter === 'Communications' ? 'selected' : ''}>Communications</option>
              <option value="System" ${this.categoryFilter === 'System' ? 'selected' : ''}>System</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action Code</th>
              <th>Category</th>
              <th>Initiated By</th>
              <th>Action Details</th>
              <th>IP / Client Node</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                  No audit logs found matching current search.
                </td>
              </tr>
            ` : logs.map(log => `
              <tr>
                <td style="white-space: nowrap;">
                  <span style="font-size: 0.78rem; font-family: monospace; color: var(--text-muted);">${log.timestamp}</span>
                </td>
                <td>
                  <span class="badge badge-primary" style="font-family: monospace; font-size: 0.72rem;">${log.action}</span>
                </td>
                <td><span class="badge badge-info">${log.category}</span></td>
                <td><strong>${log.user}</strong></td>
                <td style="max-width: 320px; font-size: 0.84rem; line-height: 1.4;">${log.details}</td>
                <td><span style="font-size: 0.76rem; color: var(--text-muted); font-family: monospace;">${log.ipAddress}</span></td>
                <td><span class="badge badge-success">${log.status}</span></td>
              </tr>
            `).join('')}
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

  handleCategoryChange(cat) {
    this.categoryFilter = cat;
    this.render(document.getElementById('view-container'));
  },

  exportAuditCSV() {
    const logs = window.store.getAuditLogs();
    const headers = ['Log ID', 'Timestamp', 'Action', 'Category', 'Initiated By', 'Details', 'IP Address', 'Status'];
    const rows = [headers];

    logs.forEach(l => {
      rows.push([
        l.id,
        l.timestamp,
        l.action,
        l.category,
        l.user,
        l.details,
        l.ipAddress,
        l.status
      ]);
    });

    Utils.exportToCSV(`Apex_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`, rows);
  }
};

if (typeof window !== 'undefined') {
  window.AuditLogs = AuditLogs;
}
