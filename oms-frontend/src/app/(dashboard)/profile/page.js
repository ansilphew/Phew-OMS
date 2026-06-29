"use client";

import { useState, useEffect } from "react";
import ProfileCard from "@/components/ProfileCard";
import InfoField from "@/components/InfoField";
import SectionHeader from "@/components/SectionHeader";
import { getCurrentUser, updateUserProfile } from "@/lib/api";

const initialProfile = {
  fullName: "Rafeeque Palakkal",
  initials: "RP",
  jobTitle: "Chief Executive Officer",
  location: "Dubai, United Arab Emirates",
  email: "rafeeque@phew.agency",
  phone: "+91 98765 43210",
  company: "Phew Interactive LLP",
  department: "Executive",
  designation: "CEO",
  website: "https://www.phewinteractive.com/",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [personalForm, setPersonalForm] = useState(null);
  const [professionalForm, setProfessionalForm] = useState(null);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingProfessional, setSavingProfessional] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUser();
        const user = data.user;
        const initials = user.fullName
          ? user.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "U";

        const profileData = {
          fullName: user.fullName || "",
          initials,
          jobTitle: user.jobTitle || "",
          location: user.location || "",
          email: user.email || "",
          phone: user.phone || "",
          company: user.company || "",
          department: user.department || "",
          designation: user.designation || "",
          website: user.website || "",
          avatarUrl: user.avatarUrl || "",
        };

        setProfile(profileData);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setMessage({ type: "error", text: "Failed to load profile details." });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Personal Info Edit Functions
  const startEditingPersonal = () => {
    setPersonalForm({
      fullName: profile.fullName,
      location: profile.location,
      email: profile.email,
      phone: profile.phone,
    });
    setIsEditingPersonal(true);
    setMessage({ type: "", text: "" });
  };

  const cancelEditingPersonal = () => {
    setIsEditingPersonal(false);
    setPersonalForm(null);
  };

  const handlePersonalInputChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const savePersonal = async () => {
    setSavingPersonal(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        ...profile,
        ...personalForm,
      };

      const data = await updateUserProfile(payload);
      const user = data.user;
      
      const initials = user.fullName
        ? user.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "U";

      const updatedProfile = {
        ...profile,
        fullName: user.fullName || "",
        initials,
        location: user.location || "",
        email: user.email || "",
        phone: user.phone || "",
      };

      setProfile(updatedProfile);
      setIsEditingPersonal(false);
      setPersonalForm(null);
      setMessage({ type: "success", text: "Personal information updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Failed to update personal profile:", error);
      setMessage({ type: "error", text: error.message || "Failed to save personal changes." });
    } finally {
      setSavingPersonal(false);
    }
  };

  // Professional Info Edit Functions
  const startEditingProfessional = () => {
    setProfessionalForm({
      company: profile.company,
      jobTitle: profile.jobTitle,
      department: profile.department,
      designation: profile.designation,
      website: profile.website,
    });
    setIsEditingProfessional(true);
    setMessage({ type: "", text: "" });
  };

  const cancelEditingProfessional = () => {
    setIsEditingProfessional(false);
    setProfessionalForm(null);
  };

  const handleProfessionalInputChange = (e) => {
    const { name, value } = e.target;
    setProfessionalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfessional = async () => {
    setSavingProfessional(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        ...profile,
        ...professionalForm,
      };

      const data = await updateUserProfile(payload);
      const user = data.user;

      const updatedProfile = {
        ...profile,
        company: user.company || "",
        jobTitle: user.jobTitle || "",
        department: user.department || "",
        designation: user.designation || "",
        website: user.website || "",
      };

      setProfile(updatedProfile);
      setIsEditingProfessional(false);
      setProfessionalForm(null);
      setMessage({ type: "success", text: "Professional information updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Failed to update professional profile:", error);
      setMessage({ type: "error", text: error.message || "Failed to save professional changes." });
    } finally {
      setSavingProfessional(false);
    }
  };

  const handleAvatarChange = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Avatar image size exceeds 10MB limit." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setSavingPersonal(true);
      setMessage({ type: "", text: "" });
      try {
        const payload = {
          ...profile,
          avatarUrl: base64,
        };
        const data = await updateUserProfile(payload);
        const user = data.user;

        const initials = user.fullName
          ? user.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "U";

        setProfile({
          ...profile,
          avatarUrl: user.avatarUrl || "",
          initials,
        });

        setMessage({ type: "success", text: "Profile picture updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } catch (error) {
        console.error("Failed to update avatar:", error);
        setMessage({ type: "error", text: error.message || "Failed to update profile picture." });
      } finally {
        setSavingPersonal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#65008c]/20 border-t-[#65008c]" />
          <p className="text-sm text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentPersonal = isEditingPersonal ? personalForm : profile;
  const currentProfessional = isEditingProfessional ? professionalForm : profile;

  return (
    <div className="w-full py-6">
      {/* Header Title */}
      <div className="pb-5 border-b border-[#f0f0f0] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1f1f1f]">My Profile</h2>
        </div>
      </div>

      {message.text && (
        <div
          className={`mt-4 p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 space-y-8">
        <ProfileCard
          profile={profile}
          onAvatarChange={handleAvatarChange}
        />

        <div className="space-y-8">
          {/* Personal Information */}
          <div>
            <SectionHeader
              title="Personal Information"
              onEdit={startEditingPersonal}
              isEditing={isEditingPersonal}
              onSave={savePersonal}
              onCancel={cancelEditingPersonal}
            />

            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 mt-4">
              <InfoField
                label="Full Name"
                name="fullName"
                value={currentPersonal.fullName}
                onChange={handlePersonalInputChange}
                disabled={!isEditingPersonal || savingPersonal}
              />
              <InfoField
                label="Location"
                name="location"
                value={currentPersonal.location}
                onChange={handlePersonalInputChange}
                disabled={!isEditingPersonal || savingPersonal}
              />
              <InfoField
                label="Email Address"
                name="email"
                value={currentPersonal.email}
                onChange={handlePersonalInputChange}
                disabled={!isEditingPersonal || savingPersonal}
              />
              <InfoField
                label="Phone Number"
                name="phone"
                value={currentPersonal.phone}
                onChange={handlePersonalInputChange}
                disabled={!isEditingPersonal || savingPersonal}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <SectionHeader
              title="Professional Information"
              onEdit={startEditingProfessional}
              isEditing={isEditingProfessional}
              onSave={saveProfessional}
              onCancel={cancelEditingProfessional}
            />

            <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 mt-4">
              <InfoField
                label="Company"
                name="company"
                value={currentProfessional.company}
                onChange={handleProfessionalInputChange}
                disabled={!isEditingProfessional || savingProfessional}
              />
              <InfoField
                label="Job Title"
                name="jobTitle"
                value={currentProfessional.jobTitle}
                onChange={handleProfessionalInputChange}
                disabled={!isEditingProfessional || savingProfessional}
              />
              <InfoField
                label="Department"
                name="department"
                value={currentProfessional.department}
                onChange={handleProfessionalInputChange}
                disabled={!isEditingProfessional || savingProfessional}
              />
              <InfoField
                label="Designation"
                name="designation"
                value={currentProfessional.designation}
                onChange={handleProfessionalInputChange}
                disabled={!isEditingProfessional || savingProfessional}
              />
              <div className="md:col-span-2">
                <InfoField
                  label="Website"
                  name="website"
                  value={currentProfessional.website}
                  onChange={handleProfessionalInputChange}
                  disabled={!isEditingProfessional || savingProfessional}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
