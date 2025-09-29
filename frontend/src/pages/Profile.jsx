// src/pages/Profile.jsx

import { useEffect, useState } from "react";
import { fetchUserProfile, updateUserProfile } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

// --- PROFESSIONALIZED COMPONENTS ---

// 🌟 Updated Helper component for form inputs with enhanced styling
const ProfileInput = ({ name, label, value, type = "text", onChange, disabled = false, required = false }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            placeholder={label}
            value={value || ""}
            onChange={onChange}
            className={`border ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white border-gray-300'} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm text-sm`}
            disabled={disabled}
        />
    </div>
);

// 🌟 Component for displaying a single read-only profile field
const ProfileField = ({ label, value, isPrimary = false }) => (
    <div className="flex flex-col border-b border-gray-100 py-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`mt-1 ${isPrimary ? 'text-lg font-semibold text-blue-600' : 'text-base font-medium text-gray-900'}`}>
            {value || <span className="text-gray-400 italic">Not set</span>}
        </p>
    </div>
);

// --- MAIN COMPONENT ---

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null); // Success/Error message
    const [initialProfile, setInitialProfile] = useState(null); // To store original state for cancel

    // Fetch profile
    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setNotification(null);
            try {
                const data = await fetchUserProfile();
                // Ensure date is in YYYY-MM-DD format for input type="date"
                if (data.dob) {
                    data.dob = data.dob.split('T')[0];
                }
                setProfile(data);
                setInitialProfile(data); // Store initial data
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setProfile({});
                setNotification({ message: "Failed to load user profile data.", type: "error" });
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    // Handle input changes
    const handleChange = (e) =>
        setProfile({ ...profile, [e.target.name]: e.target.value });

    // Handle Save updates
    const handleSave = async () => {
        setSaving(true);
        setNotification(null);

        try {
            // Construct payload with fields expected by API
            const payload = {
                full_name: profile.full_name,
                phone_number: profile.phone_number,
                address: profile.address,
                dob: profile.dob,
                nationality: profile.nationality,
                city: profile.city,
                state: profile.state,
                country: profile.country,
            };

            const updatedData = await updateUserProfile(payload);

            // Re-format the DOB just in case the API returns a full datetime string
            if (updatedData.dob) {
                updatedData.dob = updatedData.dob.split('T')[0];
            }
            setProfile(updatedData);
            setInitialProfile(updatedData); // Update initial profile
            setNotification({ message: "Profile successfully updated. 🎉", type: "success" });
            setEditing(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
            setNotification({ message: err.detail || "Profile update failed. Please check your inputs.", type: "error" });
        } finally {
            setSaving(false);
            setTimeout(() => setNotification(null), 5000); // Clear notification
        }
    };
    
    // Handle Cancel (reverts changes)
    const handleCancel = () => {
        setProfile(initialProfile); // Revert to the original data
        setEditing(false);
        setNotification(null);
    };


    // --- Sub-Components (Cleaned up for professionalism) ---

    // Read-only view component
    const ProfileDisplay = () => (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Primary Details Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Account Credentials</h2>
                    <p className="text-sm text-gray-500">Immutable authentication details.</p>
                </div>
                {/* Edit Button */}
                <button
                    onClick={() => setEditing(true)}
                    className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition duration-200"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Edit Profile
                </button>
            </div>
            
            {/* Account Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 p-6">
                <div className="py-3 sm:py-0 sm:pr-4">
                    <ProfileField label="Username" value={user?.username} isPrimary={true} />
                </div>
                <div className="py-3 sm:py-0 sm:px-4">
                    <ProfileField label="Email Address" value={user?.email} isPrimary={true} />
                </div>
                <div className="py-3 sm:py-0 sm:pl-4">
                    <ProfileField label="Account Status" value="Verified" isPrimary={true} />
                </div>
            </div>

            {/* Personal Details Section */}
            <div className="p-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <ProfileField label="Full Name" value={profile.full_name} />
                    <ProfileField label="Phone Number" value={profile.phone_number} />
                    <ProfileField label="Date of Birth" value={profile.dob} />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Residential Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <ProfileField label="Country" value={profile.country} />
                    <ProfileField label="Nationality" value={profile.nationality} />
                    <ProfileField label="State/Province" value={profile.state} />
                    <ProfileField label="City" value={profile.city} />
                    <div className="md:col-span-3">
                        <ProfileField label="Street Address" value={profile.address} />
                    </div>
                </div>
            </div>

        </div>
    );

    // Editing view component
    const ProfileEditForm = () => (
        <div className="bg-white p-6 rounded-xl shadow-2xl border-t-4 border-blue-600">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Non-Editable Fields */}
                <ProfileInput name="username" label="Username (Non-editable)" value={user?.username} disabled={true} />
                <ProfileInput name="email" label="Email (Non-editable)" value={user?.email} disabled={true} />

                {/* Editable Fields */}
                <ProfileInput name="full_name" label="Full Name" value={profile.full_name} onChange={handleChange} required={true} />
                <ProfileInput name="phone_number" label="Phone Number" value={profile.phone_number} onChange={handleChange} />
                
                <ProfileInput name="dob" label="Date of Birth" value={profile.dob} type="date" onChange={handleChange} />
                <ProfileInput name="nationality" label="Nationality" value={profile.nationality} onChange={handleChange} />
                
                <ProfileInput name="country" label="Country" value={profile.country} onChange={handleChange} />
                <ProfileInput name="state" label="State/Province" value={profile.state} onChange={handleChange} />
                
                <ProfileInput name="city" label="City" value={profile.city} onChange={handleChange} />
                <div className="md:col-span-2">
                    <ProfileInput name="address" label="Street Address" value={profile.address} onChange={handleChange} />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                >
                    {saving ? "Saving Changes..." : "Save Changes"}
                </button>
                <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gray-200 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    const NotificationToast = () => {
        if (!notification) return null;
        const classes = notification.type === 'success' ? "bg-green-50 text-green-700 border-green-400" : "bg-red-50 text-red-700 border-red-400";

        return (
            <div className={`p-4 mb-6 border-l-4 rounded-lg font-medium ${classes} flex justify-between items-center shadow-sm`} role="alert">
                <p>{notification.message}</p>
                <button onClick={() => setNotification(null)} className="text-lg font-bold ml-4">
                    &times;
                </button>
            </div>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-lg text-gray-600">Loading profile data...</p>
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">User Profile Management</h1>
                <p className="text-lg text-gray-600">Review and update your authentication and personal details.</p>
            </header>

            <NotificationToast />

            {editing ? <ProfileEditForm /> : <ProfileDisplay />}
        </div>
    );
}