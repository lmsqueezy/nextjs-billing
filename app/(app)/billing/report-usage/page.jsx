import prisma from "@/lib/prisma";
import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js';

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);


async function reportUsage() {
  /**
   * Report usage for all customers to Lemon Squeezy.
   * This example runs through all active usage-based subscriptions and sends the current total usage
   *  to Lemon Squeezy.
   * You could run this as a daily background job.
   */

  // Get all active usage-based subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      isUsageBased: true
    },
    include: {
      plan: true
    }
  });

  for (let i = 0; i < subscriptions.length; i++) {
    let subscription = subscriptions[i];
    console.log(subscription)

    // Usage from the current billing period. Get this value from your app's data
    let unitsUsed = 1;

    let resp = await ls.createUsageRecord({
      subscriptionItemId: subscription.subscriptionItemId,
      quantity: unitsUsed,
      action: 'set' // or `increment` if you want to add to the existing usage you've reported
    })
  }

}

export default async function Page() {
  reportUsage()
  
  return (
    <p>
      Done!
    </p>
  )
}

