"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { signOutAction } from "@/actions/auth"

export type UserMenuUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

function initialsFromUser(user: UserMenuUser) {
  const source = user.name?.trim() || user.email?.trim() || "?"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

export function UserMenu({ user }: Readonly<{ user: UserMenuUser }>) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const displayName = user.name?.trim() || "Account"
  const label = user.email
    ? `Account menu for ${user.email}`
    : "Account menu"

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction()
      router.push("/")
      router.refresh()
    })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-700 outline-none transition hover:border-teal-700/40 hover:ring-2 hover:ring-teal-700/15 focus-visible:border-teal-700/40 focus-visible:ring-2 focus-visible:ring-teal-700/20"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="size-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span aria-hidden="true">{initialsFromUser(user)}</span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="!min-w-56 !rounded-xl !border !border-neutral-200 !bg-white !p-1.5 !shadow-lg !shadow-neutral-900/10 flex flex-col gap-1"
      >
        <DropdownMenuLabel className="!px-2.5 !py-2 !text-left">
          <span className="block truncate text-sm font-semibold text-neutral-900">
            {displayName}
          </span>
          {user.email && (
            <span className="mt-0.5 block truncate text-xs font-normal text-neutral-500">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="!bg-neutral-200" />

        <DropdownMenuItem asChild className="!rounded-lg !px-2.5 !py-2 !text-sm !text-neutral-800 focus:!bg-neutral-100">
          <Link href="/">Home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="!rounded-lg !px-2.5 !py-2 !text-sm !text-neutral-800 focus:!bg-neutral-100">
          <Link href="/documents">Documents</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="!bg-neutral-200" />

        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          className="!rounded-lg !px-2.5 !py-2 !text-sm !text-neutral-800 focus:!bg-neutral-100"
          onSelect={(event) => {
            event.preventDefault()
            handleSignOut()
          }}
        >
          {isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
