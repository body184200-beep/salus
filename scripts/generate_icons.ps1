Add-Type -AssemblyName System.Drawing
$srcPath = 'C:\Users\body1\.gemini\antigravity\brain\9dd89654-370e-4e59-b2f1-af872c927b8f\salus_app_icon_v2_1794955173070.jpg'
$img = [System.Drawing.Image]::FromFile($srcPath)

# Copy base
New-Item -ItemType Directory -Force -Path 'c:\Users\body1\StudioProjects\salus\assets\images' | Out-Null
New-Item -ItemType Directory -Force -Path 'c:\Users\body1\StudioProjects\salus\frontend\public' | Out-Null

Copy-Item $srcPath 'c:\Users\body1\StudioProjects\salus\assets\images\salus_logo.png' -Force
Copy-Item $srcPath 'c:\Users\body1\StudioProjects\salus\frontend\public\salus_logo.png' -Force
if (Test-Path 'c:\Users\body1\StudioProjects\salus\frontend\dist') {
    Copy-Item $srcPath 'c:\Users\body1\StudioProjects\salus\frontend\dist\salus_logo.png' -Force
}

$sizes = @(
    @{ Name = 'mipmap-mdpi'; Dim = 48 },
    @{ Name = 'mipmap-hdpi'; Dim = 72 },
    @{ Name = 'mipmap-xhdpi'; Dim = 96 },
    @{ Name = 'mipmap-xxhdpi'; Dim = 144 },
    @{ Name = 'mipmap-xxxhdpi'; Dim = 192 }
)

foreach ($entry in $sizes) {
    $dim = $entry.Dim
    $dirName = $entry.Name
    $targetDir = "c:\Users\body1\StudioProjects\salus\android\app\src\main\res\$dirName"
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    $bmp = New-Object System.Drawing.Bitmap $dim, $dim
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $dim, $dim)
    $targetFile = Join-Path $targetDir 'ic_launcher.png'
    $bmp.Save($targetFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created: $targetFile ($dim x $dim)"
}

# 512x512 icon
$webBmp = New-Object System.Drawing.Bitmap 512, 512
$wg = [System.Drawing.Graphics]::FromImage($webBmp)
$wg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$wg.DrawImage($img, 0, 0, 512, 512)
$webBmp.Save('c:\Users\body1\StudioProjects\salus\frontend\public\favicon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$webBmp.Save('c:\Users\body1\StudioProjects\salus\assets\images\app_icon_512.png', [System.Drawing.Imaging.ImageFormat]::Png)
if (Test-Path 'c:\Users\body1\StudioProjects\salus\frontend\dist') {
    $webBmp.Save('c:\Users\body1\StudioProjects\salus\frontend\dist\favicon.png', [System.Drawing.Imaging.ImageFormat]::Png)
}
$wg.Dispose()
$webBmp.Dispose()
$img.Dispose()

Write-Host "Done! All app icons generated successfully."
