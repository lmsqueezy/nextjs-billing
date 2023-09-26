'use client'

import { useState } from 'react';
import Plans from '@/components/plan';
import { Loader2 } from 'lucide-react';


function PortalButton({ subscription }) {

  const [isMutating, setIsMutating] = useState(false)

  const getPortalLink = async (e) => {

    e.preventDefault()

    setIsMutating(true)

    /* Send request */
    const res = await fetch(`/api/subscriptions/${subscription.id}`)
    const result = await res.json();
    if (result.error) {
      alert(result.message)
      setIsMutating(false)
    } else {

      window.location = result.subscription.customer_portal_url

    }
  }

  return (
    <a href=""
      onClick={getPortalLink}
      className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold"
    >
      <Loader2 className={"animate-spin inline-block relative top-[-1px] mr-2" + (!isMutating ? ' hidden' : '')} />
      Manage subscription
    </a>
  )
}

// Main component
export const PortalSubscriptionComponent = ({ sub, plans }) => {
  
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
        price: sub.price / 100,
      }
    } else {
      return {}
    }
  })

  if (sub) {

    switch(subscription.status) {

      case 'active':
        return <ActiveSubscription subscription={subscription} />
      case 'on_trial':
        return <TrialSubscription subscription={subscription} />;
      case 'past_due':
        return <PastDueSubscription subscription={subscription} />;
      case 'cancelled':
        return <CancelledSubscription subscription={subscription} />;
      case 'paused':
        return <PausedSubscription subscription={subscription} />;
      case 'unpaid':
        return <UnpaidSubscription subscription={subscription} />;
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


const ActiveSubscription = ({ subscription }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan, paying ${subscription.price}/{subscription.planInterval}.
      </p>

      <p className="mb-8">Your next renewal will be on {formatDate(subscription.renewalDate)}.</p>

      <p><PortalButton subscription={subscription} /></p>
    </>
  )
}


const CancelledSubscription = ({ subscription }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan, paying ${subscription.price}/{subscription.planInterval}.
      </p>

      <p className="mb-8">Your subscription has been cancelled and <b>will end on {formatDate(subscription.expiryDate)}</b>. After this date you will no longer have access to the app.</p>

      <p><PortalButton subscription={subscription} /></p>
    </>
  )
}


const PausedSubscription = ({ subscription }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan, paying ${subscription.price}/{subscription.planInterval}.
      </p>

      {subscription.unpauseDate ? (
        <p className="mb-8">Your subscription payments are currently paused. Your subscription will automatically resume on {formatDate(subscription.unpauseDate)}.</p>
      ) : (
        <p className="mb-8">Your subscription payments are currently paused.</p>
      )}

      <p><PortalButton subscription={subscription} /></p>
    </>
  )
}


const TrialSubscription = ({ subscription }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on a free trial of the <b>{subscription.planName} {subscription.planInterval}ly</b> plan (${subscription.price}/{subscription.planInterval}).
      </p>

      <p className="mb-8">Your trial ends on {formatDate(subscription.trialEndDate)}. You can cancel your subscription before this date and you won&apos;t be charged.</p>

      <p><PortalButton subscription={subscription} /></p>
    </>
  )
}


const PastDueSubscription = ({ subscription }) => {
  return (
    <>
      <div className="my-8 p-4 text-sm text-red-800 rounded-md border border-red-200 bg-red-50">
        Your latest payment failed. We will re-try this payment up to four times, after which your subscription will be cancelled.<br />
        If you need to update your billing details, you can do so below.
      </div>

      <p className="mb-2">
        You are currently on the <b>{subscription.planName} {subscription.planInterval}ly</b> plan, paying ${subscription.price}/{subscription.planInterval}.
      </p>

      <p className="mb-8">We will attempt a payment on {formatDate(subscription.renewalDate)}.</p>

      <p><PortalButton subscription={subscription} /></p>
    </>
  )
}

const UnpaidSubscription = ({ subscription }) => {
  /*
  Unpaid subscriptions have had four failed recovery payments.
  If you have dunning enabled in your store settings, customers will be sent emails trying to reactivate their subscription.
  If you don't have dunning enabled the subscription will remain "unpaid".
  */
  return (
    <>
      <p className="mb-2">We haven&apos;t been able to make a successful payment and your subscription is currently marked as unpaid.</p>

      <p className="mb-8">Please update your billing information to regain access.</p>

      <p><PortalButton subscription={subscription} /></p>

    </>
  )
}

const ExpiredSubscription = ({ subscription, plans, setSubscription }) => {
  return (
    <>
      <p className="mb-2">Your subscription expired on {formatDate(subscription.expiryDate)}.</p>

      <p className="mb-2">Please create a new subscription to regain access.</p>

      <hr className="my-8" />

      <Plans sub={subscription} plans={plans} setSubscription={setSubscription} />

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
