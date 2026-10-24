import { body } from "express-validator";
import { emailValidation, passwordValidation, personNameValidation } from "../utils/validationRules.js";
import { validate } from "./validate.js";

export const loginValidator = [
    emailValidation("email"),
    passwordValidation("password", { strong: false }),
    validate,
];

export const setupValidator = [
    body("companyName")
        .trim()
        .notEmpty().withMessage("Company name is required")
        .bail()
        .custom((v) => v === v.trim()).withMessage("Company name must not have leading or trailing spaces")
        .bail()
        .matches(/^[A-Za-z0-9][A-Za-z0-9&.,'()\- ]{1,99}$/).withMessage("Company name contains invalid characters"),
    personNameValidation("adminName", { required: false }),
    emailValidation("adminEmail"),
    passwordValidation("adminPassword", { strong: true }),
    validate,
];

export const changePasswordValidator = [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    passwordValidation("newPassword", { strong: true }),
    validate,
];