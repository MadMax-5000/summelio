import { UpdateLog } from "@/components/update-log"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function FeatureUpdatePage() {
    return (
        <>
            {/* Navbar */}
            <div className="flex flex-col mt-2">
                <nav className="flex items-center bg-white text-black px-4 py-3 space-x-2 relative border-b border-gray-300">
                    <Link href="/dashboard" className="text-base font-medium hover:underline">
                        Dashboard
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-base font-medium">Release Notes</span>
                </nav>
            </div>

            {/* Main content */}
            <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
                <UpdateLog
                    date="March 24, 2025"
                    version="v0.1.0"
                    updates={[
                        {
                            type: "feature",
                            details: [
                                "Added files page for organizing uploaded files",
                                "Added Release notes for updating users with changes",
                                "Changed the UI for the Chatwrapper",
                            ],
                        },
                        {
                            type: "improvement",
                            details: [
                                "Optimized Files Uploads processing",
                                "Reduced API response times.",
                            ],
                        },
                        {
                            type: "fix",
                            details: [
                                "Resolved context hallucination for Chatbots",
                            ],
                        },
                    ]}
                />
            </div>
        </>
    )
}
