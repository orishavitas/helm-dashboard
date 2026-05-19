param(
  [Parameter(Mandatory)]
  [string]$TerminalId,

  [Parameter(Mandatory)]
  [string]$Label,

  [Parameter(Mandatory)]
  [ValidateSet("active", "idle", "blocked", "done", "offline")]
  [string]$Status,

  [string]$CurrentTask = "",
  [string]$Repo = "",
  [string]$AgentRole = "",
  [int]$ContextPct = -1,
  [string]$BaseUrl = $env:OVERLORD_BASE_URL,
  [string]$Secret = $env:OVERLORD_PUSH_SECRET,
  [string]$Assignee = "",
  [string]$SourceRef = "",
  [string]$Branch = "",
  [string]$LastCommand = "",
  [string]$Cwd = (Get-Location).Path
)

if (-not $BaseUrl) {
  Write-Error "OVERLORD_BASE_URL is required. Pass -BaseUrl or set the environment variable."
  exit 1
}

if (-not $Secret) {
  Write-Error "OVERLORD_PUSH_SECRET is required. Pass -Secret or set the environment variable."
  exit 1
}

$payload = @{
  terminalId = $TerminalId
  label = $Label
  status = $Status
  currentTask = if ($CurrentTask) { $CurrentTask } else { $null }
  repo = if ($Repo) { $Repo } else { $null }
  agentRole = if ($AgentRole) { $AgentRole } else { $null }
  contextPct = if ($ContextPct -ge 0) { $ContextPct } else { $null }
  meta = @{
    assignee = if ($Assignee) { $Assignee } else { $null }
    sourceRef = if ($SourceRef) { $SourceRef } else { $null }
    branch = if ($Branch) { $Branch } else { $null }
    lastCommand = if ($LastCommand) { $LastCommand } else { $null }
    cwd = if ($Cwd) { $Cwd } else { $null }
  }
}

$base = $BaseUrl.TrimEnd("/")
$uri = "$base/api/overlord/push"
$body = $payload | ConvertTo-Json -Depth 6

try {
  $response = Invoke-RestMethod `
    -Uri $uri `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $Secret" } `
    -Body $body

  Write-Host "[overlord] pushed: $($response | ConvertTo-Json -Compress)"
} catch {
  Write-Warning "[overlord] push failed (non-fatal): $($_.Exception.Message)"
}
