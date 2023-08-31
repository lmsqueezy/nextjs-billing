'use client'

import { useState, FC, useEffect } from 'react';
import Link from 'next/link';
import Plans from '@/components/plan';
import {
  UpdateBillingLink,
  CancelLink,
  ResumeButton,
  PauseLink,
  UnpauseButton
} from '@/components/manage'


interface SubscriptionProps {
  sub: Object,
  plans: Object
}

// Main component
export const SubscriptionComponent: FC<SubscriptionProps> = ({ sub, plans }) => {

  // Make sure Lemon.js is loaded
  useEffect(() => {
    window.createLemonSqueezy();
  }, [])
  
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
        unpauseDate: sub.resumesAt,
      }
    } else {
      return {}
    }
  })

  if (sub) {

    switch(subscription.status) {

      case 'active':
        return <ActiveSubscription subscription={subscription} setSubscription={setSubscription} />
      case 'on_trial':
        return <TrialSubscription subscription={subscription} setSubscription={setSubscription} />;
      case 'past_due':
        return <PastDueSubscription subscription={subscription} setSubscription={setSubscription} />;
      case 'cancelled':
        return <CancelledSubscription subscription={subscription} setSubscription={setSubscription} />;
      case 'paused':
        return <PausedSubscription subscription={subscription} setSubscription={setSubscription} />;
      case 'unpaid':
        return <UnpaidSubscription subscription={subscription} plans={plans} setSubscription={setSubscription} />;
      case 'expired':
        return <ExpiredSubscription subscription={subscription} plans={plans} setSubscription={setSubscription} />;
    }

  } else {

    return (
      <>
        <p>Please sign up to a paid plan.</p>

        <Plans plans={plans} setSubscription={setSubscription} />
      </>
    )

  }
}


const ActiveSubscription: FC = ({ subscription, setSubscription }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan.
      </p>

      <p className="mb-2">Your next renewal will be on {formatDate(subscription.renewalDate)}.</p>

      <hr className="my-8" />

      <p className="mb-4">
        <Link href="/billing/change-plan" className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold">
          Change plan &rarr;
        </Link>
      </p>

      <p><UpdateBillingLink subscription={subscription} /></p>

      <p><PauseLink subscription={subscription} setSubscription={setSubscription} /></p>

      <p><CancelLink subscription={subscription} setSubscription={setSubscription} /></p>
    </>
  )
}


const CancelledSubscription: FC = ({ subscription, setSubscription }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan.
      </p>

      <p className="mb-8">Your subscription has been cancelled and <b>will end on {formatDate(subscription.expiryDate)}</b>. After this date you will no longer have access to the app.</p>

      <p><ResumeButton subscription={subscription} setSubscription={setSubscription} /></p>
    </>
  )
}


const PausedSubscription: FC = ({ subscription, setSubscription }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan.
      </p>

      {subscription.resumeDate ? (
        <p className="mb-8">Your subscription payments are currently paused. Your subscription will automatically resume on {formatDate(subscription.resumeDate)}.</p>
      ) : (
        <p className="mb-8">Your subscription payments are currently paused.</p>
      )}

      <p><UnpauseButton subscription={subscription} setSubscription={setSubscription} /></p>
    </>
  )
}


const TrialSubscription: FC = ({ subscription, setSubscription }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on a free trial of the <b>{subscription.planName} {subscription.planInterval}ly</b> plan.
      </p>

      <p className="mb-6">Your trial ends on {formatDate(subscription.trialEndDate)}. You can cancel your subscription before this date and you won&apos;t be charged.</p>

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


const PastDueSubscription: FC = ({ subscription, setSubscription }) => {
  return (
    <>
      <div className="my-8 p-4 text-sm text-red-800 rounded-md border border-red-200 bg-red-50">
        Your latest payment failed. We will re-try this payment up to four times, after which your subscription will be cancelled.<br />
        If you need to update your billing details, you can do so below.
      </div>

      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan.
      </p>

      <p className="mb-2">We will attempt a payment on {formatDate(subscription.renewalDate)}.</p>

      <hr className="my-8" />

      <p><UpdateBillingLink subscription={subscription} /></p>

      <p><CancelLink subscription={subscription} setSubscription={setSubscription} /></p>
    </>
  )
}

const UnpaidSubscription: FC = ({ subscription, plans, setSubscription }) => {
  /*
  Unpaid subscriptions have had four failed recovery payments.
  If you have dunning enabled in your store settings, customers will be sent emails trying to reactivate their subscription.
  If you don't have dunning enabled the subscription will remain "unpaid".
  */
  return (
    <>
      <p className="mb-2">We haven&apos;t been able to make a successful payment and your subscription is currently marked as unpaid.</p>

      <p className="mb-6">Please updated your billing information to regain access.</p>

      <p><UpdateBillingLink subscription={subscription} type="button" /></p>

      <hr className="my-8" />

      <p><CancelLink subscription={subscription} setSubscription={setSubscription} /></p>

    </>
  )
}

const ExpiredSubscription: FC = ({ subscription, plans, setSubscription }) => {
  return (
    <>
      <p className="mb-2">Your subscription expired on {formatDate(subscription.expiryDate)}.</p>

      <p className="mb-2">Please create a new subscription to regain access.</p>

      <hr className="my-8" />

      <Plans sub={subscription} plans={plans} />

    </>
  )
}


function formatDate(date): string {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: "2-digit",
    year: 'numeric'
  })
}
