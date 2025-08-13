"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useState } from "react";

export default function RecyclingCentreEditModal({ initialData, onSave }) {
  // Initial states of form and saving stage
  const [formData, setFormData] = useState(initialData); // Initially set with the previous information
  const [saving, setSaving] = useState(false); // Initially no saves are made
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false); 

  // Fetch categories on mount
  useEffect(() => {
    fetch("https://trash2cashpersonal.onrender.com/api/categories/")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  // Handle checkbox change for categories
  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const current = prev.accepted_categories || [];
      return {
        ...prev,
        accepted_categories: current.includes(categoryId)
          ? current.filter((id) => id !== categoryId)
          : [...current, categoryId],
      };
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(
        `https://trash2cashpersonal.onrender.com/api/recycler/${initialData.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      onSave(updated);
      setOpen(false); 
    } catch (err) {
      alert("Failed to update the recycling center admin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Button that opens the modal dialog */}
      <DialogTrigger asChild>
        <Button variant="trash2cash">
          Edit
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            className="size-6 stroke-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </Button>
      </DialogTrigger>

      {/* Edit Modal Form Content */}
      <DialogContent>
        {/* Everything in the header */}
        <DialogHeader>
          <DialogTitle>Edit Recycling Centre</DialogTitle>
          <DialogDescription>
            Change your center admin details here.
          </DialogDescription>
        </DialogHeader>

        {/* Edit form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <span className="ml-2">Name: </span>
          <div className="pt-2">
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text"
            />
          </div>

          <span className="ml-2">Email: </span>
          <div className="pt-2">
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
            />
          </div>

          <span className="ml-2">Address: </span>
          <div className="pt-2">
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              type="text"
            />
          </div>

          <span className="ml-2">Operating Hours: </span>
          <div className="flex space-x-4 pt-2">
            <Input
              name="opening_time"
              value={formData.opening_time || ""}
              onChange={handleChange}
              type="time"
            />
            <p> ~ </p>
            <Input
              name="closing_time"
              value={formData.closing_time || ""}
              onChange={handleChange}
              type="time"
            />
          </div>

          {/* <span className="ml-2">Tags: </span>
          <div className="pt-2">
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              type="text"
            />
          </div> */}
          
          <span className="ml-2">Accepted Materials: </span>
          <div className="pt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.accepted_categories?.includes(cat.id)}
                  onChange={() => handleCategoryChange(cat.id)}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>          

          <DialogFooter>
            <Button
              variant="trash2cash"
              type="submit"
              disabled={saving}
              className="w-full"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
