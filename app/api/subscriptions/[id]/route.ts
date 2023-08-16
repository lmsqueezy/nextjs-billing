import { getSession } from "@/lib/auth";
import { getPlan } from '@/lib/data';
import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js'

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);


export async function GET(request, { params }) {
  // Get subscription update billing link
  try {
    const subscription = await ls.getSubscription({ id: params.id })
    return Response.json({ error: false, subscription: {
      update_billing_url: subscription['data']['attributes']['urls']['update_payment_method']
    } }, { status: 200 })
  } catch(e) {
    return Response.json({ error: true,  message: e.message }, { status: 400 })
  }
}


export async function POST(request, { params }) {
  const session = await getSession();

  const res = await request.json()

  var subscription;


  if (res.variantId && res.productId) {

    // Update plan

    try {
      subscription = await ls.updateSubscription({
        id: params.id,
        productId: res.productId,
        variantId: res.variantId,
      })
    } catch(e) {
      return Response.json({ error: true,  message: e.message }, { status: 400 })
    }

  } else if (res.action == 'resume') {

    // Resume
    
    try {
      subscription = await ls.resumeSubscription({ id: params.id })
    } catch(e) {
      return Response.json({ error: true,  message: e.message }, { status: 400 })
    }

  } else if (res.action == 'cancel') {

    // Cancel

    try {
      await ls.cancelSubscription({ id: params.id })
      // TODO get proper result from cancelSubscription()
      subscription = {
        data: {
          attributes: {
            status: 'cancelled',
            // endsAt
          }
        }
      }
    } catch(e) {
      return Response.json({ error: true,  message: e.message }, { status: 400 })
    }

  } else {

    // Missing data in request

    return Response.json({ error: true,  message: 'Correct data not found.' }, { status: 400 })

  }

  // Return values needed to refresh state in UI
  // DB will be updated in the background with webhooks

  // Filtered object
  const sub = {
    product_id: subscription['data']['attributes']['product_id'],
    variant_id: subscription['data']['attributes']['variant_id'],
    status: subscription['data']['attributes']['status'],
    card_brand: subscription['data']['attributes']['card_brand'],
    card_last_four: subscription['data']['attributes']['card_last_four'],
    trial_ends_at: subscription['data']['attributes']['trial_ends_at'],
    renews_at: subscription['data']['attributes']['renews_at'],
    ends_at: subscription['data']['attributes']['ends_at'],
  }

  // Get new plan's data
  const plan = await getPlan(sub.variant_id)
  sub.plan = {
    interval: plan.interval,
    name: plan.variantName
  }

  return Response.json({ error: false, subscription: sub }, { status: 200 })

}
