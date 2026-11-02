$ErrorActionPreference = 'Stop'
# No modifica Supabase. La clave no se escribe en disco, historial ni salida.
$respaldoSeguro = Read-Host 'Pegue la clave secreta del proyecto gtfqhljbxyanfyrarykw (entrada oculta, nunca en el chat)' -AsSecureString
$punteroRespaldo = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($respaldoSeguro)
try {
    $env:SUPABASE_SECRET_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($punteroRespaldo)
    & node (Join-Path $PSScriptRoot 'completar-respaldo-cuentas.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'No se completó la verificación del respaldo.' }
} finally {
    Remove-Item Env:\SUPABASE_SECRET_KEY -ErrorAction SilentlyContinue
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($punteroRespaldo)
    $respaldoSeguro.Dispose()
}
