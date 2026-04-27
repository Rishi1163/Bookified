import mongoose from "mongoose";

const MONGODB_URI= process.env.MONGO_URI

if(!MONGODB_URI) {
    throw new Error("Mongodb uri not available!")
}

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
    }
}


const cached = global.mongooseCache || (global.mongooseCache = {conn: null, promise: null});


export const connectToDb = async () => {
    if(cached.conn) return cached.conn

    if(!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false
        })
    }
    try {
        cached.conn = await cached.promise
        return cached.conn
    } catch (error) {
        cached.promise = null
        console.error("Error connecting mongodb", error)
    }

    console.info("connected to mongodb")
    return cached.conn
}
