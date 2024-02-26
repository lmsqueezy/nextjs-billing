import { Suspense } from "react";
import { Plans } from "@/components/dashboard/billing/plans/plans";
import { Subscriptions } from "@/components/dashboard/billing/subscription/subscriptions";
import { DashboardContent } from "@/components/dashboard/content";
import { PageTitleAction } from "@/components/dashboard/page-title-action";
import { PlansSkeleton } from "@/components/dashboard/skeletons/plans";
import { CardSkeleton } from "@/components/dashboard/skeletons/card";

export const dynamic = "force-dynamic";

export default function BillingPage() {
  return (
    <DashboardContent
      title="Billing"
      subtitle="View and manage your billing information."
      action={<PageTitleAction />}
    >
      <div>
        <Suspense fallback={<CardSkeleton className="h-[106px]" />}>
          <Subscriptions />
        </Suspense>

        <Suspense fallback={<PlansSkeleton />}>
          <Plans />
        </Suspense>
      </div>
    </DashboardContent>
  );
}
