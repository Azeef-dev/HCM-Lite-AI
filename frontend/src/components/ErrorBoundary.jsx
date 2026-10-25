import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("App crashed:", error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50/50 p-8">
                    <div className="max-w-2xl w-full bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-destructive mb-3">
                            <AlertTriangle className="h-5 w-5" />
                            <h1 className="text-xl font-bold">Something went wrong</h1>
                        </div>
                        <pre className="text-sm text-red-800 whitespace-pre-wrap wrap-break-word bg-red-50 p-4 rounded-lg font-mono">
                            {this.state.error.message}
                            {"\n\n"}
                            {this.state.error.stack}
                        </pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
