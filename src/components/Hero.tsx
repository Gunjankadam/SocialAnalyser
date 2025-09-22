'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';

export default function Hero() {
    const router = useRouter();
  return (
    <section
      className="min-h-screen flex flex-col md:flex-row items-center justify-between px-8 py-24 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/directd.jpg')" }} // replace with your file name
    >

         {/* FULLSCREEN BLUR LAYER */}
  <div className="absolute inset-0 bg-black/30 backdrop-blur-[8px] z-0" />
      {/* Left Text Section */}
      <div className="md:w-1/2 space-y-6 text-white z-10">
     <div className="relative text-4xl font-extrabold text-white z-10">
  <span className="relative z-10">Unlock Insights<br /> From Social Channel</span>
  <span className="absolute top-1 left-1 z-0 text-black opacity-40">
    Unlock Insights<br /> From Social Channel
  </span>
</div>

<p className="relative mt-4 w-fit px-2 text-sm text-gray-300 z-10 leading-snug">
  <span className="relative z-10">
    Social media analytics for modern brands, agencies, and researchers — monitor trends, decode sentiment, and turn raw data into powerful stories.
  </span>

</p>

<div className="flex gap-4">
<InteractiveHoverButton
  type="button"
  onClick={() => router.push('/auth/signup')}
  className="text-black"
>
  Get Started
</InteractiveHoverButton>
</div>      
</div>

     <div className="hidden md:flex md:w-1/2 mt-10 md:mt-0 z-10 justify-end pr-8">
  <Image
    src="/hero.png"
    alt="Analytics Illustration"
    width={500}
    height={400}
    className="rounded-xl shadow-2xl"
  />
</div>

    </section>
  );
}
