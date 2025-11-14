# Test script for LOV endpoints
# Usage: .\test-lov-endpoints.ps1

$baseUrl = "http://localhost:3001"

Write-Host "`n=== Testing LOV Endpoints ===" -ForegroundColor Cyan

# Step 1: Login to get token
Write-Host "`n1. Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@thevoicechurch.org"
    pin = "1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $token = $loginResponse.token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 2: Test Ministries LOV
Write-Host "`n2. Testing /api/lov/ministries..." -ForegroundColor Yellow
try {
    $ministries = Invoke-RestMethod -Uri "$baseUrl/api/lov/ministries" -Headers $headers
    Write-Host "✓ Success! Found $($ministries.Count) ministries:" -ForegroundColor Green
    $ministries | ForEach-Object { Write-Host "  - $($_.name) (ID: $($_.id))" -ForegroundColor Gray }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

# Step 3: Test Event Types LOV
Write-Host "`n3. Testing /api/lov/event-types..." -ForegroundColor Yellow
try {
    $eventTypes = Invoke-RestMethod -Uri "$baseUrl/api/lov/event-types" -Headers $headers
    Write-Host "✓ Success! Found $($eventTypes.Count) event types:" -ForegroundColor Green
    $eventTypes | ForEach-Object { Write-Host "  - $($_.name) (ID: $($_.id))" -ForegroundColor Gray }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

# Step 4: Test Roles LOV
Write-Host "`n4. Testing /api/lov/roles..." -ForegroundColor Yellow
try {
    $roles = Invoke-RestMethod -Uri "$baseUrl/api/lov/roles" -Headers $headers
    Write-Host "✓ Success! Found $($roles.Count) roles:" -ForegroundColor Green
    $roles | ForEach-Object { Write-Host "  - $($_.label) ($($_.value))" -ForegroundColor Gray }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

# Step 5: Test Statuses LOV
Write-Host "`n5. Testing /api/lov/statuses..." -ForegroundColor Yellow
try {
    $statuses = Invoke-RestMethod -Uri "$baseUrl/api/lov/statuses" -Headers $headers
    Write-Host "✓ Success! Found $($statuses.Count) statuses:" -ForegroundColor Green
    $statuses | ForEach-Object { Write-Host "  - $($_.label) ($($_.value))" -ForegroundColor Gray }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan

