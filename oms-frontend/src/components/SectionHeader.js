"use client";

import { Edit2 } from "lucide-react";

export default function SectionHeader({ title, onEdit, isEditing, onSave, onCancel }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-base font-bold text-[#1f1f1f]">
        {title}
      </h3>

      {!isEditing ? (
        onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9a9a9a] transition hover:text-[#5f5f5f]"
          >
            <span>Edit</span>
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )
      ) : (
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm font-medium text-[#9a9a9a] hover:text-[#5f5f5f] transition"
            >
              Cancel
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="inline-flex items-center justify-center rounded-lg bg-[#65008c] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#520373]"
            >
              Save
            </button>
          )}
        </div>
      )}
    </div>
  );
}
