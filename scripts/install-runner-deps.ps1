<#!
.SYNOPSIS
    Installs browser + automation dependencies required by DEMOAPP runners on Windows agents.
.DESCRIPTION
    Aligns Windows developer machines with CI by installing Playwright browsers, verifying Cypress,
    and ensuring Visual C++ runtimes are present. Safe to run multiple times.
!>
[CmdletBinding()]
param(
    [switch]$InstallPlaywright = $true,
    [switch]$VerifyCypress = $true
)

$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string]$Message)
    Write-Host "[runner-deps] $Message"
}

function Ensure-Choco {
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        throw 'Chocolatey is required. Install it from https://chocolatey.org/install and re-run this script.'
    }
}

Write-Step 'Ensuring Visual C++ runtime is installed'
Ensure-Choco
choco install vcredist140 --no-progress --yes | Out-Null

if ($InstallPlaywright) {
    Write-Step 'Installing Playwright browsers'
    npm exec -- playwright install | Out-Null
}

if ($VerifyCypress) {
    Write-Step 'Verifying Cypress binary'
    npx cypress verify | Out-Null
}

Write-Step 'Runner dependencies installed successfully'
