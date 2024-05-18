import { Suspense } from "react";
import { Plans } from "@/components/dashboard/billing/plans/plans";
import { Subscriptions } from "@/components/dashboard/billing/subscription/subscriptions";
import { DashboardContent } from "@/components/dashboard/content";
import { PlansSkeleton } from "@/components/dashboard/skeletons/plans";
import { CardSkeleton } from "@/components/dashboard/skeletons/card";
import { auth } from '@/auth'
import { signIn } from "@/auth";
import { SubmitButton } from "@/components/submit-button";
export const dynamic = "force-dynamic";

export  default async function Profile() {
  const session = await auth();
  return (
     session?.user ?
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
        :<form
        className="pt-2 w-full text-center mt-80"
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <SubmitButton
          shape="pill"
          variant="outline"
          
        >
          Sign in with Google
        </SubmitButton>
      </form>
  )
}
