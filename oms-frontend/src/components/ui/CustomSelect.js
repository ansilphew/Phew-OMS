"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomSelect({
  options = [],
  placeholder = "Select an option",
  name,
  defaultValue = "",
  className = "",
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [openUpward, setOpenUpward] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    function updateDropdownPosition() {
      if (!isOpen || !buttonRef.current) {
        return;
      }

      const rect = buttonRef.current.getBoundingClientRect();
      const estimatedMenuHeight = Math.min(options.length * 52 + 16, 240);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setOpenUpward(spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow);
    }

    updateDropdownPosition();

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, options.length]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={selectedValue} /> : null}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent bg-menu-fill px-4 py-3.5 text-left text-sm outline-none transition-all ${
          selectedOption ? "text-primary-text font-medium" : "text-[#8d8d8d]"
        } ${isOpen ? "border-card-stroke bg-white" : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="#64748B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          className={`absolute left-0 right-0 z-20 max-h-55 overflow-hidden rounded-xl border border-[#eadcf2] bg-white shadow-[0_18px_40px_rgba(43,10,56,0.12)] ${
            openUpward ? "bottom-[calc(100%+12px)]" : "top-[calc(100%+12px)]"
          }`}
        >
          <ul className="max-h-55 overflow-y-auto py-1.5" role="listbox">
            {options.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedValue(option.value);
                      setIsOpen(false);
                      if (onChange) {
                        onChange(option.value);
                      }
                    }}
                    className={`flex w-full cursor-pointer items-center rounded-lg px-4 py-2.5 text-left text-[15px] transition ${
                      isSelected
                        ? "bg-[#f7effc] text-[#5f1a7b]"
                        : "text-slate-700 hover:bg-[#faf5fd] hover:text-[#5f1a7b]"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
