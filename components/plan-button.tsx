'use client';

import { useState } from 'react';
import { useSession } from "next-auth/react"
import { Loader2 } from 'lucide-react';


export default function PlanButton({ plan, subscription }) {
  const { data: session, status } = useSession()
  
  const [isMutating, setIsMutating] = useState(false)

  async function createCheckout(e, variantId) {
    e.preventDefault()
    
    setIsMutating(true)
    /* Create a checkout */
    const res = await fetch('/api/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        variantId: variantId
      })
    })
    const checkout = await res.json();
    if (checkout.error) {
      alert(checkout.message)
    } else {
      LemonSqueezy.Url.Open(checkout['url'])
    }
    
    setIsMutating(false)
  }


  const changePlan = async (e, subscription, plan) => {
    e.preventDefault()
    if (confirm(`Please confirm you want to change to the ${plan.name} (${plan.variantName} ${plan.interval}ly) plan. \
For upgrades you will be charged a prorated amount.`)) {
      alert('change plan to ' + plan.variantId)

      /* Change plan */

    }
  }

  return (
    <>
      {!subscription ? (
        <a
          href="#"
          onClick={(e) => createCheckout(e, plan.variantId)}
          className="block text-center py-2 px-5 bg-amber-200 rounded-full font-bold text-amber-800 shadow-md shadow-gray-300/30 select-none"
          disabled={isMutating}
        >
          <Loader2 className={"animate-spin inline-block relative top-[-1px] mr-2" + (!isMutating ? ' hidden' : '')} />
          <span className="leading-[28px] inline-block">Sign up</span>
        </a>
      ) : (
        <>
          {subscription?.planId == plan.id ? (
            <span className="block text-center py-2 px-5 bg-gray-200 rounded-full font-bold shadow-md shadow-gray-300/30 select-none">
              <span className="leading-[28px] inline-block">Your current plan</span>
            </span>
          ) : (
            <a
              href="#" 
              onClick={(e) => changePlan(e, subscription, plan)}
              className="block text-center py-2 px-5 bg-amber-200 rounded-full font-bold text-amber-800 shadow-md shadow-gray-300/30 select-none"
              disabled={isMutating}
            >
              <Loader2 className={"animate-spin inline-block relative top-[-1px] mr-2" + (!isMutating ? ' hidden' : '')} />
              <span className="leading-[28px] inline-block">Change to this plan</span>
            </a>
          )}
        </>
      )}
    </>
  )
}