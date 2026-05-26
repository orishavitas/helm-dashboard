param(
  [string]$Config = "config\helm-projects.local.json",
  [string]$BaseUrl = $env:OPERATIONS_IMPORT_BASE_URL,
  [string]$Secret = $env:OPERATIONS_IMPORT_SECRET,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-TaskStatus {
  param([string]$Line)

  if ($Line -match '^\s*[-*]\s+\[[xX]\]') {
    return "done"
  }

  if ($Line -match '(?i)\bblocked\b') {
    return "blocked"
  }

  if ($Line -match '(?i)\b(in progress|working|active)\b') {
    return "in-progress"
  }

  return "todo"
}

function Get-TaskTitle {
  param([string]$Line)

  return ($Line -replace '^\s*[-*]\s+\[[ xX]\]\s*', '').Trim()
}

function Get-BlockedReason {
  param([string]$Title, [string]$Status)

  if ($Status -ne "blocked") {
    return $null
  }

  if ($Title -match '(?i)\bblocked\s*[-:]\s*(.+)$') {
    return $Matches[1].Trim()
  }

  return "Marked blocked in local sprint file"
}

function Get-LatestSprintFile {
  param([string]$ProjectPath)

  $sprintDir = Join-Path $ProjectPath "DOCS\sprints"
  if (-not (Test-Path -LiteralPath $sprintDir)) {
    return $null
  }

  return Get-ChildItem -LiteralPath $sprintDir -Filter "*.md" -File |
    Sort-Object Name -Descending |
    Select-Object -First 1
}

function Get-StableTaskRef {
  param(
    [string]$ProjectName,
    [string]$SprintPath,
    [string]$Title
  )

  $normalized = "$ProjectName`n$SprintPath`n$($Title.Trim().ToLowerInvariant())"
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($normalized)
  $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
  $hex = [System.BitConverter]::ToString($hash).Replace("-", "").ToLowerInvariant().Substring(0, 16)
  return "${ProjectName}:${SprintPath}:$hex"
}

function Get-RelativePath {
  param(
    [string]$BasePath,
    [string]$TargetPath
  )

  $baseFull = [System.IO.Path]::GetFullPath($BasePath).TrimEnd('\', '/')
  $targetFull = [System.IO.Path]::GetFullPath($TargetPath)
  if ($targetFull.StartsWith($baseFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $targetFull.Substring($baseFull.Length).TrimStart('\', '/')
  }

  return $targetFull
}

function Get-GitState {
  param([string]$ProjectPath)

  try {
    $branch = (& git -c core.excludesfile= -C $ProjectPath branch --show-current 2>$null)
    $commit = (& git -c core.excludesfile= -C $ProjectPath rev-parse --short HEAD 2>$null)
    $statusLines = @(& git -c core.excludesfile= -C $ProjectPath status --porcelain 2>$null)
    return [ordered]@{
      branch = if ($branch) { $branch.Trim() } else { $null }
      commit = if ($commit) { $commit.Trim() } else { $null }
      dirty = $statusLines.Count -gt 0
    }
  } catch {
    return [ordered]@{
      branch = $null
      commit = $null
      dirty = $null
    }
  }
}

function ConvertTo-ProjectPayload {
  param([pscustomobject]$Project)

  $projectPath = [System.IO.Path]::GetFullPath($Project.path)
  $gitState = Get-GitState -ProjectPath $projectPath
  $sprintFile = Get-LatestSprintFile -ProjectPath $projectPath
  $tasks = @()
  $sprintName = $null

  if ($sprintFile) {
    $sprintName = [System.IO.Path]::GetFileNameWithoutExtension($sprintFile.Name)
    $relativeSprintPath = Get-RelativePath -BasePath $projectPath -TargetPath $sprintFile.FullName
    $lineNumber = 0

    foreach ($line in [System.IO.File]::ReadLines($sprintFile.FullName)) {
      $lineNumber += 1
      if ($line -notmatch '^\s*[-*]\s+\[[ xX]\]\s+.+') {
        continue
      }

      $title = Get-TaskTitle -Line $line
      if (-not $title) {
        continue
      }

      $status = Get-TaskStatus -Line $line
      $sourceRef = Get-StableTaskRef -ProjectName $Project.name -SprintPath $relativeSprintPath -Title $title
      $tasks += [ordered]@{
        title = $title
        notes = "Imported from $relativeSprintPath line $lineNumber"
        status = $status
        priority = "medium"
        assignee = $Project.owner
        agentRole = $null
        source = "local"
        sourceRef = $sourceRef
        sourceUrl = $sprintFile.FullName
        blockedReason = Get-BlockedReason -Title $title -Status $status
        finishedAt = if ($status -eq "done") { $sprintFile.LastWriteTimeUtc.ToString("o") } else { $null }
      }
    }
  }

  $repoState = @()
  if ($gitState["branch"]) { $repoState += "branch $($gitState["branch"])" }
  if ($gitState["commit"]) { $repoState += "commit $($gitState["commit"])" }
  if ($null -ne $gitState["dirty"]) { $repoState += "working tree $(if ($gitState["dirty"]) { 'dirty' } else { 'clean' })" }
  $fallbackDescription = "Imported from local repo $projectPath"
  if ($repoState.Count -gt 0) {
    $fallbackDescription = "$fallbackDescription ($($repoState -join ', '))"
  }
  $description = if ($Project.description) { $Project.description } else { $fallbackDescription }

  return [ordered]@{
    name = $Project.name
    description = $description
    status = "active"
    path = $projectPath
    repo = $Project.repo
    vercelProject = $Project.vercelProject
    owner = $Project.owner
    sprint = if ($sprintName) { @{ name = $sprintName; sourceUrl = $sprintFile.FullName } } else { $null }
    tasks = $tasks
  }
}

if (-not (Test-Path -LiteralPath $Config)) {
  Write-Error "Config file not found: $Config"
  exit 1
}

$configJson = Get-Content -LiteralPath $Config -Raw
$configData = $configJson | ConvertFrom-Json
if (-not $configData.projects) {
  Write-Error "Config must include a projects array."
  exit 1
}

$payload = [ordered]@{
  projects = @($configData.projects | ForEach-Object { ConvertTo-ProjectPayload -Project $_ })
}
$json = $payload | ConvertTo-Json -Depth 12

if ($DryRun) {
  $json
  exit 0
}

if (-not $BaseUrl) {
  Write-Error "OPERATIONS_IMPORT_BASE_URL is required. Pass -BaseUrl, set the environment variable, or use -DryRun."
  exit 1
}

if (-not $Secret) {
  Write-Error "OPERATIONS_IMPORT_SECRET is required. Pass -Secret, set the environment variable, or use -DryRun."
  exit 1
}

$uri = "$($BaseUrl.TrimEnd('/'))/api/operations/import"
$response = Invoke-RestMethod `
  -Method Post `
  -Uri $uri `
  -Headers @{ Authorization = "Bearer $Secret" } `
  -ContentType "application/json" `
  -Body $json

Write-Output "[helm-sync] imported: $($response | ConvertTo-Json -Compress)"
