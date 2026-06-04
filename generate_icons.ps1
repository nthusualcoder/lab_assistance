Add-Type -AssemblyName System.Drawing

# Create 512x512 bitmap
$bmp = New-Object System.Drawing.Bitmap 512, 512
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Background gradient
$rect = New-Object System.Drawing.Rectangle 0, 0, 512, 512
$c1 = [System.Drawing.Color]::FromArgb(79, 148, 255) # #4f94ff
$c2 = [System.Drawing.Color]::FromArgb(27, 100, 218) # #1b64da
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45.0
$g.FillRectangle($brush, $rect)

# Draw Beaker Outline
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White, 24)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

# Path points:
# Neck top left: (190, 130) -> Neck bottom left: (190, 170) -> Body bottom left: (120, 280) -> Base bottom left: (120, 380) 
# -> Base bottom right: (392, 380) -> Body bottom right: (392, 280) -> Neck bottom right: (322, 170) -> Neck top right: (322, 130)
$points = @(
    (New-Object System.Drawing.Point 190, 130),
    (New-Object System.Drawing.Point 190, 170),
    (New-Object System.Drawing.Point 120, 280),
    (New-Object System.Drawing.Point 120, 380),
    (New-Object System.Drawing.Point 392, 380),
    (New-Object System.Drawing.Point 392, 280),
    (New-Object System.Drawing.Point 322, 170),
    (New-Object System.Drawing.Point 322, 130)
)
$g.DrawLines($pen, $points)

# Top Lip rim line
$g.DrawLine($pen, 170, 130, 342, 130)

# Beaker markings
$markPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White, 16)
$markPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$markPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawLine($markPen, 220, 310, 250, 310)
$g.DrawLine($markPen, 220, 260, 240, 260)

# Floating Plus/Minus Symbols
$symPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White, 20)
$symPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$symPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
# Plus sign: vertical (350, 210) to (350, 270), horizontal (320, 240) to (380, 240)
$g.DrawLine($symPen, 350, 210, 350, 270)
$g.DrawLine($symPen, 320, 240, 380, 240)
# Minus sign: horizontal (320, 330) to (380, 330)
$g.DrawLine($symPen, 320, 330, 380, 330)

# Save 512x512
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$path512 = Join-Path $scriptDir "icon_512.png"
$bmp.Save($path512, [System.Drawing.Imaging.ImageFormat]::Png)

# Resize to 192x192
$bmp192 = New-Object System.Drawing.Bitmap 192, 192
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g192.DrawImage($bmp, 0, 0, 192, 192)
$path192 = Join-Path $scriptDir "icon_192.png"
$bmp192.Save($path192, [System.Drawing.Imaging.ImageFormat]::Png)

# Dispose resources
$g.Dispose()
$bmp.Dispose()
$g192.Dispose()
$bmp192.Dispose()

Write-Host "Success: generated icon_512.png and icon_192.png"
