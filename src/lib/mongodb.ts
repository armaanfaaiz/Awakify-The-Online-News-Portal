import mongoose from "mongoose";

type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseConnection | undefined;
}

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached!.conn) return cached!.conn;
  const uri = process.env.MONGO_URI as string | undefined;
  if (!uri) {
    throw new Error("Missing MONGO_URI. Set it in .env.local and restart the dev server.");
  }
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, {
      dbName: "awakify",
    });
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
