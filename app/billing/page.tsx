import type { Metadata } from 'next';
import prisma from "lib/prisma";

import Plans from 'components/plan';

import { LemonSqueezy } from "./lemonsqueezy";
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
  return await prisma.subscription.findUnique({
    where: {
      userId: userId
    }
  })
}


export default async function Billing() {

  const plans = await getPlans()

  const subscription = null //await getSubscription(session.user.id)

  // Uses Test mode in "Demo app" (prod server)

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-xl font-bold mb-3">Billing</h1>

      {subscription ? (
        <>
          <p className="">Plan information</p>

          <hr className="my-8" />

          <h2 className="font-bold">Change plan</h2>

          <Plans plans={plans} subscription={subscription} />

          <hr className="my-8" />

          <p className="mt-8 text-sm text-gray-500">Cancel link etc</p>
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

