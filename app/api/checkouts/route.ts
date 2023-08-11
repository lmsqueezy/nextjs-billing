import { getSession } from "@/lib/auth";

import LemonSqueezy from '@lemonsqueezy/lemonsqueezy.js'
const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY);


export async function POST(request: Request) {
  const session = await getSession();

  const res = await request.json()

  if ( !res.variantId ) {
    return Response.json({'error': true, 'message': 'No variant ID was provided.'}, {status: 400})
  }

  // Customise the checkout experience
  // All the options: https://docs.lemonsqueezy.com/api/checkouts#create-a-checkout
  const attributes = {
      'checkout_options': {
          'embed': true,
          'media': false,
          'button_color': '#fde68a'
      },
      'checkout_data': {
          'email': session.user.email, // Displays in the checkout form eg session.user.email with NextAuth.js
          'custom': {
              'user_id': session.user.id // Sent in the background; visible in webhooks and API calls eg session.user.id with NextAuth.js
          }
      },
      'product_options': {
          'enabled_variants': [res.variantId], // Only show the selected variant in the checkout
          'redirect_url': 'http://localhost:3001/billing/',
          'receipt_link_url': 'http://localhost:3001/billing/',
          'receipt_button_text': 'Go to your account',
          'receipt_thank_you_note': 'Thank you for signing up to Lemonstand!'
      }
  }
  console.log(attributes)

  try {
    const checkout = await ls.createCheckout(
                          process.env.LEMONSQUEEZY_STORE_ID,
                          res.variantId,
                          attributes
                        )
    return Response.json({'error': false, 'url': checkout['data']['attributes']['url']}, {status: 200})
  } catch(e) {
    return Response.json({'error': true, 'message': e.message}, {status: 400})
  }
  

}
