'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';


export default function PlanButton({ plan, subscription }) {
  
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

  async function changePlan(e, variantId, productId) {
    e.preventDefault()
    alert('change plan')
  }

  return (
    <>
      {subscription && subscription.plan ? (
        <span className="block text-center py-2 px-5 bg-gray-200 rounded-full font-bold">
          <span className="leading-[28px] inline-block">Your current plan</span>
        </span>
      ) : (
        <>
          {subscription ? (
            <a
              href="#" 
              onClick={(e) => changePlan(e, plan.variantId, plan.productId)}
              className="block text-center py-2 px-5 bg-amber-200 rounded-full font-bold text-amber-800 shadow-md shadow-gray-300/30 select-none"
              disabled={isMutating}
            >
              <Loader2 className={"animate-spin inline-block relative top-[-1px] mr-2" + (!isMutating ? ' hidden' : '')} />
              <span className="leading-[28px] inline-block">Change to this plan</span>
            </a>
          ) : (
            <a
              href="#"
              onClick={(e) => createCheckout(e, plan.variantId)}
              className="block text-center py-2 px-5 bg-amber-200 rounded-full font-bold text-amber-800 shadow-md shadow-gray-300/30 select-none"
              disabled={isMutating}
            >
              <Loader2 className={"animate-spin inline-block relative top-[-1px] mr-2" + (!isMutating ? ' hidden' : '')} />
              <span className="leading-[28px] inline-block">Sign up</span>
            </a>
          )}
        </>
      )}
    </>
  )
}