import { Card, CardContent } from "@/components/ui/card";
import { UserX } from "lucide-react";

export default function NoEmployeeProfileNotice({ className = "" }) {
    return (
        <Card className={`border-amber-500/30 bg-amber-500/5 shadow-xs ${className}`}>
            <CardContent className="p-5 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <UserX className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        Your account isn't linked to an employee profile yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Attendance, leave and payslips need an employee profile created by HR.
                        Ask your HR team to add you from{" "}
                        <span className="font-medium text-foreground">Employees → Add Employee</span>,
                        and these features will unlock automatically for your account.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}