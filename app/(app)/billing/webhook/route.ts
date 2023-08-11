import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server'
import { Readable } from 'node:stream';
import prisma from "@/lib/prisma";


async function processEvent(event) {

  const customData = event.body['meta']['custom_data'] || null

  if (!customData) {
    console.log('No user ID, can\'t process')
    return
  }

  const obj = event.body['data']

  console.log(event.eventName)
  console.log(obj)

  if ( event.eventName.startsWith('subscription_payment_') ) {
    // Save subscription invoices; obj is a "Subscription invoice"

  } else if ( event.eventName.startsWith('subscription_') ) {
    // Save subscriptions; obj is a "Subscription"

    const data = obj['attributes']

    // We assume the Plan table is up to date
    const plan = await prisma.plan.findUnique({
      where: {
        variantId: data['variant_id']
      },
    })

    console.log(plan)

    var lemonSqueezyId = parseInt(obj['id'])

    // TODO: Link this to a real user object with customData['user_id']

    var updateData = {
      orderId: data['order_id'],
      name: data['user_name'],
      email: data['user_email'],
      status: data['status'],
      renewsAt: data['renews_at'],
      endsAt: data['ends_at'],
      trialEndsAt: data['trial_ends_at'],
      planId: plan['id'],
      userId: customData['user_id']
    }
    if ( event.eventName == 'subscription_created' ) {
      updateData.price = plan['price']
    }

    const createData = updateData
    createData.lemonSqueezyId = lemonSqueezyId

    try {

      // Create/update subscription
      const subscription = await prisma.subscription.upsert({
        where: {
          lemonSqueezyId: lemonSqueezyId
        },
        update: updateData,
        create: createData
      })

      await prisma.event.update({
        where: {
          id: event.id
        },
        data: {
          processed: true
        }
      })

    } catch (error) {
      console.log(error)
    }


  }
}


export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  
  const crypto = require('crypto');

  const rawBody = await request.text()

  const secret    = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const hmac      = crypto.createHmac('sha256', secret);
  const digest    = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signature = Buffer.from(request.headers.get('X-Signature') || '', 'utf8');

  if (!crypto.timingSafeEqual(digest, signature)) {
      throw new Error('Invalid signature.');
  }

  const data = JSON.parse(rawBody)

  const event = await prisma.webhookEvent.create({
    data: {
      eventName: data['meta']['event_name'],
      body: data
    },
  })

  // Process
  processEvent(event)

  
  return new Response('Done');
}

