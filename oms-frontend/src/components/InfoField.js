"use client";

export default function InfoField({ label, value, placeholder, name, onChange, disabled = true }) {
  return (
    <div className="mb-4 w-full">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-text">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value || ""}
        placeholder={placeholder || "—"}
        disabled={disabled}
        onChange={onChange}
        className="w-full rounded-xl border border-transparent bg-menu-fill px-4 py-3.5 text-sm text-primary-text outline-none transition-all focus:border-card-stroke focus:bg-white disabled:cursor-not-allowed disabled:bg-menu-fill disabled:text-primary-text"
      />
    </div>
  );
}
