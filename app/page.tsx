import Image from "next/image"
import Link from "next/link"
import { Fraunces, Outfit } from "next/font/google"
import { auth, signIn, signOut } from "@/auth"
import "./landing.css"

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-landing-display",
})

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-landing-sans",
})

export default async function Home() {
  const session = await auth()
  const isSignedIn = Boolean(session?.user)

  return (
    <div className={`${display.variable} ${sans.variable} landing`}>
      <header className="landing-nav">
        <Link href="/" className="landing-nav-brand">
          DocCollab
        </Link>
        <div className="landing-nav-actions">
          {isSignedIn ? (
            <>
              <span className="landing-nav-email">{session?.user?.email}</span>
              <Link href="/documents" className="landing-btn landing-btn-ghost">
                Documents
              </Link>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <button type="submit" className="landing-btn landing-btn-ghost">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server"
                await signIn("google", { redirectTo: "/documents" })
              }}
            >
              <button type="submit" className="landing-btn landing-btn-ghost">
                Sign in
              </button>
            </form>
          )}
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-brand">DocCollab</p>
            <h1 className="landing-headline">
              Documents that keep up with your team.
            </h1>
            <p className="landing-lede">
              Write and sync in real time — then ask AI to clarify, tighten, or
              proof the shared draft.
            </p>
            <div className="landing-cta">
              {isSignedIn ? (
                <Link href="/documents" className="landing-btn landing-btn-primary">
                  Open your documents
                </Link>
              ) : (
                <form
                  action={async () => {
                    "use server"
                    await signIn("google", { redirectTo: "/documents" })
                  }}
                >
                  <button type="submit" className="landing-btn landing-btn-primary">
                    Continue with Google
                  </button>
                </form>
              )}
              <a href="#how-it-works" className="landing-btn landing-btn-secondary">
                How it works
              </a>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <Image
              src="/landing-hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="landing-hero-image"
            />
          </div>
        </section>

        <section id="how-it-works" className="landing-section">
          <h2 className="landing-section-title">How it works</h2>
          <p className="landing-section-lede">
            Sign in, open a document, and invite your team into the same live
            page.
          </p>
          <ol className="landing-steps">
            <li>
              <span className="landing-step-index">01</span>
              <div>
                <h3>Create a document</h3>
                <p>Start from a blank page or pick up where you left off.</p>
              </div>
            </li>
            <li>
              <span className="landing-step-index">02</span>
              <div>
                <h3>Write together</h3>
                <p>
                  Edits sync as they happen — cursors, content, and all.
                </p>
              </div>
            </li>
            <li>
              <span className="landing-step-index">03</span>
              <div>
                <h3>Ask AI</h3>
                <p>
                  Open Ask AI for summaries, clarity tips, and a quick grammar
                  pass on the live draft.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section id="ask-ai" className="landing-section landing-ai">
          <div className="landing-ai-copy">
            <h2 className="landing-section-title">Ask AI about this draft</h2>
            <p className="landing-section-lede">
              The assistant reads your current document and answers in context —
              so help stays tied to what the team is writing now.
            </p>
          </div>
          <div className="landing-ai-panel" aria-hidden="true">
            <div className="landing-ai-panel-header">
              <span className="landing-ai-panel-title">Document assistant</span>
              <span className="landing-ai-panel-status">Ask about this document</span>
            </div>
            <div className="landing-ai-panel-body">
              <p className="landing-ai-bubble landing-ai-bubble-user">
                What is the main idea of the document?
              </p>
              <div className="landing-ai-bubble landing-ai-bubble-assistant">
                <span className="landing-ai-assistant-label">Assistant</span>
                <p>
                  Your draft centers on a shared writing space: live edits,
                  clear structure, and an assistant that can summarize or
                  tighten the page.
                </p>
              </div>
            </div>
            <div className="landing-ai-panel-footer">
              <span className="landing-ai-input-mock">Ask about this document…</span>
              <span className="landing-ai-send-mock">Ask AI</span>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-alt">
          <h2 className="landing-section-title">Built for focused writing</h2>
          <p className="landing-section-lede">
            A clean editor with live collaboration and an AI assistant —
            without the clutter.
          </p>
          <ul className="landing-features">
            <li>
              <h3>Real-time collaboration</h3>
              <p>
                Multiple people can edit the same document at once, with
                presence that shows who is where.
              </p>
            </li>
            <li>
              <h3>Document-aware AI</h3>
              <p>
                Ask for the main idea, readability tips, or a grammar check —
                grounded in the HTML of the open page.
              </p>
            </li>
            <li>
              <h3>Your docs, your account</h3>
              <p>
                Sign in with Google to keep a personal library of documents
                across sessions and devices.
              </p>
            </li>
          </ul>
        </section>

        <section className="landing-closing">
          <h2 className="landing-closing-title">Write together. Ask smarter.</h2>
          <p className="landing-closing-lede">
            Open DocCollab for a shared draft — and an assistant that already
            knows what is on the page.
          </p>
          {isSignedIn ? (
            <Link href="/documents" className="landing-btn landing-btn-primary">
              Go to documents
            </Link>
          ) : (
            <form
              action={async () => {
                "use server"
                await signIn("google", { redirectTo: "/documents" })
              }}
            >
              <button type="submit" className="landing-btn landing-btn-primary">
                Continue with Google
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="landing-footer">
        <span>DocCollab</span>
        <span>Real-time documents with an AI assistant</span>
      </footer>
    </div>
  )
}
