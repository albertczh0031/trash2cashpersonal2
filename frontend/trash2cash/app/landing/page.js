"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaRecycle, FaMapMarkerAlt, FaHandHoldingUsd, FaChartLine,FaGift } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import EnvWaste from "@/components/ui/enviromental-waste";
import { Button } from "@/components/ui/button";


const services = [
  {
    icon: (
      <motion.div
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaRecycle className="text-green-700 text-4xl" />
      </motion.div>
    ),
    title: "Item Identification & Categorization",
    description:
      "Easily scan and categorize your waste items with AI assistance to ensure proper recycling.",
  },
  {
    icon: (
      <motion.div
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaMapMarkerAlt className="text-green-700 text-4xl" />
      </motion.div>
    ),
    title: "Recycling Points Locator",
    description:
      "Discover nearby recycling centers and drop-off points quickly and conveniently.",
  },
 {
    icon: (
      <motion.div
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaGift className="text-green-700 text-4xl" />
      </motion.div>
    ),
    title: "Reward & Incentive System",
    description:
      "Earn points, discounts, or even cash for every recyclable you process responsibly.",
  },
  {
    icon: (
      <motion.div
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaHandHoldingUsd className="text-green-700 text-4xl" />
      </motion.div>
    ),
    title: "Trash2Cash Marketplace",
    description:
      "Convert your recyclables into rewards by trading them through our marketplace.",
  },
  {
    icon: (
      <motion.div
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaChartLine className="text-green-700 text-4xl" />
      </motion.div>
    ),
    title: "Environmental Impact Tracker",
    description:
      "Track your recycling habits and view your positive contributions to the environment.",
  },
];


const howWeCompare = [
  { title: "Faster Pickup", description: "We respond within 24 hours." },
  { title: "Eco-Verified Partners", description: "All recycling partners meet green standards." },
  { title: "Transparent Pricing", description: "No hidden fees — ever." },
  { title: "App Tracking", description: "Track your recycling in real-time." },
  { title: "Reward Points", description: "Earn points for every item recycled." },
];

const leaves = Array.from({ length: 10 });

export default function LandingPage() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    document.body.style.overflowX = "hidden";

    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-green-100 to-white min-h-screen text-gray-800">
      {/* Animated Floating Leaves */}
      {windowSize.width > 0 &&
        leaves.map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-[-100px] text-green-400 text-3xl select-none"
            initial={{
              x: Math.random() * windowSize.width,
              y: -100,
              opacity: 0,
            }}
            animate={{
              y: [-100, windowSize.height + 100],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              repeat: Infinity,
              duration: 20 + Math.random() * 10,
              ease: "linear",
              delay: i * 1.5,
            }}
          >
            🍃
          </motion.div>
        ))}

      {/* Hero Section */}
      <div className="text-center pt-36 px-6 md:px-16 z-10 relative">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-green-800 leading-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Turning Trash into Treasure
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Trash2Cash connects individuals, businesses, and recycling centers to make recycling rewarding, trackable, and easy for everyone.
        </motion.p>
      </div>

            {/* Services Section */}
        <div className="mt-24 px-6 md:px-16 z-10 relative">

        {/* Lottie animation inserted here */}
        <EnvWaste />

        {/* Title */}
        <h2 className="text-4xl font-bold text-green-700 text-center mb-12">
            Our Core Services
        </h2>

        {[0, 3].map((startIndex) => (
            <div
            key={startIndex}
            className="flex justify-center flex-wrap gap-8 mb-10"
            >
            {services.slice(startIndex, startIndex + 3).map((service, index) => (
                <Card
                key={index}
                className="w-full max-w-sm rounded-2xl border-2 border-green-100 shadow-md hover:shadow-xl transition"
                >
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="mb-4">{service.icon}</div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                    {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm font-medium">
                    {service.description}
                    </p>
                </CardContent>
                </Card>
            ))}
            </div>
        ))}
        </div>

      {/* How We Compare Section */}
      <div className="mt-24 px-6 md:px-16 z-10 relative">
        <h2 className="text-4xl font-bold text-green-700 text-center mb-12">How We Compare</h2>
        {[0, 3].map((startIndex) => (
          <div
            key={startIndex}
            className="flex justify-center flex-wrap gap-8 mb-10"
          >
            {howWeCompare.slice(startIndex, startIndex + 3).map((item, index) => (
              <Card
                key={index}
                className="w-full max-w-sm rounded-2xl border-2 border-green-100 shadow-md hover:shadow-xl transition"
              >
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-medium">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-24 text-center py-10 text-sm text-gray-600 z-10 relative">
        © {new Date().getFullYear()} Trash2Cash. Empowering a Greener Future.
      </footer>

    <Link href="/auth/login">
    <Button variant="floating" size="xl">
        RECYCLE NOW
    </Button>
    </Link>
    </div>
  );
}
