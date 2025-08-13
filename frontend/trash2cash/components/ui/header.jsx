"use client";
import React from "react";

const Header = ({ title }) => {
  return (
    <div className="bg-emerald-700 text-white text-xl font-semibold px-6 py-4 rounded-t shadow-sm">
      {title}
    </div>
  );
};

export default Header;
