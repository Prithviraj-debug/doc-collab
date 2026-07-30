"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useState } from "react"
import { UserMenu, type UserMenuUser } from "@/components/user-menu"

type AppNavbarProps = {
  user: UserMenuUser
  /** Extra actions shown before the avatar (e.g. Invite) */
  actions?: React.ReactNode
  /** Center content such as document title / breadcrumbs */
  center?: React.ReactNode
}

function navLinkClass(active: boolean) {
  return [
    "rounded-md px-2.5 py-1.5 text-sm font-medium transition outline-none",
    "focus-visible:ring-2 focus-visible:ring-teal-700/25",
    active
      ? "bg-teal-50 text-teal-900"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
  ].join(" ")
}

export function AppNavbar({
  user,
  actions,
  center,
}: Readonly<AppNavbarProps>) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const panelId = useId()
  const isDocuments =
    pathname === "/documents" || pathname.startsWith("/documents/")

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 text-neutral-900 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-teal-800 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/25 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls={panelId}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link
          href="/"
          className={`shrink-0 rounded-md px-1.5 py-1 text-base font-semibold tracking-tight text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-teal-700/25 ${
            center ? "hidden sm:inline" : ""
          }`}
        >
          DocCollab
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          <Link href="/" className={navLinkClass(pathname === "/")}>
            Home
          </Link>
          <Link
            href="/documents"
            className={navLinkClass(isDocuments)}
            aria-current={pathname === "/documents" ? "page" : undefined}
          >
            Documents
          </Link>
        </nav>

        {center && (
          <div className="min-w-0 flex-1 px-1 sm:px-2">{center}</div>
        )}

        {!center && <div className="flex-1" />}

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {actions}
          <UserMenu user={user} />
        </div>
      </div>

      {mobileOpen && (
        <div
          id={panelId}
          className="border-t border-neutral-200 bg-white px-3 py-3 md:hidden"
        >
          <nav aria-label="Mobile primary" className="flex flex-col gap-1">
            <Link
              href="/"
              className={navLinkClass(pathname === "/")}
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/documents"
              className={navLinkClass(isDocuments)}
              aria-current={pathname === "/documents" ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              Documents
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
