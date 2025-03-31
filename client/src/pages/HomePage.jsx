import React, { Suspense } from 'react'
import { TypewriterEffectSmoothDemo } from '../components/TypewriterEffect'
import { HomePageLoader } from '../components/layout/Loaders'

const HomePage = () => {
  return (
    <div className='bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] h-screen'>
      <Suspense fallback={<HomePageLoader />}>
        <TypewriterEffectSmoothDemo />
      </Suspense>
    </div>
  )
}

export default HomePage