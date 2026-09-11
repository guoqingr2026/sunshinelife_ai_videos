# Release ports 3000 and 3001
$ports = @(3000, 3001)
$killed = @()

foreach ($port in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            $procId = $c.OwningProcess
            if ($procId -gt 0 -and $killed -notcontains $procId) {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                $killed += $procId
                Write-Host "  Stopped port $port (PID $procId)"
            }
        }
    } catch {
        $lines = netstat -ano | Select-String ":$port\s+.*LISTENING"
        foreach ($line in $lines) {
            $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
            $procId = [int]$parts[-1]
            if ($procId -gt 0 -and $killed -notcontains $procId) {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                $killed += $procId
                Write-Host "  Stopped port $port (PID $procId)"
            }
        }
    }
}

if ($killed.Count -eq 0) {
    Write-Host "  No process found on ports 3000/3001"
}

$left = @()
foreach ($port in $ports) {
    $still = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($still) { $left += $port }
}

if ($left.Count -gt 0) {
    Write-Host ('Warning: ports still in use: ' + ($left -join ', '))
    exit 1
}

Write-Host 'Ports 3000 and 3001 are free.'
exit 0
