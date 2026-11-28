import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Loader2 } from "lucide-react";
import { employeeApi } from "@/lib/api";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function EmployeePhotoUpload({ employeeId, currentPhotoUrl, name, onUploaded, size = "h-20 w-20", readOnly = false }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentPhotoUrl || null);

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            toast.error("Photo upload isn't configured yet (missing Cloudinary env vars).");
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB.");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);
            formData.append("folder", "hcm-lite/employees");

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok || !data.secure_url) {
                throw new Error(data?.error?.message || "Upload failed");
            }

            await employeeApi.updatePhoto(employeeId, data.secure_url);
            setPreview(data.secure_url);
            onUploaded?.(data.secure_url);
            toast.success("Photo updated");
        } catch (err) {
            toast.error(err.message || "Failed to upload photo");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="relative inline-block shrink-0">
            <div className={`${size} rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden border`}>
                {preview ? (
                    <img src={preview} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="font-bold text-xl">{name ? name[0].toUpperCase() : "?"}</span>
                )}
            </div>
            {!readOnly && (
                <>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                        title="Change photo"
                    >
                        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                    </button>
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </>
            )}
        </div>
    );
}