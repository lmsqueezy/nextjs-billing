'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js'

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);


export default function UpdateBillingLink({ subscription }) {
  
  const [isMutating, setIsMutating] = useState(false)

  async function openUpdateModal(e) {

    e.preventDefault()
    
    setIsMutating(true)

    /* Fetch the subscription */
    try {
      const res = await ls.getSubscription({ id: subscription.lemonSqueezyId })
      // TODO: Use Lemon.js
      window.location = res['url']['update_payment_method']
    } catch (err) {
      alert(err['errors'][0]['detail'])
    }
    
    setIsMutating(false)

  }

  return (
    <a href="" className="mb-2 text-sm text-gray-500" onClick={openUpdateModal}>
      Update your payment method
      <Loader2 className={"animate-spin inline-block relative top-[-1px] ml-2 w-8" + (!isMutating ? ' invisible' : 'visible')} />
    </a>
  )
}