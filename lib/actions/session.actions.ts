'use server'

import VoiceSession from "@/database/models/VoiceSession.models"
import { connectToDb } from "@/database/mongoose"
import { EndSessionResult, StartSessionResult } from "@/types"
import { getCurentBillPeriodStart } from "../subscriptions-constants"

export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDb()

        //limits/plan to see whether a session is allowed
        const session = await VoiceSession.create({
            clerkId, 
            bookId, 
            startedAt: new Date(),
            billingPeriodStart: getCurentBillPeriodStart(),
            durationSeconds: 0
        })

        return {
            success: true,
            sessionId: session._id.toString(),
            //maxDurationMinutes: session.maxDurationMinutes
        }
    } catch (e) {
        console.error("Error starting voice session", e)
        return {success: false, error: "Failed to start a voice session. Please try again later"}
    }
}

export const endvoiceSession = async (sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
    try {
        await connectToDb()

        const result = await VoiceSession.findByIdAndUpdate(sessionId, {
            endedAt: new Date(),
            durationSeconds
        })
        if(!result) return { success: false, error:"Voice session not found."}

        return {success: true}
    } catch (e) {
        console.error("Error ending voice session", e)
        return {success: false, error: "Failed to end voice session. Please try again later."}
    }
}
