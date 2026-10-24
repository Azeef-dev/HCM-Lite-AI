import { Component } from "react";

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
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
                    <div className="max-w-2xl w-full bg-white border border-red-300 rounded-lg p-6 shadow">
                        <h1 className="text-xl font-bold text-red-600 mb-3">Something broke 💥</h1>
                        <pre className="text-sm text-red-800 whitespace-pre-wrap wrap-break-word bg-red-100 p-4 rounded">
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