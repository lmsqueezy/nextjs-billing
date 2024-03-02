import { type SubscriptionStatusType } from "@/types/types";
import { cn, isValidSubscription } from "@/lib/utils";
import { db, plans, type NewSubscription } from "@/db/schema";
import { getUserSubscriptions } from "@/app/actions";
import { Section } from "../../section";
import { ChangePlan } from "../plans/change-plan-button";
import { SubscriptionActions } from "./actions";
import { SubscriptionDate } from "./date";
import { SubscriptionPrice } from "./price";
import { SubscriptionStatus } from "./status";

export async function Subscriptions() {
  const userSubscriptions = await getUserSubscriptions();
  const allPlans = await db.select().from(plans);

  if (userSubscriptions.length === 0) {
    return (
      <p className="not-prose mb-2">
        It appears that you do not have any subscriptions. Please sign up for a
        plan below.
      </p>
    );
  }

  // Show active subscriptions first, then paused, then canceled
  const sortedSubscriptions = userSubscriptions.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") {
      return -1;
    }

    if (a.status === "paused" && b.status === "cancelled") {
      return -1;
    }

    return 0;
  });

  return (
    <Section className="not-prose relative">
      {sortedSubscriptions.map(
        (subscription: NewSubscription, index: number) => {
          const plan = allPlans.find((p) => p.id === subscription.planId);
          const status = subscription.status as SubscriptionStatusType;

          if (!plan) {
            throw new Error("Plan not found");
          }

          return (
            <Section.Item
              key={index}
              className="flex-col items-stretch justify-center gap-2"
            >
              <header className="flex items-center justify-between gap-3">
                <div className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1">
                  <h2
                    className={cn(
                      "text-lg text-surface-900",
                      !isValidSubscription(status) && "text-inherit",
                    )}
                  >
                    {plan.productName} ({plan.name})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {isValidSubscription(status) && (
                    <ChangePlan planId={subscription.planId} />
                  )}

                  <SubscriptionActions subscription={subscription} />
                </div>
              </header>

              <div className="flex flex-wrap items-center gap-2">
                <SubscriptionPrice
                  endsAt={subscription.endsAt}
                  interval={plan.interval}
                  intervalCount={plan.intervalCount}
                  price={subscription.price}
                  isUsageBased={plan.isUsageBased ?? false}
                />

                <SubscriptionStatus
                  status={status}
                  statusFormatted={subscription.statusFormatted}
                  isPaused={Boolean(subscription.isPaused)}
                />

                <SubscriptionDate
                  endsAt={subscription.endsAt}
                  renewsAt={subscription.renewsAt}
                  status={status}
                  trialEndsAt={subscription.trialEndsAt}
                />
              </div>
            </Section.Item>
          );
        },
      )}
    </Section>
  );
}
