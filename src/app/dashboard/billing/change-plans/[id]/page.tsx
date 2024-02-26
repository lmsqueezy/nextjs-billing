import { Button } from "@lemonsqueezy/wedges";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserSubscriptions } from "@/app/actions";
import { ChangePlans } from "@/components/dashboard/billing/plans/change-plans";
import { DashboardContent } from "@/components/dashboard/content";
import { PageTitleAction } from "@/components/dashboard/page-title-action";
import { db, plans } from "@/db/schema";
import { isValidSubscription } from "@/lib/utils";
import { type SubscriptionStatusType } from "@/types/types";

export const dynamic = "force-dynamic";

export default async function ChangePlansPage({
  params,
}: {
  params: { id?: string };
}) {
  if (!params.id) {
    notFound();
  }
  const currentPlanId = parseInt(params.id);

  if (isNaN(currentPlanId)) {
    notFound();
  }

  // Get user subscriptions to check the current plan.
  const userSubscriptions = await getUserSubscriptions();

  if (!userSubscriptions.length) {
    notFound();
  }

  const isCurrentPlan = userSubscriptions.find(
    (s) =>
      s.planId === currentPlanId &&
      isValidSubscription(s.status as SubscriptionStatusType),
  );

  if (!isCurrentPlan) {
    redirect("/dashboard/billing");
  }

  const currentPlan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, currentPlanId));

  if (!currentPlan.length) {
    notFound();
  }

  return (
    <DashboardContent
      title="Change Plans"
      subtitle="Choose a plan that works for you."
      action={
        <div className="flex items-center gap-4">
          <Button asChild variant="tertiary">
            <Link href="/dashboard/billing">Back to Billing</Link>
          </Button>
          <PageTitleAction />
        </div>
      }
    >
      <ChangePlans currentPlan={currentPlan.at(0)} />
    </DashboardContent>
  );
}
