'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Plans from '@/components/plan';


export function UpdateBillingLink({ subscription, elementType }) {
  
  const [isMutating, setIsMutating] = useState(false)

  async function openUpdateModal(e) {

    e.preventDefault()
    
    setIsMutating(true)

    /* Send request */
    const res = await fetch('/api/subscriptions/'+subscription.id)
    const result = await res.json();
    if (result.error) {
      alert(result.message)
      setIsMutating(false)

    } else {

      LemonSqueezy.Url.Open(result.subscription.update_billing_url)
      setIsMutating(false)

    }
  }

  if (elementType == 'button') {
    return (
      <a href="" className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold" onClick={openUpdateModal}>
        <Loader2 className={"animate-spin inline-block relative top-[-1px] mr-2" + (!isMutating ? ' hidden' : '')} />
        Update your payment method
      </a>
    )
  } else {
    return (
      <a href="" className="mb-2 text-sm text-gray-500" onClick={openUpdateModal}>
        Update your payment method
        <Loader2 size={16} className={"animate-spin inline-block relative top-[-1px] ml-2 w-8" + (!isMutating ? ' invisible' : 'visible')} />
      </a>
    )
  }
}

export function CancelLink({ subscription, setSubscription }) {
  
  const [isMutating, setIsMutating] = useState(false)

  async function handleCancel(e) {

    e.preventDefault()

    if (confirm(`Please confirm you want to cancel your subscription.`)) {

      setIsMutating(true)

      /* Send request */
      const res = await fetch('/api/subscriptions/'+subscription.id, {
        method: 'POST',
        body: JSON.stringify({
          action: 'cancel'
        })
      })
      const result = await res.json();
      if (result.error) {
        alert(result.message)
        setIsMutating(false)

      } else {
        
        setSubscription({
          ...subscription,
          status: result['subscription']['status'],
          expiryDate: result['subscription']['ends_at'],
        })

        toast.success('Your subscription has been cancelled.')

      }

    }

  }

  return (
    <a href="" className="mb-2 text-sm text-gray-500" onClick={handleCancel}>
      Cancel
      <Loader2 size={16} className={"animate-spin inline-block relative top-[-1px] ml-2 w-8" + (!isMutating ? ' invisible' : 'visible')} />
    </a>
  )
}


export function ResumeButton({ subscription, setSubscription }) {

  const [isMutating, setIsMutating] = useState(false)

  const resumeSubscription = async (e) => {
    
    e.preventDefault()

    if (confirm(`Please confirm you want to resume your subscription. You will be charged the regular subscription fee.`)) {

      setIsMutating(true)

      /* Send request */
      const res = await fetch('/api/subscriptions/'+subscription.id, {
        method: 'POST',
        body: JSON.stringify({
          action: 'resume'
        })
      })
      const result = await res.json();
      if (result.error) {
        alert(result.message)
        setIsMutating(false)
      } else {
        
        setSubscription({
          ...subscription,
          status: result['subscription']['status'],
          renewalDate: result['subscription']['renews_at'],
        })

        toast.success('Your subscription is now active again!')

      }

    }
  }

  return (
    <a href="" 
      onClick={resumeSubscription} 
      className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold"
    >
      <Loader2 className={"animate-spin inline-block relative top-[-1px] mr-2" + (!isMutating ? ' hidden' : '')} />
      Resume your subscription
    </a>
  )
}


export function PauseLink({ subscription, setSubscription }) {
  
  const [isMutating, setIsMutating] = useState(false)

  async function handlePause(e) {

    e.preventDefault()

    if (confirm(`Please confirm you want to pause your subscription.`)) {

      setIsMutating(true)

      /* Send request */
      const res = await fetch('/api/subscriptions/'+subscription.id, {
        method: 'POST',
        body: JSON.stringify({
          action: 'pause'
        })
      })
      const result = await res.json();
      if (result.error) {
        alert(result.message)
        setIsMutating(false)

      } else {
        
        setSubscription({
          ...subscription,
          status: result['subscription']['status'],
          unpauseDate: result['subscription']['resumes_at'],
        })

        toast.success('Your subscription has been paused.')

      }

    }

  }

  return (
    <a href="" className="mb-2 text-sm text-gray-500" onClick={handlePause}>
      Pause payments
      <Loader2 size={16} className={"animate-spin inline-block relative top-[-1px] ml-2 w-8" + (!isMutating ? ' invisible' : 'visible')} />
    </a>
  )
}


export function UnpauseButton({ subscription, setSubscription }) {

  const [isMutating, setIsMutating] = useState(false)

  const unpauseSubscription = async (e) => {
    
    e.preventDefault()

    if (confirm(`Please confirm you want to unpause your subscription. Your payments will reactivate on their original schedule.`)) {

      setIsMutating(true)

      /* Send request */
      const res = await fetch('/api/subscriptions/'+subscription.id, {
        method: 'POST',
        body: JSON.stringify({
          action: 'unpause'
        })
      })
      const result = await res.json();
      if (result.error) {
        alert(result.message)
        setIsMutating(false)
      } else {
        
        setSubscription({
          ...subscription,
          status: result['subscription']['status'],
          renewalDate: result['subscription']['renews_at'],
        })

        toast.success('Your subscription is now active again!')

      }

    }
  }

  return (
    <a href="" 
      onClick={unpauseSubscription} 
      className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold"
    >
      <Loader2 className={"animate-spin inline-block relative top-[-1px] mr-2" + (!isMutating ? ' hidden' : '')} />
      Unpause your subscription
    </a>
  )
}


export function PlansComponent({ plans, sub }) {

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

  return (
    <Plans plans={plans} subscription={subscription} setSubscription={setSubscription} />
  )

}