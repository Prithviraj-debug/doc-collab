"use client"

import type { SnapshotMeta } from "@/lib/documents"
import { useEffect, useId, useRef, useState } from "react"

const DocHistory = ({ snapshots }: Readonly<{ snapshots: SnapshotMeta[] }>) => {
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  const close = () => {
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm font-medium text-neutral-800 transition hover:border-teal-700/30 hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/20"
      >
        <HistoryIcon />
        <span className="hidden sm:inline">Snapshots</span>
        <span className="sr-only sm:hidden">View snapshots</span>
        {snapshots.length > 0 && (
          <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-neutral-600">
            {snapshots.length}
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={close}
        className="doc-history-dialog fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-neutral-200/80 bg-[#f7f8fa] p-0 text-neutral-900 shadow-[0_24px_60px_-28px_rgba(22,22,26,0.45)] open:flex open:flex-col backdrop:bg-neutral-950/40 backdrop:backdrop-blur-[2px]"
      >
        <div className="border-b border-neutral-200/80 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
                Version history
              </p>
              <h2
                id={titleId}
                className="mt-1 text-xl font-semibold tracking-tight text-neutral-900"
              >
                Snapshots
              </h2>
              <p
                id={descriptionId}
                className="mt-1 text-sm leading-relaxed text-neutral-500"
              >
                Saved checkpoints for this document, newest first.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto px-5 py-4">
          {snapshots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-8 text-center">
              <p className="text-sm font-medium text-neutral-800">
                No snapshots yet
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Save a named version to see it listed here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {[...snapshots]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .map((item, index) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-neutral-200 bg-white px-3.5 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900">
                          {index === 0 ? "Latest snapshot" : `Snapshot #${item.id}`}
                        </p>
                        <p className="mt-0.5 text-sm text-neutral-500">
                          {new Date(item.created_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                          Latest
                        </span>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-neutral-200/80 bg-white px-5 py-3">
          <button
            type="button"
            onClick={close}
            className="rounded-md bg-teal-800 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-900"
          >
            Done
          </button>
        </div>
      </dialog>
    </div>
  )
}

function HistoryIcon() {
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
        d="M3 12a9 9 0 1 0 3-6.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 4v5h5M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default DocHistory
