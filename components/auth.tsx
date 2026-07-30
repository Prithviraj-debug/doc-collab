import { auth, signIn } from "@/auth"
import { UserMenu } from "@/components/user-menu"

/**
 * Compact auth control for pages that are not using AppNavbar.
 * Signed-in users get the avatar menu; guests get Google sign-in.
 */
const Auth = async ({
  redirectTo = "/documents",
}: {
  redirectTo?: string
} = {}) => {
  const session = await auth()

  if (session?.user) {
    return <UserMenu user={session.user} />
  }

  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", { redirectTo })
      }}
    >
      <button
        type="submit"
        className="rounded-md bg-teal-800 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/30"
      >
        Sign in
      </button>
    </form>
  )
}

export default Auth
