import nodemailer from "nodemailer";

let transporter = null;
let transporterChecked = false;

function getTransporter() {
    if (transporterChecked) return transporter;
    transporterChecked = true;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        transporter = null;
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return transporter;
}

export const sendMail = async ({ to, subject, html }) => {
    const t = getTransporter();
    if (!t) {
        console.warn(`[mailer] SMTP not configured — skipped email to ${to} ("${subject}"). Set SMTP_HOST/SMTP_USER/SMTP_PASS to enable real delivery.`);
        return { skipped: true };
    }
    try {
        await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
        return { skipped: false };
    } catch (err) {
        console.error("[mailer] Failed to send email:", err.message);
        return { skipped: true, error: err.message };
    }
};