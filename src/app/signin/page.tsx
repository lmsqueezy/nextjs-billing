import { SubmitButton } from "@/components/submit-button";
import { redirect } from 'next/navigation'
import { auth } from '@/auth';
import {LoginButtons} from '@/components/login-buttons';

export default async function SignInPage() {
    const session = await auth()
    // redirect to home if user is already logged in
    if (session?.user) {
      redirect('/profile')
    }
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
        <LoginButtons/>
      </div>
    )
  }