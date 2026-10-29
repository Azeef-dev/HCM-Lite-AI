import { body } from "express-validator";
import { freeTextValidation } from "../utils/validationRules.js";
import { validate } from "./validate.js";

export const correctionRequestValidator = [
    body("date").notEmpty().withMessage("date is required").isISO8601().withMessage("date must be valid (YYYY-MM-DD)"),
    body("requestedCheckIn").optional({ checkFalsy: true }).isISO8601().withMessage("requestedCheckIn must be a valid date-time"),
    body("requestedCheckOut").optional({ checkFalsy: true }).isISO8601().withMessage("requestedCheckOut must be a valid date-time"),
    freeTextValidation("reason", { min: 3, max: 300 }),
    validate,
];

export const reviewCorrectionValidator = [
    body("decision").notEmpty().isIn(["approved", "rejected"]).withMessage("decision must be approved or rejected"),
    body("comment").optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
    validate,
];

// Bonus camera + geolocation check-in (brief Section 5)
export const cameraCheckInValidator = [
    body("lat").notEmpty().withMessage("lat is required").isFloat({ min: -90, max: 90 }).withMessage("lat must be between -90 and 90"),
    body("lng").notEmpty().withMessage("lng is required").isFloat({ min: -180, max: 180 }).withMessage("lng must be between -180 and 180"),
    body("accuracy").optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("accuracy must be a positive number"),
    body("faceDetected").optional().isBoolean().withMessage("faceDetected must be true or false"),
    validate,
];