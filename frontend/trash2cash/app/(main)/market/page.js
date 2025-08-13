'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import Link from "next/link";


export default function MarketplacePage() {
  const categoryIcons = {
  'Furniture': '🪑',
  'Books & Magazines': '📚',
  'Clothes': '👕',
  'Electronics': '📱',
};

  const categories = [
    {
      name: 'Furniture',
      description:
        'Buy and sell second-hand furniture like tables, chairs, bookshelves. Ensure cleanliness and durability before purchase.',
      avoid: ['Mattresses', 'Sofas and couches', 'Furniture with unpleasant odours'],
    },
    {
      name: 'Books & Magazines',
      description:
        'Browse collections of pre-loved books, novels, and magazines. Great for readers looking to save and recycle.',
      avoid: ['Books with missing pages', 'Water-damaged or mouldy books', 'Magazines with torn covers'],
    },
    {
      name: 'Clothes',
      description:
        'Shop affordable used clothes, from casual wear to fashion pieces. Only buy clean and gently used items.',
      avoid: ['Undergarments or swimwear', 'Clothes with stains or tears', 'Foul-smelling garments'],
    },
    {
      name: 'Electronics',
      description:
        'Find budget electronics like phones, laptops, and accessories. Always test before purchasing.',
      avoid: ['Devices with battery issues', 'Cracked screens or water damage', 'Missing original charger or parts'],
    },
  ];

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{ backgroundImage: "url('/marketBackground.jpeg')" }}
    >
{/* SECTION 0: Introduction */}
<section className="h-screen flex items-center justify-center text-center px-6 bg-transparent">
  <motion.div
    className="max-w-4xl bg-black/40 p-10 rounded-2xl"
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6">
      Welcome to Trash2Cash
    </h1>
    <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
      Give new life to old things. Buy and sell pre-loved items with ease — reduce waste, save money, and support a greener future.
    </p>
  </motion.div>
</section>

      {/* SECTION 1: LEFT TEXT */}
      <section className="h-screen flex items-center justify-start px-16">
        <motion.div
          className="max-w-md p-6 bg-black/60 rounded-xl"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
<h1 className="text-5xl font-bold mb-4">
  Buy & Sell Sustainably
</h1>
<p className="text-lg text-white/90 leading-relaxed">
  Trade second-hand goods within your local community. Reduce waste, save money, and support a greener future.
</p>
        </motion.div>
      </section>

      {/* SECTION 2: RIGHT TEXT */}
      <section className="h-screen flex items-center justify-end px-16">
        <motion.div
          className="max-w-md p-6 bg-black/60 rounded-xl"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
<h1 className="text-5xl font-bold mb-4">
  Give Items a Second Life
</h1>
<p className="text-lg text-white/90 leading-relaxed">
  From furniture to fashion, find great deals or sell what you no longer need — all while helping the planet.
</p>
        </motion.div>
      </section>

      {/* SECTION 3: Buyer/Seller Call to Action */}
<section className="relative h-screen flex items-center justify-center px-6">
  <motion.div
    className="absolute inset-0 bg-black/30"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1 }}
  />

  <motion.div
    className="relative z-10 flex flex-col items-center max-w-6xl text-center space-y-12"
    initial={{ opacity: 0, y: 100 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    viewport={{ once: true }}
  >
    <div className="space-y-4">
      <h2 className="text-5xl font-extrabold text-white">Get Involved</h2>
      <p className="text-white/90 text-xl max-w-3xl">
        Whether you&apos;re clearing out your space or hunting for a great deal, join a community making a difference through reuse and sustainability.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full px-4">
      <Card className="bg-gradient-to-br from-green-100 to-white hover:scale-[1.02] transition-transform duration-300 shadow-md">
        <CardContent className="p-6 space-y-4 text-center">
          <div className="text-4xl">🛍️</div>
          <h2 className="text-2xl font-bold">I&apos;m a Buyer</h2>
          <p className="text-muted-foreground">
            Discover affordable, pre-loved items and shop sustainably from local sellers.
          </p>
          <Button asChild variant="trash2cash" size="lg" className="mt-2">
            <Link href="/market/buy">Start Buying</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-100 to-white hover:scale-[1.02] transition-transform duration-300 shadow-md">
        <CardContent className="p-6 space-y-4 text-center">
          <div className="text-4xl">💰</div>
          <h2 className="text-2xl font-bold">I&apos;m a Seller</h2>
          <p className="text-muted-foreground">
            Declutter your space and earn extra income by selling your unused items.
          </p>
          <Button asChild variant="trash2cash" size="lg" className="mt-2">
            <Link href="/market/sell">Start Selling</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  </motion.div>
</section>


      {/* SECTION 4: Marketplace Categories */}
<section className="py-24 px-6 w-full">
  <h2 className="text-7xl font-bold text-center mb-14 text-white">What Do We Have</h2>

  <div className="flex flex-col gap-16">
    {categories.map((cat, index) => (
      <motion.div
        key={index}
        className={`flex flex-col md:flex-row items-stretch w-full rounded-2xl overflow-hidden shadow-xl ${
          index % 2 === 1 ? 'md:flex-row-reverse' : ''
        }`}
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        {/* Image Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative">
          <Image
            src={`/market/market-${cat.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
            alt={cat.name}
            width={800}
            height={500}
            className="w-full h-full object-cover rounded-none"
            priority={index === 0}
          />
        </div>

        {/* Text Section with static glassmorphism */}
        <div className="w-full md:w-1/2 bg-white/10 backdrop-blur-lg border border-white/20 text-white p-10 flex flex-col justify-center space-y-6">
          <h3 className="text-5xl md:text-6xl font-bold flex items-center gap-4">
            <span className="text-6xl">{categoryIcons[cat.name]}</span>
            {cat.name}
          </h3>

          <p className="text-lg md:text-2xl leading-relaxed text-white/90">
            {cat.description}
          </p>

          <div className="mt-4">
            <p className="text-xl font-semibold text-green-100/90 mb-2">⚠️ Avoid:</p>
            <ul className="list-disc list-inside pl-4 text-white/90 text-base md:text-lg space-y-1">
              {cat.avoid.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
</section>


      <footer className=" text-white p-8 text-center">
  <p>© 2025 Trash2Cash. All rights reserved.</p>
  <div className="flex justify-center gap-4 mt-4">
    <a href="#" className="hover:underline">Privacy</a>
    <a href="#" className="hover:underline">Terms</a>
    <a href="#" className="hover:underline">Contact</a>
  </div>
</footer>

    </main>
  );
}
