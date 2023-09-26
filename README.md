# Lemon Squeezy Next.js Demo app

This Next.js demo app can be used as a base for building subscription-based SaaS apps.

Just clone this repo and build your app alongside the ready-made auth and billing!

- [Lemon Squeezy](https://lemonsqueezy.com) for billing
- [NextAuth.js](https://next-auth.js.org) for auth
- [Prisma](https://www.prisma.io) ORM
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Resend](https://resend.com) for auth emails

## Customer Portal vs Full billing section

This demo app comes with two versions of Lemon Squeezy billing.

1. The first option uses [Lemon Squeezy's Customer Portal](https://docs.lemonsqueezy.com/help/online-store/customer-portal) for managing subscriptions. It shows a "Manage subscription" button, which links out to the no-code Customer Portal where customers can manage their subscriptions, billing methods and view invoices.
This option uses the `PortalSubscriptionComponent` component in `billing.page.jsx`.

2. The second option is a more native billing section inside the app, with options for pausing, cancelling, updating plans and updating payment method. This option is more seamless inside your application and uses the Lemon Squeezy SDK/API to make changes to subscriptions.
This option uses the `SubscriptionComponent` component in `billing.page.jsx`.

Note that both options require webhooks so that the underlying subscription data in the application is always up-to-date. A way to ingest webhooks is included in the app.

## How to set up a test version of the app

First, fork this repo and set up a project locally on your computer.

Next, you need a Lemon Squeezy account and store. If you don't have one already, sign up at [app.lemonsqueezy.com/register](https://app.lemonsqueezy.com/register).

Once you have created a store, make sure you're in Test mode, then go to [Settings > API](https://app.lemonsqueezy.com/settings/api) and create a new API key. Copy the key and paste it into `.env.example` file where it says `LEMONSQUEEZY_API_KEY=`.

You will also need the store ID from Lemon Squeezy for `LEMONSQUEEZY_STORE_ID`, which you can find in the list at [Settings > Stores](https://app.lemonsqueezy.com/settings/stores).

There are also a few other environment variables, which are all listed in `.env.example`:

- `DATABASE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM_DEFAULT` - The email address you send emails from
- `NEXT_PUBLIC_EMAIL_FROM_DEFAULT` - Same as `EMAIL_FROM_DEFAULT`. [Read about browser variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser)
- `NEXT_PUBLIC_ROOT_DOMAIN` - The root domain of your site eg localhost:3000 or mydomain.com. [Read about browser variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser)
- `NEXTAUTH_URL` - The URL of your site eg http://localhost:3000 or https://mydomain.com. [Read more](https://next-auth.js.org/configuration/options)
- `NEXTAUTH_SECRET` - A secret used for auth. [Read more](https://next-auth.js.org/configuration/options)

When you're done, rename the file `.env` so your app can read it.

Now, to get the code working on your computer or server, run `npm install` and then `npm run dev` to get the local server running.

Your site will load at http://localhost:3000.

## How to set up webhooks

**This is a required step.**

For your app to receive data from Lemon Squeezy, you need to set up webhooks in your Lemon Squeezy store at [Settings > Webhooks](https://app.lemonsqueezy.com/settings/webhooks).

When you create a webhook, you should check at least these two events:

- `subscription_created`
- `subscription_updated`

This app demo only processes these two events, but they are enough to get a billing system in place. You could, for example, extend the app to handle successful payment events to list invoices in your billing system (by subscribing to `subscription_payment_success`).

The webhook endpoint in your app is `/billing/webhook`.

In the webhook form you need to add a signing secret. Add the same value you use in the form in the `LEMONSQUEEZY_WEBHOOK_SECRET` environment variable.

### How to work with webhooks locally

Your local app will need to be able to receive webhook events, which means creating a web-accessible URL for your development project. This is not available when running your site on its local server without some sort of tunnel.

An easy way to set one up is using a service like [ngrok](https://ngrok.com/) or an app like [LocalCan](https://www.localcan.com/).

Once you are provided a URL by these services, simply add use that in your webhook settings form (make sure you add the path `/billing/webhook` to the end of the tunnel URL).

## How to go live

There are a few things to update in your code to go live.

You need to switch out of live mode in your Lemon Squeezy store and add a new live mode API key. Add this API key as an environment variable in your live server, using the same name `LEMONSQUEEZY_API_KEY`. Your store ID remains the same in both test and live mode, so add that to your server environment variables, as you did for your development site.

You also need to create a new webhook in your live store. Make sure you add the signing secret into the `LEMONSQUEEZY_WEBHOOK_SECRET` variable on your server.