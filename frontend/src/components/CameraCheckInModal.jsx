import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { attendanceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Camera,
    MapPin,
    X,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertTriangle,
} from "lucide-react";

export default function CameraCheckInModal({ open, onClose, onSuccess }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [stage, setStage] = useState("loading"); // loading | live | captured | submitting | error
    const [errorMsg, setErrorMsg] = useState("");
    const [photo, setPhoto] = useState(null);
    const [faceDetected, setFaceDetected] = useState(null); // null = not checked / unsupported
    const [faceChecking, setFaceChecking] = useState(false);
    const [location, setLocation] = useState(null);
    const [locating, setLocating] = useState(true);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;

        async function start() {
            setStage("loading");
            setErrorMsg("");
            setPhoto(null);
            setFaceDetected(null);

            setLocating(true);
            if (!navigator.geolocation) {
                setLocating(false);
            } else {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        if (cancelled) return;
                        setLocation({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                        });
                        setLocating(false);
                    },
                    () => {
                        if (cancelled) return;
                        setLocating(false);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: false,
                });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
                setStage("live");
            } catch (err) {
                if (cancelled) return;
                setErrorMsg(
                    err?.name === "NotAllowedError"
                        ? "Camera access was denied. Please allow camera permission and try again."
                        : "Couldn't access the camera on this device."
                );
                setStage("error");
            }
        }

        start();

        return () => {
            cancelled = true;
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        };
    }, [open]);

    function stopStream() {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    }

    function handleClose() {
        stopStream();
        onClose();
    }

    async function handleCapture() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.85));
        setStage("captured");

        // Best-effort face check using the browser's native FaceDetector API
        // where it's supported. This isn't a reliable cross-browser guarantee
        // (Firefox/Safari don't implement it) — it's a bonus signal on top of
        // the office-radius check, which is what actually gates the check-in
        // on the server.
        if (typeof window !== "undefined" && "FaceDetector" in window) {
            setFaceChecking(true);
            try {
                const detector = new window.FaceDetector({ fastMode: true });
                const bitmap = await createImageBitmap(canvas);
                const faces = await detector.detect(bitmap);
                setFaceDetected(faces.length === 1);
            } catch {
                setFaceDetected(null);
            } finally {
                setFaceChecking(false);
            }
        } else {
            setFaceDetected(null);
        }
    }

    function handleRetake() {
        setPhoto(null);
        setFaceDetected(null);
        setStage("live");
    }

    async function handleConfirm() {
        if (faceDetected === false) {
            toast.error("No single face was detected — please retake the photo.");
            return;
        }
        if (!location) {
            toast.error("Location is required for camera check-in.");
            return;
        }

        setStage("submitting");
        try {
            const payload = { lat: location.lat, lng: location.lng, accuracy: location.accuracy };
            if (faceDetected !== null) payload.faceDetected = faceDetected;
            await attendanceApi.checkInCamera(payload);
            toast.success("Checked in with camera verification");
            stopStream();
            onSuccess?.();
        } catch (err) {
            toast.error(err.message || "Camera check-in failed");
            setStage("captured");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-background rounded-2xl border w-full max-w-md shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-base">Camera Check-In</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-muted aspect-square">
                        {stage === "loading" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p className="text-xs">Opening camera…</p>
                            </div>
                        )}
                        {stage === "error" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
                                <AlertTriangle className="h-7 w-7 text-destructive" />
                                <p className="text-sm text-destructive">{errorMsg}</p>
                            </div>
                        )}
                        {photo ? (
                            <img src={photo} alt="Captured frame" className="w-full h-full object-cover" />
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover scale-x-[-1] ${stage === "live" ? "" : "invisible"}`}
                            />
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            {locating ? (
                                <span className="text-muted-foreground">Getting your location…</span>
                            ) : location ? (
                                <span className="text-foreground">
                                    Location acquired <span className="text-muted-foreground">(±{Math.round(location.accuracy)}m)</span>
                                </span>
                            ) : (
                                <span className="text-destructive">Location unavailable — allow location access</span>
                            )}
                        </div>

                        {photo && (
                            <div className="flex items-center gap-2">
                                {faceChecking ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-muted-foreground">Checking for a face…</span>
                                    </>
                                ) : faceDetected === true ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        <span className="text-foreground">Face detected</span>
                                    </>
                                ) : faceDetected === false ? (
                                    <>
                                        <XCircle className="h-4 w-4 text-destructive" />
                                        <span className="text-destructive">No single face detected — please retake</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        <span className="text-muted-foreground">
                                            Face detection isn't supported on this browser — location verification will still apply.
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            The office-radius check happens on the server — your photo isn't uploaded or stored, only the check-in result is.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                        {stage === "live" && (
                            <Button onClick={handleCapture} className="w-full gap-2">
                                <Camera className="h-4 w-4" /> Capture Photo
                            </Button>
                        )}
                        {stage === "captured" && (
                            <>
                                <Button variant="outline" onClick={handleRetake} className="flex-1 gap-2">
                                    <RotateCcw className="h-4 w-4" /> Retake
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={faceDetected === false || !location}
                                    className="flex-1 gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Confirm Check-In
                                </Button>
                            </>
                        )}
                        {stage === "submitting" && (
                            <Button disabled className="w-full gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                            </Button>
                        )}
                        {stage === "error" && (
                            <Button variant="outline" onClick={handleClose} className="w-full">
                                Close
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}