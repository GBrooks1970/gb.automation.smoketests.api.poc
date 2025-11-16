param(
    [Parameter(Mandatory = $true)]
    [string]$Directory,

    [Parameter(Mandatory = $true)]
    [string]$Filter
)

if (-not (Test-Path -Path $Directory)) {
    exit 0
}

$item = Get-ChildItem -Path $Directory -Filter $Filter -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($item) {
    Write-Output $item.Name
}
