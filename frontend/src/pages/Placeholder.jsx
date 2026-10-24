// Placeholder.jsx
export default function Placeholder({ title }) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground text-sm">This module is coming in the next build step.</p>
        </div>
    );
}