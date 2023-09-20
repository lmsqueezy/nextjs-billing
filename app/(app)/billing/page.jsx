import { getSession } from "@/lib/auth";
import { getPlans, getSubscription } from '@/lib/data';
/* Full in-app billing component */
import { SubscriptionComponent } from '@/components/subscription';
/* Customer Portal component */
import { PortalSubscriptionComponent } from '@/components/subscription-customer-portal';


export const metadata = {
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

      {/* <SubscriptionComponent sub={sub} plans={plans} /> */}
      <PortalSubscriptionComponent sub={sub} plans={plans} />

      <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>

    </div>
  )
}

