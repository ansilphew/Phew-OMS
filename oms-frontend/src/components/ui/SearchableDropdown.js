"use client";

import { useState, useEffect, useRef } from "react";

export default function SearchableDropdown({
  options = [],
  placeholder = "Search and select...",
  value = "",
  onChange,
  className = "",
  name = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    } else {
      setSearchTerm("");
    }
  }, [value, selectedOption]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else {
          setSearchTerm("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  const filteredOptions = options.filter((o) =>
    (o.label || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm text-[#1a202c] placeholder:text-slate-400 outline-none focus:border-[#500072] focus:ring-1 focus:ring-[#500072]/20 transition"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg
          className={`h-4.5 w-4.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-40 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-[#eadcf2] bg-white py-1.5 shadow-[0_12px_30px_rgba(80,0,114,0.08)]">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (onChange) {
                    onChange(opt.value, opt);
                  }
                  setSearchTerm(opt.label);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#faf5fd] hover:text-[#5f1a7b] transition text-slate-700 font-medium"
              >
                {opt.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-slate-400 italic">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}
