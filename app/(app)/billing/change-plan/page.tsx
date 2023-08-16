import { getSession } from "@/lib/auth";
import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { PlansComponent } from '@/components/manage';
import { getPlans, getSubscription } from '@/lib/data';
import { redirect } from 'next/navigation';


export const metadata: Metadata = {
  title: 'Billing'
}


export default async function Billing() {
  const session = await getSession();

  const plans = await getPlans();

  const sub = await getSubscription(session?.user.id);

  if (!sub) {
    redirect('/billing')
  }

  return (
    <div className="container mx-auto max-w-lg">

      <Link href="/billing/" className="text-gray-500 text-sm mb-6">&larr; Back to billing</Link>

      <h1 className="text-xl font-bold mb-3 text-center">Change plan</h1>

      {sub.status == 'on_trial' && (
        <div className="my-8 p-4 text-sm text-amber-800 rounded-md border border-amber-200 bg-amber-50">
          You are currently on a free trial. You will not be charged when changing plans during a trial.
        </div>
      )}

      <PlansComponent plans={plans} sub={sub} />

      <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>

    </div>
  )
}

