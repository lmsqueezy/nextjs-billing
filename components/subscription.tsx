'use client'

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Plans from '@/components/plan';
import { UpdateBillingLink, CancelLink, ResumeButton } from '@/components/manage'


function ActiveSubscription({ subscription, setSubscription }) {
  const renewalDate = formatDate(subscription.renewalDate)
  return (
    <>
      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan.
      </p>

      <p className="mb-2">Your next renewal will be on {renewalDate}.</p>

      <hr className="my-8" />

      <p className="mb-4">
        <Link href="/billing/change-plan" className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold">
          Change plan &rarr;
        </Link>
      </p>

      <p><UpdateBillingLink subscription={subscription} /></p>

      <p><CancelLink subscription={subscription} setSubscription={setSubscription} /></p>
    </>
  )
}


function CancelledSubscription({ subscription, setSubscription }) {
  const expiryDate = formatDate(subscription.expiryDate)
  return (
    <>
      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan.
      </p>

      <p className="mb-8">Your subscription has been cancelled and <b>will end on {expiryDate}</b>. After this date you will no longer have access to the app.</p>

      <p><ResumeButton subscription={subscription} setSubscription={setSubscription} /></p>
    </>
  )
}


function TrialSubscription({ subscription, setSubscription }) {
  const trialEndDate = formatDate(subscription.trialEndDate)
  return (
    <>
      <p className="mb-2">
        You are currently on a free trial of the <b>{subscription.planName} {subscription.planInterval}ly</b> plan.
      </p>

      <p className="mb-6">Your trial ends on {trialEndDate}. You can cancel your subscription before this date and you won't be charged.</p>

      <hr className="my-8" />

      <p className="mb-4">
        <Link href="/billing/change-plan" className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold">
          Change plan &rarr;
        </Link>
      </p>

      <p><UpdateBillingLink subscription={subscription} /></p>

      <p><CancelLink subscription={subscription} setSubscription={setSubscription} /></p>
    </>
  )
}


// Components for different subscription states
export function SubscriptionComponent({ sub, plans }) {
  const [subscription, setSubscription] = useState(() => {
    if (sub) {
      return {
        id: sub.lemonSqueezyId,
        planName: sub.plan?.variantName,
        planInterval: sub.plan?.interval,
        productId: sub.plan?.productId,
        variantId: sub.plan?.variantId,
        status: sub.status,
        renewalDate: sub.renewsAt,
        trialEndDate: sub.trialEndsAt,
        expiryDate: sub.endsAt,
      }
    } else {
      return {}
    }
  })

  switch(subscription.status) {

    case 'active':
      return <ActiveSubscription subscription={subscription} setSubscription={setSubscription} />
    case 'on_trial':
      return <TrialSubscription subscription={subscription} setSubscription={setSubscription} />;
    case 'past_due':
      return <PastDueSubscription subscription={subscription} setSubscription={setSubscription} />;
    case 'cancelled':
      return <CancelledSubscription subscription={subscription} setSubscription={setSubscription} />;
    case 'expired':
      return <ExpiredSubscription subscription={subscription} plans={plans} setSubscription={setSubscription} />;

    // TODO: Paused, Unpaused

  }
}


function PastDueSubscription({ subscription, setSubscription }) {
  const renewalDate = formatDate(subscription.renewsAt)
  return (
    <>
      <div className="my-8 p-4 text-sm text-red-800 rounded-md border border-red-200 bg-red-50">
        Your latest payment failed. We will re-try this payment up to four times, after which your subscription will be cancelled.<br />
        If you need to update your billing details, you can do so below.
      </div>

      <p className="mb-2">
        You are currently on the <b>{subscription.plan.variantName} {subscription.plan.interval}ly</b> plan.
      </p>

      <p className="mb-2">The next payment attempt will be on {renewalDate}.</p>

      <hr className="my-8" />

      <p><UpdateBillingLink subscription={subscription} /></p>

      <p><CancelLink subscription={subscription} setSubscription={setSubscription} /></p>
    </>
  )
}

function ExpiredSubscription({ subscription, plans, setSubscription }) {
  const expiryDate = formatDate(subscription.expiryDate)
  return (
    <>
      <p className="mb-2">Your subscription expired on {expiryDate}.</p>

      <p className="mb-2">Please create a new subscription to regain access.</p>

      <hr className="my-8" />

      <Plans sub={subscription} plans={plans} />

    </>
  )
}


function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: "2-digit",
    year: 'numeric'
  })
}
