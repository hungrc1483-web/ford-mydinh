// ============================================================
// Google Apps Script: Nhận form từ website Ford Mỹ Đình
// Lưu vào Google Sheets + Gửi email thông báo
// ============================================================
// CÁCH SỬ DỤNG:
// 1. Vào https://script.google.com → Tạo dự án mới
// 2. Dán toàn bộ code này vào
// 3. Chạy hàm setupSheet() 1 lần để tạo Sheet
// 4. Triển khai → Triển khai mới → Ứng dụng web
//    - Thực thi với tư cách: Tôi (your email)
//    - Ai có quyền truy cập: Bất kỳ ai
// 5. Sao chép URL triển khai và thay vào website
// ============================================================

var EMAIL_TO = "manhhungfordmydinh@gmail.com";
var SHEET_NAME = "Form_Leads";

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  sheet.getRange(1, 1, 1, 8).setValues([[
    "Thời gian", "Loại yêu cầu", "Họ tên", "Số điện thoại",
    "Dòng xe", "Hình thức LH", "Nội dung", "Trang gửi"
  ]]);
  sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#003478").setFontColor("white");
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    var data = {};

    // Hỗ trợ cả JSON body và URL-encoded form data
    if (e.postData && e.postData.type === "application/json") {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var formId = data.frm_item_id || "0";
    var formType = "Yêu cầu tư vấn chung";
    var name = "Khách hàng ẩn danh";
    var phone = "Không có";
    var car = "Không chọn";
    var contactMethod = "";
    var content = "";
    var pageUrl = data.page_url || "";

    if (formId === "1") {
      formType = "Đăng ký tư vấn - nhận ưu đãi (Popup)";
      phone = data.frm_item_phone_1 || "Không có";
      car = data.frm_item_class_1 || "Không chọn";
      contactMethod = data.frm_item_payment_type_1 || "Gọi lại";
    } else if (formId === "2") {
      formType = "Yêu cầu báo giá / lái thử tại nhà";
      name = data.frm_item_name_2 || "Khách hàng ẩn danh";
      phone = data.frm_item_phone_2 || "Không có";
      car = data.frm_item_class_2 || "Không chọn";
    } else if (formId === "3") {
      formType = "Đăng ký tư vấn qua Chat Zalo";
      phone = data.frm_item_phone_3 || "Không có";
      car = data.frm_item_class_3 || "Không chọn";
    }

    // Xử lý form frm_mic_support (Yêu cầu gọi lại)
    if (data.c_mgs_phone) {
      formType = "Yêu cầu tư vấn qua điện thoại (Gọi lại)";
      phone = data.c_mgs_phone;
      name = data.c_mgs_name || "Khách hàng ẩn danh";
      content = data.c_mgs_comment || "";
    }

    // 1. Lưu vào Google Sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      setupSheet();
    }
    var now = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    sheet.appendRow([now, formType, name, phone, car, contactMethod, content, pageUrl]);

    // 2. Gửi email thông báo
    var subject = "[Web Ford Mỹ Đình] Khách hàng mới: " + name + " (" + phone + ")";
    var body = "Bạn có một yêu cầu mới từ website Ford Mỹ Đình:\n";
    body += "--------------------------------------\n";
    body += "Thời gian: " + now + "\n";
    body += "Loại yêu cầu: " + formType + "\n";
    body += "Họ và tên: " + name + "\n";
    body += "Số điện thoại: " + phone + "\n";
    body += "Dòng xe quan tâm: " + car + "\n";
    if (contactMethod) body += "Hình thức liên hệ: " + contactMethod + "\n";
    if (content) body += "Nội dung: " + content + "\n";
    if (pageUrl) body += "Trang gửi: " + pageUrl + "\n";
    body += "--------------------------------------\n";
    body += "Email này được gửi tự động từ Google Apps Script.";

    var htmlBody = '<h3 style="color:#003478;">Khách hàng mới từ website Ford Mỹ Đình</h3>';
    htmlBody += '<table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:600px;">';
    htmlBody += '<tr style="background:#f2f2f2;"><th align="left" style="width:35%;">Thông tin</th><th align="left">Nội dung</th></tr>';
    htmlBody += '<tr><td><strong>Thời gian</strong></td><td>' + now + '</td></tr>';
    htmlBody += '<tr><td><strong>Loại yêu cầu</strong></td><td>' + formType + '</td></tr>';
    htmlBody += '<tr><td><strong>Họ và tên</strong></td><td>' + name + '</td></tr>';
    htmlBody += '<tr><td><strong>Số điện thoại</strong></td><td><a href="tel:' + phone + '">' + phone + '</a></td></tr>';
    htmlBody += '<tr><td><strong>Dòng xe</strong></td><td>Ford ' + car + '</td></tr>';
    if (contactMethod) htmlBody += '<tr><td><strong>Hình thức LH</strong></td><td>' + contactMethod + '</td></tr>';
    if (content) htmlBody += '<tr><td><strong>Nội dung</strong></td><td>' + content + '</td></tr>';
    if (pageUrl) htmlBody += '<tr><td><strong>Trang gửi</strong></td><td><a href="' + pageUrl + '">' + pageUrl + '</a></td></tr>';
    htmlBody += '</table>';
    htmlBody += '<p style="color:#666;font-size:12px;margin-top:20px;">Email tự động từ Google Apps Script.</p>';

    MailApp.sendEmail({
      to: EMAIL_TO,
      subject: subject,
      body: body,
      htmlBody: htmlBody
    });

    // 3. Trả về JSON thành công
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Lỗi: " + err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "API Ford Mỹ Đình đang hoạt động."
  })).setMimeType(ContentService.MimeType.JSON);
}
