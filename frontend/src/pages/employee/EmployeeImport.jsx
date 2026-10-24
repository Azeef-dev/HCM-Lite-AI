import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { employeeApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { ArrowLeft, Upload, FileCheck2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function EmployeeImport() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const basePath = user?.role === "hr" ? "/hr/employees" : "/admin/employees";

    const [file, setFile] = useState(null);
    const [validating, setValidating] = useState(false);
    const [importing, setImporting] = useState(false);
    const [errors, setErrors] = useState(null);
    const [validCount, setValidCount] = useState(null);

    function handleFile(e) {
        setFile(e.target.files[0]);
        setErrors(null);
        setValidCount(null);
    }

    async function runImport(dryRun) {
        if (!file) { toast.error("Please select a CSV file first"); return; }
        const formData = new FormData();
        formData.append("file", file);
        dryRun ? setValidating(true) : setImporting(true);
        try {
            const res = await employeeApi.csvImport(formData, dryRun);
            if (dryRun) {
                setErrors(res.errors || []);
                setValidCount(res.validCount ?? res.totalRows - (res.errors?.length || 0));
                if (!res.errors?.length) toast.success("No errors found — ready to import!");
                else toast.error(`${res.errors.length} row(s) have issues`);
            } else {
                toast.success(`Successfully imported ${res.createdCount || res.count || 0} employees`);
                navigate(basePath, { replace: true });
            }
        } catch (err) {
            toast.error(err.message || "Import failed");
        } finally {
            setValidating(false);
            setImporting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate(basePath)}>
                <ArrowLeft className="h-4 w-4" /> Back to Employees
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Bulk Import Employees</CardTitle>
                    <p className="text-sm text-muted-foreground">Upload a CSV with columns: employeeCode, name, email, phone, dateOfJoining, gender, basicSalary</p>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                        <input type="file" accept=".csv" id="csv-file" className="hidden" onChange={handleFile} />
                        <label htmlFor="csv-file" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">{file ? file.name : "Click to select a CSV file"}</span>
                            <span className="text-xs text-muted-foreground">or drag and drop</span>
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 gap-2" onClick={() => runImport(true)} disabled={!file || validating}>
                            <FileCheck2 className="h-4 w-4" /> {validating ? "Validating…" : "Validate (Dry Run)"}
                        </Button>
                        <Button className="flex-1 gap-2" onClick={() => runImport(false)} disabled={!file || importing || (errors && errors.length > 0)}>
                            <Upload className="h-4 w-4" /> {importing ? "Importing…" : "Import Now"}
                        </Button>
                    </div>

                    {errors !== null && (
                        <div className="space-y-3">
                            {errors.length === 0 ? (
                                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-lg p-3">
                                    <CheckCircle2 className="h-4 w-4" /> All {validCount} rows look valid. You can import now.
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-500/10 rounded-lg p-3 mb-3">
                                        <AlertTriangle className="h-4 w-4" /> {errors.length} issue(s) found — fix your CSV and re-validate.
                                    </div>
                                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                                        <table className="w-full text-xs">
                                            <thead className="bg-muted sticky top-0">
                                                <tr className="text-left">
                                                    <th className="px-3 py-2">Row</th>
                                                    <th className="px-3 py-2">Field</th>
                                                    <th className="px-3 py-2">Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {errors.map((e, i) => (
                                                    <tr key={i} className="border-t">
                                                        <td className="px-3 py-2">{e.row}</td>
                                                        <td className="px-3 py-2 font-mono">{e.field}</td>
                                                        <td className="px-3 py-2 text-muted-foreground">{e.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {errors === null && !file && (
                        <EmptyState icon={Upload} title="No file selected" description="Choose a CSV file to begin validation." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}