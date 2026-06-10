const nodemailer = require('nodemailer');

const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
        user: process.env.SMTP_USER || 'manhhungfordmydinh@gmail.com',
        pass: process.env.SMTP_PASS || 'YOUR_APP_PASSWORD'
    }
};

const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL || 'manhhungfordmydinh@gmail.com';
const transporter = nodemailer.createTransport(SMTP_CONFIG);

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const data = req.body;

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

    const emailSubject = `[Web Ford Bắc Ninh] Khách hàng mới: ${name} (${phone})`;
    const emailText = `
Bạn có một yêu cầu mới từ website Ford Bắc Ninh:
---------------------------------------------
Loại yêu cầu: ${formType}
Họ và tên: ${name}
Số điện thoại: ${phone}
Dòng xe quan tâm: ${carModel}
${extraInfo ? extraInfo + '\n' : ''}---------------------------------------------
Email này được gửi tự động từ Vercel Serverless Function.
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
        <p style="color: #666; font-size: 12px; margin-top: 20px;">Email này được gửi tự động từ Vercel Serverless Function.</p>
    `;

    try {
        await transporter.sendMail({
            from: `"${SMTP_CONFIG.auth.user}" <${SMTP_CONFIG.auth.user}>`,
            to: RECEIVER_EMAIL,
            subject: emailSubject,
            text: emailText,
            html: emailHtml
        });
        return res.status(200).json({
            success: true,
            message: 'Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất.'
        });
    } catch (error) {
        console.error('LỖI GỬI EMAIL:', error);
        return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi gửi email.'
        });
    }
};
