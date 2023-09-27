import prisma from "@/lib/prisma";
import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js';

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);


async function reportUsage() {
  /**
   * Report usage for all customers to Lemon Squeezy.
   * This example runs through all active usage-based subscriptions and sends the current total usage
   *  to Lemon Squeezy using the "set" action. You could run this as a daily background job.
   * An alternative to this method or reporting is to send usage reports more real-time (eg. after 
   *  every unit usage) using the "increment" action.
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

    // Total usage from the current billing period. Get this value from your app's data
    let unitsUsed = 10;

    let resp = await ls.createUsageRecord({
      subscriptionItemId: subscription.subscriptionItemId,
      quantity: unitsUsed,
      action: "set"
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

