'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function MarketplacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);

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
        'Buy and sell quality second-hand furniture such as tables, chairs, and shelves. Always check condition before purchasing.',
      avoid: ['Mattresses', 'Sofas and couches', 'Furniture with unpleasant odours'],
    },
    {
      name: 'Books & Magazines',
      description:
        'Explore pre-loved books, novels, and magazines. Perfect for readers who want to save money and reduce waste.',
      avoid: ['Books with missing pages', 'Water-damaged or mouldy books', 'Magazines with torn covers'],
    },
    {
      name: 'Clothes',
      description:
        'Shop gently used clothing at affordable prices. Look stylish while supporting sustainable fashion.',
      avoid: ['Undergarments or swimwear', 'Clothes with stains or tears', 'Foul-smelling garments'],
    },
    {
      name: 'Electronics',
      description:
        'Find budget-friendly electronics, from phones to laptops. Always test devices before purchase.',
      avoid: ['Devices with battery issues', 'Cracked screens or water damage', 'Missing original charger or parts'],
    },
  ];

  async function handleSellerClick() {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/get-seller-status/", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch seller status");

      const data = await res.json();

      if (data.message === "Seller Verified") {
        router.push("/market/sell");
      } else {
        setStatus(data.message);
        setOpen(true);
      }
    } catch (err) {
      console.error("Error checking seller status:", err);
      setStatus("Error checking status");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function requestSellerVerification() {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/request-seller-verification/", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("access"),
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to request verification: ${res.status}`);

      const data = await res.json();
      setStatus("✅ " + data.message);
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      console.error("Error requesting seller verification:", err);
      setStatus("❌ Error requesting verification");
    }
  }

  return (
    <main className="min-h-screen bg-green-50 text-green-900">

      {/* HERO SECTION */}
      <section className="h-screen flex items-center justify-center text-center px-6">
        <motion.div
          className="max-w-4xl bg-green-100/40 p-10 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
            Welcome to Trash2Cash
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-green-900/90">
            Give your old items a new life! Buy and sell pre-loved items easily, reduce waste, save money, and support a greener community.
          </p>
        </motion.div>
      </section>

      {/* BUYER & SELLER CALL TO ACTION */}
      <section className="py-24 flex flex-col items-center justify-center space-y-12 px-6">
        <motion.div
          className="max-w-6xl text-center space-y-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-extrabold">Get Involved</h2>
          <p className="text-xl text-green-900/80 max-w-3xl mx-auto">
            Whether you're decluttering or hunting for deals, join a community committed to sustainability and reuse.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full px-4">
            {/* Buyer Card */}
            <Card className="bg-green-100 hover:scale-[1.03] transition-transform duration-300 shadow-2xl">
              <CardContent className="p-6 space-y-4 text-center">
                <div className="text-4xl">🛍️</div>
                <h2 className="text-2xl font-bold">I'm a Buyer</h2>
                <p className="text-green-900/80">
                  Discover affordable pre-loved items and shop sustainably within your local community.
                </p>
                <Button asChild variant="trash2cash" size="lg" className="mt-2">
                  <Link href="/market/buy">Start Buying</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card className="bg-yellow-100 hover:scale-[1.03] transition-transform duration-300 shadow-2xl">
              <CardContent className="p-6 space-y-4 text-center">
                <div className="text-4xl">💰</div>
                <h2 className="text-2xl font-bold">I'm a Seller</h2>
                <p className="text-green-900/80">
                  Declutter your space and earn money by selling your pre-loved items safely and easily.
                </p>
                <Button
                  onClick={handleSellerClick}
                  variant="trash2cash"
                  size="lg"
                  className="mt-2"
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Start Selling"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* POPUP FOR SELLER STATUS */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seller Verification</DialogTitle>
            <DialogDescription>{status}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {status === "Not Verified" && (
              <Button onClick={requestSellerVerification}>Request Verification</Button>
            )}
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MARKETPLACE CATEGORIES */}
      <section className="py-24 px-6 w-full bg-green-50">
        <h2 className="text-6xl md:text-7xl font-bold text-center mb-14 text-green-900">
          What Do We Have
        </h2>

        <div className="flex flex-col gap-16 max-w-7xl mx-auto">
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              className={`flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden shadow-2xl bg-white/30 backdrop-blur-md ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <Image
                  src={`/market/market-${cat.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>

              <div className="w-full md:w-1/2 p-10 flex flex-col justify-center space-y-6 text-green-900">
                <h3 className="text-4xl md:text-5xl font-bold flex items-center gap-4">
                  <span className="text-5xl">{categoryIcons[cat.name]}</span>
                  {cat.name}
                </h3>

                <p className="text-lg md:text-xl leading-relaxed text-green-900/80">
                  {cat.description}
                </p>

                <div className="mt-4">
                  <p className="text-lg font-semibold text-green-700 mb-2">⚠️ Avoid:</p>
                  <ul className="list-disc list-inside pl-4 text-green-900/80 text-base md:text-lg space-y-1">
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

      {/* FOOTER */}
      <footer className="text-green-900 p-8 text-center">
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
