# ===========================================================================
#  build-zips.ps1 — create one ready-to-upload ZIP per week
# ---------------------------------------------------------------------------
#  The task asks for a single ZIP upload for weeks 2, 3 and 4, so this packs
#  each project folder (with the relevant report inside it) into
#  submission-zips/.
#
#      powershell -NoProfile -ExecutionPolicy Bypass -File .\build-zips.ps1
# ===========================================================================

$ErrorActionPreference = 'Stop'

$root   = $PSScriptRoot
$outDir = Join-Path $root 'submission-zips'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Which reports must travel inside each archive
$extras = @{
  'week-1-responsive-landing-page'      = @('README.md')
  'week-2-interactive-ui-components'    = @('README.md')
  'week-3-accessibility-blog'           = @('README.md', 'AUDIT-REPORT.md')
  'week-4-performance-optimization'     = @('README.md', 'PERFORMANCE-REPORT.md')
  'week-5-dashboard-app'                = @('README.md', 'REPORT.md')
}

$rows = @()

foreach ($dir in $extras.Keys | Sort-Object) {
  $src   = Join-Path $root $dir
  $stage = Join-Path $env:TEMP ("novadesk-stage-" + $dir)

  if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
  New-Item -ItemType Directory -Force -Path $stage | Out-Null

  # Copy the project, excluding nothing (all source is part of the deliverable)
  Copy-Item -Path (Join-Path $src '*') -Destination $stage -Recurse -Force

  # Reports live at the project root already; this is a safety net in case a
  # report was moved to the root of the repository instead.
  foreach ($extra in $extras[$dir]) {
    $fallback = Join-Path $root $extra
    if ((Test-Path $fallback) -and -not (Test-Path (Join-Path $stage $extra))) {
      Copy-Item $fallback -Destination $stage -Force
    }
  }

  $zip = Join-Path $outDir "$dir.zip"
  if (Test-Path $zip) { Remove-Item $zip -Force }
  Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip -CompressionLevel Optimal

  $rows += [pscustomobject]@{
    Archive  = "$dir.zip"
    Files    = (Get-ChildItem $stage -Recurse -File).Count
    Size     = '{0:N2} MB' -f ((Get-Item $zip).Length / 1MB)
  }

  Remove-Item $stage -Recurse -Force
}

$rows | Format-Table -AutoSize
Write-Output "Archives written to: $outDir"
