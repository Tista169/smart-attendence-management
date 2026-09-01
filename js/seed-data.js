/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - SEED DATA
 * Complete relational mock dataset matching the Prisma schema specifications
 */

const SEED_DATA = {
  // Authentication Credentials
  authUsers: [
    {
      id: "ADM01",
      email: "admin@apex.edu",
      password: "admin123",
      name: "Dean Arthur Vance",
      title: "System Administrator & Academic Dean",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "T001",
      email: "sarah.collins@apex.edu",
      password: "teacher123",
      name: "Dr. Sarah Collins",
      title: "Associate Professor & HOD",
      role: "teacher",
      department: "Computer Science & Engineering",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      subjects: ["CS301", "CS302"],
      phone: "+1 (555) 234-5678",
      cabin: "Room 402, Block A"
    },
    {
      id: "S101",
      email: "alex.j@student.apex.edu",
      password: "student123",
      name: "Alex Johnson",
      title: "Undergraduate Student",
      role: "student",
      rollNo: "CS24-042",
      department: "Computer Science",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
    }
  ],

  // Academic Sessions
  academicSessions: [
    { id: "SESS-2026-F", name: "Fall 2026", startDate: "2026-08-01", endDate: "2026-12-20", status: "Active", isCurrent: true },
    { id: "SESS-2027-S", name: "Spring 2027", startDate: "2027-01-10", endDate: "2027-05-25", status: "Upcoming", isCurrent: false },
    { id: "SESS-2026-M", name: "Summer 2026", startDate: "2026-05-30", endDate: "2026-07-28", status: "Archived", isCurrent: false }
  ],

  // Campus Geofence Configuration
  geofence: {
    campusName: "Apex University Tech Campus",
    centerLat: 28.6139,
    centerLng: 77.2090,
    radiusMeters: 150,
    activeWiFiSSID: "ApexUniv-Secure-5G",
    requireGPS: true
  },

  // Faculty Members
  teachers: [
    {
      id: "T001",
      name: "Dr. Sarah Collins",
      email: "sarah.collins@apex.edu",
      department: "Computer Science & Engineering",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      subjects: ["CS301", "CS302"],
      sections: ["Section A", "Section B"],
      phone: "+1 (555) 234-5678",
      cabin: "Room 402, Block A",
      status: "Active"
    },
    {
      id: "T002",
      name: "Prof. David Miller",
      email: "david.miller@apex.edu",
      department: "Information Technology",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      subjects: ["CS303"],
      sections: ["Section A"],
      phone: "+1 (555) 345-6789",
      cabin: "Room 305, Block B",
      status: "Active"
    },
    {
      id: "T003",
      name: "Dr. Elena Rostova",
      email: "elena.rostova@apex.edu",
      department: "Artificial Intelligence",
      avatar: "https://images.unsplash.com/photo-1580894732484-95a9477028b1?w=150&auto=format&fit=crop&q=80",
      subjects: ["CS304", "CS305"],
      sections: ["Section A", "Section B"],
      phone: "+1 (555) 456-7890",
      cabin: "Room 512, Block C",
      status: "Active"
    },
    {
      id: "T004",
      name: "Prof. Marcus Chen",
      email: "marcus.chen@apex.edu",
      department: "Cybersecurity & Networks",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      subjects: ["CS305"],
      sections: ["Section A"],
      phone: "+1 (555) 567-8901",
      cabin: "Room 208, Block D",
      status: "Active"
    }
  ],

  // Subjects / Classes & Sections
  subjects: [
    {
      id: "CS301",
      code: "CS-301",
      name: "Distributed Cloud Systems",
      credits: 4,
      department: "Computer Science",
      teacherId: "T001",
      sections: ["Section A", "Section B"],
      totalLectures: 32,
      schedule: "Mon, Wed 09:00 AM",
      room: "Lab 301"
    },
    {
      id: "CS302",
      code: "CS-302",
      name: "Deep Learning & Neural Nets",
      credits: 4,
      department: "Artificial Intelligence",
      teacherId: "T001",
      sections: ["Section A"],
      totalLectures: 28,
      schedule: "Tue, Thu 11:00 AM",
      room: "Hall 102"
    },
    {
      id: "CS303",
      code: "CS-303",
      name: "Advanced Database Architecture",
      credits: 3,
      department: "Information Technology",
      teacherId: "T002",
      sections: ["Section A", "Section B"],
      totalLectures: 30,
      schedule: "Mon, Fri 02:00 PM",
      room: "Lab 204"
    },
    {
      id: "CS304",
      code: "CS-304",
      name: "Full-Stack Web Engineering",
      credits: 3,
      department: "Computer Science",
      teacherId: "T003",
      sections: ["Section A"],
      totalLectures: 34,
      schedule: "Wed, Fri 10:30 AM",
      room: "Lab 405"
    },
    {
      id: "CS305",
      code: "CS-305",
      name: "Cybersecurity & Cryptography",
      credits: 4,
      department: "Cybersecurity",
      teacherId: "T004",
      sections: ["Section A"],
      totalLectures: 26,
      schedule: "Tue, Thu 03:00 PM",
      room: "Hall 201"
    }
  ],

  // Student Roster with Detailed Profile Attributes
  students: [
    {
      id: "S101",
      rollNo: "CS24-042",
      name: "Alex Johnson",
      email: "alex.j@student.apex.edu",
      phone: "+1 (555) 101-2001",
      dob: "2004-06-14",
      guardianName: "Robert Johnson",
      guardianRelationship: "Father",
      guardianPhone: "+1 (555) 101-2002",
      guardianEmail: "r.johnson@family.com",
      emergencyContact: "+1 (555) 101-2099",
      address: "742 Evergreen Terrace, Sector 4, Silicon District",
      admissionDate: "2023-08-15",
      department: "Computer Science",
      semester: "6th Semester",
      section: "Section A",
      batch: "2023-2027",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      faceEnrolled: true,
      attendancePercentage: 88.5,
      totalClasses: 150,
      attendedClasses: 133,
      status: "Active",
      subjectStats: {
        "CS301": { attended: 29, total: 32 },
        "CS302": { attended: 25, total: 28 },
        "CS303": { attended: 26, total: 30 },
        "CS304": { attended: 31, total: 34 },
        "CS305": { attended: 22, total: 26 }
      }
    },
    {
      id: "S102",
      rollNo: "CS24-001",
      name: "Sophia Martinez",
      email: "sophia.m@student.apex.edu",
      phone: "+1 (555) 102-2003",
      dob: "2004-03-22",
      guardianName: "Carlos Martinez",
      guardianRelationship: "Father",
      guardianPhone: "+1 (555) 102-2004",
      guardianEmail: "carlos.m@family.com",
      emergencyContact: "+1 (555) 102-2099",
      address: "128 Innovation Way, Suite 3B, Tech Park",
      admissionDate: "2023-08-15",
      department: "Computer Science",
      semester: "6th Semester",
      section: "Section A",
      batch: "2023-2027",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      faceEnrolled: true,
      attendancePercentage: 94.0,
      totalClasses: 150,
      attendedClasses: 141,
      status: "Active",
      subjectStats: {
        "CS301": { attended: 31, total: 32 },
        "CS302": { attended: 27, total: 28 },
        "CS303": { attended: 29, total: 30 },
        "CS304": { attended: 33, total: 34 },
        "CS305": { attended: 21, total: 26 }
      }
    },
    {
      id: "S103",
      rollNo: "CS24-015",
      name: "Ethan Walker",
      email: "ethan.w@student.apex.edu",
      phone: "+1 (555) 103-2005",
      dob: "2004-11-09",
      guardianName: "Laura Walker",
      guardianRelationship: "Mother",
      guardianPhone: "+1 (555) 103-2006",
      guardianEmail: "laura.w@family.com",
      emergencyContact: "+1 (555) 103-2099",
      address: "55 Academic Avenue, Block 9, Cyber City",
      admissionDate: "2023-08-16",
      department: "Computer Science",
      semester: "6th Semester",
      section: "Section A",
      batch: "2023-2027",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      faceEnrolled: true,
      attendancePercentage: 62.0, // Defaulter (< 75%)
      totalClasses: 150,
      attendedClasses: 93,
      status: "Active",
      subjectStats: {
        "CS301": { attended: 18, total: 32 },
        "CS302": { attended: 17, total: 28 },
        "CS303": { attended: 19, total: 30 },
        "CS304": { attended: 22, total: 34 },
        "CS305": { attended: 17, total: 26 }
      }
    },
    {
      id: "S104",
      rollNo: "CS24-023",
      name: "Olivia Chen",
      email: "olivia.c@student.apex.edu",
      phone: "+1 (555) 104-2007",
      dob: "2004-08-30",
      guardianName: "Wei Chen",
      guardianRelationship: "Father",
      guardianPhone: "+1 (555) 104-2008",
      guardianEmail: "w.chen@family.com",
      emergencyContact: "+1 (555) 104-2099",
      address: "304 University Heights, North Campus",
      admissionDate: "2023-08-15",
      department: "Computer Science",
      semester: "6th Semester",
      section: "Section A",
      batch: "2023-2027",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      faceEnrolled: true,
      attendancePercentage: 91.3,
      totalClasses: 150,
      attendedClasses: 137,
      status: "Active",
      subjectStats: {
        "CS301": { attended: 30, total: 32 },
        "CS302": { attended: 26, total: 28 },
        "CS303": { attended: 28, total: 30 },
        "CS304": { attended: 32, total: 34 },
        "CS305": { attended: 21, total: 26 }
      }
    },
    {
      id: "S105",
      rollNo: "CS24-037",
      name: "Liam O'Connor",
      email: "liam.oc@student.apex.edu",
      phone: "+1 (555) 105-2009",
      dob: "2004-01-18",
      guardianName: "Patrick O'Connor",
      guardianRelationship: "Father",
      guardianPhone: "+1 (555) 105-2010",
      guardianEmail: "p.oconnor@family.com",
      emergencyContact: "+1 (555) 105-2099",
      address: "19 West End Lane, Maple Heights",
      admissionDate: "2023-08-17",
      department: "Computer Science",
      semester: "6th Semester",
      section: "Section A",
      batch: "2023-2027",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      faceEnrolled: true,
      attendancePercentage: 68.7, // Defaulter (< 75%)
      totalClasses: 150,
      attendedClasses: 103,
      status: "Active",
      subjectStats: {
        "CS301": { attended: 21, total: 32 },
        "CS302": { attended: 19, total: 28 },
        "CS303": { attended: 20, total: 30 },
        "CS304": { attended: 25, total: 34 },
        "CS305": { attended: 18, total: 26 }
      }
    },
    {
      id: "S106",
      rollNo: "CS24-055",
      name: "Aaliyah Patel",
      email: "aaliyah.p@student.apex.edu",
      phone: "+1 (555) 106-2011",
      dob: "2004-09-12",
      guardianName: "Rajesh Patel",
      guardianRelationship: "Father",
      guardianPhone: "+1 (555) 106-2012",
      guardianEmail: "rajesh.patel@family.com",
      emergencyContact: "+1 (555) 106-2099",
      address: "88 Skyline Boulevard, Apartment 12",
      admissionDate: "2023-08-15",
      department: "Computer Science",
      semester: "6th Semester",
      section: "Section A",
      batch: "2023-2027",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      faceEnrolled: true,
      attendancePercentage: 96.0,
      totalClasses: 150,
      attendedClasses: 144,
      status: "Active",
      subjectStats: {
        "CS301": { attended: 31, total: 32 },
        "CS302": { attended: 28, total: 28 },
        "CS303": { attended: 29, total: 30 },
        "CS304": { attended: 33, total: 34 },
        "CS305": { attended: 23, total: 26 }
      }
    },
    {
      id: "S107",
      rollNo: "CS24-071",
      name: "Lucas Silva",
      email: "lucas.s@student.apex.edu",
      phone: "+1 (555) 107-2013",
      dob: "2004-04-05",
      guardianName: "Mateo Silva",
      guardianRelationship: "Father",
      guardianPhone: "+1 (555) 107-2014",
      guardianEmail: "mateo.s@family.com",
      emergencyContact: "+1 (555) 107-2099",
      address: "42 Ocean Vista Road, Bay Area",
      admissionDate: "2023-08-16",
      department: "Computer Science",
      semester: "6th Semester",
      section: "Section A",
      batch: "2023-2027",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      faceEnrolled: false,
      attendancePercentage: 81.3,
      totalClasses: 150,
      attendedClasses: 122,
      status: "Active",
      subjectStats: {
        "CS301": { attended: 27, total: 32 },
        "CS302": { attended: 23, total: 28 },
        "CS303": { attended: 25, total: 30 },
        "CS304": { attended: 28, total: 34 },
        "CS305": { attended: 19, total: 26 }
      }
    }
  ],

  // Recent Attendance Records
  attendanceLogs: [
    {
      id: "LOG-901",
      subjectId: "CS301",
      section: "Section A",
      studentId: "S101",
      studentName: "Alex Johnson",
      rollNo: "CS24-042",
      date: "2026-08-21",
      time: "09:04 AM",
      status: "Present",
      method: "Dynamic QR",
      geofenceVerified: true,
      confidence: 99.4,
      isFinalized: true,
      device: "iPhone 15 Pro (iOS 18.2)"
    },
    {
      id: "LOG-902",
      subjectId: "CS301",
      section: "Section A",
      studentId: "S102",
      studentName: "Sophia Martinez",
      rollNo: "CS24-001",
      date: "2026-08-21",
      time: "09:02 AM",
      status: "Present",
      method: "AI Face Scan",
      geofenceVerified: true,
      confidence: 98.8,
      isFinalized: true,
      device: "Pixel 9 (Android 15)"
    },
    {
      id: "LOG-903",
      subjectId: "CS301",
      section: "Section A",
      studentId: "S104",
      studentName: "Olivia Chen",
      rollNo: "CS24-023",
      date: "2026-08-21",
      time: "09:05 AM",
      status: "Present",
      method: "Dynamic QR",
      geofenceVerified: true,
      confidence: 99.1,
      isFinalized: true,
      device: "Samsung Galaxy S24"
    },
    {
      id: "LOG-904",
      subjectId: "CS301",
      section: "Section A",
      studentId: "S106",
      studentName: "Aaliyah Patel",
      rollNo: "CS24-055",
      date: "2026-08-21",
      time: "09:01 AM",
      status: "Present",
      method: "AI Face Scan",
      geofenceVerified: true,
      confidence: 99.7,
      isFinalized: true,
      device: "OnePlus 12"
    },
    {
      id: "LOG-905",
      subjectId: "CS301",
      section: "Section A",
      studentId: "S105",
      studentName: "Liam O'Connor",
      rollNo: "CS24-037",
      date: "2026-08-21",
      time: "09:14 AM",
      status: "Late",
      method: "PIN Entry",
      geofenceVerified: true,
      confidence: 100,
      isFinalized: true,
      device: "Chrome / Windows 11"
    },
    {
      id: "LOG-906",
      subjectId: "CS301",
      section: "Section A",
      studentId: "S103",
      studentName: "Ethan Walker",
      rollNo: "CS24-015",
      date: "2026-08-21",
      time: "--",
      status: "Absent",
      method: "System Auto-Mark",
      geofenceVerified: false,
      confidence: 0,
      isFinalized: true,
      device: "N/A"
    }
  ],

  // Student Leave Applications
  leaveRequests: [
    {
      id: "LV-101",
      studentId: "S103",
      studentName: "Ethan Walker",
      rollNo: "CS24-015",
      subjectId: "CS301",
      subjectName: "Distributed Cloud Systems",
      dateFrom: "2026-08-22",
      dateTo: "2026-08-24",
      reason: "Attending National Collegiate Hackathon semifinals in Seattle.",
      status: "Pending",
      appliedOn: "2026-08-20",
      document: "hackathon_invitation.pdf"
    },
    {
      id: "LV-102",
      studentId: "S105",
      studentName: "Liam O'Connor",
      rollNo: "CS24-037",
      subjectId: "CS302",
      subjectName: "Deep Learning & Neural Nets",
      dateFrom: "2026-08-18",
      dateTo: "2026-08-19",
      reason: "Medical appointment for orthopedic surgery follow-up.",
      status: "Approved",
      appliedOn: "2026-08-17",
      document: "medical_certificate.pdf"
    }
  ],

  // Broadcast Announcements
  announcements: [
    {
      id: "ANN-101",
      title: "📢 Mid-Term Exam Schedule & 75% Attendance Requirement",
      content: "All undergraduate students must have a minimum cumulative attendance of 75% across each subject to be eligible to sit for the upcoming Mid-Term Examinations commencing on September 15, 2026.",
      targetAudience: "All",
      priority: "Urgent",
      author: "Dean Arthur Vance",
      date: "2026-08-20",
      readBy: []
    },
    {
      id: "ANN-102",
      title: "🔬 Annual University AI & Robotics Hackathon 2026",
      content: "Registrations for the Apex University AI Innovate Hackathon are now open. Teams of up to 4 students can register. Faculty mentors are invited to submit problem statements.",
      targetAudience: "Students",
      priority: "Normal",
      author: "Dr. Elena Rostova",
      date: "2026-08-19",
      readBy: []
    },
    {
      id: "ANN-103",
      title: "🛡️ Faculty Attendance Submission Window & Lock Rules",
      content: "Dear Faculty Members, please ensure attendance sessions for morning lectures are finalized and locked by 02:00 PM daily. Any late amendments require academic dean approval.",
      targetAudience: "Teachers",
      priority: "Important",
      author: "Office of the Academic Dean",
      date: "2026-08-18",
      readBy: []
    }
  ],

  // System Activity & Audit Logs
  auditLogs: [
    {
      id: "AUD-801",
      action: "ATTENDANCE_FINALIZED",
      category: "Attendance",
      user: "Dr. Sarah Collins (Teacher)",
      details: "Finalized & locked lecture session for CS301 (Section A). 5 present, 1 absent.",
      timestamp: "2026-08-21 09:30 AM",
      ipAddress: "192.168.1.45 (Faculty WiFi)",
      status: "Success"
    },
    {
      id: "AUD-802",
      action: "STUDENT_AUTHENTICATED",
      category: "Security",
      user: "Alex Johnson (Student)",
      details: "Biometric AI face recognition check-in verified with 99.4% confidence.",
      timestamp: "2026-08-21 09:04 AM",
      ipAddress: "10.0.12.88 (Mobile Client)",
      status: "Success"
    },
    {
      id: "AUD-803",
      action: "TEACHER_ASSIGNED",
      category: "Academics",
      user: "Dean Arthur Vance (Admin)",
      details: "Assigned Dr. Sarah Collins to CS301 Distributed Systems (Sec A & B).",
      timestamp: "2026-08-20 03:15 PM",
      ipAddress: "192.168.1.10 (Admin Console)",
      status: "Success"
    },
    {
      id: "AUD-804",
      action: "ANNOUNCEMENT_BROADCAST",
      category: "Communications",
      user: "Dean Arthur Vance (Admin)",
      details: "Broadcasted urgent announcement 'Mid-Term Exam Schedule & 75% Requirement'.",
      timestamp: "2026-08-20 10:00 AM",
      ipAddress: "192.168.1.10 (Admin Console)",
      status: "Success"
    },
    {
      id: "AUD-805",
      action: "GEOFENCE_UPDATED",
      category: "System Settings",
      user: "Dean Arthur Vance (Admin)",
      details: "Updated campus geofence radius to 150 meters.",
      timestamp: "2026-08-19 11:20 AM",
      ipAddress: "192.168.1.10 (Admin Console)",
      status: "Success"
    }
  ]
};

if (typeof window !== 'undefined') {
  window.SEED_DATA = SEED_DATA;
}
