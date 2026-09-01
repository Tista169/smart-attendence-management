# 🎓 Smart Attendance Management System - Online Smart Student Attendance Platform

A state-of-the-art, high-tech, responsive **Online Smart Student Attendance Management System** designed for modern universities and educational institutions.

---

## 🌟 Key Features

### 1. Multi-Role Portal
- **Admin Portal**:
  - Master KPI Dashboard (Total Students, Average Attendance %, Defaulters <75%, Active Faculty).
  - 7-Day Attendance Trend chart (Chart.js Area) and Department Performance bar chart.
  - Live Real-Time Activity Feed with automated check-in logging.
  - Campus Geofencing & GPS Radius Configuration.
  - Low Attendance Defaulter Radar with direct Parent Alert triggers (WhatsApp/SMS/Email).
- **Teacher Portal**:
  - Class Schedule Timeline & Lecture Launchers.
  - **Dynamic QR Code Session Generator**: 10-second rotating cryptographic token countdown timer preventing proxy screenshot sharing. Fullscreen projector mode with real-time attendee avatars and counter.
  - **Fast Interactive Manual Roll-Call Grid**: One-click status toggling (Present, Absent, Late, Excused) and bulk "Mark All Present".
  - Student Leave Request Review & Approval Hub.
- **Student Portal**:
  - Personal Attendance Circular Progress Gauge with Status Badge (Eligible / Debarred).
  - **75% Target Calculator**: Calculates the exact number of consecutive lectures needed to regain exam eligibility.
  - **Smart Check-in Hub**:
    - Camera-based Dynamic QR Scanner with HUD.
    - AI Biometric Face Recognition scanner with facial landmark tracking and anti-spoofing liveness check.
    - Geolocation GPS boundary validation (Haversine distance calculation).
    - 4-Digit session fallback PIN code.
  - Subject-by-subject attendance progress bars.
  - Leave Application submission with status tracking.

### 2. Smart Attendance Engine
- **Rotating Dynamic QR Codes**: Refreshes every 10 seconds to prevent student photo/screenshot forwarding.
- **AI Face Recognition HUD**: Real-time webcam video stream with facial landmark scanning, confidence gauge, and profile matching.
- **Campus GPS Geofencing**: Confirms students are physically inside classroom/campus radius before allowing attendance mark.
- **Dynamic 4-Digit Security PIN**: Quick offline/backup verification.

### 3. Comprehensive Reports & Analytics
- Multi-dimensional filters: Subject/Course, Status (Present, Absent, Late, Excused), Defaulters only (<75%).
- **Export to CSV / Excel**: Download raw attendance logs.
- **Printable Institutional PDF Sheet**: Formatted official attendance report with institutional header, summary statistics, and signature lines.

### 4. Complete Student Management
- Student Directory with real-time search, filters (All / Eligible / Defaulters), and pagination.
- Full Student Profile Drawer: Enrolled courses, biometric registration status, contact info, guardian info, attendance history log.
- Add / Edit / Delete Student modals with form validation.
- Direct Parent Alert Notification (customizable academic warning notice).

---

## 🚀 How to Run

### Method 1: Direct Browser Launch
Simply double-click [`index.html`](file:///e:/smart%20attendence/index.html) in any modern web browser (Chrome, Edge, Firefox, Brave).

### Method 2: Local PowerShell HTTP Server
Run the PowerShell script:
```powershell
.\server.ps1
```
This starts the local web server at `http://localhost:3000` and automatically opens your default browser.

### Method 3: Local Node.js Server
```bash
node server.js
```

### Method 4: Deploy to Vercel
This project is configured with [`vercel.json`](file:///e:/smart%20attendence/vercel.json) and dedicated Serverless Functions in [`api/index.js`](file:///e:/smart%20attendence/api/index.js).
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In [Vercel](https://vercel.com/), click **Add New Project** and select your repository.
3. Keep default settings (Framework Preset: **Other**) and click **Deploy**.
4. Vercel will automatically serve the static web application and route `/api/*` to the serverless API.

---

## 🛠️ Tech Stack & Design
- **Frontend**: HTML5, Vanilla JavaScript (ES6+ Modules), Modern CSS3 with CSS Custom Properties, Glassmorphism, and Dynamic Micro-animations.
- **Visuals & Charts**: Chart.js for responsive charts, Lucide Icons for clean iconography, Google Fonts (`Outfit` & `Plus Jakarta Sans`).
- **Audio Effects**: Web Audio API synthesizer for instant feedback sounds.
- **Persistence**: Reactive LocalStorage DataStore with Pub/Sub event architecture.
