import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HOUSES } from './constants';
import type { Student, SportEvent, View, HouseName, Theme, AdminProfile } from './types';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import EventManagement from './components/EventManagement';
import HouseDashboard from './components/HouseDashboard';
import Profile from './components/Profile';
import AuthScreen from './components/AuthScreen';
import PointsSystem from './components/PointsSystem';
import { DashboardIcon, StudentsIcon, EventsIcon, HouseIcon, UserIcon, SettingsIcon, ProfileIcon, LogoutIcon, MenuIcon, CloseIcon, ChartIcon } from './components/Icons'; 
import Card from './components/common/Card';
import { useAuth } from './context/AuthContext';    // New relative path
import api from './api';       
import { Sun, Moon, LogOut, AlertOctagon } from 'lucide-react';                     // New relative path

// --- HEADER COMPONENT ---
interface HeaderProps {
    adminProfile: AdminProfile;
    onMenuToggle: () => void;
    isMobileMenuOpen: boolean; 
}

const Header: React.FC<HeaderProps> = ({ adminProfile, onMenuToggle, isMobileMenuOpen }) => (
    <header className="bg-white dark:bg-gray-800 p-4 shadow-md flex justify-between items-center z-10 relative border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
            <button
                onClick={onMenuToggle}
                className="text-gray-800 dark:text-white md:hidden"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">SDA Sports</h1>
        </div>
        <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">{adminProfile.name}</span>
             {adminProfile.profilePictureUrl ? (
                <img src={adminProfile.profilePictureUrl} alt="Admin Profile" className="h-8 w-8 rounded-full object-cover" />
            ) : (
                <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <UserIcon />
                </div>
            )}
        </div>
    </header>
);

// --- SIDEBAR COMPONENT ---
interface SidebarProps {
    view: View;
    setView: (view: View) => void;
    onLogout: () => void;
    isMobileMenuOpen: boolean; 
    setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>; 
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, onLogout, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    
    // Helper to set view AND close menu on mobile
    const handleSetView = (newView: View) => {
        setView(newView);
        setIsMobileMenuOpen(false);
    };

    // Helper for logout
    const handleLogout = () => {
        onLogout();
        setIsMobileMenuOpen(false);
    }

    const navItemClasses = (currentView: View) => `flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${view === currentView ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`;

    return (
        <aside 
            className={`fixed md:relative inset-y-0 left-0 z-30 w-64 bg-gray-800 p-4 space-y-2 flex flex-col text-white
                        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
                        transition-transform duration-300 ease-in-out`}
        >
            <nav className="flex-grow space-y-2">
                <div className={navItemClasses('dashboard')} onClick={() => handleSetView('dashboard')}>
                    <DashboardIcon /> <span>Dashboard</span>
                </div>
                <div className={navItemClasses('points')} onClick={() => handleSetView('points')}>
                    <ChartIcon /> <span>Points System</span>
                </div>
                <div className={navItemClasses('students')} onClick={() => handleSetView('students')}>
                    <StudentsIcon /> <span>Students</span>
                </div>
                <div className={navItemClasses('events')} onClick={() => handleSetView('events')}>
                    <EventsIcon /> <span>Events</span>
                </div>
                
                <div className="pt-4">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase px-3 mb-2">Houses</h3>
          {HOUSES.map(house => (
            <div key={house.name} className={navItemClasses(`house-${house.name.toLowerCase()}` as View)} onClick={() => handleSetView(`house-${house.name.toLowerCase()}` as View)}>
              <HouseIcon/> <span>{house.name} House</span>
            </div>
          ))}
                </div>
            </nav>
            <div className="border-t border-gray-700 pt-2 space-y-1">
                 <div className={navItemClasses('profile')} onClick={() => handleSetView('profile')}>
                    <ProfileIcon /> <span>Profile</span>
                </div>
                 <div className={navItemClasses('settings')} onClick={() => handleSetView('settings')}>
                    <SettingsIcon /> <span>Settings</span>
                </div>
                 <div className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-red-600 text-red-300" onClick={handleLogout}>
                    <LogoutIcon/> <span>Logout</span>
                </div>
            </div>
        </aside>
    );
};

// --- SETTINGS COMPONENT ---
// --- SETTINGS COMPONENT ---
// --- SETTINGS COMPONENT ---
const Settings: React.FC<{theme: Theme, setTheme: (theme: Theme) => void, onResetData: () => void}> = ({theme, setTheme, onResetData}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false); // New state for the modal

    const handleReset = () => {
        if (window.confirm('Are you sure you want to log out and clear local theme settings? All your data is saved on the server.')) {
            onResetData();
        }
    };

    // This now just opens our beautiful in-app modal
    const triggerDeleteAccount = () => {
        setShowConfirmModal(true);
    };

    // This does the actual deletion when they click "Yes, delete my account" inside the modal
    const confirmDeleteAccount = async () => {
        setIsDeleting(true);
        setErrorMsg('');

        try {
            await api.delete('/auth/profile');
            // We can still use a simple alert here for the final success message before redirect, 
            // or rely on the login screen to show a fresh state.
            alert("Account successfully deleted."); 
            onResetData(); 
        } catch (error: any) {
            console.error("Deletion failed:", error);
            const serverMessage = error.response?.data?.message || error.message || 'Failed to delete account. Please try again.';
            setErrorMsg(serverMessage);
            setIsDeleting(false);
            setShowConfirmModal(false); // Close modal so they can see the error message
        }
    };

    return (
        <div className="p-8 max-w-4xl relative">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Settings</h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    
                    {/* 1. Appearance Section */}
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors duration-200 group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Customize the interface theme of your dashboard.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setTheme('light')}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    theme === 'light' 
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                            >
                                Light
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    theme === 'dark' 
                                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>

                    {/* 2. Data Management Section */}
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors duration-200 group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                <LogOut size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Log out safely and clear local browser settings.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors duration-200"
                        >
                            Log Out
                        </button>
                    </div>

                    {/* 3. Danger Zone Section */}
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors duration-200 group">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-sm">
                                <AlertOctagon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-600 dark:text-red-500">Danger Zone</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Permanently delete your admin account. <span className="font-semibold text-gray-700 dark:text-gray-300">This action cannot be undone.</span>
                                </p>
                                {errorMsg && (
                                    <p className="text-xs font-semibold text-red-500 mt-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-block">
                                        {errorMsg}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={triggerDeleteAccount}
                            className="px-6 py-2.5 font-semibold rounded-xl border transition-all duration-200 bg-white dark:bg-transparent border-red-200 dark:border-red-800 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white hover:border-red-600 shadow-sm"
                        >
                            Delete Account
                        </button>
                    </div>

                </div>
            </div>

            {/* --- IN-APP CONFIRMATION MODAL --- */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-fadeIn">
                        
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                            <AlertOctagon size={32} className="text-red-600 dark:text-red-500" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                            Delete your account?
                        </h3>
                        
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                            Are you absolutely sure? This will permanently erase your account, along with all your registered <strong className="text-gray-700 dark:text-gray-300">Houses, Students, and Events</strong>. This action cannot be undone.
                        </p>

                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 text-white bg-red-600 hover:bg-red-700 font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center"
                            >
                                {isDeleting ? (
                                    <span className="animate-pulse">Deleting...</span>
                                ) : (
                                    "Yes, delete account"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN APP COMPONENT ---
function App() {
  const { user, isLoading, logout, updateProfile } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({ name: '', email: '', profilePictureUrl: '' });
  
  const [view, setView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('sda-sports-theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('sda-sports-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [studentsRes, eventsRes, profileRes] = await Promise.all([
            api.get('/students'),
            api.get('/events'),
            api.get('/auth/profile')
          ]);
          setStudents(studentsRes.data);
          setEvents(eventsRes.data);
          setAdminProfile(profileRes.data);
        } catch (error) {
          console.error("Failed to fetch data", error);
          if ((error as any).response?.status === 401) {
            logout();
          }
        }
      };
      fetchData();
    } else {
      setStudents([]);
      setEvents([]);
      setAdminProfile({ name: '', email: '', profilePictureUrl: '' });
    }
  }, [user, logout]);


  const handleResetData = useCallback(() => {
    if (window.confirm('Are you sure you want to log out and clear local theme settings?')) {
        localStorage.removeItem('sda-sports-theme');
        logout();
        window.location.reload();
    }
  }, [logout]);

  const renderView = useMemo(() => {
    const houseViewMatch = view.match(/^house-(yellow|blue|green|red)$/);
    if(houseViewMatch){
        const houseName = houseViewMatch[1].charAt(0).toUpperCase() + houseViewMatch[1].slice(1) as HouseName;
        return <HouseDashboard houseName={houseName} students={students} events={events} />;
    }

    switch (view) {
      case 'students':
        return <StudentManagement students={students} setStudents={setStudents} events={events} />;
      case 'events':
        return <EventManagement events={events} setEvents={setEvents} students={students} />;
      case 'points':
        return <PointsSystem students={students} events={events} />;
      case 'settings':
        return <Settings theme={theme} setTheme={setTheme} onResetData={handleResetData} />;
      case 'profile':
        return <Profile adminProfile={adminProfile} setAdminProfile={setAdminProfile} updateProfile={updateProfile} />;
      case 'dashboard':
      default:
        return <Dashboard students={students} events={events} theme={theme} />;
    }
  }, [view, students, events, adminProfile, theme, handleResetData, updateProfile]);
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            Loading...
        </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header 
        adminProfile={adminProfile} 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-20 md:hidden" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            ></div>
        )}
        <Sidebar 
            view={view} 
            setView={setView} 
            onLogout={logout} 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto relative z-0">
          {renderView}
        </main>
      </div>
    </div>
  );
}

export default App;