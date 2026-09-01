# Lightweight PowerShell Local HTTP Server for Smart Attendance Management System
param(
    [int]$Port = 3000
)

$listener = New-Object System.Net.HttpListener

try {
    $listener.Prefixes.Add("http://localhost:$Port/")
} catch { }

try {
    $listener.Prefixes.Add("http://127.0.0.1:$Port/")
} catch { }

try {
    $listener.Start()
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " 🚀 SMART ATTENDANCE MANAGEMENT SERVER RUNNING AT:" -ForegroundColor Green
    Write-Host "    http://localhost:$Port/" -ForegroundColor Yellow
    Write-Host "    http://127.0.0.1:$Port/" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Cyan

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            # Add CORS & Security Headers
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
            $response.AddHeader("X-Content-Type-Options", "nosniff")

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 204
                $response.Close()
                continue
            }

            $path = $request.Url.LocalPath

            # Handle REST API Endpoints
            if ($path.StartsWith("/api/")) {
                $response.ContentType = "application/json; charset=utf-8"
                $jsonPayload = ""

                if ($path -eq "/api/stats") {
                    $jsonPayload = '{"success":true,"data":{"totalStudents":7,"totalTeachers":4,"totalClasses":5,"todayAttendancePct":89.2,"presentCount":5,"absentCount":1,"lateCount":1,"defaultersCount":2}}'
                } elseif ($path -eq "/api/auth/login") {
                    $jsonPayload = '{"success":true,"token":"JWT-MOCK-SESSION-TOKEN","user":{"email":"admin@apex.edu","role":"ADMIN"}}'
                } else {
                    $jsonPayload = '{"success":true,"message":"Smart Attendance Management REST API v2.0 Online"}'
                }

                $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonPayload)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.OutputStream.Flush()
                $response.Close()
                continue
            }

            if ($path -eq "/" -or $path -eq "" -or $path -eq "/index") {
                $path = "/index.html"
            }

            $cleanPath = $path.TrimStart('/').Replace('/', '\')
            $localPath = Join-Path $PSScriptRoot $cleanPath

            if (Test-Path $localPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                
                # Set content types
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                switch ($ext) {
                    ".html" { $response.ContentType = "text/html; charset=utf-8" }
                    ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                    ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                    ".json" { $response.ContentType = "application/json; charset=utf-8" }
                    ".png"  { $response.ContentType = "image/png" }
                    ".jpg"  { $response.ContentType = "image/jpeg" }
                    ".jpeg" { $response.ContentType = "image/jpeg" }
                    ".svg"  { $response.ContentType = "image/svg+xml" }
                    ".ico"  { $response.ContentType = "image/x-icon" }
                    ".prisma" { $response.ContentType = "text/plain; charset=utf-8" }
                    ".sql"  { $response.ContentType = "text/plain; charset=utf-8" }
                    default { $response.ContentType = "application/octet-stream" }
                }

                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.OutputStream.Flush()
            } else {
                $response.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                $response.OutputStream.Flush()
            }
            $response.Close()
        } catch {
            Write-Host "Error processing request: $_" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "Failed to start listener: $_" -ForegroundColor Red
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
    }
}
