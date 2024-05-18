import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function Navbar() {
    return(
    <div className="md:sticky md:top-0 md:z-50 md:flex md:items-center md:justify-between md:w-full md:h-12 md:p-2 md:shrink-0 md:bg-gradient-to-b md:from-background/10 md:via-background/50 md:to-background/80 md:backdrop-blur-xl fixed bottom-0 z-50 w-full bg-gradient-to-t from-background/10 via-background/50 to-background/80 p-2 backdrop-blur-xl flex items-center justify-between">
    <ThemeToggle />
    <nav className='max-w-xs mx-auto flex gap-4'>
        <Link href='/'>HOME</Link>
        <Link href='/'>FAVOR</Link>
        <Link href='/'>WORKS</Link>
        <Link href='/profile'>MY</Link>
    </nav>
    </div>
    )
}
