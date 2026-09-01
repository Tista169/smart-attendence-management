/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - MAIN APPLICATION CONTROLLER
 * Dynamic role-based navigation, auth & signup gate, modal controllers, theme switching & router
 */

const App = {
  currentView: 'dashboard',
  authMode: 'login', // 'login' | 'signup'

  // Curated Preset Avatars Gallery for instant 1-click selection
  AVATAR_PRESETS: [
    { name: "Executive Dean", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { name: "Professor Sarah", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
    { name: "Student Alex", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" },
    { name: "Student Jordan", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
    { name: "Faculty David", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
    { name: "Faculty Elena", url: "https://images.unsplash.com/photo-1580894732484-95a9477028b1?w=150&auto=format&fit=crop&q=80" },
    { name: "Scholar Ryan", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { name: "Scholar Maya", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
  ],

  init() {
    this.initTheme();
    this.checkAuthAndRender();
    this.initStoreListener();

    if (window.lucide) window.lucide.createIcons();
  },

  // Listen to Data Store updates
  initStoreListener() {
    window.store.subscribe((event, payload) => {
      if (['ATTENDANCE_MARKED', 'ATTENDANCE_OVERRIDDEN', 'STUDENT_ADDED', 'STUDENT_UPDATED', 'STUDENT_DELETED', 'TEACHER_ADDED', 'TEACHER_UPDATED', 'CLASS_ADDED', 'LEAVE_UPDATED', 'ANNOUNCEMENT_ADDED', 'USER_UPDATED', 'PROFILE_UPDATED'].includes(event)) {
        this.refreshCurrentView();
      }
    });
  },

  // Check Auth State & Render Login/Signup or App Shell
  checkAuthAndRender() {
    const loginScreen = document.getElementById('login-screen');
    const appRoot = document.getElementById('app-root');

    if (!Auth.getIsAuthenticated()) {
      if (loginScreen) loginScreen.style.display = 'flex';
      if (appRoot) appRoot.style.display = 'none';
      if (this.authMode === 'signup') {
        this.renderSignUpScreen('student');
      } else {
        this.renderLoginScreen('admin');
      }
    } else {
      if (loginScreen) loginScreen.style.display = 'none';
      if (appRoot) appRoot.style.display = 'flex';
      this.renderSidebar();
      this.renderHeaderUser();
      this.navigate(this.currentView);
    }
  },

  // Switch between Sign In and Sign Up modes
  setAuthMode(mode, selectedRole = 'student') {
    this.authMode = mode;
    const container = document.getElementById('login-card-container');
    if (!container) return;

    if (mode === 'signup') {
      container.style.maxWidth = '580px';
      this.renderSignUpScreen(selectedRole);
    } else {
      container.style.maxWidth = '440px';
      this.renderLoginScreen(selectedRole);
    }
  },

  // Render Login UI
  renderLoginScreen(selectedRole = 'admin') {
    this.authMode = 'login';
    const container = document.getElementById('login-card-container');
    if (!container) return;
    container.style.maxWidth = '440px';

    let defaultEmail = 'admin@apex.edu';
    let defaultPass = 'admin123';
    let roleTitle = 'Administrator Portal';

    if (selectedRole === 'teacher') {
      defaultEmail = 'sarah.collins@apex.edu';
      defaultPass = 'teacher123';
      roleTitle = 'Faculty / Teacher Portal';
    } else if (selectedRole === 'student') {
      defaultEmail = 'alex.j@student.apex.edu';
      defaultPass = 'student123';
      roleTitle = 'Student Portal';
    }

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div class="brand-icon" style="margin: 0 auto 0.75rem auto; width: 48px; height: 48px; font-size: 1.5rem;">
          <i data-lucide="shield-check"></i>
        </div>
        <h2 style="font-size: 1.55rem; font-weight: 800;">Smart Attendance Management</h2>
        <p style="font-size: 0.84rem; color: var(--text-secondary);">Secure Institutional Gateway</p>
      </div>

      <!-- Auth Mode Switcher (Sign In vs Sign Up) -->
      <div style="display: flex; background: var(--bg-surface-elevated); padding: 4px; border-radius: var(--radius-md); margin-bottom: 1.25rem; border: 1px solid var(--border-color);">
        <button type="button" class="btn btn-sm ${this.authMode === 'login' ? 'btn-primary' : 'btn-outline'}" style="flex: 1; border: none; font-weight: 700;" onclick="App.setAuthMode('login', '${selectedRole}')">
          <i data-lucide="log-in"></i> Sign In
        </button>
        <button type="button" class="btn btn-sm ${this.authMode === 'signup' ? 'btn-primary' : 'btn-outline'}" style="flex: 1; border: none; font-weight: 700;" onclick="App.setAuthMode('signup', '${selectedRole}')">
          <i data-lucide="user-plus"></i> Create Account
        </button>
      </div>

      <!-- Role Selector Tabs -->
      <div class="role-pill-group" style="margin-bottom: 1.25rem; justify-content: center;">
        <button type="button" class="role-btn ${selectedRole === 'admin' ? 'active' : ''}" onclick="App.renderLoginScreen('admin')">
          <i data-lucide="shield"></i> Admin
        </button>
        <button type="button" class="role-btn ${selectedRole === 'teacher' ? 'active' : ''}" onclick="App.renderLoginScreen('teacher')">
          <i data-lucide="graduation-cap"></i> Teacher
        </button>
        <button type="button" class="role-btn ${selectedRole === 'student' ? 'active' : ''}" onclick="App.renderLoginScreen('student')">
          <i data-lucide="user"></i> Student
        </button>
      </div>

      <!-- Login Form -->
      <form onsubmit="App.handleLoginSubmit(event, '${selectedRole}')">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="login-email" class="form-control" value="${defaultEmail}" placeholder="name@apex.edu" required />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div style="position: relative;">
            <input type="password" id="login-password" class="form-control" value="${defaultPass}" placeholder="••••••••" required />
            <button type="button" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: var(--text-muted); cursor: pointer;" onclick="App.togglePasswordVisibility('login-password', 'password-eye-icon')">
              <i data-lucide="eye" id="password-eye-icon"></i>
            </button>
          </div>
        </div>

        <div id="login-error-msg" style="color: var(--danger); font-size: 0.8rem; margin-bottom: 1rem; display: none;"></div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-bottom: 1rem;">
          <i data-lucide="log-in"></i> Sign In to ${roleTitle}
        </button>
      </form>

      <!-- Prompt to Sign Up -->
      <div style="text-align: center; font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1rem;">
        Don't have an account? 
        <a href="javascript:void(0)" onclick="App.setAuthMode('signup', '${selectedRole}')" style="color: var(--primary); font-weight: 700; text-decoration: none;">
          Sign Up / Register Here →
        </a>
      </div>

      <!-- Quick 1-Click Demo Buttons -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: 0.5rem; text-align: center;">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
          ⚡ 1-Click Quick Demo Sign-In
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          <button type="button" class="btn btn-outline btn-sm" onclick="Auth.quickLogin('admin')">Admin</button>
          <button type="button" class="btn btn-outline btn-sm" onclick="Auth.quickLogin('teacher')">Dr. Collins</button>
          <button type="button" class="btn btn-outline btn-sm" onclick="Auth.quickLogin('student')">Alex J.</button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // Render Sign-Up / Registration UI
  renderSignUpScreen(selectedRole = 'student') {
    this.authMode = 'signup';
    const container = document.getElementById('login-card-container');
    if (!container) return;
    container.style.maxWidth = '580px';

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div class="brand-icon" style="margin: 0 auto 0.5rem auto; width: 44px; height: 44px; font-size: 1.3rem;">
          <i data-lucide="user-plus"></i>
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 800;">Create Your Account</h2>
        <p style="font-size: 0.84rem; color: var(--text-secondary);">Join Smart Attendance Management as a Student, Faculty, or Admin</p>
      </div>

      <!-- Auth Mode Switcher (Sign In vs Sign Up) -->
      <div style="display: flex; background: var(--bg-surface-elevated); padding: 4px; border-radius: var(--radius-md); margin-bottom: 1.25rem; border: 1px solid var(--border-color);">
        <button type="button" class="btn btn-sm ${this.authMode === 'login' ? 'btn-primary' : 'btn-outline'}" style="flex: 1; border: none; font-weight: 700;" onclick="App.setAuthMode('login', '${selectedRole}')">
          <i data-lucide="log-in"></i> Sign In
        </button>
        <button type="button" class="btn btn-sm ${this.authMode === 'signup' ? 'btn-primary' : 'btn-outline'}" style="flex: 1; border: none; font-weight: 700;" onclick="App.setAuthMode('signup', '${selectedRole}')">
          <i data-lucide="user-plus"></i> Create Account
        </button>
      </div>

      <!-- Role Selector Tabs -->
      <div class="role-pill-group" style="margin-bottom: 1.25rem; justify-content: center;">
        <button type="button" class="role-btn ${selectedRole === 'student' ? 'active' : ''}" onclick="App.renderSignUpScreen('student')">
          <i data-lucide="user"></i> Student Account
        </button>
        <button type="button" class="role-btn ${selectedRole === 'teacher' ? 'active' : ''}" onclick="App.renderSignUpScreen('teacher')">
          <i data-lucide="graduation-cap"></i> Faculty Member
        </button>
        <button type="button" class="role-btn ${selectedRole === 'admin' ? 'active' : ''}" onclick="App.renderSignUpScreen('admin')">
          <i data-lucide="shield"></i> Administrator
        </button>
      </div>

      <!-- Sign-Up Registration Form -->
      <form onsubmit="App.handleSignUpSubmit(event, '${selectedRole}')">
        
        <!-- Common Fields: Full Name & Email -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Full Name <span style="color: var(--danger);">*</span></label>
            <input type="text" id="signup-name" class="form-control" placeholder="e.g. Jordan Miller" required />
          </div>
          <div class="form-group">
            <label class="form-label">Institutional Email <span style="color: var(--danger);">*</span></label>
            <input type="email" id="signup-email" class="form-control" placeholder="name@apex.edu" required />
          </div>
        </div>

        <!-- Role-Specific Fields -->
        ${selectedRole === 'student' ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Roll Number <span style="color: var(--danger);">*</span></label>
              <input type="text" id="signup-rollno" class="form-control" placeholder="e.g. CS24-105" required />
            </div>
            <div class="form-group">
              <label class="form-label">Department / Major</label>
              <select id="signup-dept" class="form-control">
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Date of Birth</label>
              <input type="date" id="signup-dob" class="form-control" value="2004-05-15" required />
            </div>
            <div class="form-group">
              <label class="form-label">Class Section</label>
              <select id="signup-section" class="form-control">
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Guardian / Parent Name</label>
              <input type="text" id="signup-guardian-name" class="form-control" placeholder="e.g. Robert Miller" />
            </div>
            <div class="form-group">
              <label class="form-label">Guardian Phone</label>
              <input type="text" id="signup-guardian-phone" class="form-control" placeholder="+1 (555) 234-5678" />
            </div>
          </div>
        ` : (selectedRole === 'teacher' ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Department</label>
              <select id="signup-dept" class="form-control">
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Cybersecurity & Networks">Cybersecurity & Networks</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Office / Cabin</label>
              <input type="text" id="signup-cabin" class="form-control" placeholder="Room 405, Block A" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Contact Phone</label>
            <input type="text" id="signup-phone" class="form-control" placeholder="+1 (555) 987-6543" />
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Administrative Title</label>
              <input type="text" id="signup-title" class="form-control" placeholder="e.g. Dean of Students" />
            </div>
            <div class="form-group">
              <label class="form-label">Admin Security Code</label>
              <input type="password" id="signup-admin-code" class="form-control" placeholder="ADMIN-2026" value="ADMIN-2026" />
            </div>
          </div>
        `)}

        <!-- Password & Confirm Password -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="form-group">
            <label class="form-label">Password <span style="color: var(--danger);">*</span></label>
            <div style="position: relative;">
              <input type="password" id="signup-password" class="form-control" placeholder="Min 6 characters" required />
              <button type="button" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: var(--text-muted); cursor: pointer;" onclick="App.togglePasswordVisibility('signup-password', 'signup-pass-eye')">
                <i data-lucide="eye" id="signup-pass-eye"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Confirm Password <span style="color: var(--danger);">*</span></label>
            <input type="password" id="signup-confirm-password" class="form-control" placeholder="Re-enter password" required />
          </div>
        </div>

        <div id="signup-error-msg" style="color: var(--danger); font-size: 0.8rem; margin-bottom: 1rem; display: none;"></div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem; margin-bottom: 1rem;">
          <i data-lucide="check-circle-2"></i> Register & Enter System
        </button>
      </form>

      <!-- Back to Sign In link -->
      <div style="text-align: center; font-size: 0.84rem; color: var(--text-secondary);">
        Already have an account? 
        <a href="javascript:void(0)" onclick="App.setAuthMode('login', '${selectedRole}')" style="color: var(--primary); font-weight: 700; text-decoration: none;">
          Sign In Here →
        </a>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  handleLoginSubmit(e, role) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error-msg');

    const result = Auth.login(email, pass, role);
    if (!result.success) {
      if (errorEl) {
        errorEl.textContent = result.message;
        errorEl.style.display = 'block';
      }
      Utils.showToast("Login Failed", result.message, "danger");
    }
  },

  handleSignUpSubmit(e, role) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-password').value;
    const confirmPass = document.getElementById('signup-confirm-password').value;
    const errorEl = document.getElementById('signup-error-msg');

    if (pass !== confirmPass) {
      if (errorEl) {
        errorEl.textContent = "Passwords do not match. Please re-enter.";
        errorEl.style.display = 'block';
      }
      Utils.showToast("Password Mismatch", "Passwords do not match.", "warning");
      return;
    }

    if (pass.length < 6) {
      if (errorEl) {
        errorEl.textContent = "Password must be at least 6 characters long.";
        errorEl.style.display = 'block';
      }
      Utils.showToast("Weak Password", "Password must be at least 6 characters.", "warning");
      return;
    }

    let extraDetails = {};
    if (role === 'student') {
      extraDetails.rollNo = document.getElementById('signup-rollno')?.value.trim();
      extraDetails.department = document.getElementById('signup-dept')?.value;
      extraDetails.dob = document.getElementById('signup-dob')?.value;
      extraDetails.section = document.getElementById('signup-section')?.value;
      extraDetails.guardianName = document.getElementById('signup-guardian-name')?.value.trim();
      extraDetails.guardianPhone = document.getElementById('signup-guardian-phone')?.value.trim();
    } else if (role === 'teacher') {
      extraDetails.department = document.getElementById('signup-dept')?.value;
      extraDetails.cabin = document.getElementById('signup-cabin')?.value.trim();
      extraDetails.phone = document.getElementById('signup-phone')?.value.trim();
    } else { // Admin
      extraDetails.title = document.getElementById('signup-title')?.value.trim();
    }

    const result = Auth.register({
      name,
      email,
      password: pass,
      role,
      ...extraDetails
    });

    if (!result.success) {
      if (errorEl) {
        errorEl.textContent = result.message;
        errorEl.style.display = 'block';
      }
      Utils.showToast("Registration Failed", result.message, "danger");
    } else {
      Utils.showToast("🎉 Account Created!", `Welcome to Smart Attendance Management, ${name}!`, "success");
    }
  },

  togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const eye = document.getElementById(iconId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (eye) eye.setAttribute('data-lucide', 'eye-off');
    } else {
      input.type = 'password';
      if (eye) eye.setAttribute('data-lucide', 'eye');
    }
    if (window.lucide) window.lucide.createIcons();
  },

  onAuthSuccess(user) {
    Utils.showToast("Welcome Back!", `Signed in as ${user.name} (${user.role.toUpperCase()})`, "success");
    this.checkAuthAndRender();
  },

  onLogout() {
    Utils.showToast("Signed Out", "You have been logged out securely.", "info");
    this.checkAuthAndRender();
  },

  // Theme Management
  initTheme() {
    const savedTheme = localStorage.getItem('SMART_ATTENDANCE_THEME') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('SMART_ATTENDANCE_THEME', next);
    Utils.showToast("Theme Changed", `Switched to ${next} mode`, "info", 1500);
  },

  // Role Switching from Header
  switchRole(role) {
    Auth.quickLogin(role);
  },

  renderHeaderUser() {
    const user = Auth.getCurrentUser();
    const role = Auth.getCurrentRole();

    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });

    const userBadge = document.getElementById('header-user-badge');
    if (userBadge) {
      userBadge.innerHTML = `
        <img src="${user.avatar}" alt="${user.name}" class="user-avatar" />
        <div class="user-info">
          <span class="user-name">${user.name}</span>
          <span class="user-role-tag">${role.toUpperCase()} PORTAL</span>
        </div>
      `;
    }
  },

  // Dynamic Sidebar Navigation based on Role
  renderSidebar() {
    const role = Auth.getCurrentRole();
    const container = document.getElementById('sidebar-nav-list');
    if (!container) return;

    let items = [];

    if (role === 'admin') {
      items = [
        { id: 'dashboard', icon: 'layout-dashboard', label: 'Master Dashboard' },
        { id: 'students', icon: 'users', label: 'Student Management' },
        { id: 'teachers', icon: 'graduation-cap', label: 'Faculty Management' },
        { id: 'classes', icon: 'book-open', label: 'Classes & Sections' },
        { id: 'sessions', icon: 'calendar', label: 'Academic Sessions' },
        { id: 'reports', icon: 'file-bar-chart', label: 'Attendance Records' },
        { id: 'announcements', icon: 'megaphone', label: 'Announcements' },
        { id: 'audit-logs', icon: 'shield-alert', label: 'Audit Trail Logs' },
        { id: 'smart-hub', icon: 'qr-code', label: 'Smart QR & Face Hub' },
        { id: 'geofence-config', icon: 'map-pin', label: 'Campus Geofence' },
        { id: 'profile', icon: 'user', label: 'My Profile' }
      ];
    } else if (role === 'teacher') {
      items = [
        { id: 'dashboard', icon: 'layout-dashboard', label: 'Teacher Dashboard' },
        { id: 'manual-roll', icon: 'check-square', label: 'Record Attendance' },
        { id: 'students', icon: 'users', label: 'Student Directory' },
        { id: 'reports', icon: 'file-bar-chart', label: 'Class Reports' },
        { id: 'leaves', icon: 'file-text', label: 'Leave Requests' },
        { id: 'announcements', icon: 'megaphone', label: 'School Notices' },
        { id: 'profile', icon: 'user', label: 'My Profile' }
      ];
    } else { // Student
      items = [
        { id: 'dashboard', icon: 'layout-dashboard', label: 'My Attendance & 75%' },
        { id: 'smart-hub', icon: 'scan', label: 'Smart Check-In Hub' },
        { id: 'reports', icon: 'history', label: 'Attendance History' },
        { id: 'announcements', icon: 'megaphone', label: 'Announcements' },
        { id: 'leaves', icon: 'file-plus', label: 'Apply for Leave' },
        { id: 'profile', icon: 'user', label: 'My Profile' }
      ];
    }

    container.innerHTML = `
      <div class="nav-section-title">Navigation Menu</div>
      ${items.map(item => `
        <a class="nav-item ${this.currentView === item.id ? 'active' : ''}" onclick="App.navigate('${item.id}')">
          <i data-lucide="${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      `).join('')}
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  // Navigation Router
  navigate(viewName) {
    this.currentView = viewName;
    const container = document.getElementById('view-container');
    if (!container) return;

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('onclick')?.includes(`'${viewName}'`));
    });

    const role = Auth.getCurrentRole();

    switch (viewName) {
      case 'dashboard':
        if (role === 'admin') Dashboards.renderAdminDashboard(container);
        else if (role === 'teacher') Dashboards.renderTeacherDashboard(container);
        else Dashboards.renderStudentDashboard(container);
        break;

      case 'students':
        StudentMgmt.render(container);
        break;

      case 'teachers':
        TeacherMgmt.render(container);
        break;

      case 'classes':
        ClassMgmt.render(container);
        break;

      case 'sessions':
        AcademicSessionMgmt.render(container);
        break;

      case 'reports':
        Reports.render(container);
        break;

      case 'announcements':
        Announcements.render(container);
        break;

      case 'audit-logs':
        AuditLogs.render(container);
        break;

      case 'manual-roll':
        container.innerHTML = `<div id="manual-roll-call-container"></div>`;
        SmartAttendance.renderManualRollCall('manual-roll-call-container', 'CS301', 'Section A');
        break;

      case 'smart-hub':
        this.renderSmartHubView(container);
        break;

      case 'geofence-config':
        this.renderGeofenceConfigView(container);
        break;

      case 'leaves':
        this.renderLeavesView(container);
        break;

      case 'profile':
        this.renderProfileView(container);
        break;

      default:
        Dashboards.renderAdminDashboard(container);
    }

    if (window.lucide) window.lucide.createIcons();
  },

  refreshCurrentView() {
    this.navigate(this.currentView);
  },

  renderSmartHubView(container) {
    const role = Auth.getCurrentRole();
    const subjects = window.store.getSubjects();

    if (role === 'student') {
      container.innerHTML = `
        <div class="card" style="margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="zap" style="color: var(--accent-cyan);"></i> Student Smart Check-in Hub
          </h2>
          <p style="font-size: 0.84rem; color: var(--text-secondary);">Choose your automated biometric or dynamic scan verification</p>
        </div>

        <div class="dashboard-grid-2col">
          <div class="card" style="text-align: center; padding: 2rem;">
            <div class="metric-icon-box" style="margin: 0 auto 1.25rem auto; width: 64px; height: 64px; font-size: 1.8rem; background: rgba(79, 70, 229, 0.15); color: var(--primary);">
              <i data-lucide="qr-code"></i>
            </div>
            <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">Scan Teacher's Dynamic QR</h3>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Point your camera at the rotating QR code projected in class</p>
            <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="SmartAttendance.openStudentQRScanner()">
              <i data-lucide="camera"></i> Launch Camera QR Scanner
            </button>
          </div>

          <div class="card" style="text-align: center; padding: 2rem;">
            <div class="metric-icon-box" style="margin: 0 auto 1.25rem auto; width: 64px; height: 64px; font-size: 1.8rem; background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">
              <i data-lucide="scan-face"></i>
            </div>
            <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">AI Biometric Face Verify</h3>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Instant face mesh scan with anti-spoofing verification</p>
            <button class="btn btn-primary btn-lg" style="width: 100%; background: linear-gradient(135deg, var(--accent-cyan), var(--primary));" onclick="SmartAttendance.openStudentFaceScanner()">
              <i data-lucide="scan"></i> Launch AI Face Recognition
            </button>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="card" style="margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="qr-code" style="color: var(--primary);"></i> Smart Attendance Launcher
          </h2>
          <p style="font-size: 0.84rem; color: var(--text-secondary);">Initiate dynamic rotating QR code sessions with anti-proxy protection</p>
        </div>

        <div class="dashboard-grid-2col">
          <div class="card">
            <h3 style="font-size: 1.15rem; margin-bottom: 1rem;">Launch Dynamic QR Session</h3>
            <div class="form-group">
              <label class="form-label">Select Course / Lecture</label>
              <select class="form-control" id="launch-qr-subject">
                ${subjects.map(s => `<option value="${s.id}">${s.code}: ${s.name}</option>`).join('')}
              </select>
            </div>
            <button class="btn btn-primary btn-lg" style="width: 100%; margin-top: 1rem;" onclick="SmartAttendance.startQRSession(document.getElementById('launch-qr-subject').value)">
              <i data-lucide="play-circle"></i> Start Live Projected QR
            </button>
          </div>

          <div class="card">
            <h3 style="font-size: 1.15rem; margin-bottom: 1rem;">Anti-Proxy & Security Features</h3>
            <ul style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.88rem; color: var(--text-secondary); list-style: none;">
              <li style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="shield-check" style="color: var(--success);"></i>
                <strong>10-Second Token Rotation:</strong> Prevents photo sharing among students
              </li>
              <li style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="map-pin" style="color: var(--accent-cyan);"></i>
                <strong>150m Campus Geofence:</strong> Rejects check-ins from outside classroom
              </li>
              <li style="display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="scan-face" style="color: var(--secondary);"></i>
                <strong>AI Biometric Matching:</strong> Validates face geometry
              </li>
            </ul>
          </div>
        </div>
      `;
    }
  },

  renderProfileView(container) {
    const user = Auth.getCurrentUser();
    const role = Auth.getCurrentRole();

    // Fetch synchronized entity if exists
    let studentData = null;
    let teacherData = null;
    if (role === 'student' && window.store) {
      studentData = window.store.getStudentById(user.id) || window.store.getStudents().find(s => s.email.toLowerCase() === user.email.toLowerCase()) || user;
    } else if (role === 'teacher' && window.store) {
      teacherData = window.store.getTeacherById(user.id) || window.store.getTeachers().find(t => t.email.toLowerCase() === user.email.toLowerCase()) || user;
    }

    const displayName = user.name || (studentData ? studentData.name : (teacherData ? teacherData.name : 'User'));
    const displayEmail = user.email || (studentData ? studentData.email : (teacherData ? teacherData.email : 'user@apex.edu'));
    const displayPhone = user.phone || (studentData ? studentData.phone : (teacherData ? teacherData.phone : '+1 (555) 000-0000'));
    const displayAvatar = user.avatar || (studentData ? studentData.avatar : (teacherData ? teacherData.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'));
    const displayTitle = user.title || (role === 'admin' ? 'Institutional Administrator & Academic Dean' : (role === 'teacher' ? 'Faculty Member & Instructor' : 'Undergraduate Student'));
    const displayDept = user.department || (studentData ? studentData.department : (teacherData ? teacherData.department : 'Computer Science'));

    container.innerHTML = `
      <!-- Hero Profile Header Banner -->
      <div class="profile-hero-card">
        <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <div class="profile-hero-avatar-wrapper">
            <img src="${displayAvatar}" alt="${displayName}" class="profile-hero-avatar" />
            <button class="profile-hero-edit-btn" onclick="App.openEditProfileModal()" title="Edit Profile & Avatar">
              <i data-lucide="camera" style="width: 15px; height: 15px;"></i>
            </button>
          </div>

          <div class="profile-hero-details">
            <div class="profile-hero-name">
              ${displayName}
              <span class="profile-hero-role-pill"><i data-lucide="shield-check" style="width: 12px; height: 12px; display: inline;"></i> ${role.toUpperCase()} PORTAL</span>
            </div>
            <div style="font-size: 0.95rem; color: var(--text-secondary); font-weight: 500;">
              ${displayTitle}
            </div>
            <div class="profile-meta-chips">
              <span class="profile-meta-chip"><i data-lucide="mail"></i> ${displayEmail}</span>
              <span class="profile-meta-chip"><i data-lucide="phone"></i> ${displayPhone}</span>
              <span class="profile-meta-chip"><i data-lucide="building"></i> ${displayDept}</span>
            </div>
          </div>
        </div>

        <div class="profile-action-group">
          <button class="btn btn-primary" onclick="App.openEditProfileModal()">
            <i data-lucide="edit-3"></i> Edit Profile
          </button>
          <button class="btn btn-outline" onclick="App.openChangePasswordModal()">
            <i data-lucide="key"></i> Change Password
          </button>
        </div>
      </div>

      <!-- Profile Content Grid -->
      <div class="dashboard-grid-2col">
        
        <!-- Left Column: Detailed Profile Attributes -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <h3 style="font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="id-card" style="color: var(--primary);"></i> Account & Academic Details
              </h3>
              <button class="btn btn-outline btn-sm" onclick="App.openEditProfileModal()">
                <i data-lucide="edit-2"></i> Edit Details
              </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div class="profile-info-card-item">
                <span class="item-label">Full Legal Name</span>
                <span class="item-value">${displayName}</span>
              </div>
              <div class="profile-info-card-item">
                <span class="item-label">Institutional Email</span>
                <span class="item-value">${displayEmail}</span>
              </div>
              <div class="profile-info-card-item">
                <span class="item-label">Phone Number</span>
                <span class="item-value">${displayPhone}</span>
              </div>
              <div class="profile-info-card-item">
                <span class="item-label">Department / Faculty</span>
                <span class="item-value">${displayDept}</span>
              </div>

              ${role === 'student' ? `
                <div class="profile-info-card-item">
                  <span class="item-label">Roll Number</span>
                  <span class="item-value">${user.rollNo || (studentData && studentData.rollNo) || 'CS24-042'}</span>
                </div>
                <div class="profile-info-card-item">
                  <span class="item-label">Class Section</span>
                  <span class="item-value">${(studentData && studentData.section) || user.section || 'Section A'}</span>
                </div>
                <div class="profile-info-card-item">
                  <span class="item-label">Date of Birth</span>
                  <span class="item-value">${(studentData && studentData.dob) || user.dob || '2004-06-14'}</span>
                </div>
                <div class="profile-info-card-item">
                  <span class="item-label">Batch & Semester</span>
                  <span class="item-value">${(studentData && studentData.semester) || '6th Semester'} (${(studentData && studentData.batch) || '2023-2027'})</span>
                </div>
                <div class="profile-info-card-item" style="grid-column: 1 / -1;">
                  <span class="item-label">Guardian / Parent Contact</span>
                  <span class="item-value">👨‍👧 ${(studentData && studentData.guardianName) || user.guardianName || 'Robert Johnson'} • 📞 ${(studentData && studentData.guardianPhone) || user.guardianPhone || '+1 (555) 101-2002'}</span>
                </div>
                <div class="profile-info-card-item" style="grid-column: 1 / -1;">
                  <span class="item-label">Campus / Residential Address</span>
                  <span class="item-value">🏠 ${(studentData && studentData.address) || user.address || 'Apex University Campus Residence, Block 4'}</span>
                </div>
              ` : ''}

              ${role === 'teacher' ? `
                <div class="profile-info-card-item">
                  <span class="item-label">Office / Cabin Room</span>
                  <span class="item-value">🚪 ${(teacherData && teacherData.cabin) || user.cabin || 'Room 402, Block A'}</span>
                </div>
                <div class="profile-info-card-item">
                  <span class="item-label">Faculty Designation</span>
                  <span class="item-value">${displayTitle}</span>
                </div>
                <div class="profile-info-card-item" style="grid-column: 1 / -1;">
                  <span class="item-label">Assigned Teaching Courses</span>
                  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 4px;">
                    ${((teacherData && teacherData.subjects) || ['CS301', 'CS302']).map(s => `<span class="badge badge-primary">${s}</span>`).join('')}
                  </div>
                </div>
              ` : ''}

              ${role === 'admin' ? `
                <div class="profile-info-card-item">
                  <span class="item-label">Administrative Rank</span>
                  <span class="item-value">Executive System Administrator</span>
                </div>
                <div class="profile-info-card-item">
                  <span class="item-label">Security Authorization Level</span>
                  <span class="item-value"><span class="badge badge-danger">Full SuperAdmin (Tier 1)</span></span>
                </div>
                <div class="profile-info-card-item" style="grid-column: 1 / -1;">
                  <span class="item-label">System Privileges</span>
                  <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
                    • Full CRUD access to Students, Faculty, Courses, Geofencing, Reports, System Audit Logs, and Attendance Override Authorizations.
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Quick Preset Avatar Gallery Card -->
          <div class="card">
            <h3 style="font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
              <i data-lucide="palette" style="color: var(--accent-cyan);"></i> Quick Avatar Selector
            </h3>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
              Click any photo preset below to immediately update your active profile avatar:
            </p>
            <div class="avatar-preset-list" style="gap: 12px;">
              ${this.AVATAR_PRESETS.map((preset) => `
                <img 
                  src="${preset.url}" 
                  alt="${preset.name}" 
                  class="avatar-preset-thumb ${displayAvatar === preset.url ? 'active' : ''}" 
                  title="${preset.name}" 
                  onclick="App.quickUpdateAvatar('${preset.url}')"
                  style="width: 48px; height: 48px;" 
                />
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Right Column: Security & System Settings -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Security Card -->
          <div class="card">
            <h3 style="font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
              <i data-lucide="shield" style="color: var(--success);"></i> Security & Credentials
            </h3>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div>
                  <div style="font-weight: 700; font-size: 0.92rem;">Account Password</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Last changed recently • Protected</div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="App.openChangePasswordModal()">
                  <i data-lucide="key"></i> Update
                </button>
              </div>

              ${role === 'student' ? `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                  <div>
                    <div style="font-weight: 700; font-size: 0.92rem;">AI Face Biometric Profile</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">Touchless QR & Face Scanner Enrollment</div>
                  </div>
                  <span class="badge badge-success"><i data-lucide="check"></i> Enrolled</span>
                </div>

                <button class="btn btn-primary" style="width: 100%;" onclick="SmartAttendance.openStudentFaceScanner()">
                  <i data-lucide="scan-face"></i> Re-Calibrate Biometric Face Scan
                </button>
              ` : ''}

              <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--bg-surface-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div>
                  <div style="font-weight: 700; font-size: 0.92rem;">Active Session Status</div>
                  <div style="font-size: 0.78rem; color: var(--success); font-weight: 600;">● Online (Local Node)</div>
                </div>
                <span class="badge badge-primary">256-Bit SSL</span>
              </div>
            </div>
          </div>

          <!-- Quick Action Card -->
          <div class="card" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(6, 182, 212, 0.08));">
            <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.75rem;">Need to Update Profile?</h3>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
              You can modify your registered name, institutional contact info, department, and profile picture at any time.
            </p>
            <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="App.openEditProfileModal()">
              <i data-lucide="user-check"></i> Open Profile Editor
            </button>
          </div>

        </div>

      </div>
    `;
  },

  renderGeofenceConfigView(container) {
    const geo = window.store.getGeofence();
    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="map-pin" style="color: var(--primary);"></i> Campus Geofencing & Smart Rules
        </h2>
        <p style="font-size: 0.84rem; color: var(--text-secondary);">Configure GPS boundaries and security restrictions for attendance verification</p>
      </div>

      <div class="dashboard-grid-2col">
        <div class="card">
          <h3 style="font-size: 1.15rem; margin-bottom: 1.25rem;">Geofence Parameters</h3>
          <div class="form-group">
            <label class="form-label">Campus Name</label>
            <input type="text" class="form-control" id="geo-campus-name" value="${geo.campusName}" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Latitude</label>
              <input type="number" step="0.0001" class="form-control" id="geo-lat" value="${geo.centerLat}" />
            </div>
            <div class="form-group">
              <label class="form-label">Longitude</label>
              <input type="number" step="0.0001" class="form-control" id="geo-lng" value="${geo.centerLng}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Allowed Radius (Meters)</label>
            <input type="number" class="form-control" id="geo-radius" value="${geo.radiusMeters}" />
          </div>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="App.saveGeofenceSettings()">
            <i data-lucide="save"></i> Save Geofence Settings
          </button>
        </div>

        <div class="card" style="text-align: center;">
          <h3 style="font-size: 1.15rem; margin-bottom: 1rem;">Live Campus Geofence Radar</h3>
          <div class="geofence-radar-box">
            <div class="radar-ring r1"></div>
            <div class="radar-ring r2"></div>
            <div class="radar-ring r3"></div>
            <div class="radar-center-pin" title="Campus Center"></div>
            <div class="radar-student-pin" style="top: 35%; left: 60%;" title="Student in Range"></div>
          </div>
          <div style="font-size: 0.85rem; color: var(--success); font-weight: 700;">
            Active Radius: ${geo.radiusMeters}m Around Campus Epicenter
          </div>
        </div>
      </div>
    `;
  },

  saveGeofenceSettings() {
    const campusName = document.getElementById('geo-campus-name').value;
    const centerLat = parseFloat(document.getElementById('geo-lat').value);
    const centerLng = parseFloat(document.getElementById('geo-lng').value);
    const radiusMeters = parseInt(document.getElementById('geo-radius').value, 10);

    window.store.updateGeofence({ campusName, centerLat, centerLng, radiusMeters });
    Utils.showToast("Settings Saved", "Campus geofence updated successfully.", "success");
  },

  renderLeavesView(container) {
    const leaves = window.store.getLeaveRequests();
    const role = Auth.getCurrentRole();

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="file-text" style="color: var(--warning);"></i> Student Leave Management
            </h2>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">Manage, review, and track student absence requests</p>
          </div>
          ${role === 'student' ? `
            <button class="btn btn-primary" onclick="App.openLeaveApplicationModal()">
              <i data-lucide="plus"></i> Submit Leave Request
            </button>
          ` : ''}
        </div>
      </div>

      <div class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course / Subject</th>
              <th>Leave Dates</th>
              <th>Reason</th>
              <th>Status</th>
              ${role !== 'student' ? '<th style="text-align: right;">Action</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${leaves.map(l => `
              <tr>
                <td><strong>${l.studentName}</strong> (${l.rollNo})</td>
                <td>${l.subjectName}</td>
                <td>${l.dateFrom} to ${l.dateTo}</td>
                <td style="max-width: 250px;">${l.reason}</td>
                <td>
                  <span class="badge ${l.status === 'Approved' ? 'badge-success' : (l.status === 'Rejected' ? 'badge-danger' : 'badge-warning')}">
                    ${l.status}
                  </span>
                </td>
                ${role !== 'student' ? `
                  <td style="text-align: right;">
                    ${l.status === 'Pending' ? `
                      <button class="btn btn-success btn-sm" onclick="Dashboards.approveLeave('${l.id}')">Approve</button>
                      <button class="btn btn-outline btn-sm" onclick="Dashboards.rejectLeave('${l.id}')">Reject</button>
                    ` : `<span style="font-size: 0.8rem; color: var(--text-muted);">Reviewed</span>`}
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openPINModal() {
    const modal = document.getElementById('pin-entry-modal');
    if (modal) modal.classList.add('active');
  },

  handlePINSubmit() {
    const pin = document.getElementById('student-pin-input').value;
    if (pin.length === 4) {
      SmartAttendance.recordSuccessfulCheckIn({ method: 'PIN Entry', confidence: 100 });
      document.getElementById('pin-entry-modal').classList.remove('active');
    } else {
      Utils.showToast("Invalid PIN", "Please enter a 4-digit numeric PIN.", "warning");
    }
  },

  openLeaveApplicationModal() {
    const modal = document.getElementById('leave-app-modal');
    if (modal) modal.classList.add('active');
  },

  handleLeaveApplicationSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const student = Auth.getCurrentUser();
    const subjectId = document.getElementById('leave-subject').value;
    const dateFrom = document.getElementById('leave-from').value;
    const dateTo = document.getElementById('leave-to').value;
    const reason = document.getElementById('leave-reason').value;

    if (!dateFrom || !dateTo || !reason) {
      Utils.showToast("Missing Fields", "Please complete all fields.", "danger");
      return;
    }

    const sub = window.store.getSubjectById(subjectId);

    window.store.addLeaveRequest({
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      subjectId: subjectId,
      subjectName: sub ? sub.name : "Subject",
      dateFrom,
      dateTo,
      reason
    });

    Utils.showToast("Leave Submitted", "Your leave application has been submitted for faculty review.", "success");
    document.getElementById('leave-app-modal').classList.remove('active');
    this.refreshCurrentView();
  },

  // Profile Edit & Avatar Customization Modals
  openEditProfileModal() {
    const user = Auth.getCurrentUser();
    const role = Auth.getCurrentRole();

    let studentData = null;
    let teacherData = null;
    if (role === 'student' && window.store) {
      studentData = window.store.getStudentById(user.id) || window.store.getStudents().find(s => s.email.toLowerCase() === user.email.toLowerCase()) || user;
    } else if (role === 'teacher' && window.store) {
      teacherData = window.store.getTeacherById(user.id) || window.store.getTeachers().find(t => t.email.toLowerCase() === user.email.toLowerCase()) || user;
    }

    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    // Role badge
    const roleBadge = document.getElementById('edit-profile-role-badge');
    if (roleBadge) roleBadge.textContent = role.toUpperCase();

    // Basic inputs
    const previewImg = document.getElementById('edit-profile-avatar-preview');
    const avatarInput = document.getElementById('edit-profile-avatar-url');
    const nameInput = document.getElementById('edit-profile-name');
    const emailInput = document.getElementById('edit-profile-email');
    const phoneInput = document.getElementById('edit-profile-phone');
    const titleInput = document.getElementById('edit-profile-title');

    const currentAvatar = user.avatar || (studentData && studentData.avatar) || (teacherData && teacherData.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    if (previewImg) previewImg.src = currentAvatar;
    if (avatarInput) avatarInput.value = currentAvatar;
    if (nameInput) nameInput.value = user.name || (studentData && studentData.name) || (teacherData && teacherData.name) || '';
    if (emailInput) emailInput.value = user.email || (studentData && studentData.email) || (teacherData && teacherData.email) || '';
    if (phoneInput) phoneInput.value = user.phone || (studentData && studentData.phone) || (teacherData && teacherData.phone) || '';
    if (titleInput) titleInput.value = user.title || (role === 'admin' ? 'Institutional Administrator & Academic Dean' : (role === 'teacher' ? 'Faculty Member & Instructor' : 'Undergraduate Student'));

    // Dynamic Role Fields
    const dynamicContainer = document.getElementById('edit-profile-dynamic-fields');
    if (dynamicContainer) {
      if (role === 'student') {
        const rollNo = user.rollNo || (studentData && studentData.rollNo) || 'CS24-042';
        const dept = user.department || (studentData && studentData.department) || 'Computer Science';
        const dob = (studentData && studentData.dob) || user.dob || '2004-06-14';
        const section = (studentData && studentData.section) || user.section || 'Section A';
        const gName = (studentData && studentData.guardianName) || user.guardianName || '';
        const gPhone = (studentData && studentData.guardianPhone) || user.guardianPhone || '';
        const gEmail = (studentData && studentData.guardianEmail) || user.guardianEmail || '';
        const addr = (studentData && studentData.address) || user.address || '';

        dynamicContainer.innerHTML = `
          <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: 1rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">Student Academic & Guardian Information</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Department / Major</label>
                <select id="edit-profile-dept" class="form-control">
                  <option value="Computer Science" ${dept === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                  <option value="Information Technology" ${dept === 'Information Technology' ? 'selected' : ''}>Information Technology</option>
                  <option value="Artificial Intelligence" ${dept === 'Artificial Intelligence' ? 'selected' : ''}>Artificial Intelligence</option>
                  <option value="Cybersecurity" ${dept === 'Cybersecurity' ? 'selected' : ''}>Cybersecurity</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Roll Number</label>
                <input type="text" id="edit-profile-rollno" class="form-control" value="${rollNo}" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Date of Birth</label>
                <input type="date" id="edit-profile-dob" class="form-control" value="${dob}" />
              </div>
              <div class="form-group">
                <label class="form-label">Class Section</label>
                <select id="edit-profile-section" class="form-control">
                  <option value="Section A" ${section === 'Section A' ? 'selected' : ''}>Section A</option>
                  <option value="Section B" ${section === 'Section B' ? 'selected' : ''}>Section B</option>
                  <option value="Section C" ${section === 'Section C' ? 'selected' : ''}>Section C</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Guardian / Parent Name</label>
                <input type="text" id="edit-profile-guardian-name" class="form-control" value="${gName}" placeholder="Robert Johnson" />
              </div>
              <div class="form-group">
                <label class="form-label">Guardian Phone</label>
                <input type="tel" id="edit-profile-guardian-phone" class="form-control" value="${gPhone}" placeholder="+1 (555) 101-2002" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Guardian Email</label>
              <input type="email" id="edit-profile-guardian-email" class="form-control" value="${gEmail}" placeholder="parent@family.com" />
            </div>

            <div class="form-group">
              <label class="form-label">Campus / Residential Address</label>
              <textarea id="edit-profile-address" class="form-control" rows="2" placeholder="Hostel Block or Residence...">${addr}</textarea>
            </div>
          </div>
        `;
      } else if (role === 'teacher') {
        const dept = user.department || (teacherData && teacherData.department) || 'Computer Science & Engineering';
        const cabin = user.cabin || (teacherData && teacherData.cabin) || 'Room 402, Block A';

        dynamicContainer.innerHTML = `
          <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: 1rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">Faculty & Departmental Details</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Faculty Department</label>
                <select id="edit-profile-dept" class="form-control">
                  <option value="Computer Science & Engineering" ${dept.includes('Computer') ? 'selected' : ''}>Computer Science & Engineering</option>
                  <option value="Information Technology" ${dept.includes('Information') ? 'selected' : ''}>Information Technology</option>
                  <option value="Artificial Intelligence" ${dept.includes('Artificial') ? 'selected' : ''}>Artificial Intelligence</option>
                  <option value="Cybersecurity & Networks" ${dept.includes('Cyber') ? 'selected' : ''}>Cybersecurity & Networks</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Office / Cabin Room</label>
                <input type="text" id="edit-profile-cabin" class="form-control" value="${cabin}" placeholder="Room 402, Block A" />
              </div>
            </div>
          </div>
        `;
      } else { // Admin
        const dept = user.department || 'Office of Academic Affairs & Administration';
        dynamicContainer.innerHTML = `
          <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: 1rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">Administrative Office</h4>
            <div class="form-group">
              <label class="form-label">Administrative Department / Division</label>
              <input type="text" id="edit-profile-dept" class="form-control" value="${dept}" />
            </div>
          </div>
        `;
      }
    }

    // Render Preset Avatars Thumbnails in modal
    const presetContainer = document.getElementById('avatar-preset-thumbnails');
    if (presetContainer) {
      presetContainer.innerHTML = this.AVATAR_PRESETS.map(p => `
        <img 
          src="${p.url}" 
          alt="${p.name}" 
          class="avatar-preset-thumb ${currentAvatar === p.url ? 'active' : ''}" 
          onclick="App.selectAvatarPreset('${p.url}')" 
          title="Choose ${p.name}" 
        />
      `).join('');
    }

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.classList.remove('active');
  },

  previewAvatarUrl(url) {
    const preview = document.getElementById('edit-profile-avatar-preview');
    if (preview && url) {
      preview.src = url;
    }
  },

  selectAvatarPreset(url) {
    const avatarInput = document.getElementById('edit-profile-avatar-url');
    const preview = document.getElementById('edit-profile-avatar-preview');
    if (avatarInput) avatarInput.value = url;
    if (preview) preview.src = url;

    document.querySelectorAll('#avatar-preset-thumbnails .avatar-preset-thumb').forEach(el => {
      el.classList.toggle('active', el.src === url);
    });
  },

  handleAvatarFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Utils.showToast("Invalid File", "Please select a valid image file (JPG, PNG, WEBP).", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const avatarInput = document.getElementById('edit-profile-avatar-url');
      const preview = document.getElementById('edit-profile-avatar-preview');
      if (avatarInput) avatarInput.value = dataUrl;
      if (preview) preview.src = dataUrl;
      Utils.showToast("Photo Loaded", "Image selected. Click 'Save Changes' to update your profile.", "info");
    };
    reader.readAsDataURL(file);
  },

  quickUpdateAvatar(url) {
    const res = Auth.updateProfile({ avatar: url });
    if (res.success) {
      Utils.showToast("Avatar Updated", "Your profile photo was updated successfully!", "success");
      this.renderHeaderUser();
      this.refreshCurrentView();
    }
  },

  handleEditProfileSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const name = document.getElementById('edit-profile-name')?.value.trim();
    const email = document.getElementById('edit-profile-email')?.value.trim();
    const phone = document.getElementById('edit-profile-phone')?.value.trim();
    const title = document.getElementById('edit-profile-title')?.value.trim();
    const avatar = document.getElementById('edit-profile-avatar-url')?.value.trim();
    const dept = document.getElementById('edit-profile-dept')?.value.trim();
    const rollNo = document.getElementById('edit-profile-rollno')?.value?.trim();
    const dob = document.getElementById('edit-profile-dob')?.value;
    const section = document.getElementById('edit-profile-section')?.value;
    const guardianName = document.getElementById('edit-profile-guardian-name')?.value?.trim();
    const guardianPhone = document.getElementById('edit-profile-guardian-phone')?.value?.trim();
    const guardianEmail = document.getElementById('edit-profile-guardian-email')?.value?.trim();
    const cabin = document.getElementById('edit-profile-cabin')?.value?.trim();
    const address = document.getElementById('edit-profile-address')?.value?.trim();

    if (!name || !email) {
      Utils.showToast("Required Fields", "Please provide a valid name and email address.", "danger");
      return;
    }

    const updateData = {
      name,
      email,
      phone,
      title,
      avatar,
      department: dept,
      rollNo,
      dob,
      section,
      guardianName,
      guardianPhone,
      guardianEmail,
      cabin,
      address
    };

    const result = Auth.updateProfile(updateData);
    if (!result.success) {
      Utils.showToast("Update Failed", result.message, "danger");
      return;
    }

    Utils.showToast("Profile Updated", "Your profile details were saved successfully!", "success");
    this.closeEditProfileModal();
    this.renderHeaderUser();
    this.refreshCurrentView();
  },

  openChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (!modal) return;
    const currentInput = document.getElementById('change-pass-current');
    const newInput = document.getElementById('change-pass-new');
    const confirmInput = document.getElementById('change-pass-confirm');
    const errEl = document.getElementById('change-pass-error-msg');

    if (currentInput) currentInput.value = '';
    if (newInput) newInput.value = '';
    if (confirmInput) confirmInput.value = '';
    if (errEl) errEl.style.display = 'none';

    modal.classList.add('active');
    if (window.lucide) window.lucide.createIcons();
  },

  closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) modal.classList.remove('active');
  },

  handleChangePasswordSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const currentPass = document.getElementById('change-pass-current')?.value;
    const newPass = document.getElementById('change-pass-new')?.value;
    const confirmPass = document.getElementById('change-pass-confirm')?.value;
    const errEl = document.getElementById('change-pass-error-msg');

    if (newPass !== confirmPass) {
      if (errEl) {
        errEl.textContent = "New password and confirmation do not match.";
        errEl.style.display = 'block';
      }
      Utils.showToast("Password Mismatch", "Passwords do not match.", "warning");
      return;
    }

    if (newPass.length < 6) {
      if (errEl) {
        errEl.textContent = "New password must be at least 6 characters long.";
        errEl.style.display = 'block';
      }
      Utils.showToast("Weak Password", "Password must be at least 6 characters.", "warning");
      return;
    }

    const res = Auth.changePassword(currentPass, newPass);
    if (!res.success) {
      if (errEl) {
        errEl.textContent = res.message;
        errEl.style.display = 'block';
      }
      Utils.showToast("Password Error", res.message, "danger");
      return;
    }

    Utils.showToast("Password Changed", "Your password has been successfully updated.", "success");
    this.closeChangePasswordModal();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});

if (typeof window !== 'undefined') {
  window.App = App;
}
