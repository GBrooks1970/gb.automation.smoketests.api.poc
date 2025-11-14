param(
    [Parameter(Mandatory = $true)]
    [string]$MetricsFile,

    [Parameter(Mandatory = $true)]
    [string]$TextFile,

    [Parameter(Mandatory = $true)]
    [string]$MarkdownFile
)

if (-not (Test-Path -Path $MetricsFile)) {
    throw "Metrics file '$MetricsFile' not found."
}

function Convert-ToTimeString {
    param(
        [string]$DurationValue
    )

    if ([string]::IsNullOrWhiteSpace($DurationValue)) {
        return '-'
    }

    $seconds = 0
    if (-not [double]::TryParse($DurationValue, [ref]$seconds)) {
        return '-'
    }

    $ts = [TimeSpan]::FromSeconds($seconds)
    return "{0:00}:{1:00}" -f [math]::Floor($ts.TotalMinutes), $ts.Seconds
}

function Get-CypressStats {
    param([string]$LogPath)

    $stats = [ordered]@{
        Time    = '-'
        Tests   = '-'
        Passing = '-'
        Failing = '-'
        Pending = '-'
        Skipped = '-'
    }

    if (-not (Test-Path -Path $LogPath)) {
        return [pscustomobject]$stats
    }

    $duration = Select-String -Path $LogPath -Pattern 'Duration:\s+(\d+)' | Select-Object -Last 1
    if ($duration -and $duration.Matches.Count -gt 0) {
        $stats.Time = Convert-ToTimeString $duration.Matches[0].Groups[1].Value
    }

    foreach ($field in @('Tests', 'Passing', 'Failing', 'Pending', 'Skipped')) {
        $pattern = "{0}:\s+(\d+)" -f $field
        $match = Select-String -Path $LogPath -Pattern $pattern | Select-Object -Last 1
        if ($match -and $match.Matches.Count -gt 0) {
            $stats.$field = $match.Matches[0].Groups[1].Value
        } else {
            $stats.$field = '0'
        }
    }

    return [pscustomobject]$stats
}

function Get-PlaywrightStats {
    param([string]$LogPath)

    $stats = [ordered]@{
        Time    = '-'
        Tests   = '-'
        Passing = '-'
        Failing = '-'
        Pending = '-'
        Skipped = '-'
    }

    if (-not (Test-Path -Path $LogPath)) {
        return [pscustomobject]$stats
    }

    $line = Select-String -Path $LogPath -Pattern 'Playwright Scenarios' | Select-Object -Last 1
    if ($line) {
        if ($line.Line -match 'total=(\d+)') { $stats.Tests = $matches[1] }
        if ($line.Line -match 'passed=(\d+)') { $stats.Passing = $matches[1] }
        if ($line.Line -match 'failed=(\d+)') { $stats.Failing = $matches[1] }
        if ($line.Line -match 'skipped=(\d+)') { $stats.Skipped = $matches[1] }
        $stats.Pending = '0'
    }

    return [pscustomobject]$stats
}

function Get-DotNetStats {
    param([string]$LogPath)

    $stats = [ordered]@{
        Time    = '-'
        Tests   = '-'
        Passing = '-'
        Failing = '-'
        Pending = '-'
        Skipped = '-'
    }

    if (-not (Test-Path -Path $LogPath)) {
        return [pscustomobject]$stats
    }

    $line = Select-String -Path $LogPath -Pattern 'Passed!\s+-' | Select-Object -Last 1
    if ($line) {
        if ($line.Line -match 'Failed:\s+(\d+)') { $stats.Failing = $matches[1] }
        if ($line.Line -match 'Passed:\s+(\d+)') { $stats.Passing = $matches[1] }
        if ($line.Line -match 'Skipped:\s+(\d+)') { $stats.Skipped = $matches[1] }
        if ($line.Line -match 'Total:\s+(\d+)') { $stats.Tests = $matches[1] }
        if ($line.Line -match 'Duration:\s+(\d+)') { $stats.Time = Convert-ToTimeString $matches[1] }
        $stats.Pending = '0'
    }

    return [pscustomobject]$stats
}

function Get-SuiteStats {
    param(
        [string]$Suite,
        [string]$LogPath
    )

    switch -Regex ($Suite) {
        'Cypress'          { return Get-CypressStats -LogPath $LogPath }
        'Playwright TS'    { return Get-PlaywrightStats -LogPath $LogPath }
        '\.NET Playwright' { return Get-DotNetStats -LogPath $LogPath }
        default            { return [pscustomobject]@{ Time='-'; Tests='-'; Passing='-'; Failing='-'; Pending='-'; Skipped='-' } }
    }
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
            Exit  = [int]$matches[2]
            Log   = $matches[4]
        }
        continue
    }

    if ($line -match '^OverallExit=(.*)$') {
        $overall = $matches[1]
    }
}

foreach ($row in $rows) {
    $stats = Get-SuiteStats -Suite $row.Suite -LogPath $row.Log
    $row | Add-Member -NotePropertyName Time -NotePropertyValue $stats.Time
    $row | Add-Member -NotePropertyName Tests -NotePropertyValue $stats.Tests
    $row | Add-Member -NotePropertyName Passing -NotePropertyValue $stats.Passing
    $row | Add-Member -NotePropertyName Failing -NotePropertyValue $stats.Failing
    $row | Add-Member -NotePropertyName Pending -NotePropertyValue $stats.Pending
    $row | Add-Member -NotePropertyName Skipped -NotePropertyValue $stats.Skipped
}

function ConvertToInt {
    param([string]$Value)
    $result = 0
    if ([int]::TryParse($Value, [ref]$result)) {
        return $result
    }
    return 0
}

$totalTests = ($rows | ForEach-Object { ConvertToInt $_.Tests } | Measure-Object -Sum).Sum
$totalPassing = ($rows | ForEach-Object { ConvertToInt $_.Passing } | Measure-Object -Sum).Sum
$totalFailing = ($rows | ForEach-Object { ConvertToInt $_.Failing } | Measure-Object -Sum).Sum
$totalPending = ($rows | ForEach-Object { ConvertToInt $_.Pending } | Measure-Object -Sum).Sum
$totalSkipped = ($rows | ForEach-Object { ConvertToInt $_.Skipped } | Measure-Object -Sum).Sum

$textLines = @()
$textLines += "Run UTC: $runUtc"
$textLines += ""
$textLines += "================================================================================"
$textLines += ""
$textLines += "  (Run Finished)"
$textLines += ""
$border = "  +-------------------------------------------------------------------------------+"
$header = "  | Project-Spec                               | Time  | Tests | Pass  | Fail  | Pend  | Skip  |"
$textLines += $border
$textLines += $header
$textLines += $border

$rowFormat = "  | {0,-40} | {1,6} | {2,5} | {3,5} | {4,5} | {5,5} | {6,5} |"

foreach ($row in $rows) {
    $symbol = if ($row.Exit -eq 0) { "[OK]" } else { "[FAIL]" }
    $label = "{0} {1}" -f $symbol, $row.Suite
    $textLines += ($rowFormat -f $label, $row.Time, $row.Tests, $row.Passing, $row.Failing, $row.Pending, $row.Skipped)
}

$textLines += $border
$totalSymbol = if ($overall -eq 0) { "[OK]" } else { "[FAIL]" }
$statusWord = if ($overall -eq 0) { "passed" } else { "failed" }
$textLines += ($rowFormat -f ("{0} Total {1}" -f $totalSymbol, $statusWord), '-', $totalTests, $totalPassing, $totalFailing, $totalPending, $totalSkipped)
$textLines += $border
$textLines += ""
$textLines += "Log Files:"
foreach ($row in $rows) {
    $textLines += "  - $($row.Suite): $($row.Log)"
}

Set-Content -Path $TextFile -Value $textLines

$mdLines = @()
$mdLines += "Run UTC: $runUtc"
$mdLines += ""
$mdLines += "| Project-Spec | Time | Tests | Passing | Failing | Pending | Skipped | Log |"
$mdLines += "| --- | --- | --- | --- | --- | --- | --- | --- |"

foreach ($row in $rows) {
    $symbol = if ($row.Exit -eq 0) { "[OK]" } else { "[FAIL]" }
    $label = "{0} {1}" -f $symbol, $row.Suite
    $mdLines += "| $label | $($row.Time) | $($row.Tests) | $($row.Passing) | $($row.Failing) | $($row.Pending) | $($row.Skipped) | $($row.Log) |"
}

$totalLabel = if ($overall -eq 0) { "[OK] TOTAL passed" } else { "[FAIL] TOTAL failed" }
$mdLines += "| $totalLabel | - | $totalTests | $totalPassing | $totalFailing | $totalPending | $totalSkipped | Overall exit: $overall |"

Set-Content -Path $MarkdownFile -Value $mdLines
