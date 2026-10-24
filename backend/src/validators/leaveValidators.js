import { mongoIdValidation, isoDateValidation, freeTextValidation } from "../utils/validationRules.js";
import { validate } from "./validate.js";

export const applyLeaveValidator = [
    mongoIdValidation("leaveTypeId"),
    isoDateValidation("startDate"),
    isoDateValidation("endDate"),
    freeTextValidation("reason", { min: 3, max: 300 }),
    validate,
];

export const reviewLeaveValidator = [
    freeTextValidation("comment", { required: false, min: 0, max: 300 }),
    validate,
];