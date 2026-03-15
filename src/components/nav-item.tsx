"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItemProps = {
    href: string
    icon: React.ReactNode
    label: string
    badge?: string
    badgeColor?: "green" | "orange"
}

export function NavItem({ href, icon, label, badge, badgeColor = "green" }: NavItemProps) {
    const pathname = usePathname()

    const active = href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname?.startsWith(href)

    return (
        <Link
            href={href}
            className={`relative flex items-center gap-[10px] mx-2 my-[1px] px-[14px] py-[9px] text-[13px] rounded-lg transition-all select-none ${active
                    ? "bg-[rgba(106,191,48,0.12)] text-[#6abf30] font-bold"
                    : "text-[#8aab7a] hover:text-[#e8f0e2] hover:bg-[#1a2413] font-medium"
                }`}
        >
            {/* Left active indicator */}
            {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#6abf30] rounded-r-sm" />
            )}
            <span className="w-[18px] flex justify-center shrink-0">{icon}</span>
            {label}
            {badge && (
                <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded-full text-black ${badgeColor === "orange" ? "bg-[#f59e0b]" : "bg-[#6abf30]"
                    }`}>
                    {badge}
                </span>
            )}
        </Link>
    )
}
