// ============================================================
// form-handler.js - Chuyển hướng form tĩnh sang EmailJS
// Thay thế sendmail.php bằng EmailJS tự động 100%
// ============================================================
(function () {
  
  // Hàm xử lý gửi data qua EmailJS bằng Key đã cấu hình ở <head>
  function sendViaEmailJS(formData, callback) {
    if (typeof emailjs === 'undefined') {
      console.error('Lỗi: Thư viện EmailJS chưa được tải!');
      if (callback) callback(false);
      return;
    }

    // Đọc mã cấu hình từ biến global ở đầu trang HTML
    var serviceId = window.EMAILJS_SERVICE_ID || 'service_1cl6v1p';
    var templateId = window.EMAILJS_TEMPLATE_ID || 'template_el174ig';

    // Phân tích dữ liệu từ form
    var formId = formData.frm_item_id;
    var formType = 'Yêu cầu tư vấn';
    var name = 'Khách hàng ẩn danh';
    var phone = '';
    var car = 'Chưa chọn';
    var message = '';

    if (formId == '1' || formId === 1) {
      formType = 'Đăng ký tư vấn - nhận ưu đãi (Popup)';
      phone = formData.frm_item_phone_1 || '';
      car = formData.frm_item_class_1 || 'Chưa chọn';
      message = 'Hình thức liên hệ mong muốn: ' + (formData.frm_item_payment_type_1 || 'Gọi lại');
    } else if (formId == '2' || formId === 2) {
      formType = 'Yêu cầu báo giá / lái thử tại nhà (Form chính)';
      name = formData.frm_item_name_2 || 'Khách hàng ẩn danh';
      phone = formData.frm_item_phone_2 || '';
      car = formData.frm_item_class_2 || 'Chưa chọn';
    } else if (formId == '3' || formId === 3) {
      formType = 'Đăng ký tư vấn qua Zalo (Chatbot)';
      phone = formData.frm_item_phone_3 || '';
      car = formData.frm_item_class_3 || 'Chưa chọn';
      message = 'Đăng ký nhận tư vấn và báo giá chi tiết qua Zalo chat.';
    } else if (formData.c_mgs_phone) {
      formType = 'Yêu cầu gọi lại tư vấn qua điện thoại';
      phone = formData.c_mgs_phone;
      name = formData.c_mgs_name || 'Khách hàng ẩn danh';
      car = formData.c_mgs_class || 'Chưa chọn';
      message = formData.c_mgs_comment || '';
    }

    // Các biến gửi về Template của EmailJS
    var templateParams = {
      form_type: formType,
      to_email: 'manhhungfordmydinh@gmail.com',
      from_name: name,
      phone: phone,
      car_model: car,
      message: message
    };

    console.log('--- Đang gửi EmailJS qua API ---');
    console.log('Params:', templateParams);

    emailjs.send(serviceId, templateId, templateParams)
      .then(function (response) {
        console.log('✅ Gửi EmailJS thành công!', response.status, response.text);
        if (callback) callback(true);
      }, function (error) {
        console.error('❌ Gửi EmailJS thất bại:', error);
        if (callback) callback(false);
      });
  }

  // Hàm chuyển serialize string thành object
  function serializeToObj(str) {
    var obj = {};
    if (!str) return obj;
    str.split('&').forEach(function (pair) {
      var parts = pair.split('=');
      if (parts[0]) obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
    });
    return obj;
  }

  // Override jQuery.ajax để chặn các request tới /sendmail.php
  var _origAjax = $.ajax;
  $.ajax = function (opts) {
    if (typeof opts === 'object' && opts.url &&
      (opts.url.indexOf('/sendmail.php') !== -1 || opts.url.indexOf('/send-form-info') !== -1 || opts.url.indexOf('/send-customer-message') !== -1)) {

      var formData = {};

      // Parse data tùy theo dạng gửi lên
      if (typeof opts.data === 'string') {
        try {
          formData = JSON.parse(opts.data);
        } catch (e) {
          formData = serializeToObj(opts.data);
        }
      } else if (typeof opts.data === 'object') {
        formData = opts.data;
      }

      sendViaEmailJS(formData, function (ok) {
        if (ok) {
          if (opts.success) {
            opts.success({ success: true, message: "Gửi thành công" });
          }
        } else {
          if (opts.error) {
            opts.error({}, 'error', 'Network error');
          }
        }
        if (opts.always) opts.always();
      });

      // Trả về fake jqXHR để không bị lỗi all.min.js
      return {
        always: function (fn) { setTimeout(function(){ if(fn) fn(); }, 800); return this; },
        done: function () { return this; },
        fail: function () { return this; },
        then: function () { return this; }
      };
    }

    return _origAjax.apply(this, arguments);
  };
})();
