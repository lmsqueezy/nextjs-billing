import { getSession } from "@/lib/auth";
import Link from 'next/link'

export default async function Home() {
  const session = await getSession();
  const email = session?.user.email || null
  return (

    <div className="text-center py-4">

      {session ? (
        <>
          <p class="mb-4">Welcome, {email}</p>
          <Link href="/billing">Go to the Billing page &rarr;</Link>
        </>
      ) : (
        <Link href="/login">Sign in</Link>
      )}

    </div>

  )
}
