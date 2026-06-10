$oldUrl = "/send-form-info"
$newUrl = "/sendmail.php"
$targetPath = "d:\Code Web - Copy\web_new"

Write-Host "Bắt đầu cập nhật URL gửi form cho môi trường PHP Hosting..." -ForegroundColor Yellow

$files = Get-ChildItem -Path $targetPath -Recurse -Filter *.html

$count = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding utf8
    if ($content.Contains($oldUrl)) {
        $newContent = $content.Replace($oldUrl, $newUrl)
        Set-Content -Path $file.FullName -Value $newContent -Encoding utf8
        Write-Host "Đã chuyển đổi file: $($file.FullName)" -ForegroundColor Green
        $count++
    }
}

Write-Host "Hoàn thành! Đã chuyển đổi thành công $count file HTML sang dùng sendmail.php." -ForegroundColor Green
