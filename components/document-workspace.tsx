"use client"

import { useCallback, useRef, useState } from "react"
import { AppNavbar } from "@/components/app-navbar"
import { DocumentBreadcrumb } from "@/components/document-breadcrumb"
import DocHistory from "@/components/doc-history"
import InviteUser from "@/components/invite-user"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import type { SnapshotMeta } from "@/lib/documents"
import type { ConnectionState } from "@/hooks/use-sync-status"
import type { UserMenuUser } from "@/components/user-menu"

type DocumentWorkspaceProps = Readonly<{
  documentId: string
  title: string
  user: UserMenuUser
  snapshots: SnapshotMeta[]
}>

export function DocumentWorkspace({
  documentId,
  title,
  user,
  snapshots,
}: DocumentWorkspaceProps) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting")
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const downloadRef = useRef<(() => void) | null>(null)

  const handleSyncStatusChange = useCallback(
    (status: {
      connectionState: ConnectionState
      hasPendingChanges: boolean
    }) => {
      setConnectionState(status.connectionState)
      setHasPendingChanges(status.hasPendingChanges)
    },
    []
  )

  const handleDownloadReady = useCallback((download: () => void) => {
    downloadRef.current = download
  }, [])

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <AppNavbar
        user={user}
        center={
          <DocumentBreadcrumb documentId={documentId} title={title} />
        }
        actions={
          <div className="flex items-center gap-1 sm:gap-1.5">
            <ConnectionBadge
              connectionState={connectionState}
              hasPendingChanges={hasPendingChanges}
            />
            <DocHistory snapshots={snapshots} />
            <button
              type="button"
              onClick={() => downloadRef.current?.()}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm font-medium text-neutral-800 transition hover:border-teal-700/30 hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/20 sm:px-2.5"
              aria-label="Download as PDF"
            >
              <DownloadIcon />
              <span className="hidden sm:inline">Download</span>
            </button>
            <InviteUser documentId={documentId} />
          </div>
        }
      />

      <main id="main-content" className="min-h-0 flex-1" tabIndex={-1}>
        <SimpleEditor
          documentId={documentId}
          user={user as { id: string; name?: string | null; email?: string | null }}
          onSyncStatusChange={handleSyncStatusChange}
          onDownloadReady={handleDownloadReady}
        />
      </main>
    </div>
  )
}

function connectionLabel(
  connectionState: ConnectionState,
  hasPendingChanges: boolean
) {
  if (connectionState === "connected") {
    return "Connected"
  }
  if (connectionState === "syncing") return "Syncing…"
  if (connectionState === "connecting") return "Connecting…"
  return "Offline"
}

function connectionDotClass(
  connectionState: ConnectionState,
  hasPendingChanges: boolean
) {
  if (connectionState === "connected") {
    return "bg-emerald-500"
  }
  if (connectionState === "syncing" || connectionState === "connecting") {
    return "bg-amber-400"
  }
  return "bg-red-500"
}

function ConnectionBadge({
  connectionState,
  hasPendingChanges,
}: Readonly<{
  connectionState: ConnectionState
  hasPendingChanges: boolean
}>) {
  const label = connectionLabel(connectionState, hasPendingChanges)
  const dotClass = connectionDotClass(connectionState, hasPendingChanges)

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-600 sm:px-2.5"
      title={label}
      aria-live="polite"
    >
      <span className={`size-2 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
      <span className="hidden max-w-26 truncate sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-current"
    >
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
