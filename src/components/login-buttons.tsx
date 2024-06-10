import { SubmitButton } from "./submit-button";
import { signIn } from "@/auth";
import { GoogleIcon } from "./icons/google";

export function LoginButtons() {
    return (
        <>
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
          className="mx-auto p-2"
        >
          Sign in with Google
        </SubmitButton>
      </form>
    </>
    )
}