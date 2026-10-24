export default function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}