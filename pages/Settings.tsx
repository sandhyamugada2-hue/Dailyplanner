
import React, { useState, useRef } from 'react';
import { User, Mail, Camera, Save, Shield, Bell, Smartphone, Globe, LogOut, ChevronRight, Edit3, Image as ImageIcon, X } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsProps {
  user: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email.toLowerCase(),
  });

  const handleSave = () => {
    onUpdateUser({ ...formData, email: formData.email.toLowerCase() });
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ avatar: reader.result as string });
        setShowUploadOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerGallery = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Profile & Settings</h2>
          <p className="text-white/70 mt-1 font-medium">Manage your identity and app preferences.</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/20 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10"></div>
            
            <div className="relative mt-4">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover" 
              />
              <button 
                onClick={() => setShowUploadOptions(true)}
                className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-blue-600 hover:text-blue-700 transition-transform hover:scale-110"
              >
                <Camera size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-1">
              <h3 className="text-xl font-black text-white">{user.name}</h3>
              <p className="text-sm font-bold text-white/50 tracking-widest">{user.email.toLowerCase()}</p>
            </div>

            {/* Hidden Inputs for File Upload */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="user" 
              onChange={handleFileChange} 
            />

            {/* Upload Options Modal */}
            {showUploadOptions && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900">Update Photo</h4>
                      <button onClick={() => setShowUploadOptions(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={triggerGallery}
                        className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-left group"
                      >
                        <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                          <ImageIcon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Gallery</p>
                          <p className="text-[10px] text-slate-500">Choose from your photos</p>
                        </div>
                      </button>
                      <button 
                        onClick={triggerCamera}
                        className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-left group"
                      >
                        <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                          <Camera size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Camera</p>
                          <p className="text-[10px] text-slate-500">Take a new photo</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 w-full grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-tighter">Member Since</p>
                <p className="text-sm font-bold text-white/80">Mar 2024</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-tighter">Plan Type</p>
                <p className="text-sm font-bold text-blue-400">Pro</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1E3A5F] p-6 rounded-[32px] text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <h4 className="font-bold mb-2 relative z-10">Storage Usage</h4>
            <div className="flex justify-between text-xs mb-2 text-blue-100/70 relative z-10">
              <span>Cloud Sync</span>
              <span>1.2 GB / 5 GB</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-blue-400" style={{ width: '24%' }}></div>
            </div>
            <button className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all backdrop-blur-md relative z-10">
              Upgrade Storage
            </button>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-[32px] border border-white/20 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <User size={20} />
                </div>
                <h3 className="font-black text-white tracking-tight">Personal Information</h3>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              )}
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-white"
                    />
                  ) : (
                    <div className="w-full bg-white/5 border border-transparent rounded-2xl py-3 px-4 text-sm font-bold text-white/80">
                      {user.name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Email Address</label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-white"
                    />
                  ) : (
                    <div className="w-full bg-white/5 border border-transparent rounded-2xl py-3 px-4 text-sm font-bold text-white/80">
                      {user.email.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <h4 className="text-xs font-black text-white/50 uppercase tracking-widest ml-1">App Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl text-white/40 group-hover:text-blue-400 transition-colors">
                        <Bell size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white/80">Push Notifications</p>
                        <p className="text-[10px] font-medium text-white/50">Daily reminders and goal alerts</p>
                      </div>
                    </div>
                    <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl text-white/40 group-hover:text-blue-400 transition-colors">
                        <Shield size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white/80">Two-Factor Auth</p>
                        <p className="text-[10px] font-medium text-white/50">Enhanced account security</p>
                      </div>
                    </div>
                    <div className="w-10 h-6 bg-white/10 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-[32px] border border-white/20 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-white/10 bg-white/5">
              <h3 className="font-black text-white text-sm tracking-tight">Connected Devices</h3>
            </div>
            <div className="divide-y divide-white/5">
              <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl text-white/50">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">iPhone 15 Pro</p>
                    <p className="text-[10px] font-medium text-white/50 uppercase tracking-tighter">Active Now • San Francisco, CA</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </div>
              <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl text-white/50">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">MacBook Pro 16"</p>
                    <p className="text-[10px] font-medium text-white/50 uppercase tracking-tighter">Last active 2h ago • Chrome on MacOS</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
