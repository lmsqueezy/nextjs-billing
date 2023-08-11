export default function Verify() {
  return (
    <>
      <p>Magic link sent!</p>
      <p>Please check your email inbox for an email from <code>{process.env.NEXT_PUBLIC_EMAIL_FROM_DEFAULT}</code>.</p>
      <p>Return to <a href="/">Homepage</a></p>
    </>
  )
}
