<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Lấy dữ liệu gửi lên từ form (hỗ trợ cả JSON và URL-encoded)
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Fallback: nếu không phải JSON, đọc từ $_POST (URL-encoded từ all.min.js)
    if (!$data || empty($data)) {
        $data = $_POST;
    }
    
    if (!$data || empty($data)) {
        echo json_encode(["success" => false, "message" => "Không nhận được dữ liệu"]);
        exit;
    }
    
    $form_id = isset($data['frm_item_id']) ? $data['frm_item_id'] : '0';
    
    $form_type = 'Yêu cầu tư vấn chung';
    $name = 'Khách hàng ẩn danh';
    $phone = 'Không có';
    $car = 'Không chọn';
    $extra = '';

    if ($form_id === '1' || $form_id === 1) {
        $form_type = 'Đăng ký tư vấn - nhận ưu đãi (Popup)';
        $phone = isset($data['frm_item_phone_1']) ? htmlspecialchars($data['frm_item_phone_1']) : 'Không có';
        $car = isset($data['frm_item_class_1']) ? htmlspecialchars($data['frm_item_class_1']) : 'Không chọn';
        $extra = "Hình thức liên hệ: " . (isset($data['frm_item_payment_type_1']) ? htmlspecialchars($data['frm_item_payment_type_1']) : 'Gọi lại');
    } else if ($form_id === '2' || $form_id === 2) {
        $form_type = 'Yêu cầu báo giá hoặc lái thử tại nhà (Form chính)';
        $name = isset($data['frm_item_name_2']) ? htmlspecialchars($data['frm_item_name_2']) : 'Khách hàng ẩn danh';
        $phone = isset($data['frm_item_phone_2']) ? htmlspecialchars($data['frm_item_phone_2']) : 'Không có';
        $car = isset($data['frm_item_class_2']) ? htmlspecialchars($data['frm_item_class_2']) : 'Không chọn';
    } else if ($form_id === '3' || $form_id === 3) {
        $form_type = 'Đăng ký tư vấn qua Chat Zalo (Bong bóng chat)';
        $phone = isset($data['frm_item_phone_3']) ? htmlspecialchars($data['frm_item_phone_3']) : 'Không có';
        $car = isset($data['frm_item_class_3']) ? htmlspecialchars($data['frm_item_class_3']) : 'Không chọn';
    }
    
    // Xử lý form frm_mic_support (Yêu cầu tư vấn qua điện thoại)
    if (isset($data['c_mgs_phone'])) {
        $form_type = 'Yêu cầu tư vấn qua điện thoại (Gọi lại)';
        $phone = htmlspecialchars($data['c_mgs_phone']);
        $name = isset($data['c_mgs_name']) ? htmlspecialchars($data['c_mgs_name']) : 'Khách hàng ẩn danh';
        $car = isset($data['c_mgs_class']) ? htmlspecialchars($data['c_mgs_class']) : 'Không chọn';
        $extra = isset($data['c_mgs_comment']) ? 'Nội dung: ' . htmlspecialchars($data['c_mgs_comment']) : '';
    }
    
    // Email đích nhận thông tin đăng ký của bạn
    $to = 'manhhungfordmydinh@gmail.com';
    
    // Tiêu đề email
    $subject = "=?UTF-8?B?".base64_encode("[Web Ford Mỹ Đình] Khách hàng mới: $name ($phone)")."?=";
    
    // Nội dung chi tiết trong email
    $body = "Bạn có một yêu cầu mới từ website:\n\n";
    $body .= "--------------------------------------\n";
    $body .= "Loại yêu cầu: $form_type\n";
    $body .= "Họ và tên: $name\n";
    $body .= "Số điện thoại: $phone\n";
    $body .= "Dòng xe quan tâm: $car\n";
    if ($extra) {
        $body .= "$extra\n";
    }
    $body .= "--------------------------------------\n";
    $body .= "Email này được gửi tự động từ website Ford Mỹ Đình.";
    
    // Cấu hình Header gửi thư
    $headers = "From: Webmaster <no-reply@ford-mydinh.io.vn>\r\n";
    $headers .= "Reply-To: $to\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Tiến hành gửi thư bằng hàm mail của PHP Server
    if (@mail($to, $subject, $body, $headers)) {
        echo json_encode(["success" => true, "message" => "Gửi email thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Không thể gửi email bằng server mail nội bộ"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Yêu cầu không hợp lệ"]);
}
?>
