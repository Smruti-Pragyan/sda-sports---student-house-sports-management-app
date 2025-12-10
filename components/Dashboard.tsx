import React, { useMemo, useState, useEffect } from 'react';
import { type Student, type SportEvent, type Theme, HouseName } from '../types';
import { HOUSES } from '../constants';
import Card from './common/Card';
import { TrophyIcon } from './Icons'; 
import api from '../src/api';

interface DashboardProps {
  students: Student[];
  events: SportEvent[];
  theme: Theme;
}

// --- 1. Enhanced Winner Badge (Trophy) ---
const WinnerBadge = ({ colorClass }: { colorClass: string }) => {
  const bgColor = colorClass.includes('border') ? colorClass.replace('border-', 'bg-') : colorClass;

  return (
    <div className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-2xl ${bgColor} border-[3px] border-white dark:border-gray-800 transform hover:scale-110 transition-transform duration-300 z-10 group`}>
      <svg className="absolute w-16 h-16 text-white opacity-20 group-hover:opacity-30 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
         <path d="M12 2C7.03 2 3 6.03 3 11C3 15.97 7.03 20 12 20C16.97 20 21 15.97 21 11C21 7.5 18.5 4.5 15.5 3.12L15 4.1C17.5 5.25 19.5 7.75 19.5 11C19.5 15.14 16.14 18.5 12 18.5C7.86 18.5 4.5 15.14 4.5 11C4.5 7.75 6.5 5.25 9 4.1L8.5 3.12C5.5 4.5 3 7.5 3 11H12V2Z" />
         <path d="M12 21C12 21 10 19 8 16C6 13 6 10 6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="opacity-0" />
      </svg>
      <svg className="absolute top-2 right-4 w-3 h-3 text-yellow-100 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
      <svg className="absolute bottom-3 left-4 w-2 h-2 text-yellow-200 animate-pulse delay-75" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
      <div className="relative z-10 drop-shadow-lg">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8V4Z" fill="#FCD34D" stroke="#B45309" strokeWidth="1.5"/>
            <path d="M17 5H19C20.1046 5 21 5.89543 21 7V8C21 9.10457 20.1046 10 19 10H17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 5H5C3.89543 5 3 5.89543 3 7V8C3 9.10457 3.89543 10 5 10H7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 13V16" stroke="#B45309" strokeWidth="2" strokeLinecap="round"/>
            <rect x="8" y="16" width="8" height="3" rx="1" fill="#78350F" stroke="#78350F" strokeWidth="1"/>
            <path d="M14 5V9" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

// --- 2. Completed Events Badge (Gold Medal) ---
const CompletedBadge = () => {
  return (
    <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 transform hover:scale-105 transition-transform duration-300">
      <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        <path d="M12 2L15 6H9L12 2Z" fill="#FDE68A" /> 
        <path d="M7 6L12 13L17 6V3H7V6Z" fill="#3B82F6" />
        <path d="M12 13L7 6H5V8L10.5 15.5L12 13Z" fill="#1D4ED8" />
        <path d="M12 13L17 6H19V8L13.5 15.5L12 13Z" fill="#1D4ED8" />
        <circle cx="12" cy="17" r="5" fill="#FCD34D" stroke="#B45309" strokeWidth="0.5" />
        <circle cx="12" cy="17" r="3.5" fill="#fbbf24" />
        <path d="M12 15.5L12.4 16.6H13.5L12.6 17.2L12.9 18.3L12 17.6L11.1 18.3L11.4 17.2L10.5 16.6H11.6L12 15.5Z" fill="#B45309" />
      </svg>
    </div>
  );
};

// --- 3. Total Students Badge (User Group) ---
const StudentBadge = () => {
  return (
    <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform duration-300">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-sm">
            <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.9"/>
            <path d="M12 13C8 13 5 15 5 18V19H19V18C19 15 16 13 12 13Z" fill="currentColor" fillOpacity="0.9"/>
            <path d="M19.5 9.5C19.5 10.88 18.38 12 17 12C16.5 12 16.03 11.85 15.64 11.6C16.48 10.96 17 9.95 17 8.82C17 7.7 16.49 6.69 15.66 6.05C16.04 5.79 16.5 5.64 17 5.64C18.38 5.64 19.5 6.76 19.5 8.14V9.5Z" fill="currentColor" fillOpacity="0.6"/>
            <path d="M4.5 9.5C4.5 10.88 5.62 12 7 12C7.5 12 7.97 11.85 8.36 11.6C7.52 10.96 7 9.95 7 8.82C7 7.7 7.51 6.69 8.34 6.05C7.96 5.79 7.5 5.64 7 5.64C5.62 5.64 4.5 6.76 4.5 8.14V9.5Z" fill="currentColor" fillOpacity="0.6"/>
        </svg>
    </div>
  );
}

// --- 4. Total Events Badge (Calendar/List) ---
const TotalEventsBadge = () => {
    return (
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-teal-500/30 transform hover:scale-105 transition-transform duration-300">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-sm">
              <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 11H20" stroke="currentColor" strokeWidth="2"/>
              <circle cx="9" cy="15" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
          </svg>
      </div>
    );
  }

// --- 5. Ongoing Events Badge (Pulsing Stopwatch) ---
const OngoingBadge = () => {
    return (
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-rose-600 shadow-lg shadow-red-500/30 transform hover:scale-105 transition-transform duration-300">
          {/* Pulsing ring for "Active" effect */}
          <div className="absolute inset-0 rounded-full border-2 border-white opacity-30 animate-ping"></div>
          
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-sm">
              <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 9V13L14.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 2H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 4L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
      </div>
    );
  }

// --- 6. New House Identity Badge (Simple House) ---
const HouseIconBadge = ({ colorClass }: { colorClass: string }) => {
    // Extract background color
    const bgColor = colorClass.includes('border') ? colorClass.replace('border-', 'bg-') : colorClass;
    
    return (
        <div className={`relative flex items-center justify-center w-14 h-14 rounded-full ${bgColor} shadow-lg border-2 border-white dark:border-gray-700 transform hover:scale-105 transition-transform duration-300`}>
            {/* Subtle inner shine/glow */}
            <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
            
            {/* House Icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-md">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );
}

const Dashboard: React.FC<DashboardProps> = ({ students, events, theme }) => {
  const [initialPoints, setInitialPoints] = useState<Record<HouseName, number>>({
    [HouseName.Yellow]: 0,
    [HouseName.Blue]: 0,
    [HouseName.Green]: 0,
    [HouseName.Red]: 0,
  });

  useEffect(() => {
    const fetchHousePoints = async () => {
      try {
        const { data } = await api.get('/houses');
        const pointsMap: Record<string, number> = {};
        data.forEach((house: any) => {
          pointsMap[house.name] = house.initialPoints;
        });
        setInitialPoints(prev => ({ ...prev, ...pointsMap }));
      } catch (error) {
        console.error("Failed to fetch house points", error);
      }
    };
    fetchHousePoints();
  }, []);

  const housePoints = useMemo(() => {
    const studentHouseMap = new Map<string, HouseName>(
      students.map(s => [s._id || s.id, s.house])
    );

    const points: Record<HouseName, number> = {
      [HouseName.Yellow]: 0,
      [HouseName.Blue]: 0,
      [HouseName.Green]: 0,
      [HouseName.Red]: 0,
    };

    for (const event of events) {
      for (const p of event.participants) {
        const pStudentId = typeof p.studentId === 'string' 
          ? p.studentId 
          : (p.studentId as any)._id || (p.studentId as any).id;

        const house = studentHouseMap.get(pStudentId);
        if (house) {
          points[house] += p.score;
        }
      }
    }

    return Object.entries(points)
      .map(([name, score]) => {
        const houseDetails = HOUSES.find(h => h.name === name);
        return { 
          name: name as HouseName, 
          score: score + (initialPoints[name as HouseName] || 0),
          color: houseDetails?.color || 'bg-gray-500',
          accentColor: houseDetails?.accentColor || 'border-gray-500'
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [students, events, initialPoints]);

  const totalStudents = students.length;
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'Completed').length;
  const ongoingEvents = events.filter(e => e.status === 'Ongoing').length;
  const upcomingEvents = totalEvents - completedEvents - ongoingEvents;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Sports Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* TOTAL STUDENTS */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <StudentBadge />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalStudents}</p>
            </div>
          </div>
        </Card>

        {/* TOTAL EVENTS */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <TotalEventsBadge />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalEvents}</p>
            </div>
          </div>
        </Card>
        
        {/* COMPLETED EVENTS */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <CompletedBadge />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Events</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{completedEvents}</p>
            </div>
          </div>
        </Card>

        {/* ONGOING EVENTS */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <OngoingBadge />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ongoing Events</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{ongoingEvents}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEADERBOARD SECTION */}
        <Card>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">House Points Leaderboard</h2>
          <div className="space-y-6">
            {housePoints.map((house, index) => {
              const isFirst = index === 0;
              
              return (
                <div key={house.name} className={`flex items-center p-4 rounded-xl transition-all ${isFirst ? 'bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 border border-yellow-200 dark:border-yellow-800 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                  
                  {/* Rank / Winner Badge */}
                  <div className="flex-shrink-0 mr-6 w-20 flex justify-center items-center">
                    {isFirst ? (
                      <WinnerBadge colorClass={house.color} />
                    ) : (
                      <HouseIconBadge colorClass={house.color} />
                    )}
                  </div>

                  {/* House Details */}
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <p className={`font-bold text-xl ${isFirst ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{house.name} House</p>
                      {isFirst && <span className="ml-3 px-3 py-1 text-xs font-bold text-yellow-800 bg-yellow-300 rounded-full shadow-sm animate-pulse">LEADER</span>}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-3 max-w-[240px] overflow-hidden">
                       <div className={`h-2 rounded-full ${house.color} transition-all duration-1000`} style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  {/* Points Display */}
                  <div className="text-right pl-4">
                    <p className={`text-3xl font-black ${isFirst ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{house.score}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* EVENT STATUS SECTION */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Event Status Overview</h2>
          <div className="space-y-6 py-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-base font-semibold text-blue-700 dark:text-blue-400">Upcoming</span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{upcomingEvents}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                <div className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: totalEvents > 0 ? `${(upcomingEvents/totalEvents)*100}%` : '0%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-base font-semibold text-green-700 dark:text-green-400">Ongoing</span>
                <span className="text-sm font-bold text-green-700 dark:text-green-400">{ongoingEvents}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                <div className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: totalEvents > 0 ? `${(ongoingEvents/totalEvents)*100}%` : '0%'}}></div>
              </div>
            </div>
             <div>
              <div className="flex justify-between mb-2">
                <span className="text-base font-semibold text-gray-700 dark:text-gray-300">Completed</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{completedEvents}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                <div className="bg-gray-400 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: totalEvents > 0 ? `${(completedEvents/totalEvents)*100}%` : '0%'}}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;