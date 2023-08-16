import { getSession } from "@/lib/auth";
import { getSubscription } from '@/lib/data';
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
  return Response.json({ error: false, subscription: subscription['data']['attributes'] }, { status: 200 })

}
