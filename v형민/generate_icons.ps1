[void][System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")

function Create-Icon([int]$size, [string]$path) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # 1. Background orange gradient
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect, 
        [System.Drawing.Color]::FromArgb(255, 255, 160, 0), # #ffa000
        [System.Drawing.Color]::FromArgb(255, 255, 61, 0),  # #ff3d00
        45.0
    )
    
    # 2. Rounded rectangle background path
    $path_gd = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = $size * 0.25 # rounded corners
    $path_gd.AddArc(0, 0, $r, $r, 180, 90)
    $path_gd.AddArc(($size - $r), 0, $r, $r, 270, 90)
    $path_gd.AddArc(($size - $r), ($size - $r), $r, $r, 0, 90)
    $path_gd.AddArc(0, ($size - $r), $r, $r, 90, 90)
    $path_gd.CloseAllFigures()
    $g.FillPath($brush, $path_gd)
    
    # 3. Draw Beaker Graphic
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, ($size * 0.046)) # stroke-width 24/512
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    
    $f = $size / 512.0
    
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    # Start M190 120
    $p.AddLine((190*$f), (120*$f), (322*$f), (120*$f)) # h132
    $p.AddLine((322*$f), (120*$f), (322*$f), (160*$f)) # v40
    $p.AddLine((322*$f), (160*$f), (252*$f), (270*$f)) # l-70 110
    $p.AddLine((252*$f), (270*$f), (252*$f), (370*$f)) # v100
    
    # Bezier curve: c0 11 9 20 20 20 -> (252,370) to (272,390)
    $p.AddBezier(
        (252*$f), (370*$f), 
        (252*$f), ((370 + 11)*$f), 
        ((252 + 9)*$f), ((370 + 20)*$f), 
        (272*$f), (390*$f)
    )
    
    $p.AddLine((272*$f), (390*$f), (188*$f), (390*$f)) # h-84
    
    # Bezier curve: c11 0 20-9 20-20 -> (188,390) to (208,370)
    $p.AddBezier(
        (188*$f), (390*$f), 
        ((188 + 11)*$f), (390*$f), 
        ((188 + 20)*$f), ((390 - 9)*$f), 
        (208*$f), (370*$f)
    )
    
    $p.AddLine((208*$f), (370*$f), (208*$f), (270*$f)) # V270
    $p.AddLine((208*$f), (270*$f), (138*$f), (160*$f)) # l-70-110
    $p.AddLine((138*$f), (160*$f), (138*$f), (120*$f)) # v-40
    
    $p.CloseFigure()
    $g.DrawPath($pen, $p)
    
    # 4. Measurement lines
    $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, ($size * 0.031))
    $linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($linePen, (220*$f), (310*$f), (250*$f), (310*$f))
    $g.DrawLine($linePen, (220*$f), (270*$f), (240*$f), (270*$f))
    
    # 5. Spheroid bubble aggregates
    $brushWhiteAlpha = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
    $brushWhiteAlpha2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(153, 255, 255, 255)) # 0.6 opacity
    $brushWhiteAlpha3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(191, 255, 255, 255)) # 0.75 opacity
    
    $g.FillEllipse($brushWhiteAlpha, ((340-24)*$f), ((230-24)*$f), (48*$f), (48*$f))
    $g.FillEllipse($brushWhiteAlpha, ((356-12)*$f), ((216-12)*$f), (24*$f), (24*$f))
    $g.FillEllipse($brushWhiteAlpha, ((324-14)*$f), ((244-14)*$f), (28*$f), (28*$f))
    $g.FillEllipse($brushWhiteAlpha, ((348-10)*$f), ((250-10)*$f), (20*$f), (20*$f))
    
    $g.FillEllipse($brushWhiteAlpha3, ((210-12)*$f), ((215-12)*$f), (24*$f), (24*$f))
    $g.FillEllipse($brushWhiteAlpha2, ((290-8)*$f), ((250-8)*$f), (16*$f), (16*$f))
    
    # Clean up
    $brush.Dispose()
    $pen.Dispose()
    $linePen.Dispose()
    $brushWhiteAlpha.Dispose()
    $brushWhiteAlpha2.Dispose()
    $brushWhiteAlpha3.Dispose()
    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Create-Icon 192 "$scriptDir\icon_192.png"
Create-Icon 512 "$scriptDir\icon_512.png"

Write-Host "Icons generated successfully in $scriptDir!"
