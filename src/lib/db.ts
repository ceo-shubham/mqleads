import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var __mqleadsMongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and add your MongoDB Atlas connection string."
    );
  }
  if (globalThis.__mqleadsMongoose?.conn) return globalThis.__mqleadsMongoose.conn;
  if (!globalThis.__mqleadsMongoose) {
    globalThis.__mqleadsMongoose = { conn: null, promise: null };
  }
  if (!globalThis.__mqleadsMongoose.promise) {
    globalThis.__mqleadsMongoose.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }
  try {
    globalThis.__mqleadsMongoose.conn = await globalThis.__mqleadsMongoose.promise;
  } catch (err) {
    globalThis.__mqleadsMongoose.promise = null;
    throw err;
  }
  return globalThis.__mqleadsMongoose.conn;
}
