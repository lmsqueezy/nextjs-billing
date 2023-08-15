import { getSession } from "@/lib/auth";
import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import Plans from '@/components/plan';
import UpdateBillingLink from '@/components/update-billing'
import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js'

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);


export const metadata: Metadata = {
  title: 'Billing'
}

async function getPlans() {
  // Fetch data from external API
  const plans = await prisma.plan.findMany({
    where: {
      NOT: {
        status: 'draft'
      }
    }
  });

  return plans
}


async function getSubscription(userId) {
  return await prisma.subscription.findFirst({
    where: {
      userId: userId
    },
    include: {
      plan: true
    }
  })
}

export default async function Billing() {
  const session = await getSession();

  const plans = await getPlans()

  const subscription = await getSubscription(session?.user.id)

  const renewalDate = subscription?.renewsAt ? new Date(subscription.renewsAt).toLocaleString('en-US', {
    month: 'short',
    day: "2-digit",
    year: 'numeric'
  }) : null

  // Uses Test mode in "Demo app" (prod server)

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-xl font-bold mb-3">Billing</h1>

      {subscription ? (
        <>
          <p className="mb-2">Your current plan: {subscription.plan.name} ({subscription.plan.variantName}) {subscription.plan.interval}ly.</p>
          <p className="mb-2">Your next renewal will be on {renewalDate}.</p>

          <hr className="my-8" />

          <h2 className="font-bold">Change plan</h2>

          <Plans plans={plans} sub={subscription} />

          <hr className="my-8" />

          <p><UpdateBillingLink subscription={subscription} /></p>
          <p className="text-sm text-gray-500">Cancel your subscription</p>
        </>
      ) : (
        
        <>
          <p>Please sign up to a paid plan.</p>

          <Plans plans={plans} />

          <p className="mt-8 text-gray-400 text-sm text-center">
            Payments are processed securely by Lemon Squeezy.
          </p>
        </>
      )}

      <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>

    </div>
  )
}

