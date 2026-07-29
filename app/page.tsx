import { auth } from "@/auth"
import Auth from "@/components/auth"
import Link from "next/link"
export default async function Home() {
  const session = await auth()
  console.log(session)
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <h1 className="text-2xl font-bold">Welcome to DocCollab</h1>
      <p className="text-sm text-neutral-500"> Collaborative document editing in real-time</p>
      <Link href="/documents" className="text-blue-500">Documents</Link>
      <Auth />
    </main>
  )
}
