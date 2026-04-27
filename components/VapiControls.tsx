"use client"

import { useVapi } from "@/hooks/useVapi"
import { IBook } from "@/types"
import { Mic, MicOff } from "lucide-react"
import Image from "next/image"
import Transcript from "./Transcript"

const VapiControls = ({ book }: { book: IBook }) => {
    const { status, isActive, messages, currentMessage, currentUserMessage, duration,
        start, stop, clearError, } = useVapi(book)

    const formattedDuration = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`
    const statusLabel = status === "idle" ? "Ready" : status.charAt(0).toUpperCase() + status.slice(1)
    const statusDotClass = status === "idle" ? "vapi-status-dot-ready" : `vapi-status-dot-${status}`

    const handleMicClick = () => {
        clearError()

        if (isActive) {
            stop()
            return
        }

        start()
    }

    return (
        <div>
            <div className="mx-auto flex max-w-4xl flex-col gap-8">
                <section className="vapi-header-card">
                    <div className="vapi-cover-wrapper">
                        <Image
                            src={book.coverURL || "/assets/book-cover.svg"}
                            alt={book.title}
                            width={120}
                            height={180}
                            className="h-[180px] w-[120px] rounded-lg object-cover shadow-[var(--shadow-book)]"
                        />

                        <div className="absolute -bottom-3 -right-3">
                            <button
                                type="button"
                                className={`vapi-mic-btn shadow-[var(--shadow-soft-md)] ${isActive ? "vapi-mic-btn-active" : "vapi-mic-btn-inactive"}`}
                                aria-label={isActive ? "Stop conversation" : "Start conversation"}
                                onClick={handleMicClick}
                                disabled={status === "connecting"}
                            >
                                {isActive ? (
                                    <Mic className="size-7 text-[var(--text-primary)]" />
                                ) : (
                                    <MicOff className="size-7 text-[var(--text-primary)]" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <div className="space-y-2">
                            <h1 className="font-serif text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                                {book.title}
                            </h1>
                            <p className="text-lg text-[var(--text-secondary)]">
                                by {book.author}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="vapi-status-indicator">
                                <span className={`vapi-status-dot ${statusDotClass}`} />
                                <span className="vapi-status-text">{statusLabel}</span>
                            </div>

                            <div className="rounded-[4px] bg-white px-3 py-2">
                                <span className="vapi-status-text">
                                    Voice: {book.persona || "Default"}
                                </span>
                            </div>

                            <div className="rounded-[4px] bg-white px-3 py-2">
                                <span className="vapi-status-text">{formattedDuration}/15:00</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <div className="vapi-transcript-wrapper">
                <div className="transcript-container min-h-[400px]">
                    <Transcript
                        messages={messages}
                        currentMessage={currentMessage}
                        currentUserMessage={currentUserMessage}
                    />
                </div>
            </div>
        </div>
    )
}

export default VapiControls
