"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import Image from "next/image";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pull item from query params
  const item = {
    id: searchParams.get("id"),
    title: searchParams.get("title") || "Unknown Item",
    price: searchParams.get("price") || 0,
    image: searchParams.get("image") || "/logo.png",
  };

  // Payment state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [fpxBank, setFpxBank] = useState("");
  const [ewallet, setEwallet] = useState("");

  const banks = ["Maybank", "CIMB", "Public Bank", "RHB", "Hong Leong"];
  const ewallets = ["GrabPay", "Touch'n Go", "ShopeePay", "Boost"];

  const validateCard = () => {
    if (!name.trim()) return "Cardholder name is required.";
    if (!/^[0-9]{13,16}$/.test(cardNumber)) return "Card number must be 13-16 digits.";
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) return "Expiry must be in MM/YY format.";
    if (!/^[0-9]{3,4}$/.test(cvc)) return "CVC must be 3 or 4 digits.";
    const [mm, yy] = expiry.split("/").map(Number);
    const expDate = new Date(2000 + yy, mm - 1, 1);
    expDate.setMonth(expDate.getMonth() + 1);
    if (expDate <= new Date()) return "Card has expired.";
    return null;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    if (method === "card") {
      const err = validateCard();
      if (err) {
        setError(err);
        return;
      }
    } else if (method === "fpx") {
      if (!fpxBank) {
        setError("Please select a bank for FPX payment.");
        return;
      }
    } else if (method === "ewallet") {
      if (!ewallet) {
        setError("Please select an e-wallet provider.");
        return;
      }
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowDialog(true);
    }, 1400);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg border-2 border-green-200">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-3xl font-bold text-green-800">Make Your Payment</CardTitle>
          <p className="text-muted-foreground text-lg mb-2">Complete your purchase with confidence</p>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start mb-4">
            {/* Item Preview */}
            <div className="flex flex-col items-center md:w-1/3 w-full mt-2">
              <div className="w-40 h-40 relative rounded-xl overflow-hidden shadow">
                <Image src={item.image} alt={item.title} fill sizes="160px" className="object-cover" />
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-green-700 font-bold text-xl">RM{item.price}</p>
              </div>
            </div>

            {/* Payment Form */}
            <form className="flex flex-col gap-3 w-full md:w-2/3" onSubmit={handlePayment}>
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit / Debit Card</SelectItem>
                  <SelectItem value="fpx">FPX (Online Banking)</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>

              {method === "card" && (
                <>
                  <Input placeholder="Cardholder Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    maxLength={16}
                  />
                  <div className="flex gap-3">
                    <Input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} maxLength={5} />
                    <Input placeholder="CVC" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ""))} maxLength={4} />
                  </div>
                </>
              )}

              {method === "fpx" && (
                <>
                  <label className="text-sm font-medium">Choose Bank</label>
                  <Select value={fpxBank} onValueChange={setFpxBank}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {method === "ewallet" && (
                <>
                  <label className="text-sm font-medium">Choose E-Wallet</label>
                  <Select value={ewallet} onValueChange={setEwallet}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select e-wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {ewallets.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

              <div className="flex gap-3 mt-2">
                <Button type="submit" className="flex-1 bg-green-700 text-white" disabled={processing}>
                  {processing ? "Processing..." : `Pay RM${item.price}`}
                </Button>
                <Button variant="outline" onClick={() => router.push("/market/buy")}>Back</Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Successful!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-green-100 rounded-full p-4"
            >
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                <path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
            <p className="text-lg font-semibold text-green-700">Thank you for your purchase!</p>
            <p className="text-muted-foreground text-center">Your purchase is successful! The seller will be notified shortly.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => { setShowDialog(false); router.push('/market/buy'); }} className="w-full bg-green-700 text-white">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
