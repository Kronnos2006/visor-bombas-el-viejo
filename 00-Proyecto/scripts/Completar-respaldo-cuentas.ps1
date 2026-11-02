param(
    [switch]$CheckOnly,
    [string]$BackupDirectory = (Join-Path ([Environment]::GetFolderPath('UserProfile')) 'VocatusBackups\Supabase'),
    [string]$NodePath
)
$ErrorActionPreference = 'Stop'
# No depender de LOCALAPPDATA: Windows puede redirigirlo al contenedor de la app.
$perfilRespaldo = [Environment]::GetFolderPath('UserProfile')
$candidatosNode = @()
if ($NodePath) { $candidatosNode += $NodePath }
else {
    $nodeEnPath = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($nodeEnPath) { $candidatosNode += $nodeEnPath.Source }
    $candidatosNode += (Join-Path $perfilRespaldo '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe')
    $candidatosNode += (Join-Path $env:ProgramFiles 'nodejs\node.exe')
}
$ejecutableNode = $null
foreach ($candidatoNode in ($candidatosNode | Select-Object -Unique)) {
    if (Test-Path -LiteralPath $candidatoNode -PathType Leaf) {
        $versionNode = & $candidatoNode --version
        if ($LASTEXITCODE -eq 0 -and $versionNode -match '^v(\d+)\.' -and [int]$Matches[1] -ge 22) {
            $ejecutableNode = $candidatoNode
            break
        }
    }
}
if (-not $ejecutableNode) { throw 'No se encontro Node 22 o superior. Use -NodePath con la ruta de node.exe.' }
Write-Output ('Node: ' + $ejecutableNode)
$scriptRespaldo = Join-Path $PSScriptRoot 'completar-respaldo-cuentas.mjs'
# Siempre verificar todo localmente ANTES de pedir o preparar una credencial.
& $ejecutableNode $scriptRespaldo --check-only --backup-dir $BackupDirectory
if ($LASTEXITCODE -ne 0) { throw 'Fallo la comprobacion local. No se solicito clave ni se descargo nada.' }
if ($CheckOnly) { return }

# Solo la descarga explicita pide clave. No se guarda en disco ni en el historial.
$claveAnteriorRespaldo = $env:SUPABASE_SECRET_KEY
$tokenAnteriorRespaldo = $env:SUPABASE_STORAGE_TOKEN
$respaldoSeguro = Read-Host 'Pegue la clave secreta del proyecto gtfqhljbxyanfyrarykw (entrada oculta, nunca en el chat)' -AsSecureString
$punteroRespaldo = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($respaldoSeguro)
try {
    $env:SUPABASE_SECRET_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($punteroRespaldo)
    Remove-Item Env:\SUPABASE_STORAGE_TOKEN -ErrorAction SilentlyContinue
    & $ejecutableNode $scriptRespaldo --backup-dir $BackupDirectory
    if ($LASTEXITCODE -ne 0) { throw 'No se completo la verificacion del respaldo.' }
} finally {
    $env:SUPABASE_SECRET_KEY = $claveAnteriorRespaldo
    $env:SUPABASE_STORAGE_TOKEN = $tokenAnteriorRespaldo
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($punteroRespaldo)
    $respaldoSeguro.Dispose()
}
