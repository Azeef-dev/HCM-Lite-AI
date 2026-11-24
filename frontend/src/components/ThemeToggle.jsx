import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitialTheme() {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("hcm_theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle({ className }) {
    const [dark, setDark] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("hcm_theme", dark ? "dark" : "light");
    }, [dark]);

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", className)}
            onClick={() => setDark((d) => !d)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}