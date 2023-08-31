import { getSession } from "@/lib/auth";
import Link from 'next/link';
import SignOutButton from '@/components/signout-button';

export default async function Home() {
  const session = await getSession();
  const email = session?.user.email || null
  return (

    <div className="text-center py-4">

      {session ? (
        <>
          <p className="mb-4">Welcome, {email}</p>
          <p className="mb-8"><Link href="/billing">Go to the Billing page &rarr;</Link></p>
          <p><SignOutButton /></p>
        </>
      ) : (
        <Link href="/login">Sign in</Link>
      )}

    </div>

  )
}
