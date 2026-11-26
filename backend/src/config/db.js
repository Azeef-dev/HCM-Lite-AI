import mongoose from "mongoose";

let connectionPromise = null;

export const connectDB = async () => {
    // Reuse an existing (or in-flight) connection — in a serverless
    // environment this function can be called on every single request,
    // so we only want to actually dial MongoDB once per warm container.
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    if (connectionPromise) return connectionPromise;

    connectionPromise = mongoose
        .connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
        })
        .then((conn) => {
            console.log("MongoDB connected!");
            return conn;
        })
        .catch((err) => {
            // Reset so the NEXT request gets to try again, instead of being
            // stuck forever on one permanently-rejected promise.
            connectionPromise = null;
            console.error("MongoDB connection failed:", err.message);
            // Deliberately NO process.exit() here. This runs inside a
            // Vercel serverless function — exiting kills the whole warm
            // container, including any other request it might be
            // mid-handling, turning one transient Atlas hiccup into a
            // total outage for everyone. Throwing instead lets the caller
            // (index.js's middleware below) turn this into a clean 503
            // for just this one request, and the process stays alive.
            throw err;
        });

    return connectionPromise;
};