#!/usr/bin/env bash
# Installs GUI-less browser dependencies (Xvfb + supporting libraries)
# needed by Cypress/Playwright Linux runs. Designed for CI agents and
# dev machines that mirror the orchestrator environment.
set -euo pipefail

info() { printf '\n[runner-deps] %s\n' "$*"; }

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command '$1' not found. Install it or run with sudo." >&2
    exit 1
  fi
}

require_command apt-get
require_command npx

SUDO=""
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo "Run as root or install sudo to continue." >&2
    exit 1
  fi
fi

APT_PACKAGES=(
  xvfb
  libgtk-3-0t64
  libnss3
  libdrm2
  libgbm1
  libxkbcommon0
  libasound2t64
  fonts-liberation
  libxss1
  libatk-bridge2.0-0t64
)

info "Refreshing apt cache"
$SUDO apt-get update -y || info "apt-get update returned warnings; continuing with cached indexes"

info "Installing GUI/headless dependencies: ${APT_PACKAGES[*]}"
$SUDO apt-get install -y --no-install-recommends "${APT_PACKAGES[@]}"

info "Installing Playwright system deps + browsers"
npx playwright install --with-deps >/tmp/playwright-install.log 2>&1 || {
  cat /tmp/playwright-install.log >&2
  exit 1
}

info "Verifying Cypress binary"
npx cypress verify

info "Runner dependencies installed successfully"
