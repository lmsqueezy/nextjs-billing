import { Suspense } from "react";
import { Plans } from "@/components/dashboard/billing/plans/plans";
import { Subscriptions } from "@/components/dashboard/billing/subscription/subscriptions";
import { DashboardContent } from "@/components/dashboard/content";
import { PlansSkeleton } from "@/components/dashboard/skeletons/plans";
import { CardSkeleton } from "@/components/dashboard/skeletons/card";
import { auth } from '@/auth'
import { signIn } from "@/auth";
import { SubmitButton } from "@/components/submit-button";
import  Navbar from "@/components/navbar";
export const dynamic = "force-dynamic";

export  default async function Profile() {
  const session = await auth();
  if(!session?.user) {
    return <>
      <form
        className="flex items-center h-screen text-center w-full"
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <SubmitButton
          shape="pill"
          variant="outline"
          className="mx-auto"
        >
          Sign in with Google
        </SubmitButton>
      </form>
    </>
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
