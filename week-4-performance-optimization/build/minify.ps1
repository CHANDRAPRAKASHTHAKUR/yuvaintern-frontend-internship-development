# ===========================================================================
#  Week 4 — build step: minify the optimised bundle
# ---------------------------------------------------------------------------
#  Reproduces the .min files that after/index.html actually loads.
#  Run it from the week-4-performance-optimization folder:
#
#      powershell -NoProfile -ExecutionPolicy Bypass -File .\build\minify.ps1
#
#  In a real project you would swap this for esbuild / terser / lightningcss
#  (see the "Further optimisation" section of PERFORMANCE-REPORT.md). This
#  script exists so the byte counts in the report are verifiable by hand.
# ===========================================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$after = Join-Path $root 'after'

# ---------------------------------------------------------------------------
# 1. CSS minifier — strips comments and collapses whitespace
# ---------------------------------------------------------------------------
function Minify-Css {
  param([string]$Css)

  # Remove /* ... */ block comments (non-greedy, across newlines)
  $out = [System.Text.RegularExpressions.Regex]::Replace($Css, '/\*.*?\*/', '', 'Singleline')
  # Collapse all runs of whitespace into a single space
  $out = [System.Text.RegularExpressions.Regex]::Replace($out, '\s+', ' ')
  # Remove the space around structural characters
  $out = $out -replace '\s*([{};:,>])\s*', '$1'
  # Drop the last semicolon in each block
  $out = $out -replace ';}', '}'
  # `a >b` and `a> b` are both fine, but `:hover` must not become ` :hover`
  $out = $out.Trim()
  return $out
}

# ---------------------------------------------------------------------------
# 2. JS minifier — line based, so automatic-semicolon-insertion behaviour is
#    never altered. Strips whole-line and block comments, indentation and
#    blank lines. (A production build would use terser/esbuild for mangling;
#    see the report.)
# ---------------------------------------------------------------------------
function Minify-Js {
  param([string]$Js)

  $result = New-Object System.Collections.Generic.List[string]
  $inBlock = $false

  foreach ($line in ($Js -split "`r?`n")) {
    $t = $line.Trim()

    if ($inBlock) {
      if ($t -match '\*/') { $inBlock = $false }
      continue
    }

    if ($t.StartsWith('/*')) {
      if ($t -notmatch '\*/') { $inBlock = $true }
      continue
    }
    if ($t -eq '' ) { continue }
    if ($t.StartsWith('//')) { continue }
    if ($t -eq '*/') { continue }

    $result.Add($t)
  }

  return ($result -join "`n")
}

# ---------------------------------------------------------------------------
# 3. Run the build
# ---------------------------------------------------------------------------
$targets = @(
  @{ src = 'css/styles.css'; dest = 'css/styles.min.css'; kind = 'css' },
  @{ src = 'js/app.js';     dest = 'js/app.min.js';     kind = 'js'  }
)

$rows = @()

foreach ($t in $targets) {
  $srcPath  = Join-Path $after $t.src
  $destPath = Join-Path $after $t.dest

  $source = [System.IO.File]::ReadAllText($srcPath)

  $minified = if ($t.kind -eq 'css') { Minify-Css $source } else { Minify-Js $source }

  [System.IO.File]::WriteAllText($destPath, $minified)

  $srcBytes  = (Get-Item $srcPath).Length
  $destBytes = (Get-Item $destPath).Length
  $saving    = [math]::Round((1 - $destBytes / $srcBytes) * 100, 1)

  $rows += [pscustomobject]@{
    File   = $t.dest
    Source = '{0:N1} KB' -f ($srcBytes / 1KB)
    Min    = '{0:N1} KB' -f ($destBytes / 1KB)
    Saved  = "$saving %"
  }
}

$rows | Format-Table -AutoSize
