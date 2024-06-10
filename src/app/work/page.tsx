'use client';
import { Suspense } from 'react'
import Notes from '@/components/notes'

export default async  function Works() {
  return (
    <Suspense>
      <Notes param='user'/>
    </Suspense>
  )
}