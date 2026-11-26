import mongoose from "mongoose";

let connectionPromise = null;

export const connectDB = async () => {

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
            connectionPromise = null;
            console.error("MongoDB connection failed:", err.message);
            throw err;
        });

    return connectionPromise;
};