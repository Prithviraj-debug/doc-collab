"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import { HocuspocusProvider } from '@hocuspocus/provider'
import { jsPDF } from 'jspdf'

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import Collaboration from "@tiptap/extension-collaboration"
import * as Y from "yjs"
import { IndexeddbPersistence } from 'y-indexeddb'
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret"

import { useSyncStatus } from "@/hooks/use-sync-status"
import Chat from "@/components/ai-chat"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { colorFromUserId } from "@/lib/collaboration-user"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

const DownloadIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2a1 1 0 011 1v10.59l2.3-2.29a1 1 0 111.4 1.41l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.41L11 13.59V3a1 1 0 011-1zM5 19a1 1 0 000 2h14a1 1 0 100-2H5z"/>
    </svg>
  )
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  save,
  connectionState,
  hasPendingChanges,
  download
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  save: () => void
  connectionState: string
  hasPendingChanges: boolean
  download: () => void
}) => {
  const statusLabel =
    connectionState === "connected"
      ? "Connected"
      : connectionState === "syncing"
        ? "Syncing…"
        : connectionState === "connecting"
          ? "Connecting…"
          : "Offline"

  const statusClass =
    connectionState === "connected"
      ? "text-green-500"
      : connectionState === "syncing" || connectionState === "connecting"
        ? "text-yellow-500"
        : "text-red-500"

  return (
    <>
      <ToolbarGroup>
        <Button variant="ghost" onClick={download}><DownloadIcon />Download</Button>
        <ToolbarSeparator />
        <span className={`text-sm font-medium px-1 ${statusClass}`}>
          {statusLabel}
        </span>

      </ToolbarGroup>

      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      {/* <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup> */}
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({
  documentId,
  user,
}: {
  documentId: string
  user: { id: string; name?: string | null; email?: string | null }
}) {
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)

  const collaborationUser = useMemo(
    () => ({
      name: user.name?.trim() || user.email?.trim() || "Anonymous",
      color: colorFromUserId(user.id),
    }),
    [user.id, user.name, user.email]
  )

  // Yjs document created once per component instance / document id.
  const [ydoc] = useState(() => new Y.Doc())

  // Room name + IndexedDB key must match the Postgres document id.
  const [wsProvider] = useState(
    () =>
      new HocuspocusProvider({
        url:
          process.env.NEXT_PUBLIC_HOCUSPOCUS_URL ?? "ws://localhost:1234",
        name: documentId,
        document: ydoc,
      })
  )

  const [indexDbProvider] = useState(() => {
    if (typeof window !== "undefined") {
      return new IndexeddbPersistence(`y-doc-${documentId}`, ydoc)
    }
    return null
  })

  const { connectionState, hasPendingChanges } = useSyncStatus(
    wsProvider,
    ydoc
  )

  useEffect(() => {
    const handleSynced = () => {
      const xmlFragment = ydoc.getXmlFragment('default')
      console.log('synced content:', xmlFragment.toJSON())
    }
    if (!indexDbProvider) return
    indexDbProvider.on('synced', handleSynced)
    return () => indexDbProvider.off('synced', handleSynced)
  }, [indexDbProvider, ydoc])

  // Mount flag + cleanup on unmount.
  useEffect(() => {
    setMounted(true)
    return () => {
      wsProvider?.destroy()
      indexDbProvider?.destroy()
      ydoc.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const download = async () => {
    if (!editor) return
  
    const pdf = new jsPDF()
  
    const element = document.createElement("div")
    element.innerHTML = editor.getHTML()
  
    await pdf.html(element, {
      callback: (doc) => {
        doc.save("content.pdf")
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 800,
    })
  }

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        undoRedo: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      // Collaboration must be registered before CollaborationCaret so the
      // Yjs sync plugin exists when caret decorations are created.
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCaret.configure({
        provider: wsProvider,
        user: collaborationUser,
        render: (caretUser) => {
          const cursor = document.createElement("span")
          cursor.classList.add("collaboration-carets__caret")
          cursor.style.borderColor = caretUser.color

          // Keep the caret from collapsing to 0 height (required for borders).
          cursor.appendChild(document.createTextNode("\u2060"))

          const label = document.createElement("div")
          label.classList.add("collaboration-carets__label")
          label.style.backgroundColor = caretUser.color
          label.style.color = "#fff"
          label.textContent = caretUser.name
          cursor.appendChild(label)

          cursor.appendChild(document.createTextNode("\u2060"))
          return cursor
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
  })

  // Keep awareness in sync if the session display name changes.
  useEffect(() => {
    if (!editor || !wsProvider.awareness) return
    editor.commands.updateUser(collaborationUser)
  }, [editor, wsProvider, collaborationUser])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  const save = () => {
    if (!editor) return

    const html = editor.getHTML()
    console.log("Saving content:", html)

    if (html) {
      // TODO: this is where a named version snapshot should be captured
      // (e.g. send Y.encodeStateAsUpdate(ydoc) to the server to store as
      // a labeled checkpoint) — not yet wired up.
      const update = Y.encodeStateAsUpdate(ydoc)
      console.log("Update:", update)
      alert("Document saved!")
    }
  }

  useEffect(() => {
    if (!editor) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        save()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editor])

  if (!mounted) {
    return <div className="simple-editor-wrapper" />
  }

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              save={save}
              download={download}
              connectionState={connectionState}
              hasPendingChanges={hasPendingChanges}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />

        <Chat documentId={documentId} user={user} />
      </EditorContext.Provider>
    </div>
  )
}