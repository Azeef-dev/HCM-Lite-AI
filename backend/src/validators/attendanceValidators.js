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