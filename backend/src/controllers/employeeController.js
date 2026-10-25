import Employee from "../models/Employee.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTempPassword } from "../utils/generatePassword.js";
import { logAudit } from "../services/auditService.js";
import { parse } from "csv-parse/sync";

// POST /api/employees  (HR only) - registers employee + creates login
export const createEmployee = asyncHandler(async (req, res) => {
    const {
        employeeCode, name, email, phone, address,
        department, designation, dateOfJoining, gender,
        salary,
    } = req.body;

    if (!employeeCode || !name || !email || !dateOfJoining || !salary?.basic) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (Number(salary.basic) <= 0) {
        return res.status(400).json({ message: "Salary must be greater than 0" });
    }

    const companyId = req.user?.companyId || null;

    const existingEmp = await Employee.findOne({
        ...(companyId ? { company: companyId } : {}),
        $or: [{ email: email.toLowerCase() }, { employeeCode }],
    });
    if (existingEmp) {
        return res.status(409).json({ message: "Employee code or email already exists in this organization" });
    }

    const employee = await Employee.create({
        company: companyId,
        employeeCode,
        name,
        email: email.toLowerCase(),
        phone,
        address,
        department: department || null,
        designation: designation || null,
        dateOfJoining,
        gender: gender || "other",
        salary: { basic: Number(salary.basic) },
        status: "probation",
    });

    const tempPassword = generateTempPassword();
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: tempPassword,
        role: "employee",
        company: companyId,
        employee: employee._id,
        mustChangePassword: true,
    });

    await logAudit({
        actor: req.user,
        action: "create",
        entity: "Employee",
        entityId: employee._id,
        after: employee,
        companyId,
    });

    res.status(201).json({ employee, login: { email: user.email, tempPassword } });
});

// GET /api/employees  -> directory, search, filter, paging
export const listEmployees = asyncHandler(async (req, res) => {
    const { search = "", department, status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (req.user?.companyId) filter.company = req.user.companyId;
    if (search) filter.$text = { $search: search };
    if (department) filter.department = department;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [employees, total] = await Promise.all([
        Employee.find(filter)
            .populate("department designation")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 }),
        Employee.countDocuments(filter),
    ]);

    res.json({ data: employees, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/employees/:id  -> Employee 360
export const getEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id).populate("department designation");
    if (!employee) return res.status(404).json({ message: "Not found" });

    // Employee can only view own record
    if (req.user.role === "employee" && req.user.employeeId !== employee._id.toString()) {
        return res.status(403).json({ message: "Forbidden" });
    }

    res.json(employee);
});

// PUT /api/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Not found" });

    if (req.user.role === "employee") {
        if (req.user.employeeId !== employee._id.toString()) {
            return res.status(403).json({ message: "Forbidden" });
        }
        // Employee can only change phone & address
        employee.phone = req.body.phone ?? employee.phone;
        employee.address = req.body.address ?? employee.address;
    } else if (req.user.role === "hr" || req.user.role === "admin") {
        const before = employee.toObject();
        Object.assign(employee, req.body);
        await logAudit({
            actor: req.user,
            action: "update",
            entity: "Employee",
            entityId: employee._id,
            before,
            after: employee,
            companyId: req.user?.companyId,
        });
    } else {
        return res.status(403).json({ message: "Forbidden" });
    }

    await employee.save();
    res.json(employee);
});

// POST /api/employees/csv-import?dryRun=true
export const importEmployeesCsv = asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "CSV file is required" });

    const companyId = req.user?.companyId || null;
    const records = parse(req.file.buffer.toString(), { columns: true, skip_empty_lines: true, trim: true });
    const dryRun = req.query.dryRun === "true";
    const errors = [];
    const validRows = [];

    const existingEmployees = await Employee.find(companyId ? { company: companyId } : {}).select("employeeCode email");
    const existingCodes = new Set(existingEmployees.flatMap((e) => [e.employeeCode, e.email]));

    records.forEach((row, idx) => {
        const rowNum = idx + 2; // account for header row
        const required = ["employeeCode", "name", "email", "department", "dateOfJoining", "salary"];
        for (const field of required) {
            if (!row[field]) errors.push({ row: rowNum, field, reason: "Missing required field" });
        }
        if (row.email && !/^\S+@\S+\.\S+$/.test(row.email)) {
            errors.push({ row: rowNum, field: "email", reason: "Invalid email format" });
        }
        if ((row.employeeCode && existingCodes.has(row.employeeCode)) || (row.email && existingCodes.has(row.email))) {
            errors.push({ row: rowNum, field: "employeeCode/email", reason: "Duplicate value in organization" });
        }
        if (row.dateOfJoining && isNaN(Date.parse(row.dateOfJoining))) {
            errors.push({ row: rowNum, field: "dateOfJoining", reason: "Invalid ISO date" });
        }
        if (row.salary && Number(row.salary) <= 0) {
            errors.push({ row: rowNum, field: "salary", reason: "Must be greater than 0" });
        }
        if (errors.filter((e) => e.row === rowNum).length === 0) {
            validRows.push(row);
        }
    });

    if (dryRun) {
        return res.json({ totalRows: records.length, validCount: validRows.length, errors });
    }

    const created = [];
    for (const row of validRows) {
        const tempPassword = generateTempPassword();
        const employee = await Employee.create({
            company: companyId,
            employeeCode: row.employeeCode,
            name: row.name,
            email: row.email.toLowerCase(),
            phone: row.phone,
            department: row.department,
            dateOfJoining: row.dateOfJoining,
            salary: { basic: Number(row.salary) },
            status: "probation",
        });
        await User.create({
            company: companyId,
            name: row.name,
            email: row.email.toLowerCase(),
            password: tempPassword,
            role: "employee",
            employee: employee._id,
            mustChangePassword: true,
        });
        created.push(employee.employeeCode);
    }

    res.json({ created: created.length, errors });
});

// GET /api/employees/export -> CSV export
export const exportEmployeesCsv = asyncHandler(async (req, res) => {
    const filter = req.user?.companyId ? { company: req.user.companyId } : {};
    const employees = await Employee.find(filter).populate("department designation");
    const header = "employeeCode,name,email,phone,department,designation,dateOfJoining,status,basicSalary\n";
    const rows = employees.map((e) =>
        [
            e.employeeCode, e.name, e.email, e.phone || "",
            e.department?.name || "", e.designation?.title || "",
            e.dateOfJoining ? e.dateOfJoining.toISOString().split("T")[0] : "", e.status, e.salary?.basic || 0,
        ].join(",")
    );
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=employees.csv");
    res.send(header + rows.join("\n"));
});
