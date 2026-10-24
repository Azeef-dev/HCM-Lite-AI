export const patterns = {
    name: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
    code: /^[A-Za-z0-9\-_]{2,20}$/,
    phone: /^\+?[0-9]{7,15}$/,
};

export function validateEmail(value) {
    if (!value || /\s/.test(value)) return "Enter a valid email address (no spaces)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    return "";
}

export function validatePersonName(value, { required = true, label = "Name" } = {}) {
    if (!value && !required) return "";
    if (!value) return `${label} is required`;
    if (value !== value.trim()) return `${label} cannot start/end with space`;
    if (!patterns.name.test(value)) return `${label} must contain letters only (no numbers/symbols)`;
    if (value.length < 2 || value.length > 50) return `${label} must be 2-50 characters`;
    return "";
}

export function validatePassword(value, { strong = true } = {}) {
    if (!value) return "Password is required";
    if (/\s/.test(value)) return "Password cannot contain spaces";
    if (value.length < 8 || value.length > 64) return "Password must be 8-64 characters";
    if (strong) {
        if (!/[a-z]/.test(value)) return "Password must include a lowercase letter";
        if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter";
        if (!/[0-9]/.test(value)) return "Password must include a number";
        if (!/[^A-Za-z0-9]/.test(value)) return "Password must include a special character";
    }
    return "";
}

export function validateCode(value, { label = "Code" } = {}) {
    if (!value) return `${label} is required`;
    if (/\s/.test(value)) return `${label} cannot contain spaces`;
    if (!patterns.code.test(value)) return `${label} must be 2-20 letters/numbers/-/_`;
    return "";
}

export function validatePhone(value, { required = false } = {}) {
    if (!value) return required ? "Phone is required" : "";
    if (!patterns.phone.test(value)) return "Enter a valid phone number (digits only, optional +)";
    return "";
}

export function validateFreeText(value, { required = true, min = 3, max = 300, label = "Field" } = {}) {
    if (!value && !required) return "";
    if (!value || !value.trim()) return `${label} is required`;
    if (value !== value.trim()) return `${label} cannot start/end with space`;
    if (value.length < min || value.length > max) return `${label} must be ${min}-${max} characters`;
    return "";
}

export function validateCompanyName(value) {
    if (!value || !value.trim()) return "Company name is required";
    if (value !== value.trim()) return "Company name cannot start/end with space";
    if (value.length < 2 || value.length > 100) return "Company name must be 2-100 characters";
    if (!/^[A-Za-z0-9&.,'\- ]+$/.test(value)) return "Company name has invalid characters";
    return "";
}