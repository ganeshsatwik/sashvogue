import React from 'react';
import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div className="bg-white text-black font-sans min-h-screen overflow-x-hidden flex flex-col">

      {/* HERO SECTION - Fits in one screen */}
      <section className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between pt-6 pb-6" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* Top Massive Text */}
        <div className="text-center w-full shrink-0 flex items-center justify-center mb-6">
          <h1 className="text-[10vw] sm:text-[9vw] xl:text-[120px] leading-none tracking-tighter text-black uppercase whitespace-nowrap">
            <span className="font-normal">KNOW</span> <span className="font-black">SASHVOGUE</span>
          </h1>
        </div>

        {/* Content Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-end flex-grow">

          {/* Left Side Image */}
          <div className="w-full flex flex-col justify-end h-full">
            <img
              src="https://i.ibb.co/2LDvSbz/knowsashimg.jpg"
              alt="Models Left"
              className="w-full h-full max-h-[50vh] object-cover"
            />
          </div>

          {/* Center Main Image */}
          <div className="w-full flex justify-center h-full">
            <img
              src="https://i.ibb.co/zWD683jc/product3.jpg"
              alt="Main Model"
              className="w-full h-full max-h-[55vh] object-cover"
            />
          </div>

          {/* Right Text */}
          <div className="w-full flex flex-col justify-end space-y-4 h-full pb-4">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-black">
              Passion Beyond Borders
            </h2>
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              Fueled by a deep-rooted passion, SashVOGUE's journey reflects our fearless ambition to redefine modern fashion on a global scale. We bring quality, utility, and timeless garments directly to you.
            </p>
            <div className="pt-2">
              <img
                src="https://i.ibb.co/fzV1QYk5/knowsashimg2.jpg"
                alt="Right detail"
                className="w-[180px] h-[120px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-16 w-full">
        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-widest text-black text-center mb-12">Our Story</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="w-full h-full relative aspect-[4/5] sm:aspect-auto sm:h-[500px] overflow-hidden">
            <img
              src="https://i.ibb.co/4R3LX6tc/poster.jpg"
              alt="Our Story"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {/* Right Content */}
          <div className="flex flex-col space-y-6 md:pl-8">
            <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
              <p>
                SashVOGUE began with a simple idea: that everyday clothing should be exceptional. We noticed a gap in the market for garments that were both stylish and durable without the luxury markup. Our founders set out to source the best materials globally and partner with skilled artisans.
              </p>
              <p>
                Over the years, our small project blossomed into a worldwide movement. We remain dedicated to our core principles of transparency, sustainability, and unparalleled quality. Every piece we create is a testament to our ongoing pursuit of perfection and passion for innovative design.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
