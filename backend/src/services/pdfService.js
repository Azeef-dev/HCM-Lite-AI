import PDFDocument from "pdfkit";

export const generatePayslipPdf = (slip, res) => {
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

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

    doc.end();
};