"use client";

import { Edit2, Camera } from "lucide-react";

export default function ProfileCard({ profile, onAvatarChange }) {
  const handleCameraClick = () => {
    document.getElementById("profile-avatar-input")?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="py-6 w-full">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          {/* Avatar Container with Camera Icon */}
          <div className="relative h-24 w-24 flex-shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-24 w-24 rounded-[28px] object-cover border border-card-stroke"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-menu-fill text-2xl font-bold text-primary-button border border-card-stroke">
                {profile.initials}
              </div>
            )}
            
            {/* Hidden Input File */}
            <input
              id="profile-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Camera Overlay Badge */}
            <div 
              onClick={handleCameraClick}
              className="absolute bottom-0 right-0 translate-x-1 translate-y-1 flex h-7 w-7 items-center justify-center rounded-full border border-card-stroke bg-white text-secondary-text shadow-sm hover:text-primary-text cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary-text">
              {profile.fullName}
            </h3>
            <p className="mt-0.5 text-sm text-secondary-text">{profile.email || "—"}</p>
            <p className="mt-0.5 text-sm text-secondary-text">{profile.location || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
