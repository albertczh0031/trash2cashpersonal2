"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PlasticPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="text-lg font-bold mb-4 hover:text-green-700"
      >
        ←
      </button>

      <div className="bg-green-200 rounded-lg p-4 flex items-center gap-4 mb-6">
        <Image
          src="/icons/plastic-bottles.png"
          alt="Plastic"
          width={40}
          height={40}
        />
        <h1 className="text-2xl font-bold">PLASTIC</h1>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-bold text-green-600 mb-2">YES:</h2>
          <ul className="list-disc pl-6 text-gray-800 space-y-1">
            <li>Plastic bottles and containers coded #1–#7</li>
            <li>Six or twelve pack rings</li>
          </ul>

          <h2 className="font-bold text-red-600 mt-6 mb-2">NO:</h2>
          <ul className="list-disc pl-6 text-gray-800 space-y-1">
            <li>Plastic bags and film</li>
            <li>Electronic items</li>
            <li>Hazardous chemical containers</li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold mb-2">PET</h2>
          <p className="text-sm italic mb-4">Polyethylene Terephthalate</p>

          <h3 className="font-bold text-gray-700 mb-1">COMMON ITEMS:</h3>
          <ul className="space-y-1 uppercase text-sm text-gray-800 tracking-wide">
            <li>Cosmetic Containers</li>
            <li>Plastic Bottles</li>
            <li>Mouthwash Bottles</li>
            <li>Prepared Food Trays</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
