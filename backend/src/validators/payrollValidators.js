import { body } from "express-validator";
import { validate } from "./validate.js";

export const createPayrollRunValidator = [
    body("month").notEmpty().withMessage("month is required").isInt({ min: 1, max: 12 }).withMessage("month must be 1-12"),
    body("year").notEmpty().withMessage("year is required").isInt({ min: 2000, max: 2100 }).withMessage("year must be valid"),
    validate,
];