$root = Join-Path $PSScriptRoot ".."

Get-ChildItem -Path $root -Recurse -Filter *.json | ForEach-Object {

    $path = $_.FullName

    # Leer como texto
    $content = [System.IO.File]::ReadAllText($path)

    # Eliminar BOM si existe
    if ($content.Length -gt 0 -and $content[0] -eq [char]0xFEFF) {
        $content = $content.Substring(1)
        Write-Host "BOM removido: $($_.Name)" -ForegroundColor Yellow
    }

    # Guardar UTF-8 sin BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

}