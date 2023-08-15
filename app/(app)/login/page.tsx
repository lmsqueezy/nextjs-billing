'use client'

import { signIn } from "next-auth/react"

const handleSubmit = (event) => {
  event.preventDefault()
  signIn("email", { email: event.target.email.value })
}

export default function SignIn() {
  return (
    <div className="max-w-xl mx-auto px-4">
      <h1 className="mb-4">Sign in with a magic link</h1>
      <form method="post" onSubmit={handleSubmit}>
        <label>
          Email address
          <input type="email" id="email" name="email" />
        </label>
        <button type="submit" className="rounded-md bg-grey-900 text-grey-50">Sign in with Email</button>
      </form>
    </div>
  )
}
