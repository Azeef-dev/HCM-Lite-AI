import { Building2 } from "lucide-react";

export default function Logo({ size = "md" }) {
    const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
    const iconSizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" };
    return (
        <div className={`${sizes[size]} rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30`}>
            <Building2 className={`${iconSizes[size]} text-primary-foreground`} />
        </div>
    );
}