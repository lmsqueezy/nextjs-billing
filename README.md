# Next.js Billing App with Lemon Squeezy

This Next.js demo app can be used as a base for building subscription-based SaaS apps.

Just clone this repo and build your app alongside the ready-made auth and billing.

Using the following stack:

- Framework - [Next.js 14](https://nextjs.org)
- Language - [TypeScript](https://www.typescriptlang.org)
- Billing - [Lemon Squeezy](https://lemonsqueezy.com)
- Auth (GitHub OAuth) - [Auth.js v5](https://authjs.dev)
- ORM - [Drizzle](https://orm.drizzle.team/)
- Styling - [Tailwind CSS](https://tailwindcss.com)
- Components -[Wedges](https://www.lemonsqueezy.com/wedges/docs)
- Serverless Postgres - [Neon](https://neon.tech/)
- Linting - [ESLint](https://eslint.org)
- Formatting - [Prettier](https://prettier.io)

This template uses the new Next.js App Router. This includes support for enhanced layouts, colocation of components, tests, and styles, component-level data fetching, and more.

Compatbile with Vercel Edge Functions and serverless deployments.

## Customer Portal vs Integrated Billing

Keep in mind that Lemon Squeezy has inbuilt [Customer Portal](https://www.lemonsqueezy.com/features/customer-portal) that covers all the features from this app and more.

Nonetheless, should you seek a billing solution more closely integrated with your SaaS platform, this template serves as a foundation for creating a seamless, integrated SaaS billing system.

## Prerequisites

### 1. Lemon Squeezy Account and Store

You need a Lemon Squeezy account and store. If you don't have one already, sign up at [Lemon Squeezy](https://app.lemonsqueezy.com/register).

### 2. Neon Account

This template uses Neon + Drizzle ORM for serverless Postgres, making it compatible with the Vercel Edge functions. If you don't have an account, you can sign up for free at [Neon](https://neon.tech/).

## Getting Started

### 1. Clone the Repo

Start by cloning this repo to your local machine and navigating into the directory.

### 2. Install Dependencies

Then, install the project dependencies:

```bash
pnpm install
```

### 3. Set Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then, fill in the environment variables:

```
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=

WEBHOOK_URL=

POSTGRES_URL=

AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

AUTH_SECRET=

AUTH_URL=

NEXT_PUBLIC_APP_URL=
```

#### Lemon Squeezy

Once you have created an account and store on Lemon Squeezy, make sure you're in **Test mode**, then go to [Settings > API](https://app.lemonsqueezy.com/settings/api) and create a new API key. Copy the key and paste it into `.env` file where it says `LEMONSQUEEZY_API_KEY=`.

You will also need the store ID from Lemon Squeezy for `LEMONSQUEEZY_STORE_ID`, which you can find in the list at [Settings > Stores](https://app.lemonsqueezy.com/settings/stores).

Finally, you will need to add a random webhook secret in `LEMONSQUEEZY_WEBHOOK_SECRET`. A webhook secret is a security key that ensures data received from a webhook is genuine and unaltered, safeguarding against unauthorized access.

#### Webhook URL

Your local app will need to be able to receive webhook events, which means creating a web-accessible URL for your development project.

This is not available when running your site on its local server without some sort of tunnel.

An easy way to set one up is using a service like [ngrok](https://ngrok.com/) or an app like [LocalCan](https://www.localcan.com/).

Once you are provided a URL by these services, simply add that in your `.env` file where it says `WEBHOOK_URL=`.

#### Postgres URL

You can get the Postgres URL from your Neon account. For more information refer to the [Neon documentation](https://neon.tech/docs/connect/connect-from-any-app).

#### Auth

You will need to set up a GitHub OAuth app in order to obtain `GITHUB_SECRET` and `GITHUB_ID` to handle authentication.

Refer to the [GitHub documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) for setting up GitHub OAuth.

Once you have set up the OAuth app, you will need to add the `AUTH_GITHUB_SECRET` and `AUTH_GITHUB_ID` to your `.env` file.

Additionally, you need to add a random secret for `AUTH_SECRET` in your `.env` file. On Linux or macOS, you can generate a random secret using the following command:

```bash
openssl rand -hex 32
```

or go to https://generate-secret.now.sh/32 to generate a random secret.

Next, you need to provide the URL of your app in `AUTH_URL` in format `https://your-app-url.com/api/auth`. For local development, you can use `http://localhost:3000/api/auth`.

Finally, you will need to add the URL of your app in `NEXT_PUBLIC_APP_URL`. For example, `http://localhost:3000`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Set Up the Database

Run the following command to set up the database:

```bash
pnpm db:push
```

With Drizzle ORM, you can access the database with [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview). Run the following command to open Drizzle Studio:

```bash
pnpm db:studio
```

Go to https://local.drizzle.studio/ to access the database.

### 5. Run the Development Server

Start the development server:

```bash
pnpm dev
```

That's all, you're ready to go!

## How to set up Webhooks

**This is a required step.**

For your app to receive data from Lemon Squeezy, you need to set up webhooks in your Lemon Squeezy store at [Settings > Webhooks](https://app.lemonsqueezy.com/settings/webhooks).

**In the app we have provided an action (Setup webhook button) that demonstrates how you can create a webhook on Lemon Squeezy using the Lemon Squeezy SDK.**

When you create a webhook, you should check at least these two events:

- `subscription_created`
- `subscription_updated`

This app demo only processes these two events, but they are enough to get a billing system in place. You could, for example, extend the app to handle successful payment events to list invoices in your billing system (by subscribing to `subscription_payment_success`).

The webhook endpoint in your app is `/api/webhook`, which means if you are manually setting up the webhook, you need to append `/api/webook` to your webhook URL on Lemon Squeezy. For example, `https://your-app-url.com/api/webhook`

The server action for creating a webhook via SDK will do that automatically for you.

In the webhook form you need to add a signing secret. Add the same value you use in the form in the `LEMONSQUEEZY_WEBHOOK_SECRET` environment variable.

## Production

There are a few things to update in your code to go live.

You need to turn off the **Test mode** in your Lemon Squeezy store and add a new live mode API key. Add this API key as an environment variable in your live server, using the same name `LEMONSQUEEZY_API_KEY`. Your store ID remains the same in both test and live mode, so add that to your server environment variables, as you did for your development site.

You also need to create a new webhook in your live store. Make sure you add the signing secret into the `LEMONSQUEEZY_WEBHOOK_SECRET` variable on your server.
