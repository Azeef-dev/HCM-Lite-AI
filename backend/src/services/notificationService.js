import Notification from "../models/Notification.js";

export const createNotification = async ({ user, title, message, type = "general", company }) => {
    try {
        await Notification.create({ user, title, message, type, company: company || null });
    } catch (err) {
        console.error("Notification create failed:", err.message);
    }
};
