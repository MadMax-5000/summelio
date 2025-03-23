import { CheckCircle2, XCircle, ArrowUpCircle } from "lucide-react"

type UpdateType = "feature" | "fix" | "improvement"

interface UpdateItem {
    type: UpdateType
    details: string[]
}

interface UpdateLogProps {
    date: string
    version: string
    updates: UpdateItem[]
}

export function UpdateLog({ date, version, updates }: UpdateLogProps) {
    const getIcon = (type: UpdateType) => {
        const commonClasses = "h-5 w-5"
        switch (type) {
            case "feature":
                return <CheckCircle2 className={`${commonClasses} text-green-500 flex-shrink-0`} />
            case "fix":
                return <XCircle className={`${commonClasses} text-red-500 flex-shrink-0`} />
            case "improvement":
                return <ArrowUpCircle className={`${commonClasses} text-blue-500 flex-shrink-0`} />
            default:
                return null
        }
    }

    const getTypeLabel = (type: UpdateType) => {
        switch (type) {
            case "feature":
                return "Feature"
            case "fix":
                return "Fix"
            case "improvement":
                return "Improvement"
            default:
                return ""
        }
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex flex-col items-start justify-between sm:flex-row">
                <h2 className="text-2xl font-semibold text-gray-800">{version}</h2>
                <time className="text-sm text-gray-500">{date}</time>
            </div>

            <div className="space-y-6">
                {updates.map((update, index) => (
                    <div key={index} className="flex gap-4">
                        {getIcon(update.type)}
                        <div className="flex-1">
                            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-600">
                                {getTypeLabel(update.type)}
                            </span>
                            <ul className="space-y-1 pl-5 list-disc text-sm text-gray-700">
                                {update.details.map((detail, i) => (
                                    <li key={i}>{detail}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
