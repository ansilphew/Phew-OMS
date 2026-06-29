"use client";

import React from "react";
import { Plus } from "lucide-react";

export default function FAB() {
  const handleClick = () => {
    // Reusable click handler or trigger action
    console.log("Floating Action Button Clicked");
  };

  return (


    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-[#3b0d58] text-white shadow-lg transition-all duration-300 hover:scale-107 hover:bg-[#2c0a42] hover:shadow-xl active:scale-95 cursor-pointer"
      aria-label="Add new item"
    >
    
    
      <Plus className="h-6 w-6 stroke-[2.5]" />
    </button>
  );
}
