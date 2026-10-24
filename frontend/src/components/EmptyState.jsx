export default function EmptyState({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            {Icon && <Icon className="h-9 w-9 text-muted-foreground/50 mb-3" />}
            <p className="text-sm font-medium text-foreground/80">{title}</p>
            {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
        </div>
    );
}