import { body } from "express-validator";
import { emailValidation, personNameValidation } from "../utils/validationRules.js";
import { validate } from "./validate.js";

export const departmentValidator = [
    body("name")
        .trim().notEmpty().withMessage("Department name is required")
        .bail().custom((v) => v === v.trim()).withMessage("No leading/trailing spaces allowed")
        .matches(/^[A-Za-z][A-Za-z\s&-]{1,49}$/).withMessage("Department name must contain letters only (2-50 chars)"),
    body("description").optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
    validate,
];

export const designationValidator = [
    body("title")
        .trim().notEmpty().withMessage("Designation title is required")
        .bail().custom((v) => v === v.trim()).withMessage("No leading/trailing spaces allowed")
        .matches(/^[A-Za-z][A-Za-z\s-]{1,49}$/).withMessage("Title must contain letters only (2-50 chars)"),
    body("department").optional({ checkFalsy: true }).isMongoId().withMessage("Invalid department id"),
    validate,
];

export const leaveTypeValidator = [
    body("name")
        .trim().notEmpty().withMessage("Leave type name is required")
        .matches(/^[A-Za-z][A-Za-z\s]{1,29}$/).withMessage("Leave type name must contain letters only"),
    body("annualQuota").isInt({ min: 0, max: 365 }).withMessage("Annual quota must be between 0 and 365"),
    body("isPaid").optional().isBoolean().withMessage("isPaid must be true or false"),
    validate,
];

export const holidayValidator = [
    body("name").trim().notEmpty().withMessage("Holiday name is required").isLength({ min: 2, max: 100 }),
    body("date").notEmpty().withMessage("Date is required").isISO8601().withMessage("Date must be valid (YYYY-MM-DD)"),
    validate,
];

export const companySettingsValidator = [
    body("name").optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 100 }),
    body("officeStartTime").optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("officeStartTime must be HH:mm"),
    body("graceMinutes").optional().isInt({ min: 0, max: 120 }).withMessage("graceMinutes must be 0-120"),
    body("halfDayHours").optional().isFloat({ min: 1, max: 12 }).withMessage("halfDayHours must be 1-12"),
    body("radiusMeters").optional().isInt({ min: 10, max: 5000 }).withMessage("radiusMeters must be 10-5000"),
    body("officeLocation.lat").optional().isFloat({ min: -90, max: 90 }),
    body("officeLocation.lng").optional().isFloat({ min: -180, max: 180 }),
    validate,
];

export const createHrValidator = [
    personNameValidation("name"),
    emailValidation("email"),
    validate,
];