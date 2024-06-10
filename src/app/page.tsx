'use client';
import { Suspense } from 'react'
import Notes from '@/components/notes'

export default async  function Home() {
  return (
    <>
      <h1 className='h-[320px] background-image bg-opacity-20 pt-20 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white mx-auto'>
        Daily Post Inspiration<br /> A Helpful Social Media Copilot
      </h1>
    <Suspense>
      <Notes />
    </Suspense>
    </>
  )
}