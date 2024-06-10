'use client';
import { Suspense } from 'react'
import Notes from '@/components/notes'

export default async  function Favor() {
  return (
    <Suspense>
      <Notes param='favor'/>
    </Suspense>
  )
}