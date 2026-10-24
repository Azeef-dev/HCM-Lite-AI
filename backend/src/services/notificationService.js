import Notification from "../models/Notification.js";

export const createNotification = async ({ user, title, message, type = "general" }) => {
    try {
        await Notification.create({ user, title, message, type });
    } catch (err) {
        console.error("Notification create failed:", err.message);
    }
};