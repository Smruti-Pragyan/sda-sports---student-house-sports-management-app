import React, { useState, useEffect, useRef } from 'react';
import type { AdminProfile } from '../types';
import Card from './common/Card';
import { UserIcon, LockIcon, IdIcon } from './Icons';
import api from '../src/api';

interface ProfileProps {
    adminProfile: AdminProfile;
    setAdminProfile: React.Dispatch<React.SetStateAction<AdminProfile>>; // <-- CHANGED PROP
    updateProfile: (profileData: AdminProfile) => Promise<void>; // <-- ADDED PROP
}

// ChangePasswordForm is UPDATED to use API
const ChangePasswordForm: React.FC = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (passwords.newPassword.length < 8) {
            setError('New password must be at least 8 characters long.');
            return;
        }

        // --- NEW API CALL ---
        try {
            const { data } = await api.post('/auth/changepassword', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            setSuccess(data.message || 'Password changed successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setError('');
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to change password');
            setSuccess('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Current Password</label>
                <input 
                    type="password" 
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">New Password</label>
                <input 
                    type="password" 
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Confirm New Password</label>
                <input 
                    type="password" 
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
            <div className="flex justify-end pt-4">
                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Change Password</button>
            </div>
        </form>
    );
};

// ProfileDetails is UPDATED to use API
const ProfileDetails: React.FC<{adminProfile: AdminProfile, setAdminProfile: React.Dispatch<React.SetStateAction<AdminProfile>>, updateProfile: (profileData: AdminProfile) => Promise<void>}> = ({ adminProfile, setAdminProfile, updateProfile }) => {
    const [formData, setFormData] = useState(adminProfile);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setFormData(adminProfile);
    }, [adminProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // --- NEW API CALL (using updateProfile from AuthContext) ---
        try {
            await updateProfile(formData);
            setAdminProfile(formData); // Update App.tsx state
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile.");
        }
    }

    const handleCancel = () => {
        setFormData(adminProfile);
        setIsEditing(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                {formData.profilePictureUrl ? (
                    <img src={formData.profilePictureUrl} alt="Admin Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-500" />
                ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-4 ring-blue-500">
                        <UserIcon />
                    </div>
                )}
                <div className="flex-grow text-center sm:text-left">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{formData.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{formData.email}</p>
                        {isEditing && (
                            <div className="mt-2">
                                <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Change Picture
                                </button>
                            </div>
                        )}
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70" 
                    />
                </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        disabled={!isEditing}
                        className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70" 
                    />
                </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-8">
                {isEditing ? (
                    <>
                        <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Save Changes</button>
                    </>
                ) : (
                    <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Edit Profile</button>
                )}
            </div>
        </form>
    );
};

// Profile component is updated with new props
const Profile: React.FC<ProfileProps> = ({ adminProfile, setAdminProfile, updateProfile }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');
    
    const tabClasses = (tabName: 'details' | 'security') => 
        `flex items-center space-x-2 px-4 py-2 font-semibold rounded-md cursor-pointer transition-colors ${
            activeTab === tabName 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`;

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8">Admin Profile</h1>
            <Card className="max-w-2xl">
                <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-4 -mb-px">
                        <button className={tabClasses('details')} onClick={() => setActiveTab('details')}>
                            <IdIcon />
                            <span>Profile Details</span>
                        </button>
                         <button className={tabClasses('security')} onClick={() => setActiveTab('security')}>
                             <LockIcon />
                             <span>Security</span>
                        </button>
                    </nav>
                </div>
                
                <div className="pt-4">
                    {activeTab === 'details' && <ProfileDetails adminProfile={adminProfile} setAdminProfile={setAdminProfile} updateProfile={updateProfile} />}
                    {activeTab === 'security' && <ChangePasswordForm />}
                </div>
            </Card>
        </div>
    );
}

export default Profile;
