# Solo para flujo con logo RASTER en public\favicon.png.
# El favicon por defecto del proyecto es vectorial (public\favicon.svg); no hace falta este script.
# Deja solo el busto (sin texto "ATHENA" / tagline) y recorta borde inferior (marca de agua).
# Sustituye public\favicon.png por tu logo completo y ejecuta:
#   powershell -ExecutionPolicy Bypass -File scripts/crop-favicon-woman.ps1
param(
  [double]$TopRatio = 0.615,      # fracción superior de la imagen (busto)
  [int]$TrimBottomPixels = 72     # píxeles a quitar del borde inferior tras el primer recorte
)
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$pngPath = Join-Path $root 'public\favicon.png'
if (-not (Test-Path $pngPath)) { throw "No existe: $pngPath" }

function Save-BitmapReplace {
  param($Bitmap, $Path)
  $tmp = "$Path.tmp.png"
  try { $Bitmap.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png) }
  finally { $Bitmap.Dispose() }
  Move-Item -LiteralPath $tmp -Destination $Path -Force
}

$src = [System.Drawing.Image]::FromFile($pngPath)
$w = $src.Width
$h1 = [int][Math]::Max(1, [Math]::Round($src.Height * $TopRatio))
$bmp1 = New-Object System.Drawing.Bitmap $w, $h1
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
try {
  $r = New-Object System.Drawing.Rectangle 0, 0, $w, $h1
  $g1.DrawImage($src, $r, $r, [System.Drawing.GraphicsUnit]::Pixel)
}
finally {
  $g1.Dispose()
  $src.Dispose()
}

$h2 = [Math]::Max(1, $h1 - $TrimBottomPixels)
if ($h2 -lt $h1) {
  $bmp2 = New-Object System.Drawing.Bitmap $w, $h2
  $g2 = [System.Drawing.Graphics]::FromImage($bmp2)
  try {
    $r2 = New-Object System.Drawing.Rectangle 0, 0, $w, $h2
    $g2.DrawImage($bmp1, $r2, $r2, [System.Drawing.GraphicsUnit]::Pixel)
  }
  finally {
    $g2.Dispose()
    $bmp1.Dispose()
  }
  Save-BitmapReplace -Bitmap $bmp2 -Path $pngPath
}
else {
  Save-BitmapReplace -Bitmap $bmp1 -Path $pngPath
}

Write-Host "OK: favicon.png -> ${w}x${h2} (luego ejecuta: node scripts/embed-favicon.mjs)"
