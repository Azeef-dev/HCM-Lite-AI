import { body } from "express-validator";
import {
    emailValidation, personNameValidation, codeValidation,
    phoneValidation, isoDateValidation,
} from "../utils/validationRules.js";
import { validate } from "./validate.js";

export const createEmployeeValidator = [
    codeValidation("employeeCode"),
    personNameValidation("name"),
    emailValidation("email"),
    phoneValidation("phone", { required: false }),
    body("address").optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
    body("department").optional({ checkFalsy: true }).isMongoId().withMessage("Invalid department id"),
    body("designation").optional({ checkFalsy: true }).isMongoId().withMessage("Invalid designation id"),
    isoDateValidation("dateOfJoining"),
    body("gender").optional().isIn(["male", "female", "other"]),
    body("salary.basic")
        .notEmpty().withMessage("Basic salary is required")
        .isFloat({ gt: 0 }).withMessage("Basic salary must be greater than 0"),
    validate,
];

export const updateEmployeeValidator = [
    personNameValidation("name", { required: false }),
    phoneValidation("phone", { required: false }),
    body("address").optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
    body("department").optional({ checkFalsy: true }).isMongoId(),
    body("designation").optional({ checkFalsy: true }).isMongoId(),
    body("status").optional().isIn(["active", "probation", "inactive"]),
    body("salary.basic").optional().isFloat({ gt: 0 }),
    validate,
];