import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center py-4">
      <Link href="/billing">Go to the Billing page &rarr;</Link>
    </div>
  )
}
