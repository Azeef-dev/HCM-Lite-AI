// NotFound.jsx
import { Link } from "react-router-dom";
export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
            <h1 className="text-2xl font-bold">404 — Page Not Found</h1>
            <Link to="/" className="text-primary underline">Go Home</Link>
        </div>
    );
}