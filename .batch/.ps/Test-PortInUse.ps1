<#
.SYNOPSIS
  Checks if a local port is in use and reports owning process info.

.DESCRIPTION
  - Uses Get-NetTCPConnection when available.
  - Falls back to parsing `netstat -ano` output if needed.
  - Supports TCP or UDP checks. Note: process mapping is reliable for TCP.
  - Returns a clear summary and sets exit code for scripting.

.PARAMETER Port
  The port number to check, for example 3001.

.PARAMETER Protocol
  TCP or UDP. Defaults to TCP.

.EXAMPLE
  .\Test-PortInUse.ps1 -Port 3001
  Checks TCP port 3001 and prints a report. Exit code 0 if in use, 1 otherwise.

.EXAMPLE
  .\Test-PortInUse.ps1 -Port 3001 -Protocol UDP
  Checks UDP port 3001.

.NOTES
  Requires Windows PowerShell 5.1 or PowerShell 7+. Admin not required.
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true, Position=0)]
  [ValidateRange(1,65535)]
  [int]$Port,

  [ValidateSet('TCP','UDP')]
  [string]$Protocol = 'TCP'
)

function Write-Heading($text) {
  Write-Host ('=' * 60)
  Write-Host $text
  Write-Host ('=' * 60)
}

# Helper: check if a command exists
function Test-Command {
  param([string]$Name)
  $null -ne (Get-Command -Name $Name -ErrorAction SilentlyContinue)
}

# Modern path using Get-NetTCPConnection / Get-NetUDPEndpoint
function Get-PortOwnershipModern {
  param([int]$Port, [string]$Protocol)

  if ($Protocol -eq 'TCP') {
    if (Test-Command 'Get-NetTCPConnection') {
      $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
      if (-not $conns) { return @() }

      # Filter for Listening or Established states that use the local port
      $relevant = $conns | Where-Object { $_.LocalPort -eq $Port -and $_.State -in @('Listen','Established','SynReceived','SynSent') }
      $results = foreach ($c in $relevant) {
        $proc = $null
        try { $proc = Get-Process -Id $c.OwningProcess -ErrorAction Stop } catch { }
        [pscustomobject]@{
          Protocol     = 'TCP'
          LocalAddress = $c.LocalAddress
          LocalPort    = $c.LocalPort
          State        = $c.State
          PID          = $c.OwningProcess
          ProcessName  = if ($proc) { $proc.ProcessName } else { $null }
        }
      }
      return $results
    }
  } else {
    # UDP has no "connection state" concept, just endpoints
    if (Test-Command 'Get-NetUDPEndpoint') {
      $eps = Get-NetUDPEndpoint -LocalPort $Port -ErrorAction SilentlyContinue
      if (-not $eps) { return @() }
      $results = foreach ($e in $eps) {
        $proc = $null
        try { $proc = Get-Process -Id $e.OwningProcess -ErrorAction Stop } catch { }
        [pscustomobject]@{
          Protocol     = 'UDP'
          LocalAddress = $e.LocalAddress
          LocalPort    = $e.LocalPort
          State        = 'N/A'
          PID          = $e.OwningProcess
          ProcessName  = if ($proc) { $proc.ProcessName } else { $null }
        }
      }
      return $results
    }
  }

  return @()
}

# Fallback path parsing netstat output
function Get-PortOwnershipFallback {
  param([int]$Port, [string]$Protocol)

  # netstat protocols are shown uppercase
  $proto = $Protocol.ToUpper()
  $lines = netstat -ano | Select-String -SimpleMatch ":$Port" | ForEach-Object { $_.Line }

  # Filter lines by protocol and exact port match
  $filtered = $lines | Where-Object {
    ($_ -match "^\s*$proto\s") -and ($_ -match ":(?<port>\d+)\s") -and ([int]($Matches['port']) -eq $Port)
  }

  $results = foreach ($line in $filtered) {
    # Typical netstat -ano columns:
    # Proto  Local Address         Foreign Address       State           PID
    # UDP lines may not have State, but have PID at the end.
    $parts = $line -split '\s+' | Where-Object { $_ -ne '' }

    $protoCol = $parts[0]
    $local    = $parts[1]
    $state    = if ($protoCol -eq 'TCP') { $parts[3] } else { 'N/A' }
    $pidIdx   = $parts.Count - 1
    $pid      = 0
    [void][int]::TryParse($parts[$pidIdx], [ref]$pid)

    $proc = $null
    try { $proc = Get-Process -Id $pid -ErrorAction Stop } catch { }

    [pscustomobject]@{
      Protocol     = $protoCol
      LocalAddress = $local.Split(':')[0]
      LocalPort    = $Port
      State        = $state
      PID          = if ($pid -gt 0) { $pid } else { $null }
      ProcessName  = if ($proc) { $proc.ProcessName } else { $null }
    }
  }

  # Remove duplicates that netstat sometimes prints
  $results | Sort-Object Protocol,LocalAddress,LocalPort,PID,State -Unique
}

Write-Heading "Port Usage Check"

Write-Host "Protocol : $Protocol"
Write-Host "Port     : $Port"
Write-Host ""

# Try modern API first, then fallback
$owners = Get-PortOwnershipModern -Port $Port -Protocol $Protocol
if (-not $owners -or $owners.Count -eq 0) {
  Write-Host "Modern cmdlets not available or returned no results. Trying netstat fallback..."
  $owners = Get-PortOwnershipFallback -Port $Port -Protocol $Protocol
}

$inUse = $owners -and $owners.Count -gt 0

if ($inUse) {
  Write-Host ""
  Write-Host "Result: IN USE"
  Write-Host ""
  $owners |
    Select-Object Protocol, LocalAddress, LocalPort, State, PID, ProcessName |
    Format-Table -AutoSize

  # Exit code 0 means success in scripts. Here, success means port is in use.
  exit 0
} else {
  Write-Host ""
  Write-Host "Result: NOT IN USE"
  # Exit code 1 helps CI fail fast if expecting a service to be up.
  exit 1
}
