"use client";

import React, { useState, useEffect } from "react";
import ListingItemCard from '@/components/marketplace/ListingItemCard';
import MessageSellerDialog from '@/components/marketplace/MessageSellerDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ArrowDownUp, Filter } from 'lucide-react';

export default function BuyPage() {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const handleMessageSellerClick = async (listing) => {
    if (listing.seller_username) {
      setSelectedListing(listing);
      setIsMessageDialogOpen(true);
      return;
    }
    try {
      const res = await fetch(`http://trash2cashpersonal.onrender.com/api/users/${listing.seller}/`);
      const data = await res.json();
      setSelectedListing({
        ...listing,
        seller_username: data.username || "Unknown",
      });
      setIsMessageDialogOpen(true);
    } catch (err) {
      setSelectedListing({
        ...listing,
        seller_username: "Unknown",
      });
      setIsMessageDialogOpen(true);
    }
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCategoryEndpoint, setSelectedCategoryEndpoint] = useState("");

  const [selectedTime, setSelectedTime] = useState("Anytime");
  const [selectedPrice, setSelectedPrice] = useState("Any Price");

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);

  const [query, setQuery] = useState("");

  // Add sort state
  const [sortField, setSortField] = useState(null); // 'date' | 'price' | null
  const [sortOrder, setSortOrder] = useState(null); // 'asc' | 'desc' | null

  const categories = [
    { name: "All", endpoint: "" },
    { name: "Electronics", endpoint: "electronics" },
    { name: "Clothes", endpoint: "clothes" },
    { name: "Books & Magazines", endpoint: "books-magazines" },
    { name: "Furniture", endpoint: "furniture" },
    { name: "Miscellaneous", endpoint: "misc-items" }
  ];

  const timeFilters = [
    { name: "Anytime", days: null },
    { name: "Last 24 hours", days: 1 },
    { name: "Last 7 days", days: 7 },
    { name: "Last 30 days", days: 30 },
  ];

  const priceFilters = [
    { name: "Any Price", min: null, max: null },
    { name: "Low Price (0–50)", min: 0, max: 50 },
    { name: "Mid Range (51–200)", min: 51, max: 200 },
    { name: "High Price (201+)", min: 201, max: null },
  ];

  const handleChange = (e) => {
      setQuery(e.target.value);
    };

    const handleSearch = async (e) => {
      e.preventDefault()
      fetchItems(selectedCategoryEndpoint)
    }

  const fetchItems = async (categoryEndpoint = "", days = null, min = null, max = null) => {
    setLoading(true);
    let baseurl = categoryEndpoint
      ? `http://trash2cashpersonal.onrender.com/api/marketplace/${categoryEndpoint}/`
      : `http://trash2cashpersonal.onrender.com/api/marketplace/all-items/`;
    let url = query 
      ? baseurl + `?search=${query}&days=${days}&min=${min}&max=${max}`
      : baseurl + `?days=${days}&min=${min}&max=${max}`;

    const res = await fetch(url);
    let data = await res.json();

    // Filter out listings where the seller is the current user
    let currentUserId = null;
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          currentUserId = userObj.id;
        } catch {}
      }
    }
    if (currentUserId) {
      data = data.filter(item => String(item.seller) !== String(currentUserId));
    }

    // Apply frontend filtering for now
    if (days !== null) {
      const now = new Date();
      const cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

      data = data.filter(item => {
          if (!item.date) return false; // skip if missing date
          const itemDate = new Date(item.date);
          return itemDate.getTime() >= cutoff.getTime();
      });
    }

    if (min !== null) data = data.filter(item => item.price >= min);
    if (max !== null) data = data.filter(item => item.price <= max);

    setItems(data);
    setLoading(false);
  };

  const updateFilters = (newCategory = selectedCategory, newTime = selectedTime, newPrice = selectedPrice) => {
    const categoryEndpoint = categories.find(c => c.name === newCategory)?.endpoint || "";
    setSelectedCategoryEndpoint(categoryEndpoint)
    const days = timeFilters.find(t => t.name === newTime)?.days || null;
    const priceObj = priceFilters.find(p => p.name === newPrice) || {};
    fetchItems(categoryEndpoint, days, priceObj.min, priceObj.max);
  };

  useEffect(() => {
    updateFilters();
  }, []);

  return (
    <div className="bg-gradient-to-b from-green-100 to-white min-h-screen flex flex-col items-center py-10 px-4">
      {/* Search Bar */}
      <div className="py-2 w-full max-w-7xl flex gap-4 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-full">
          <Input
            type="text"
            placeholder="Search for items..."
            value={query}
            onChange={handleChange}
            className="flex-1 bg-white"
          />
          <Button type="submit" disabled={loading} variant="default">
            Search
          </Button>
        </form>
        {/* Category Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="size-4" />
              <span>Category</span>
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categories.slice(1).map(category => (
              <DropdownMenuCheckboxItem
                key={category.name}
                checked={selectedCategory === category.name}
                onCheckedChange={() => {
                  setSelectedCategory(category.name);
                  updateFilters(category.name, selectedTime, selectedPrice);
                }}
              >
                {category.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem className="text-red-600" onClick={() => {
              setSelectedCategory('All');
              updateFilters('All', selectedTime, selectedPrice);
            }}>
              Reset Filter
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Time Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="size-4" />
              <span>Date</span>
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {timeFilters.slice(1).map(time => (
              <DropdownMenuCheckboxItem
                key={time.name}
                checked={selectedTime === time.name}
                onCheckedChange={() => {
                  setSelectedTime(time.name);
                  updateFilters(selectedCategory, time.name, selectedPrice);
                }}
              >
                {time.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem className="text-red-600" onClick={() => {
              setSelectedTime('Anytime');
              updateFilters(selectedCategory, 'Anytime', selectedPrice);
            }}>
              Reset Filter
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Price Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="size-4" />
              <span>Price</span>
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {priceFilters.slice(1).map(price => (
              <DropdownMenuCheckboxItem
                key={price.name}
                checked={selectedPrice === price.name}
                onCheckedChange={() => {
                  setSelectedPrice(price.name);
                  updateFilters(selectedCategory, selectedTime, price.name);
                }}
              >
                {price.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem className="text-red-600" onClick={() => {
              setSelectedPrice('Any Price');
              updateFilters(selectedCategory, selectedTime, 'Any Price');
            }}>
              Reset Filter
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowDownUp className="size-4" />
              <span>Sort By</span>
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={sortField === 'date'}
              onCheckedChange={(checked) => {
                setSortField(checked ? 'date' : null);
                setSortOrder(checked ? sortOrder : null);
              }}
            >
              Date
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortField === 'price'}
              onCheckedChange={(checked) => {
                setSortField(checked ? 'price' : null);
                setSortOrder(checked ? sortOrder : null);
              }}
            >
              Price
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={sortOrder === 'asc'}
              onCheckedChange={() => setSortOrder('asc')}
              disabled={!sortField}
            >
              Ascending
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={sortOrder === 'desc'}
              onCheckedChange={() => setSortOrder('desc')}
              disabled={!sortField}
            >
              Descending
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Recommended Title */}
      <h1 className="text-3xl font-bold mb-6 mt-2 self-start w-full max-w-7xl">
        Recommended for You
      </h1>

      {/* Loading State */}
      {loading && <p className="text-lg text-gray-500">Loading items...</p>}

      {/* Grid View */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl">
          {items
            .slice() // copy array
            .sort((a, b) => {
              if (!sortField) return 0;
              if (sortField === 'date') {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
              }
              if (sortField === 'price') {
                return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
              }
              return 0;
            })
            .map((item, idx) => (
              <ListingItemCard
                key={`${item.id ?? idx}-${idx}`}
                listing={{
                  ...item,
                  seller_username: item.seller_username || item.seller?.username || "Unknown",
                  images: Array.isArray(item.images)
                    ? item.images.map(img =>
                        img.startsWith("http") ? img : `http://trash2cashpersonal.onrender.com/${img}`
                      )
                    : item.images
                    ? [`http://trash2cashpersonal.onrender.com/${item.images}`]
                    : [],
                }}
                onMessageSellerClick={() => handleMessageSellerClick({
                  ...item,
                  images: Array.isArray(item.images)
                    ? item.images.map(img =>
                        img.startsWith("http") ? img : `http://trash2cashpersonal.onrender.com/${img}`
                      )
                    : item.images
                    ? [`http://trash2cashpersonal.onrender.com/${item.images}`]
                    : [],
                })}
              />
            ))
          }
        </div>
      )}
      <MessageSellerDialog
        listing={selectedListing}
        isOpen={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
      />
    </div>
  );
}