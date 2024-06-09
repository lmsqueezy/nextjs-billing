import { SubmitButton } from "@/components/submit-button";
import { redirect } from 'next/navigation'
import { auth,signIn } from '@/auth';
import { GoogleIcon } from "@/components/icons/google";
export default async function SignInPage() {
    const session = await auth()
    // redirect to home if user is already logged in
    if (session?.user) {
      redirect('/profile')
    }
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
        <form
        className="flex items-center h-screen text-center w-full"
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <SubmitButton
          before={<GoogleIcon/>}
          shape="pill"
          variant="outline"
          className="mx-auto max-w-xs"
        >
          Sign in with Google
        </SubmitButton>
      </form>
      </div>
    )
  }