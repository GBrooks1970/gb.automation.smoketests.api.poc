param(
    [Parameter(Mandatory = $true)]
    [string]$MetricsFile,

    [Parameter(Mandatory = $true)]
    [string]$MarkdownFile
)

if (-not (Test-Path -Path $MetricsFile)) {
    throw "Metrics file '$MetricsFile' not found."
}

$metrics = Get-Content -Path $MetricsFile
$rows = @()
$runUtc = ''
$overall = ''

foreach ($line in $metrics) {
    if ($line -like 'RUN UTC:*') {
        $runUtc = $line.Split(':')[1].Trim()
        continue
    }

    if ($line -match '^(.*)_Exit=(.*),(.*)_Log=(.*)$') {
        $rows += [pscustomobject]@{
            Suite = $matches[1]
            Exit  = $matches[2]
            Log   = $matches[4]
        }
        continue
    }

    if ($line -match '^OverallExit=(.*)$') {
        $overall = $matches[1]
    }
}

$tableLines = @(
    "| Suite | Exit Code | Log |",
    "| --- | --- | --- |"
)

foreach ($row in $rows) {
    $tableLines += "| $($row.Suite) | $($row.Exit) | $($row.Log) |"
}

$tableLines += "| Overall | $overall |  |"

$content = @()
$content += "Run UTC: $runUtc"
$content += ""
$content += $tableLines

Set-Content -Path $MarkdownFile -Value $content
