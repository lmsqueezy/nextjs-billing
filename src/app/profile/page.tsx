import { Suspense } from "react";
import { Plans } from "@/components/dashboard/billing/plans/plans";
import { Subscriptions } from "@/components/dashboard/billing/subscription/subscriptions";
import { DashboardContent } from "@/components/dashboard/content";
import { PlansSkeleton } from "@/components/dashboard/skeletons/plans";
import { CardSkeleton } from "@/components/dashboard/skeletons/card";
import { auth } from '@/auth'
import { LoginButtons } from "@/components/login-buttons";
export const dynamic = "force-dynamic";

export  default async function Profile() {
  const session = await auth();
  if(!session?.user) {
    return <LoginButtons/>
  }
  return (
    <>
        <DashboardContent
        title="Billing"
        subtitle="View and manage your billing information."
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
        </>
  )
}
