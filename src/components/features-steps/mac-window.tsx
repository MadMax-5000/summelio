import type React from "react"
interface MacWindowProps {
    title: string
    children: React.ReactNode
}

export default function MacWindow({ title, children }: MacWindowProps) {
    return (
        <div className="rounded-lg overflow-hidden shadow-xl border border-gray-200">
            <div className="bg-gray-100 p-2 flex items-center">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-medium text-center flex-1">{title}</div>
            </div>
            <div className="bg-white">{children}</div>
        </div>
    )
}

