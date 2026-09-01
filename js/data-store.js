/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - DATA STORE
 * Reactive state management with LocalStorage persistence, pub/sub events & full CRUD
 */

class DataStore {
  constructor() {
    this.STORAGE_KEY = 'SMART_ATTENDANCE_V2_DATA';
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.authUsers) parsed.authUsers = window.SEED_DATA.authUsers;
        if (!parsed.academicSessions) parsed.academicSessions = window.SEED_DATA.academicSessions;
        if (!parsed.announcements) parsed.announcements = window.SEED_DATA.announcements;
        if (!parsed.auditLogs) parsed.auditLogs = window.SEED_DATA.auditLogs;
        if (!parsed.absenceNotificationsQueue) parsed.absenceNotificationsQueue = [];
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    const initial = JSON.parse(JSON.stringify(window.SEED_DATA || {}));
    initial.absenceNotificationsQueue = [];
    this.saveState(initial);
    return initial;
  }

  saveState(stateToSave = this.state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, payload) {
    this.saveState();
    this.listeners.forEach(listener => {
      try {
        listener(event, payload, this.state);
      } catch (err) {
        console.error("Error in store listener:", err);
      }
    });
  }

  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(window.SEED_DATA || {}));
    this.state.absenceNotificationsQueue = [];
    this.saveState();
    this.notify('RESET', null);
  }

  // Activity & Audit Logging
  logActivity({ action, category, user, details, status = "Success" }) {
    if (!this.state.auditLogs) this.state.auditLogs = [];
    const logEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      action,
      category,
      user: user || "System",
      details,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ipAddress: "192.168.1.45 (Local Node)",
      status
    };
    this.state.auditLogs.unshift(logEntry);
    this.notify('AUDIT_LOGGED', logEntry);
    return logEntry;
  }

  // Getters
  getStudents() { return this.state.students || []; }
  getStudentById(id) { return this.getStudents().find(s => s.id === id); }
  getTeachers() { return this.state.teachers || []; }
  getTeacherById(id) { return this.getTeachers().find(t => t.id === id); }
  getSubjects() { return this.state.subjects || []; }
  getSubjectById(id) { return this.getSubjects().find(s => s.id === id); }
  getAttendanceLogs() { return this.state.attendanceLogs || []; }
  getLeaveRequests() { return this.state.leaveRequests || []; }
  getGeofence() { return this.state.geofence || {}; }
  getAcademicSessions() { return this.state.academicSessions || []; }
  getAnnouncements() { return this.state.announcements || []; }
  getAuditLogs() { return this.state.auditLogs || []; }
  getAuthUsers() { return this.state.authUsers || []; }
  getAbsenceQueue() { return this.state.absenceNotificationsQueue || []; }

  // Student CRUD Operations
  addStudent(studentData) {
    const newStudent = {
      id: 'S' + (100 + this.state.students.length + 1),
      rollNo: studentData.rollNo || `CS24-${String(this.state.students.length + 1).padStart(3, '0')}`,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone || "+1 (555) 000-0000",
      dob: studentData.dob || "2004-01-01",
      guardianName: studentData.guardianName || "Guardian",
      guardianRelationship: studentData.guardianRelationship || "Parent",
      guardianPhone: studentData.guardianPhone || "+1 (555) 000-0001",
      guardianEmail: studentData.guardianEmail || "guardian@family.com",
      emergencyContact: studentData.emergencyContact || "+1 (555) 000-0099",
      address: studentData.address || "University Campus Residence",
      admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
      department: studentData.department || "Computer Science",
      semester: studentData.semester || "6th Semester",
      section: studentData.section || "Section A",
      batch: studentData.batch || "2023-2027",
      avatar: studentData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      faceEnrolled: !!studentData.faceEnrolled,
      attendancePercentage: 100,
      totalClasses: 150,
      attendedClasses: 150,
      status: "Active",
      subjectStats: {
        "CS301": { attended: 32, total: 32 },
        "CS302": { attended: 28, total: 28 },
        "CS303": { attended: 30, total: 30 },
        "CS304": { attended: 34, total: 34 },
        "CS305": { attended: 26, total: 26 }
      }
    };
    this.state.students.unshift(newStudent);
    this.logActivity({
      action: 'STUDENT_CREATED',
      category: 'Students',
      details: `Added new student ${newStudent.name} (${newStudent.rollNo}) in ${newStudent.department}.`
    });
    this.notify('STUDENT_ADDED', newStudent);
    return newStudent;
  }

  updateStudent(studentId, updatedData) {
    const index = this.state.students.findIndex(s => s.id === studentId);
    if (index !== -1) {
      this.state.students[index] = { ...this.state.students[index], ...updatedData };
      this.logActivity({
        action: 'STUDENT_UPDATED',
        category: 'Students',
        details: `Updated details for ${this.state.students[index].name} (${this.state.students[index].rollNo}).`
      });
      this.notify('STUDENT_UPDATED', this.state.students[index]);
      return this.state.students[index];
    }
    return null;
  }

  deleteStudent(studentId) {
    const student = this.getStudentById(studentId);
    this.state.students = this.state.students.filter(s => s.id !== studentId);
    this.logActivity({
      action: 'STUDENT_DELETED',
      category: 'Students',
      details: `Removed student ${student ? student.name : studentId} from directory.`
    });
    this.notify('STUDENT_DELETED', studentId);
  }

  // Teacher CRUD Operations
  addTeacher(teacherData) {
    if (!this.state.teachers) this.state.teachers = [];
    const newTeacher = {
      id: 'T' + String(this.state.teachers.length + 1).padStart(3, '0'),
      name: teacherData.name,
      email: teacherData.email,
      department: teacherData.department || "Computer Science & Engineering",
      avatar: teacherData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      subjects: teacherData.subjects || ["CS301"],
      sections: teacherData.sections || ["Section A"],
      phone: teacherData.phone || "+1 (555) 234-5678",
      cabin: teacherData.cabin || "Room 400, Block A",
      status: teacherData.status || "Active"
    };
    this.state.teachers.unshift(newTeacher);
    this.logActivity({
      action: 'TEACHER_CREATED',
      category: 'Faculty',
      details: `Added new faculty member ${newTeacher.name} to ${newTeacher.department}.`
    });
    this.notify('TEACHER_ADDED', newTeacher);
    return newTeacher;
  }

  updateTeacher(teacherId, updatedData) {
    const index = this.state.teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) {
      this.state.teachers[index] = { ...this.state.teachers[index], ...updatedData };
      this.logActivity({
        action: 'TEACHER_UPDATED',
        category: 'Faculty',
        details: `Updated faculty profile for ${this.state.teachers[index].name}.`
      });
      this.notify('TEACHER_UPDATED', this.state.teachers[index]);
      return this.state.teachers[index];
    }
    return null;
  }

  deleteTeacher(teacherId) {
    const teacher = this.getTeacherById(teacherId);
    this.state.teachers = this.state.teachers.filter(t => t.id !== teacherId);
    this.logActivity({
      action: 'TEACHER_DELETED',
      category: 'Faculty',
      details: `Removed faculty member ${teacher ? teacher.name : teacherId}.`
    });
    this.notify('TEACHER_DELETED', teacherId);
  }

  // Class & Section Management
  addClass(classData) {
    if (!this.state.subjects) this.state.subjects = [];
    const newClass = {
      id: classData.id || `CS${300 + this.state.subjects.length + 1}`,
      code: classData.code || `CS-${300 + this.state.subjects.length + 1}`,
      name: classData.name,
      credits: parseInt(classData.credits || 3, 10),
      department: classData.department || "Computer Science",
      teacherId: classData.teacherId || "T001",
      sections: classData.sections || ["Section A"],
      totalLectures: parseInt(classData.totalLectures || 30, 10),
      schedule: classData.schedule || "Mon, Wed 10:00 AM",
      room: classData.room || "Room 201"
    };
    this.state.subjects.unshift(newClass);
    this.logActivity({
      action: 'CLASS_CREATED',
      category: 'Academics',
      details: `Created new course ${newClass.code}: ${newClass.name}.`
    });
    this.notify('CLASS_ADDED', newClass);
    return newClass;
  }

  updateClass(classId, updatedData) {
    const index = this.state.subjects.findIndex(c => c.id === classId);
    if (index !== -1) {
      this.state.subjects[index] = { ...this.state.subjects[index], ...updatedData };
      this.logActivity({
        action: 'CLASS_UPDATED',
        category: 'Academics',
        details: `Updated course parameters for ${this.state.subjects[index].code}.`
      });
      this.notify('CLASS_UPDATED', this.state.subjects[index]);
      return this.state.subjects[index];
    }
    return null;
  }

  deleteClass(classId) {
    const cls = this.getSubjectById(classId);
    this.state.subjects = this.state.subjects.filter(c => c.id !== classId);
    this.logActivity({
      action: 'CLASS_DELETED',
      category: 'Academics',
      details: `Deleted course ${cls ? cls.code : classId}.`
    });
    this.notify('CLASS_DELETED', classId);
  }

  // Academic Sessions
  addAcademicSession(sessionData) {
    if (!this.state.academicSessions) this.state.academicSessions = [];
    const newSession = {
      id: `SESS-${Date.now().toString().slice(-4)}`,
      name: sessionData.name,
      startDate: sessionData.startDate,
      endDate: sessionData.endDate,
      status: sessionData.status || "Active",
      isCurrent: !!sessionData.isCurrent
    };
    if (newSession.isCurrent) {
      this.state.academicSessions.forEach(s => s.isCurrent = false);
    }
    this.state.academicSessions.unshift(newSession);
    this.logActivity({
      action: 'ACADEMIC_SESSION_CREATED',
      category: 'System',
      details: `Created academic term ${newSession.name}.`
    });
    this.notify('SESSION_ADDED', newSession);
    return newSession;
  }

  setActiveSession(sessionId) {
    this.state.academicSessions.forEach(s => {
      s.isCurrent = s.id === sessionId;
      if (s.isCurrent) s.status = "Active";
    });
    const active = this.state.academicSessions.find(s => s.id === sessionId);
    this.logActivity({
      action: 'ACTIVE_SESSION_CHANGED',
      category: 'System',
      details: `Switched active university session to ${active ? active.name : sessionId}.`
    });
    this.notify('SESSION_ACTIVE_CHANGED', sessionId);
  }

  // Announcements CRUD
  addAnnouncement(announcementData) {
    if (!this.state.announcements) this.state.announcements = [];
    const newAnn = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      title: announcementData.title,
      content: announcementData.content,
      targetAudience: announcementData.targetAudience || "All",
      priority: announcementData.priority || "Normal",
      author: announcementData.author || "Dean Arthur Vance",
      date: new Date().toISOString().split('T')[0],
      readBy: []
    };
    this.state.announcements.unshift(newAnn);
    this.logActivity({
      action: 'ANNOUNCEMENT_BROADCAST',
      category: 'Communications',
      details: `Broadcasted announcement '${newAnn.title}' to ${newAnn.targetAudience}.`
    });
    this.notify('ANNOUNCEMENT_ADDED', newAnn);
    return newAnn;
  }

  deleteAnnouncement(annId) {
    this.state.announcements = this.state.announcements.filter(a => a.id !== annId);
    this.notify('ANNOUNCEMENT_DELETED', annId);
  }

  // Mark Attendance Function with Duplicate Prevention & Absence Alert Trigger
  markAttendance({ studentId, subjectId, section = "Section A", date = null, status = 'Present', method = 'Dynamic QR', geofenceVerified = true, confidence = 99.0 }) {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const now = new Date();
    const targetDate = date || now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Duplicate Check
    const existingLogIndex = this.state.attendanceLogs.findIndex(
      log => log.studentId === studentId && log.subjectId === subjectId && log.date === targetDate
    );

    let historyEntry = null;
    let logEntry;

    if (existingLogIndex !== -1) {
      const prev = this.state.attendanceLogs[existingLogIndex];
      // If already finalized and no authorization provided, prevent modification
      if (prev.isFinalized && method !== 'Teacher Manual Roll-Call' && method !== 'Admin Override') {
        console.warn("Cannot modify locked finalized attendance session without authorization.");
        return null;
      }

      historyEntry = {
        previousStatus: prev.status,
        newStatus: status,
        modifiedBy: method,
        modifiedAt: new Date().toISOString()
      };

      logEntry = {
        ...prev,
        status,
        method,
        time: prev.time === '--' ? timeStr : prev.time,
        geofenceVerified,
        confidence,
        history: [...(prev.history || []), historyEntry]
      };
      this.state.attendanceLogs[existingLogIndex] = logEntry;
    } else {
      logEntry = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        subjectId,
        section,
        studentId,
        studentName: student.name,
        rollNo: student.rollNo,
        date: targetDate,
        time: status === 'Absent' ? '--' : timeStr,
        status,
        method,
        geofenceVerified,
        confidence,
        isFinalized: false,
        history: [],
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'
      };
      this.state.attendanceLogs.unshift(logEntry);
    }

    // Trigger Automatic Absence Notification if marked Absent or Late
    if (status === 'Absent' || status === 'Late') {
      this.queueAbsenceNotification({
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        subjectId,
        date: targetDate,
        status,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        guardianEmail: student.guardianEmail
      });
    }

    // Recalculate Student Stats
    this.recalculateStudentStats(studentId);

    this.notify('ATTENDANCE_MARKED', logEntry);
    return logEntry;
  }

  // Automatic Absence Notification Queue
  queueAbsenceNotification(alertData) {
    if (!this.state.absenceNotificationsQueue) this.state.absenceNotificationsQueue = [];
    const notification = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      ...alertData,
      timestamp: new Date().toLocaleTimeString(),
      channels: ['SMS', 'WhatsApp', 'Email'],
      dispatched: true,
      message: `Apex University Academic Alert: Your ward ${alertData.studentName} (${alertData.rollNo}) was marked ${alertData.status.toUpperCase()} for ${alertData.subjectId} lecture on ${alertData.date}.`
    };
    this.state.absenceNotificationsQueue.unshift(notification);
    this.notify('ABSENCE_ALERT_DISPATCHED', notification);
  }

  // Recalculate student percentages and subject breakdown
  recalculateStudentStats(studentId) {
    const student = this.getStudentById(studentId);
    if (!student) return;

    const studentLogs = this.state.attendanceLogs.filter(l => l.studentId === studentId);
    const subjects = this.getSubjects();

    if (!student.subjectStats) student.subjectStats = {};

    let totalAttended = 0;
    let totalClasses = 0;

    subjects.forEach(sub => {
      const subLogs = studentLogs.filter(l => l.subjectId === sub.id);
      const attended = subLogs.filter(l => l.status === 'Present' || l.status === 'Late').length;
      const total = Math.max(subLogs.length, 1);

      // Base offset from seed if available
      const baseAttended = student.subjectStats[sub.id] ? student.subjectStats[sub.id].attended : attended;
      const baseTotal = student.subjectStats[sub.id] ? student.subjectStats[sub.id].total : total;

      totalAttended += baseAttended;
      totalClasses += baseTotal;
    });

    student.attendedClasses = totalAttended;
    student.totalClasses = totalClasses;
    student.attendancePercentage = Number(((totalAttended / (totalClasses || 1)) * 100).toFixed(1));
  }

  // Authorized Attendance Override
  overrideAttendance({ logId, newStatus, reason, authorizedBy }) {
    const log = this.state.attendanceLogs.find(l => l.id === logId);
    if (!log) return null;

    const oldStatus = log.status;
    log.status = newStatus;
    log.authorizedEdit = {
      authorizedBy: authorizedBy || "Dean Arthur Vance",
      reason: reason || "Manual academic administrative review",
      previousStatus: oldStatus,
      modifiedAt: new Date().toLocaleString()
    };

    if (!log.history) log.history = [];
    log.history.push({
      previousStatus: oldStatus,
      newStatus,
      modifiedBy: authorizedBy || "Admin Override",
      reason,
      modifiedAt: new Date().toISOString()
    });

    this.recalculateStudentStats(log.studentId);

    this.logActivity({
      action: 'ATTENDANCE_OVERRIDE',
      category: 'Attendance',
      user: authorizedBy || "Admin",
      details: `Overrode attendance for ${log.studentName} (${log.subjectId}) from ${oldStatus} to ${newStatus}. Reason: "${reason}".`
    });

    this.notify('ATTENDANCE_OVERRIDDEN', log);
    return log;
  }

  // Finalize & Lock Attendance Session
  finalizeAttendanceSession({ subjectId, section, date, teacherId }) {
    const logs = this.state.attendanceLogs.filter(
      l => l.subjectId === subjectId && l.date === date
    );
    logs.forEach(l => l.isFinalized = true);

    const teacher = this.getTeacherById(teacherId);
    this.logActivity({
      action: 'ATTENDANCE_FINALIZED',
      category: 'Attendance',
      user: teacher ? `${teacher.name} (Teacher)` : "Faculty",
      details: `Finalized and locked attendance records for ${subjectId} (${section}) on ${date}.`
    });

    this.notify('SESSION_FINALIZED', { subjectId, section, date });
    return logs;
  }

  // Leave Management
  updateLeaveStatus(leaveId, newStatus) {
    const leave = this.state.leaveRequests.find(l => l.id === leaveId);
    if (leave) {
      leave.status = newStatus;
      this.logActivity({
        action: `LEAVE_${newStatus.toUpperCase()}`,
        category: 'Leaves',
        details: `${newStatus} leave application for ${leave.studentName} (${leave.subjectName}).`
      });
      this.notify('LEAVE_UPDATED', leave);
      return leave;
    }
    return null;
  }

  addLeaveRequest(data) {
    const newLeave = {
      id: `LV-${Date.now().toString().slice(-4)}`,
      studentId: data.studentId,
      studentName: data.studentName,
      rollNo: data.rollNo,
      subjectId: data.subjectId || "CS301",
      subjectName: data.subjectName || "Distributed Cloud Systems",
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      reason: data.reason,
      status: "Pending",
      appliedOn: new Date().toISOString().split('T')[0],
      document: data.document || "attachment.pdf"
    };
    this.state.leaveRequests.unshift(newLeave);
    this.notify('LEAVE_ADDED', newLeave);
    return newLeave;
  }

  updateGeofence(newConfig) {
    this.state.geofence = { ...this.state.geofence, ...newConfig };
    this.logActivity({
      action: 'GEOFENCE_UPDATED',
      category: 'System',
      details: `Updated campus geofence radius to ${newConfig.radiusMeters}m.`
    });
    this.notify('GEOFENCE_UPDATED', this.state.geofence);
    return this.state.geofence;
  }

  // Update Auth User Profile & Sync with Student/Teacher entities
  updateAuthUser(userIdOrEmail, updatedData) {
    if (!this.state.authUsers) this.state.authUsers = [];
    let index = this.state.authUsers.findIndex(u => 
      (u.id && u.id === userIdOrEmail) || 
      (u.email && u.email.toLowerCase() === String(userIdOrEmail).toLowerCase())
    );

    // If not found in authUsers but found in seed/active user, create an entry
    if (index === -1) {
      const newUser = { id: userIdOrEmail, ...updatedData };
      this.state.authUsers.push(newUser);
      index = this.state.authUsers.length - 1;
    } else {
      this.state.authUsers[index] = { ...this.state.authUsers[index], ...updatedData };
    }

    const user = this.state.authUsers[index];

    // If user is a student, sync to students directory
    if (user.role === 'student' || this.getStudentById(user.id)) {
      const studentIndex = (this.state.students || []).findIndex(s => s.id === user.id || (user.email && s.email && s.email.toLowerCase() === user.email.toLowerCase()));
      if (studentIndex !== -1) {
        this.state.students[studentIndex] = {
          ...this.state.students[studentIndex],
          name: updatedData.name || this.state.students[studentIndex].name,
          email: updatedData.email || this.state.students[studentIndex].email,
          phone: updatedData.phone !== undefined ? updatedData.phone : this.state.students[studentIndex].phone,
          avatar: updatedData.avatar || this.state.students[studentIndex].avatar,
          department: updatedData.department || this.state.students[studentIndex].department,
          rollNo: updatedData.rollNo || this.state.students[studentIndex].rollNo,
          dob: updatedData.dob || this.state.students[studentIndex].dob,
          section: updatedData.section || this.state.students[studentIndex].section,
          guardianName: updatedData.guardianName || this.state.students[studentIndex].guardianName,
          guardianPhone: updatedData.guardianPhone || this.state.students[studentIndex].guardianPhone,
          guardianEmail: updatedData.guardianEmail || this.state.students[studentIndex].guardianEmail,
          emergencyContact: updatedData.emergencyContact || this.state.students[studentIndex].emergencyContact,
          address: updatedData.address || this.state.students[studentIndex].address
        };
      }
    }

    // If user is a teacher, sync to teachers directory
    if (user.role === 'teacher' || this.getTeacherById(user.id)) {
      const teacherIndex = (this.state.teachers || []).findIndex(t => t.id === user.id || (user.email && t.email && t.email.toLowerCase() === user.email.toLowerCase()));
      if (teacherIndex !== -1) {
        this.state.teachers[teacherIndex] = {
          ...this.state.teachers[teacherIndex],
          name: updatedData.name || this.state.teachers[teacherIndex].name,
          email: updatedData.email || this.state.teachers[teacherIndex].email,
          phone: updatedData.phone !== undefined ? updatedData.phone : this.state.teachers[teacherIndex].phone,
          avatar: updatedData.avatar || this.state.teachers[teacherIndex].avatar,
          department: updatedData.department || this.state.teachers[teacherIndex].department,
          cabin: updatedData.cabin || this.state.teachers[teacherIndex].cabin
        };
      }
    }

    this.logActivity({
      action: 'USER_PROFILE_UPDATED',
      category: 'Authentication',
      user: `${user.name} (${(user.role || 'USER').toUpperCase()})`,
      details: `Profile details updated for account ${user.email}.`
    });

    this.notify('USER_UPDATED', user);
    return user;
  }
}

// Global Store Instance
window.store = new DataStore();
