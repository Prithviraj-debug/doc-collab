"use client"

import { useEffect, useRef, useState } from "react"
import * as Y from "yjs"
import { HocuspocusProvider } from "@hocuspocus/provider"

export type ConnectionState = "offline" | "connecting" | "syncing" | "connected"

export interface SyncStatus {
    connectionState: ConnectionState
    hasPendingChanges: boolean
    lastSyncedAt: Date | null
}

/**
 * Tracks the real sync state of a Yjs document against a Hocuspocus provider.
 *
 * - connectionState reflects the WebSocket handshake + sync status, not just
 *   navigator.onLine (a device can be "online" while the WS connection is
 *   still failing/cold-starting).
 * - hasPendingChanges is true when local edits exist that haven't yet been
 *   confirmed synced with the server.
 * - lastSyncedAt updates every time a full sync round-trip completes.
 */
export function useSyncStatus(
    provider: HocuspocusProvider | null,
    ydoc: Y.Doc
): SyncStatus {
    const [connectionState, setConnectionState] = useState<ConnectionState>(
        provider ? "connecting" : "offline"
    )
    const [hasPendingChanges, setHasPendingChanges] = useState(false)
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

    // Mirrors whether the WebSocket is currently connected, without
    // depending on connectionState inside closures (avoids stale reads).
    const wsConnectedRef = useRef(false)

    // Listen to the provider's own connection/sync lifecycle.
    useEffect(() => {
        if (!provider) {
            setConnectionState("offline")
            return
        }

        const handleStatus = ({ status }: { status: string }) => {
            if (status === "connected") {
                wsConnectedRef.current = true
                setConnectionState("connected")
            } else if (status === "connecting") {
                wsConnectedRef.current = false
                setConnectionState("connecting")
            } else {
                wsConnectedRef.current = false
                setConnectionState("offline")
            }
        }

        const handleSynced = ({ synced }: { synced: boolean }) => {
            if (synced) {
                setHasPendingChanges(false)
                setLastSyncedAt(new Date())
                setConnectionState("connected")
            }
        }

        provider.on("status", handleStatus)
        provider.on("synced", handleSynced)

        return () => {
            provider.off("status", handleStatus)
            provider.off("synced", handleSynced)
        }
    }, [provider])

    // Listen to the Y.Doc itself to detect local (unsynced) edits.
    // Updates that originate from the provider (i.e. came from the server)
    // are tagged with that provider as their origin, so we can tell local
    // edits apart from remote ones arriving via sync.
    useEffect(() => {
        const handleUpdate = (_update: Uint8Array, origin: unknown) => {
            console.log('origin: ', origin, 'provider: ', provider, 'update:', _update)
            const isRemoteUpdate = origin === provider

            if (!isRemoteUpdate) {
                setHasPendingChanges(true)
                if (wsConnectedRef.current) {
                    // setConnectionState("syncing")
                }
            }
        }

        ydoc.on("update", handleUpdate)
        return () => {
            ydoc.off("update", handleUpdate)
        }
    }, [ydoc, provider])

    return { connectionState, hasPendingChanges, lastSyncedAt }
}