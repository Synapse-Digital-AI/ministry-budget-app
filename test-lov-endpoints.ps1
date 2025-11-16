# Test script for LOV endpoints
# Usage: .\test-lov-endpoints.ps1

$baseUrl = "http://localhost:3001"

Write-Host ""
Write-Host "=== Testing LOV Endpoints ===" -ForegroundColor Cyan

# Step 1: Login to get token
Write-Host ""
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@thevoicechurch.org"
    pin   = "1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $token = $loginResponse.token

    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host ("  Token: {0}..." -f $token.Substring(0,50)) -ForegroundColor Gray
}
catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# Step 2: Ministries
Write-Host ""
Write-Host "2. Testing /api/lov/ministries..." -ForegroundColor Yellow

try {
    $ministries = Invoke-RestMethod -Uri "$baseUrl/api/lov/ministries" -Headers $headers
    Write-Host ("Success! Found {0} ministries:" -f $ministries.Count) -ForegroundColor Green

    foreach ($m in $ministries) {
        Write-Host ("  - {0} (ID: {1})" -f $m.name, $m.id) -ForegroundColor Gray
    }
}
catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Event Types
Write-Host ""
Write-Host "3. Testing /api/lov/event-types..." -ForegroundColor Yellow

try {
    $eventTypes = Invoke-RestMethod -Uri "$baseUrl/api/lov/event-types" -Headers $headers
    Write-Host ("Success! Found {0} event types:" -f $eventTypes.Count) -ForegroundColor Green

    foreach ($t in $eventTypes) {
        Write-Host ("  - {0} (ID: {1})" -f $t.name, $t.id) -ForegroundColor Gray
    }
}
catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Roles
Write-Host ""
Write-Host "4. Testing /api/lov/roles..." -ForegroundColor Yellow

try {
    $roles = Invoke-RestMethod -Uri "$baseUrl/api/lov/roles" -Headers $headers
    Write-Host ("Success! Found {0} roles:" -f $roles.Count) -ForegroundColor Green

    foreach ($r in $roles) {
        Write-Host ("  - {0} ({1})" -f $r.label, $r.value) -ForegroundColor Gray
    }
}
catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Statuses
Write-Host ""
Write-Host "5. Testing /api/lov/statuses..." -ForegroundColor Yellow

try {
    $statuses = Invoke-RestMethod -Uri "$baseUrl/api/lov/statuses" -Headers $headers
    Write-Host ("Success! Found {0} statuses:" -f $statuses.Count) -ForegroundColor Green

    foreach ($s in $statuses) {
        Write-Host ("  - {0} ({1})" -f $s.label, $s.value) -ForegroundColor Gray
    }
}
catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan