// Unauthorized.jsx
import { Link } from "react-router-dom";
export default function Unauthorized() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
            <h1 className="text-2xl font-bold">403 — Unauthorized</h1>
            <p className="text-muted-foreground">You don't have permission to view this page.</p>
            <Link to="/login" className="text-primary underline">Back to Login</Link>
        </div>
    );
}