export default function EmptyState({ icon: Icon, title = "No data yet", message }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {Icon && <Icon className="h-10 w-10 text-muted-foreground/50 mb-3" />}
            <p className="font-medium text-foreground">{title}</p>
            {message && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>}
        </div>
    );
}