$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
    param([float]$x, [float]$y, [float]$w, [float]$h, [float]$r)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = 2 * $r
    if ($d -le 0 -or $w -le 0 -or $h -le 0) { return $path }
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function New-MenaceIcon {
    param([int]$Size, [string]$Path, [double]$Scale = 1.0)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    $pad = $Size * (1 - $Scale) / 2
    $s = ($Size - 2 * $pad) / 512.0
    $ox = [float]$pad
    $oy = [float]$pad

    $g.Clear([System.Drawing.Color]::FromArgb(45, 55, 72))

    # Ground shadow
    $sw = 280 * $s
    $sh = 36 * $s
    $brushShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(89, 32, 32, 32))
    $g.FillEllipse($brushShadow, $ox + (256 * $s - $sw / 2), $oy + 448 * $s - $sh / 2, $sw, $sh)
    $brushShadow.Dispose()

    # Outer sleeve (kraft gradient approximated as two-tone rect)
    $bx = $ox + 88 * $s
    $by = $oy + 72 * $s
    $bw = 336 * $s
    $bh = 368 * $s
    $br = 28 * $s
    $sleevePath = New-RoundedRectPath $bx $by $bw $bh $br
    $brushSleeve = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.PointF]::new($bx, $by),
        [System.Drawing.PointF]::new($bx, $by + $bh),
        [System.Drawing.Color]::FromArgb(255, 217, 188, 148),
        [System.Drawing.Color]::FromArgb(255, 184, 149, 110)
    )
    $g.FillPath($brushSleeve, $sleevePath)
    $brushSleeve.Dispose()
    $penStroke = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(92, 64, 48), [Math]::Max(1.0, 6 * $s))
    $g.DrawPath($penStroke, $sleevePath)
    $penStroke.Dispose()

    # Top highlight on sleeve
    $hiH = 26 * $s
    $hiR = [Math]::Min([Math]::Min(26 * $s, $hiH / 2), $bw / 2)
    $hiPath = New-RoundedRectPath $bx $by $bw $hiH $hiR
    $brushHi = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 232, 212, 184))
    $g.FillPath($brushHi, $hiPath)
    $brushHi.Dispose()
    $hiPath.Dispose()

    # Strike strip (clipped to sleeve)
    $g.SetClip($sleevePath)
    $strikeW = 64 * $s
    $brushStrike = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 127, 29, 29))
    $g.FillRectangle($brushStrike, $bx, $by, $strikeW, $bh)
    $brushStrike.Dispose()
    $brushStrikeDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(115, 69, 26, 26))
    $g.FillRectangle($brushStrikeDark, $bx + 8 * $s, $by + 24 * $s, 8 * $s, 320 * $s)
    $brushStrikeDark.Dispose()
    $g.ResetClip()
    $sleevePath.Dispose()

    # Inner label panel
    $ix = $ox + 168 * $s
    $iy = $oy + 96 * $s
    $iw = 240 * $s
    $ih = 320 * $s
    $ir = 18 * $s
    $innerPath = New-RoundedRectPath $ix $iy $iw $ih $ir
    $brushInner = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.PointF]::new($ix, $iy),
        [System.Drawing.PointF]::new($ix, $iy + $ih),
        [System.Drawing.Color]::FromArgb(255, 255, 253, 248),
        [System.Drawing.Color]::FromArgb(255, 240, 230, 216)
    )
    $g.FillPath($brushInner, $innerPath)
    $brushInner.Dispose()
    $penInner = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(196, 180, 154), [Math]::Max(1.0, 4 * $s))
    $g.DrawPath($penInner, $innerPath)
    $penInner.Dispose()
    $innerPath.Dispose()

    # 3×3 grid overlay
    $penGrid = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(230, 45, 55, 72), [Math]::Max(2.0, 6 * $s))
    $penGrid.EndCap = [System.Drawing.Drawing2D.LineCap]::Square
    $penGrid.StartCap = [System.Drawing.Drawing2D.LineCap]::Square
    $x1 = $ox + 198 * $s
    $x2 = $ox + 258 * $s
    $x3 = $ox + 318 * $s
    $x4 = $ox + 378 * $s
    $y1 = $oy + 166 * $s
    $y2 = $oy + 226 * $s
    $y3 = $oy + 286 * $s
    $y4 = $oy + 346 * $s
    $g.DrawLine($penGrid, $x2, $y1, $x2, $y4)
    $g.DrawLine($penGrid, $x3, $y1, $x3, $y4)
    $g.DrawLine($penGrid, $x1, $y2, $x4, $y2)
    $g.DrawLine($penGrid, $x1, $y3, $x4, $y3)
    $penGrid.Dispose()

    $g.Dispose()
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$base = Join-Path $PSScriptRoot "..\icons" | Resolve-Path
New-MenaceIcon -Size 192 -Path (Join-Path $base "icon-192.png") -Scale 1.0
New-MenaceIcon -Size 512 -Path (Join-Path $base "icon-512.png") -Scale 1.0
New-MenaceIcon -Size 512 -Path (Join-Path $base "icon-maskable-512.png") -Scale 0.82
Write-Host "Wrote PNG icons to $base"
