import { createTransport } from 'nodemailer';

export async function sendEmail(form: {
        from: string,
        to: string,
        subject: string,
        html: string
    }) {
    const transporter = createTransport({
        host: process.env.SMTP_PROVIDER!, // Replace with your SMTP server host
        port: 587,                // 587 (TLS) or 465 (SSL)
        secure: false,            // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL, // Your SMTP username
            pass: process.env.SMTP_PASSWORD,    // Your SMTP password or app password
        },
    });

    try {
        await transporter.sendMail(form);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}