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
                    date="March 20, 2025"
                    version="v1.2.0"
                    updates={[
                        {
                            type: "feature",
                            details: [
                                "Added real-time collaboration support.",
                                "Enabled multiple team members to work concurrently.",
                                "Improved user permissions for collaboration.",
                            ],
                        },
                        {
                            type: "improvement",
                            details: [
                                "Optimized dashboard loading speed by 40%.",
                                "Reduced API response times.",
                                "Streamlined asset loading for faster render times.",
                            ],
                        },
                        {
                            type: "fix",
                            details: [
                                "Resolved an issue causing intermittent logouts.",
                                "Fixed a bug in the project switching logic.",
                                "Addressed UI glitches in mobile view.",
                            ],
                        },
                    ]}
                />

                <UpdateLog
                    date="February 15, 2025"
                    version="v1.1.0"
                    updates={[
                        {
                            type: "feature",
                            details: [
                                "Introduced a comprehensive analytics dashboard.",
                                "Added custom reporting capabilities.",
                                "Integrated real-time metrics.",
                            ],
                        },
                        {
                            type: "improvement",
                            details: [
                                "Enhanced dark mode with better contrast.",
                                "Smoothed transitions between themes.",
                                "Improved overall UI responsiveness.",
                                "Refined typography and spacing.",
                            ],
                        },
                        {
                            type: "fix",
                            details: [
                                "Resolved navigation issues on smaller mobile devices.",
                                "Fixed menu item access problems on various resolutions.",
                            ],
                        },
                    ]}
                />
            </div>
        </>
    )
}
