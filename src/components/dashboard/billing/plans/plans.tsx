/* eslint-disable @typescript-eslint/prefer-optional-chain -- allow */
import { type Subscription } from "@lemonsqueezy/lemonsqueezy.js";
import { getUserSubscriptions, syncPlans } from "@/app/actions";
import { db, plans, type NewPlan } from "@/db/schema";
import { InfoMessage, NoPlans, Plan } from "./plan";

export async function Plans({
  isChangingPlans = false,
}: {
  isChangingPlans?: boolean;
  currentPlan?: NewPlan;
}) {
  let allPlans: NewPlan[] = await db.select().from(plans);
  const userSubscriptions = await getUserSubscriptions();

  // Do not show plans if the user already has a valid subscription.
  if (userSubscriptions.length > 0) {
    const hasValidSubscription = userSubscriptions.some((subscription) => {
      const status =
        subscription.status as Subscription["data"]["attributes"]["status"];

      return (
        status !== "cancelled" && status !== "expired" && status !== "unpaid"
      );
    });

    if (hasValidSubscription && !isChangingPlans) {
      return null;
    }
  }

  // If there are no plans in the database, sync them from Lemon Squeezy.
  // You might want to add logic to sync plans periodically or a webhook handler.
  if (!allPlans.length) {
    allPlans = await syncPlans();
  }

  if (!allPlans.length) {
    return <NoPlans />;
  }

  const sortedPlans = allPlans.sort((a, b) => {
    if (
      a.sort === undefined ||
      a.sort === null ||
      b.sort === undefined ||
      b.sort === null
    ) {
      return 0;
    }

    return a.sort - b.sort;
  });

  return (
    <div>
      <h2 className='flex items-center after:ml-5 after:h-px after:grow after:bg-surface-100 after:content-[""]'>
        Plans
      </h2>

      <div className="mb-5 mt-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        {sortedPlans.map((plan, index) => {
          return <Plan key={`plan-${index}`} plan={plan} />;
        })}
      </div>

      <InfoMessage />
    </div>
  );
}
