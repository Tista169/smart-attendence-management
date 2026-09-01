/**
 * ONLINE SMART STUDENT ATTENDANCE SYSTEM - VERCEL SERVERLESS REST API
 * Handles /api/stats, /api/auth/login, and API status queries on Vercel
 */

// Simple In-Memory Mock Store for REST API
const apiData = {
  stats: {
    totalStudents: 7,
    totalTeachers: 4,
    totalClasses: 5,
    todayAttendancePct: 89.2,
    presentCount: 5,
    absentCount: 1,
    lateCount: 1,
    defaultersCount: 2
  }
};

module.exports = (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    if (res.status) {
      return res.status(204).end();
    }
    res.writeHead(204);
    return res.end();
  }

  res.setHeader('Content-Type', 'application/json');

  const url = req.url || '';

  // Helper response sender
  const sendJson = (status, payload) => {
    const jsonStr = JSON.stringify(payload);
    if (res.status) {
      return res.status(status).send(jsonStr);
    }
    res.writeHead(status);
    return res.end(jsonStr);
  };

  // 1. GET /api/stats
  if ((url.endsWith('/stats') || url.includes('/api/stats')) && req.method === 'GET') {
    return sendJson(200, { success: true, data: apiData.stats });
  }

  // 2. POST /api/auth/login
  if ((url.endsWith('/auth/login') || url.includes('/api/auth/login') || url.endsWith('/login')) && req.method === 'POST') {
    const processLogin = (body) => {
      try {
        const { email, password } = typeof body === 'string' ? JSON.parse(body) : (body || {});
        if (email && password) {
          return sendJson(200, {
            success: true,
            token: `JWT-${Buffer.from(email).toString('base64')}-${Date.now()}`,
            user: { email, role: email.includes('admin') ? 'ADMIN' : (email.includes('sarah') ? 'TEACHER' : 'STUDENT') }
          });
        } else {
          return sendJson(400, { success: false, message: "Missing email or password." });
        }
      } catch (e) {
        return sendJson(400, { success: false, message: "Invalid JSON body." });
      }
    };

    if (req.body) {
      return processLogin(req.body);
    } else {
      let rawBody = '';
      req.on('data', chunk => rawBody += chunk.toString());
      req.on('end', () => processLogin(rawBody));
      return;
    }
  }

  // Fallback API Status Endpoint
  return sendJson(200, {
    success: true,
    message: "Smart Attendance Management REST API v2.0 Online (Vercel Serverless)",
    timestamp: new Date().toISOString()
  });
};
