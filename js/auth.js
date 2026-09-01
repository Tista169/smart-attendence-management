/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - AUTH & SESSION MANAGER
 * Secure credential validation, role-based login gate, account registration, demo presets & session storage
 */

const Auth = {
  CURRENT_USER_KEY: 'SMART_ATTENDANCE_ACTIVE_USER',
  IS_AUTH_KEY: 'SMART_ATTENDANCE_IS_AUTHENTICATED',

  currentUser: null,
  isAuthenticated: false,

  init() {
    try {
      const isAuth = localStorage.getItem(this.IS_AUTH_KEY) === 'true';
      const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
      if (isAuth && storedUser) {
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      } else {
        // If not authenticated, do not auto-login so the user sees the Signup / Login gate
        this.currentUser = null;
        this.isAuthenticated = false;
      }
    } catch (e) {
      console.warn("Auth initialization error:", e);
      this.currentUser = null;
      this.isAuthenticated = false;
    }
  },

  getIsAuthenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  },

  getCurrentUser() {
    return this.currentUser || {
      id: "ADM01",
      name: "Dean Arthur Vance",
      role: "admin",
      email: "admin@apex.edu",
      title: "System Administrator",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    };
  },

  getCurrentRole() {
    return (this.currentUser && this.currentUser.role) ? this.currentUser.role : 'admin';
  },

  // Perform Email & Password Login
  login(email, password, expectedRole = null) {
    const authUsers = window.store ? window.store.getAuthUsers() : (window.SEED_DATA.authUsers || []);
    const user = authUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);

    if (!user) {
      return { success: false, message: "Invalid email or password. Please verify your credentials or create a new account." };
    }

    if (expectedRole && user.role !== expectedRole) {
      return { success: false, message: `Account found, but registered role is '${user.role.toUpperCase()}', not '${expectedRole.toUpperCase()}'.` };
    }

    this.currentUser = user;
    this.isAuthenticated = true;

    localStorage.setItem(this.IS_AUTH_KEY, 'true');
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));

    if (window.store) {
      window.store.logActivity({
        action: 'USER_LOGIN',
        category: 'Authentication',
        user: `${user.name} (${user.role.toUpperCase()})`,
        details: `User logged in securely via email (${user.email}).`
      });
    }

    if (window.App && typeof window.App.onAuthSuccess === 'function') {
      window.App.onAuthSuccess(this.currentUser);
    }

    return { success: true, user: this.currentUser };
  },

  // User Registration / Signup
  register(formData) {
    const { name, email, password, role, ...details } = formData;

    if (!name || !email || !password || !role) {
      return { success: false, message: "Please complete all mandatory fields." };
    }

    const authUsers = window.store ? window.store.getAuthUsers() : (window.SEED_DATA.authUsers || []);
    const existing = authUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return { success: false, message: "An account with this email already exists. Please sign in instead." };
    }

    let newUser = null;
    const avatarUrl = details.avatar || (role === 'student' 
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' 
      : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80');

    if (role === 'student') {
      const studentCount = window.store ? window.store.getStudents().length : 7;
      const rollNo = details.rollNo || `CS24-${String(studentCount + 10).padStart(3, '0')}`;
      
      const newStudent = window.store ? window.store.addStudent({
        name,
        email: email.trim(),
        rollNo,
        department: details.department || 'Computer Science',
        dob: details.dob || '2004-06-14',
        section: details.section || 'Section A',
        guardianName: details.guardianName || 'Guardian',
        guardianPhone: details.guardianPhone || '+1 (555) 000-0001',
        phone: details.phone || '+1 (555) 000-0000',
        address: details.address || 'Campus Residence',
        avatar: avatarUrl,
        faceEnrolled: true
      }) : { id: 'S' + (100 + studentCount + 1), name, rollNo };

      newUser = {
        id: newStudent.id,
        name,
        email: email.trim(),
        password,
        role: 'student',
        title: 'Undergraduate Student',
        rollNo: newStudent.rollNo,
        department: details.department || 'Computer Science',
        avatar: avatarUrl
      };
    } else if (role === 'teacher') {
      const teacherCount = window.store ? window.store.getTeachers().length : 4;
      const newTeacher = window.store ? window.store.addTeacher({
        name,
        email: email.trim(),
        department: details.department || 'Computer Science & Engineering',
        cabin: details.cabin || 'Room 302, Block A',
        phone: details.phone || '+1 (555) 234-5678',
        avatar: avatarUrl,
        subjects: details.subjects || ['CS301']
      }) : { id: 'T' + String(teacherCount + 1).padStart(3, '0'), name };

      newUser = {
        id: newTeacher.id,
        name,
        email: email.trim(),
        password,
        role: 'teacher',
        title: details.title || 'Faculty Member',
        department: details.department || 'Computer Science & Engineering',
        avatar: avatarUrl
      };
    } else { // Admin
      const adminCount = authUsers.filter(u => u.role === 'admin').length;
      newUser = {
        id: `ADM${String(adminCount + 1).padStart(2, '0')}`,
        name,
        email: email.trim(),
        password,
        role: 'admin',
        title: details.title || 'Institutional Administrator',
        avatar: avatarUrl
      };
    }

    if (window.store && window.store.state && window.store.state.authUsers) {
      window.store.state.authUsers.push(newUser);
      window.store.saveState();
    }

    // Auto-login after registration
    this.currentUser = newUser;
    this.isAuthenticated = true;
    localStorage.setItem(this.IS_AUTH_KEY, 'true');
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));

    if (window.store) {
      window.store.logActivity({
        action: 'USER_REGISTERED',
        category: 'Authentication',
        user: `${newUser.name} (${newUser.role.toUpperCase()})`,
        details: `New ${newUser.role.toUpperCase()} account created for ${newUser.name} (${newUser.email}).`
      });
    }

    if (window.App && typeof window.App.onAuthSuccess === 'function') {
      window.App.onAuthSuccess(this.currentUser);
    }

    return { success: true, user: this.currentUser };
  },

  // 1-Click Quick Demo Login
  quickLogin(role = 'admin') {
    let presetUser = null;
    if (role === 'admin') {
      presetUser = {
        id: "ADM01",
        email: "admin@apex.edu",
        password: "admin123",
        name: "Dean Arthur Vance",
        title: "System Administrator & Academic Dean",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      };
    } else if (role === 'teacher') {
      presetUser = (window.store && window.store.getTeacherById('T001')) || {
        id: "T001",
        email: "sarah.collins@apex.edu",
        password: "teacher123",
        name: "Dr. Sarah Collins",
        title: "Associate Professor",
        role: "teacher",
        department: "Computer Science & Engineering",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
      };
      presetUser.role = 'teacher';
    } else {
      presetUser = (window.store && window.store.getStudentById('S101')) || {
        id: "S101",
        email: "alex.j@student.apex.edu",
        password: "student123",
        name: "Alex Johnson",
        title: "Undergraduate Student",
        role: "student",
        rollNo: "CS24-042",
        department: "Computer Science",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
      };
      presetUser.role = 'student';
    }

    this.currentUser = presetUser;
    this.isAuthenticated = true;
    localStorage.setItem(this.IS_AUTH_KEY, 'true');
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));

    if (window.App && typeof window.App.onAuthSuccess === 'function') {
      window.App.onAuthSuccess(this.currentUser);
    }
  },

  // Update Current User Profile
  updateProfile(updatedData) {
    if (!this.currentUser) {
      return { success: false, message: "No active user session found." };
    }

    const { name, email, phone, avatar, title, department, rollNo, cabin, dob, section, guardianName, guardianPhone, guardianEmail, address, emergencyContact } = updatedData;

    // Check if new email is taken by another account
    if (email && email.toLowerCase().trim() !== this.currentUser.email.toLowerCase()) {
      const authUsers = window.store ? window.store.getAuthUsers() : [];
      const duplicate = authUsers.find(u => u.id !== this.currentUser.id && u.email.toLowerCase() === email.toLowerCase().trim());
      if (duplicate) {
        return { success: false, message: "This email address is already in use by another account." };
      }
    }

    // Merge updated fields into current user
    this.currentUser = {
      ...this.currentUser,
      ...(name ? { name: name.trim() } : {}),
      ...(email ? { email: email.toLowerCase().trim() } : {}),
      ...(phone !== undefined ? { phone: phone.trim() } : {}),
      ...(avatar ? { avatar: avatar.trim() } : {}),
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(department !== undefined ? { department: department.trim() } : {}),
      ...(rollNo !== undefined ? { rollNo: rollNo.trim() } : {}),
      ...(cabin !== undefined ? { cabin: cabin.trim() } : {}),
      ...(dob !== undefined ? { dob } : {}),
      ...(section !== undefined ? { section } : {}),
      ...(guardianName !== undefined ? { guardianName: guardianName.trim() } : {}),
      ...(guardianPhone !== undefined ? { guardianPhone: guardianPhone.trim() } : {}),
      ...(guardianEmail !== undefined ? { guardianEmail: guardianEmail.trim() } : {}),
      ...(emergencyContact !== undefined ? { emergencyContact: emergencyContact.trim() } : {}),
      ...(address !== undefined ? { address: address.trim() } : {})
    };

    // Save session in localStorage
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));

    // Update in store state & synced tables
    if (window.store && typeof window.store.updateAuthUser === 'function') {
      window.store.updateAuthUser(this.currentUser.id || this.currentUser.email, this.currentUser);
    }

    if (window.App) {
      if (typeof window.App.renderHeaderUser === 'function') {
        window.App.renderHeaderUser();
      }
      if (typeof window.App.refreshCurrentView === 'function') {
        window.App.refreshCurrentView();
      }
    }

    return { success: true, user: this.currentUser };
  },

  // Change Password
  changePassword(currentPassword, newPassword) {
    if (!this.currentUser) {
      return { success: false, message: "No active user session." };
    }

    // If user has a set password, verify it
    if (this.currentUser.password && this.currentUser.password !== currentPassword) {
      return { success: false, message: "Incorrect current password. Please try again." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: "New password must be at least 6 characters long." };
    }

    this.currentUser.password = newPassword;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));

    if (window.store && typeof window.store.updateAuthUser === 'function') {
      window.store.updateAuthUser(this.currentUser.id || this.currentUser.email, { password: newPassword });
    }

    if (window.store) {
      window.store.logActivity({
        action: 'PASSWORD_CHANGED',
        category: 'Security',
        user: `${this.currentUser.name} (${(this.currentUser.role || 'USER').toUpperCase()})`,
        details: "Account password successfully updated."
      });
    }

    return { success: true, message: "Password updated successfully." };
  },

  // Logout Function
  logout() {
    if (this.currentUser && window.store) {
      window.store.logActivity({
        action: 'USER_LOGOUT',
        category: 'Authentication',
        user: `${this.currentUser.name} (${this.currentUser.role.toUpperCase()})`,
        details: "User logged out of active session."
      });
    }
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem(this.IS_AUTH_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);

    if (window.App && typeof window.App.onLogout === 'function') {
      window.App.onLogout();
    }
  }
};

Auth.init();
if (typeof window !== 'undefined') {
  window.Auth = Auth;
}
