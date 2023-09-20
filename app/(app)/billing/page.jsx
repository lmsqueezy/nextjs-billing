import { getSession } from "@/lib/auth";
// import { SubscriptionComponent } from '@/components/subscription';
import { PortalSubscriptionComponent } from '@/components/subscription-customer-portal';
import { getPlans, getSubscription } from '@/lib/data';


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
      <PortalSubscriptionComponent sub={sub} />

      <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>

    </div>
  )
}

