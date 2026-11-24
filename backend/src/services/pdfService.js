import PDFDocument from "pdfkit";

export const generatePayslipPdf = (slip) => {
    const doc = new PDFDocument({ margin: 50 });

    doc.fontSize(18).text("HCM Lite — Payslip", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Period: ${slip.month}/${slip.year}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).text(`Employee: ${slip.employee.name} (${slip.employee.employeeCode})`);
    doc.text(`Email: ${slip.employee.email}`);
    doc.moveDown();

    const row = (label, value) => {
        doc.text(`${label}:`, { continued: true, width: 250 });
        doc.text(`  ${value}`);
    };

    row("Basic Salary", slip.basic.toFixed(2));
    row("HRA", slip.hra.toFixed(2));
    row("Medical", slip.medical.toFixed(2));
    row("Gross Salary", slip.gross.toFixed(2));
    doc.moveDown();
    row("Working Days", slip.workingDaysInMonth);
    row("Present Days", slip.presentDays);
    row("Absent Days", slip.absentDays);
    row("Half Days", slip.halfDays);
    row("Late Days", slip.lateDays ?? 0);
    row("Late Penalty (days)", slip.latePenaltyDays ?? 0);
    row("Paid Leave Days", slip.paidLeaveDays);
    row("Unpaid Leave Days", slip.unpaidLeaveDays);
    row("Deduction Days", slip.deductionDays);
    row("Deduction Amount", slip.deductionAmount.toFixed(2));
    doc.moveDown();
    row("Monthly Tax", slip.taxMonthly.toFixed(2));
    doc.moveDown();
    doc.fontSize(14).text(`Net Pay: Rs. ${slip.netPay.toFixed(2)}`, { underline: true });

    doc.moveDown(2);
    doc.fontSize(8).fillColor("gray").text("This is a system-generated payslip.", { align: "center" });

    // IMPORTANT: no doc.pipe()/doc.end() here. The old version called
    // `doc.pipe(res)` where `res` was actually the *employee object* (a
    // mismatch with how the controller called this function) and never
    // returned the document — so every payslip PDF request crashed with a
    // 500 error before the login-token issue even mattered. The controller
    // owns the HTTP response stream, so it pipes and ends it itself.
    return doc;
};