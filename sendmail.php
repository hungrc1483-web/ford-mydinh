<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lấy dữ liệu gửi lên từ form dạng JSON
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        echo json_encode(["status" => "error", "message" => "Không nhận được dữ liệu"]);
        exit;
    }
    
    $form_type = isset($data['form_type']) ? htmlspecialchars($data['form_type']) : 'Yêu cầu từ Website';
    $name = isset($data['from_name']) ? htmlspecialchars($data['from_name']) : 'Khách hàng ẩn danh';
    $phone = isset($data['phone']) ? htmlspecialchars($data['phone']) : 'Không có';
    $car = isset($data['car_model']) ? htmlspecialchars($data['car_model']) : 'Không chọn';
    $message = isset($data['message']) ? htmlspecialchars($data['message']) : '';
    
    // Email đích nhận thông tin đăng ký của bạn
    $to = 'manhhungfordmydinh@gmail.com';
    
    // Tiêu đề email gửi về hòm thư của bạn
    $subject = "=?UTF-8?B?".base64_encode("[$form_type] Khách hàng mới: $name")."?=";
    
    // Nội dung chi tiết trong email gửi về cho bạn
    $body = "Bạn có một yêu cầu mới từ website:\n\n";
    $body .= "--------------------------------------\n";
    $body .= "Loại yêu cầu: $form_type\n";
    $body .= "Họ và tên: $name\n";
    $body .= "Số điện thoại: $phone\n";
    $body .= "Dòng xe quan tâm: $car\n";
    if ($message) {
        $body .= "Nội dung ghi chú: $message\n";
    }
    $body .= "--------------------------------------\n";
    $body .= "Email này được gửi tự động từ máy chủ website Ford Mỹ Đình.";
    
    // Cấu hình Header gửi thư (đảm bảo không bị nhận diện là spam/rác)
    $headers = "From: Webmaster <no-reply@ford-mydinh.io.vn>\r\n";
    $headers .= "Reply-To: $to\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Tiến hành gửi thư bằng hàm mail của PHP Server
    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(["status" => "success", "message" => "Gửi email thành công"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Không thể gửi email bằng server mail nội bộ"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Yêu cầu không hợp lệ"]);
}
?>
