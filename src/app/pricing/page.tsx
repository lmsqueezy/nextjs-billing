'use client';
import { type Subscription } from "@lemonsqueezy/lemonsqueezy.js";
import { getUserSubscriptions, syncPlans } from "@/app/actions";
import { db, plans, type NewPlan } from "@/db/schema";
import { InfoMessage, NoPlans, Plan } from "@/components/dashboard/billing/plans/plan";
import { useEffect, useState } from "react";

const PlansPage = ({ isChangingPlans = false }: { isChangingPlans?: boolean }) => {
  const [allPlans, setAllPlans] = useState<NewPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchPlans = async () => {
  //     let plansData: NewPlan[] = await db.select().from(plans);
  //     const userSubscriptions = await getUserSubscriptions();

  //     // Do not show plans if the user already has a valid subscription.
  //     if (userSubscriptions.length > 0) {
  //       const hasValidSubscription = userSubscriptions.some((subscription) => {
  //         const status =
  //           subscription.status as Subscription["data"]["attributes"]["status"];

  //         return (
  //           status !== "cancelled" && status !== "expired" && status !== "unpaid"
  //         );
  //       });

  //       if (hasValidSubscription && !isChangingPlans) {
  //         setLoading(false);
  //         return;
  //       }
  //     }

  //     // If there are no plans in the database, sync them from Lemon Squeezy.
  //     // You might want to add logic to sync plans periodically or a webhook handler.
  //     if (!plansData.length) {
  //       plansData = await syncPlans();
  //     }

  //     if (plansData.length) {
  //       const sortedPlans = plansData.sort((a, b) => {
  //         if (a.sort === undefined || a.sort === null || b.sort === undefined || b.sort === null) {
  //           return 0;
  //         }
  //         return a.sort - b.sort;
  //       });
  //       setAllPlans(sortedPlans);
  //     }
  //     setLoading(false);
  //   };

  //   fetchPlans();
  // }, [isChangingPlans]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!allPlans.length) {
    return <NoPlans />;
  }

  return (
    <div>
      <h2 className='flex items-center after:ml-5 after:h-px after:grow after:bg-surface-100 after:content-[""]'>
        Plans
      </h2>

      {/* <div className="mb-5 mt-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        {allPlans.map((plan, index) => {
          return <Plan key={`plan-${index}`} plan={plan} />;
        })}
      </div> */}

      {/* <InfoMessage /> */}
    </div>
  );
}

export default PlansPage;