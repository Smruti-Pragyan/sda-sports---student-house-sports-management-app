import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HOUSES } from './constants';
import type { Student, SportEvent, View, HouseName, Theme, AdminProfile } from './types';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import EventManagement from './components/EventManagement';
import HouseDashboard from './components/HouseDashboard';
import Profile from './components/Profile';
import Login from './components/login';
import { DashboardIcon, StudentsIcon, EventsIcon, HouseIcon, UserIcon, SettingsIcon, ProfileIcon, LogoutIcon } from './components/Icons';
import Card from './components/common/Card';
import { useAuth } from './src/context/AuthContext';
import api from './src/api';

// --- HEADER COMPONENT ---
const Header: React.FC<{ adminProfile: AdminProfile }> = ({ adminProfile }) => (
    <header className="bg-white dark:bg-gray-800 p-4 shadow-md flex justify-between items-center z-10 relative border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">SDA Sports</h1>
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

// --- SIDEBAR COMPONENT (Corrected) ---
const Sidebar: React.FC<{ view: View; setView: (view: View) => void; onLogout: () => void }> = ({ view, setView, onLogout }) => {
    // This function was missing in your broken version
    const navItemClasses = (currentView: View) => `flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${view === currentView ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`;

    return (
        <aside className="w-64 bg-gray-800 p-4 space-y-2 flex flex-col text-white">
            <nav className="flex-grow space-y-2">
                <div className={navItemClasses('dashboard')} onClick={() => setView('dashboard')}>
                    <DashboardIcon /> <span>Dashboard</span>
                </div>
                <div className={navItemClasses('students')} onClick={() => setView('students')}>
                    <StudentsIcon /> <span>Students</span>
                </div>
                <div className={navItemClasses('events')} onClick={() => setView('events')}>
                    <EventsIcon /> <span>Events</span>
                </div>
                
                <div className="pt-4">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase px-3 mb-2">Houses</h3>
          {HOUSES.map(house => (
            <div key={house.name} className={navItemClasses(`house-${house.name.toLowerCase()}` as View)} onClick={() => setView(`house-${house.name.toLowerCase()}` as View)}>
              <HouseIcon/> <span>{house.name} House</span>
            </div>
          ))}
                </div>
            </nav>
            <div className="border-t border-gray-700 pt-2 space-y-1">
                 <div className={navItemClasses('profile')} onClick={() => setView('profile')}>
                    <ProfileIcon /> <span>Profile</span>
                </div>
                 <div className={navItemClasses('settings')} onClick={() => setView('settings')}>
                    <SettingsIcon /> <span>Settings</span>
                </div>
                 {/* This is the corrected Logout button layout */}
                 <div className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-red-600 text-red-300" onClick={onLogout}>
                    <LogoutIcon/> <span>Logout</span>
                </div>
            </div>
        </aside>
    );
};

// --- SETTINGS COMPONENT (Was Missing) ---
const Settings: React.FC<{theme: Theme, setTheme: (theme: Theme) => void, onResetData: () => void}> = ({theme, setTheme, onResetData}) => {
    
    const handleReset = () => {
        // Updated confirmation message
        if (window.confirm('Are you sure you want to log out and clear local theme settings? All your data is saved on the server.')) {
            onResetData();
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8">Settings</h1>
            <Card className="max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Appearance</h2>
                <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400">Choose a theme for the application.</p>
                    <div className="flex space-x-4 pt-2">
                        <button
                            onClick={() => setTheme('light')}
                            className={`px-6 py-2 rounded-md font-semibold ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                        >
                            Light
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`px-6 py-2 rounded-md font-semibold ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                        >
                            Dark
                        </button>
                    </div>
                </div>
            </Card>
            <Card className="max-w-md mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Data Management</h2>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This will log you out and clear local settings. All your data is saved securely on the server.
                    </p>
                    <button
                        onClick={handleReset}
                        className="w-full px-6 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                    >
                        Logout and Clear Settings
                    </button>
                </div>
            </Card>
        </div>
    )
}

// --- MAIN APP COMPONENT ---
function App() {
  const { user, isLoading, logout, updateProfile } = useAuth();
  
  // App state is now managed with useState and fetched from API
  const [students, setStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({ name: '', email: '', profilePictureUrl: '' });
  
  const [view, setView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('sda-sports-theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });
  
  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('sda-sports-theme', theme);
  }, [theme]);

  // Data fetching effect
  useEffect(() => {
    if (user) {
      // User is logged in, fetch all data
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
          // If token is bad, log out
          if ((error as any).response?.status === 401) {
            logout();
          }
        }
      };
      fetchData();
    } else {
      // User is logged out, clear data
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

    // Pass state and *setters* to components
    switch (view) {
      case 'students':
        return <StudentManagement students={students} setStudents={setStudents} events={events} />;
      case 'events':
        return <EventManagement events={events} setEvents={setEvents} students={students} />;
      case 'settings':
        return <Settings theme={theme} setTheme={setTheme} onResetData={handleResetData} />;
      case 'profile':
        return <Profile adminProfile={adminProfile} setAdminProfile={setAdminProfile} />;
      case 'dashboard':
      default:
        return <Dashboard students={students} events={events} theme={theme} />;
    }
  }, [view, students, events, adminProfile, theme, handleResetData, updateProfile]);
  
  // Handle auth loading and logged-out state
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            Loading...
        </div>
    ); // Or a spinner
  }

  if (!user) {
    return <Login />;
  }

  // Logged-in App View
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header adminProfile={adminProfile}/>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar view={view} setView={setView} onLogout={logout} />
        <main className="flex-1 overflow-y-auto">
          {renderView}
        </main>
      </div>
    </div>
  );
}

export default App;
