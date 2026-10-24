import { body } from "express-validator";
import { validate } from "./validate.js";

export const announcementValidator = [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 3, max: 120 }),
    body("message").trim().notEmpty().withMessage("Message is required").isLength({ min: 3, max: 1000 }),
    body("audience").optional().isIn(["all", "hr", "employee"]),
    validate,
];