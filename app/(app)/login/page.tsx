'use client'

import { signIn } from "next-auth/react"

const handleSubmit = (event) => {
  event.preventDefault()
  signIn("email", { email: event.target.email.value })
}

export default function SignIn() {
  return (
    <div>
      <h1>Sign in with a magic link</h1>
      <form method="post" onSubmit={handleSubmit}>
        <label>
          Email address
          <input type="email" id="email" name="email" />
        </label>
        <button type="submit">Sign in with Email</button>
      </form>
    </div>
  )
}
