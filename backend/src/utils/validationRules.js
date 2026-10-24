import { body } from "express-validator";

// Reusable, strict validation builders used across every route in the app.
// Rules: no leading/trailing/internal spaces where not allowed, no pure numbers
// or special characters in names, strong passwords, valid emails only.

export const emailValidation = (field = "email") =>
    body(field)
        .trim()
        .notEmpty().withMessage("Email is required")
        .bail()
        .custom((v) => !/\s/.test(v)).withMessage("Email must not contain spaces")
        .bail()
        .isEmail().withMessage("Enter a valid email address")
        .normalizeEmail({ gmail_remove_dots: false });

export const passwordValidation = (field = "password", { strong = true } = {}) => {
    const chain = body(field)
        .notEmpty().withMessage("Password is required")
        .bail()
        .custom((v) => !/\s/.test(v)).withMessage("Password must not contain spaces")
        .bail()
        .isLength({ min: 8, max: 64 }).withMessage("Password must be 8 to 64 characters");

    if (strong) {
        return chain
            .matches(/[a-z]/).withMessage("Password must include a lowercase letter")
            .matches(/[A-Z]/).withMessage("Password must include an uppercase letter")
            .matches(/\d/).withMessage("Password must include a number")
            .matches(/[^A-Za-z0-9]/).withMessage("Password must include a special character (e.g. @ # $ ! %)");
    }
    return chain;
};

// Human names: letters + single spaces only. No numbers, no symbols, no double spaces.
export const personNameValidation = (field = "name", { required = true } = {}) => {
    let chain = body(field).trim();
    chain = required
        ? chain.notEmpty().withMessage(`${field} is required`)
        : chain.optional({ checkFalsy: true });

    return chain
        .bail()
        .custom((v) => v === v.trim()).withMessage(`${field} must not have leading or trailing spaces`)
        .bail()
        .matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/).withMessage(`${field} must contain letters and single spaces only (no numbers or symbols)`)
        .isLength({ min: 2, max: 50 }).withMessage(`${field} must be 2 to 50 characters`);
};

// Codes like employee code: no spaces, alphanumeric + - _
export const codeValidation = (field) =>
    body(field)
        .trim()
        .notEmpty().withMessage(`${field} is required`)
        .bail()
        .custom((v) => !/\s/.test(v)).withMessage(`${field} must not contain spaces`)
        .bail()
        .matches(/^[A-Za-z0-9\-_]{2,20}$/).withMessage(`${field} must be 2-20 letters, numbers, - or _ only`);

export const phoneValidation = (field = "phone", { required = false } = {}) => {
    let chain = body(field).trim();
    chain = required
        ? chain.notEmpty().withMessage("Phone is required")
        : chain.optional({ checkFalsy: true });

    return chain
        .bail()
        .matches(/^\+?[0-9]{7,15}$/).withMessage("Phone must be 7-15 digits, optional leading +, no spaces or letters");
};

export const freeTextValidation = (field, { required = true, min = 3, max = 500 } = {}) => {
    let chain = body(field).trim();
    chain = required
        ? chain.notEmpty().withMessage(`${field} is required`)
        : chain.optional({ checkFalsy: true });

    return chain
        .bail()
        .custom((v) => v === v.trim()).withMessage(`${field} must not have leading or trailing spaces`)
        .isLength({ min, max }).withMessage(`${field} must be ${min}-${max} characters`);
};

export const mongoIdValidation = (field) =>
    body(field)
        .trim()
        .notEmpty().withMessage(`${field} is required`)
        .isMongoId().withMessage(`${field} is not a valid id`);

export const isoDateValidation = (field) =>
    body(field)
        .notEmpty().withMessage(`${field} is required`)
        .isISO8601().withMessage(`${field} must be a valid date (YYYY-MM-DD)`);

export const positiveNumberValidation = (field) =>
    body(field)
        .notEmpty().withMessage(`${field} is required`)
        .isFloat({ gt: 0 }).withMessage(`${field} must be greater than 0`);