"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/rewards/animated-tabs';
import { Progress } from '@/components/ui/progress';
import VoucherItem from './VoucherItem';
import { Card, CardContent } from '@/components/ui/card';

const VOUCHER_API = 'http://127.0.0.1:8000/api/rewards/get-voucher-instance/';
const TIER_PRIORITY = { Bronze: 1, Silver: 2, Gold: 3, Platinum: 4 };
const TABS = { POINTS: 'points', UNREDEEMED: 'unredeemed', REDEEMED: 'redeemed' };

export default function RewardsPage() {
  const [vouchers, setVouchers] = useState([]);
  const [user, setUser] = useState({
    name: 'User',
    tier: 'Bronze',
    points: 0,
    expiring_points: null,
    expiry_date: null,
    tier_thresholds: {}
  });
  const [activeTab, setActiveTab] = useState(TABS.POINTS);

  useEffect(() => {
    const fetchVouchers = async () => {
      let access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      const tryFetch = async (token) => {
        const res = await fetch(VOUCHER_API, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("STATUS", res.status);
        const text = await res.text();
        console.log("Raw response body:", text);

        if (!res.ok) throw new Error("Failed to fetch vouchers");
        return JSON.parse(text);
      };

      try {
        const data = await tryFetch(access);
        setUser({
          name: data.username,
          tier: data.tier,
          points: data.points,
          expiring_points: data.expiring_points,
          expiry_date: data.expiry_date,
          tier_thresholds: data.tier_thresholds,
          current_tier_threshold: data.current_tier_threshold,
          next_tier: data.next_tier,
          next_tier_threshold: data.next_tier_threshold,
        });
        setVouchers(data.rewards || []);
      } catch (error) {
        console.warn("Access token might be expired, trying to refresh...");

        try {
          const refreshRes = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh }),
          });

          if (!refreshRes.ok) throw new Error("Failed to refresh token");

          const refreshData = await refreshRes.json();
          access = refreshData.access;
          localStorage.setItem("access", access);

          const data = await tryFetch(access);
          setUser({
            name: data.username,
            tier: data.tier,
            points: data.points,
            expiring_points: data.expiring_points,
            expiry_date: data.expiry_date,
            tier_thresholds: data.tier_thresholds,
            current_tier_threshold: data.current_tier_threshold,
            next_tier: data.next_tier,
            next_tier_threshold: data.next_tier_threshold,
          });
          setVouchers(data.rewards || []);
        } catch (refreshError) {
          console.error("Token refresh failed or second fetch failed:", refreshError);
        }
      }
    };

    fetchVouchers();
  }, []);


  const tierThresholds = user.tier_thresholds;
  const currentThreshold = tierThresholds[user.tier] ?? 0;

  let sortedTiers = [];
  let nextTier = null;
  let nextThreshold = null;
  if (tierThresholds && Object.keys(tierThresholds).length > 0) {
    sortedTiers = Object.entries(tierThresholds)
      .sort(([, a], [, b]) => a - b)
      .map(([tier]) => tier);

    const currentIndex = sortedTiers.indexOf(user.tier);

    if (currentIndex !== -1 && currentIndex < sortedTiers.length - 1) {
      nextTier = sortedTiers[currentIndex + 1];
      nextThreshold = tierThresholds[nextTier];
    }
  }

  const isEligible = (voucherTier) => {
    const currentTier = user?.tier?.charAt(0).toUpperCase() + user?.tier?.slice(1).toLowerCase();
    return TIER_PRIORITY[currentTier] >= voucherTier; 
  };

  const eligibleVouchers = vouchers.filter((v) =>
    isEligible(v.voucher.required_tier)
  );

  const unredeemed = eligibleVouchers.filter((v) => {
  const expiry = new Date(v.voucher.expiration_date);
  const today = new Date();

    return !v.redeemed && expiry >= today;});
  const redeemed = eligibleVouchers.filter((v) => v.redeemed);

  const TIER_IMAGES = {
  Bronze: '/voucher_images/bronze-big.png',
  Silver: '/voucher_images/silver-big.png',
  Gold: '/voucher_images/gold-big.png',
  Platinum: '/voucher_images/platinum-big.png',
};

  // Calculate progress percentage for the progress bar
  const progressPercent = nextThreshold
    ? (user.points / nextThreshold) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <Card className="bg-gradient-to-bl from-green-100 to-green-200  shadow-md w-full rounded-none">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold">Welcome {user.name}</h1>
          <p className="text-xl">Current Tier: {user.tier}</p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="">
          <TabsList className="bg-green-200">
            <TabsTrigger value={TABS.POINTS}>Points</TabsTrigger>
            <TabsTrigger value={TABS.UNREDEEMED}>Available Rewards</TabsTrigger>
            <TabsTrigger value={TABS.REDEEMED}>Redeemed Rewards</TabsTrigger>
          </TabsList>

          {/* Points Tab */}
          <TabsContent value={TABS.POINTS}>
            <div className="p-2">
              {/* Points Info: All are hardcoded currently */}
              <div>
                <div className="flex ">
                  <div className=''>
                    <p className="text-2xl font-bold mb-2">Available Points: </p>
                      <p className='text-4xl mb-2'>{user.points}</p>
                        <p className="text-md text-gray-500">
                          Expiring: {user.expiring_points ?? '—'} points
                        </p>
                        <p className="text-md text-gray-500">
                          By: {user.expiry_date ? new Date(user.expiry_date).toLocaleDateString() : '—'}
                        </p>
                  </div>
                  {/* Tier Badge above progress bar, to the right of points */}
                  <div className="flex items-center justify-center w-full">
                    <img
                      src={TIER_IMAGES[user.tier]}
                      alt={`${user.tier} Tier`}
                      className="w-48 h-48 mb-2"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2 mt-2">
                <span className="text-md">
                  Points Required to Maintain Tier: {currentThreshold ?? '—'}
                </span>
                <span className="text-md">
                  {nextThreshold !== null
                    ? `Points Required for ${nextTier} Tier: ${nextThreshold - user.points}`
                    : "No next tier available or tier data missing."}
                </span>
                </div>
                <Progress value={progressPercent} className="h-4" />
              </div>
            </div>
          </TabsContent>

          {/* Active Rewards Tab */}
          <TabsContent value={TABS.UNREDEEMED}>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 mt-6">
              {unredeemed && unredeemed.length > 0 ? (unredeemed.map((voucher) => (
                <VoucherItem key={voucher.id} voucher={voucher} />
              ))): (
                  <p>You do not have any rewards!</p>
              )}
            </div>
          </TabsContent>

          {/* Redeemed Rewards Tab */}
          <TabsContent value={TABS.REDEEMED}>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 mt-6">
              {redeemed && redeemed.length > 0 ? (redeemed.map((voucher) => (
                <VoucherItem key={voucher.id} voucher={voucher} />
              ))) : (
                  <p>You have not redeemed any rewards!</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
