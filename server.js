require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Use morgan for HTTP request logging
app.use(morgan('dev'));

// Parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CẤU HÌNH SMTP GỬI MAIL (Thay đổi thông tin tại đây hoặc cấu hình qua biến môi trường)
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false', // true cho cổng 465, false cho các cổng khác
    auth: {
        user: process.env.SMTP_USER || 'manhhungfordmydinh@gmail.com', // Tài khoản Gmail gửi thư
        pass: process.env.SMTP_PASS || 'YOUR_APP_PASSWORD' // Mật khẩu ứng dụng (App Password)
    }
};

const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || 'manhhungfordmydinh@gmail.com'; // Email nhận thông tin khách hàng

// Khởi tạo Transporter cho Nodemailer
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Handle the contact form submission endpoint
app.post('/send-form-info', async (req, res) => {
    console.log('--- Form Submission Received ---');
    console.log('Data:', req.body);
    console.log('--------------------------------');

    const data = req.body;
    
    // Tự động phân tích dữ liệu dựa trên loại form (frm_item_id)
    let formType = 'Yêu cầu tư vấn chung';
    let name = 'Khách hàng ẩn danh';
    let phone = 'Không có';
    let carModel = 'Không chọn';
    let extraInfo = '';

    if (data.frm_item_id === '1' || data.frm_item_id === 1) {
        formType = 'Đăng ký tư vấn - nhận ưu đãi (Popup)';
        phone = data.frm_item_phone_1 || 'Không có';
        carModel = data.frm_item_class_1 || 'Không chọn';
        extraInfo = `Hình thức liên hệ: ${data.frm_item_payment_type_1 || 'Gọi lại'}`;
    } else if (data.frm_item_id === '2' || data.frm_item_id === 2) {
        formType = 'Yêu cầu báo giá hoặc lái thử tại nhà (Form chính)';
        name = data.frm_item_name_2 || 'Khách hàng ẩn danh';
        phone = data.frm_item_phone_2 || 'Không có';
        carModel = data.frm_item_class_2 || 'Không chọn';
    } else if (data.frm_item_id === '3' || data.frm_item_id === 3) {
        formType = 'Đăng ký tư vấn qua Chat Zalo (Bong bóng chat)';
        phone = data.frm_item_phone_3 || 'Không có';
        carModel = data.frm_item_class_3 || 'Không chọn';
    }

    // Tạo nội dung Email dạng Text và HTML
    const emailSubject = `[Web Ford Bắc Ninh] Khách hàng mới: ${name} (${phone})`;
    const emailText = `
Bạn có một yêu cầu mới từ website Ford Bắc Ninh:
---------------------------------------------
Loại yêu cầu: ${formType}
Họ và tên: ${name}
Số điện thoại: ${phone}
Dòng xe quan tâm: ${carModel}
${extraInfo ? extraInfo + '\n' : ''}---------------------------------------------
Email này được gửi tự động từ máy chủ Node.js của website.
    `;

    const emailHtml = `
        <h3>Bạn có một yêu cầu mới từ website Ford Bắc Ninh:</h3>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr style="background-color: #f2f2f2;">
                <th align="left" style="width: 30%;">Trường thông tin</th>
                <th align="left">Nội dung</th>
            </tr>
            <tr>
                <td><strong>Loại yêu cầu</strong></td>
                <td>${formType}</td>
            </tr>
            <tr>
                <td><strong>Họ và tên</strong></td>
                <td>${name}</td>
            </tr>
            <tr>
                <td><strong>Số điện thoại</strong></td>
                <td><a href="tel:${phone}">${phone}</a></td>
            </tr>
            <tr>
                <td><strong>Dòng xe quan tâm</strong></td>
                <td>Ford ${carModel}</td>
            </tr>
            ${extraInfo ? `
            <tr>
                <td><strong>Thông tin thêm</strong></td>
                <td>${extraInfo}</td>
            </tr>
            ` : ''}
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">Email này được gửi tự động từ máy chủ Node.js của website.</p>
    `;

    // Nếu cấu hình mật khẩu chưa được thay đổi, báo lỗi chi tiết ra console nhưng vẫn phản hồi thành công để UI không lỗi
    if (SMTP_CONFIG.auth.pass === 'YOUR_APP_PASSWORD') {
        console.warn('⚠️ CẢNH BÁO: Chưa cấu hình mật khẩu ứng dụng Gmail (App Password). Thư chưa được gửi đi.');
        return res.status(200).json({
            success: true,
            message: 'Gửi yêu cầu thành công! (Môi trường phát triển - Chưa cấu hình gửi mail)'
        });
    }

    try {
        await transporter.sendMail({
            from: `"${SMTP_CONFIG.auth.user}" <${SMTP_CONFIG.auth.user}>`,
            to: RECEIVER_EMAIL,
            subject: emailSubject,
            text: emailText,
            html: emailHtml
        });
        console.log(`✅ Đã gửi email báo cáo thành công tới: ${RECEIVER_EMAIL}`);
        return res.status(200).json({
            success: true,
            message: 'Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất.'
        });
    } catch (error) {
        console.error('❌ LỖI GỬI EMAIL:', error);
        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra trong quá trình gửi yêu cầu, vui lòng thử lại hoặc gọi hotline.'
        });
    }
});

// Middleware for clean URLs: maps /gioi-thieu to /gioi-thieu.html
app.use((req, res, next) => {
    let reqPath = req.path;
    
    // Default to index.html for root path
    if (reqPath === '/') {
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }
    
    // Check if the requested path has an extension
    const ext = path.extname(reqPath);
    if (!ext) {
        // Check if a file with .html exists
        const htmlFilePath = path.join(__dirname, reqPath + '.html');
        if (fs.existsSync(htmlFilePath)) {
            return res.sendFile(htmlFilePath);
        }
        
        // Check if it's a directory containing index.html
        const dirIndexPath = path.join(__dirname, reqPath, 'index.html');
        if (fs.existsSync(dirIndexPath)) {
            return res.sendFile(dirIndexPath);
        }
    }
    
    next();
});

// Serve all other static assets (CSS, JS, images, favicon)
app.use(express.static(__dirname));

// Error fallback page (serve index.html or 404 if index.html is missing)
app.use((req, res) => {
    res.status(404).send('<h1>404 - Page Not Found</h1><p>The page you requested does not exist locally.</p><a href="/">Go to Homepage</a>');
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`Server is running at: http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server.`);
    console.log(`==================================================`);
});
