"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GlassPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-lg font-bold mb-4 hover:text-green-700"
      >
        ←
      </button>

      {/* Title + Icon */}
      <div className="bg-green-200 rounded-lg p-4 flex items-center gap-4 mb-6">
        <Image src="/icons/glass.png" alt="Glass" width={40} height={40} />
        <h1 className="text-2xl font-bold">GLASS</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg p-6 shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* YES / NO Section */}
        <div>
          <h2 className="font-bold text-green-600 mb-2">YES:</h2>
          <ul className="list-disc pl-6 text-gray-800 space-y-1">
            <li>Glass jars and bottles (clear, brown, green)</li>
          </ul>

          <h2 className="font-bold text-red-600 mt-6 mb-2">NO:</h2>
          <ul className="list-disc pl-6 text-gray-800 space-y-1">
            <li>Pyrex or ceramic</li>
            <li>Mirrors or light bulbs</li>
          </ul>
        </div>

        {/* Resin Code / Common Items */}
        <div>
          <h2 className="font-bold mb-2">GLASS TYPES</h2>
          <p className="text-sm italic mb-4">Clear, Brown, Green</p>

          <h3 className="font-bold text-gray-700 mb-1">COMMON ITEMS:</h3>
          <ul className="space-y-1 uppercase text-sm text-gray-800 tracking-wide">
            <li>Food Storage Jars</li>
            <li>Wine Bottles</li>
            <li>Beer Bottles</li>
            <li>Glass Beverage Products</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
