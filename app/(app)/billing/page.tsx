import { getSession } from "@/lib/auth";
import type { Metadata } from 'next';
import { SubscriptionComponent } from '@/components/subscription';
import { getPlans, getSubscription } from '@/lib/data';


export const metadata: Metadata = {
  title: 'Billing'
}


export default async function Page() {
  const session = await getSession();

  const plans = await getPlans()

  const sub = await getSubscription(session?.user?.id)

  // Uses Test mode in "Demo app" (prod server)

  return (
    <div className="container mx-auto max-w-lg">

      <h1 className="text-xl font-bold mb-3">Billing</h1>

      <SubscriptionComponent sub={sub} plans={plans} />

      <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>

    </div>
  )
}

