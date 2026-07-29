import { auth, signIn, signOut } from "@/auth";

const Auth = async () => {
  const session = await auth();
  return (
    <div className="flex items-center gap-2">
      <p className="text-sm">Signed in as {session?.user?.email}</p>
      <div className="flex justify-between items-center px-4 rounded-md bg-gray-700 py-2 text-white shadow-md gap-2">
      {!session ? (
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button type="submit">Signin</button>
        </form>
      ) : (
        <button
          onClick={async () => {
            "use server";
            await signOut();
          }}
        >
          Signout
        </button>
      )}
    </div>
    </div>
  );
};

export default Auth;
