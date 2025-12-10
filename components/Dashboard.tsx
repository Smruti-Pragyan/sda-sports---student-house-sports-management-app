import React, { useMemo, useState, useEffect } from 'react';
import { type Student, type SportEvent, type Theme, HouseName } from '../types';
import { HOUSES } from '../constants';
import Card from './common/Card';
import { UserIcon, EventsIcon, TrophyIcon } from './Icons'; // Kept TrophyIcon for non-winners
import api from '../src/api';

interface DashboardProps {
  students: Student[];
  events: SportEvent[];
  theme: Theme;
}

// --- NEW: Enhanced Winner Badge (Matches Reference Image) ---
const WinnerBadge = ({ colorClass }: { colorClass: string }) => {
  // Extract the color name (e.g., 'bg-red-500') to use for the background
  const bgColor = colorClass.includes('border') ? colorClass.replace('border-', 'bg-') : colorClass;

  return (
    <div className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-2xl ${bgColor} border-[3px] border-white dark:border-gray-800 transform hover:scale-110 transition-transform duration-300 z-10 group`}>
      
      {/* 1. Laurel Wreath (Background Decoration) */}
      <svg className="absolute w-16 h-16 text-white opacity-20 group-hover:opacity-30 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
         <path d="M12 2C7.03 2 3 6.03 3 11C3 15.97 7.03 20 12 20C16.97 20 21 15.97 21 11C21 7.5 18.5 4.5 15.5 3.12L15 4.1C17.5 5.25 19.5 7.75 19.5 11C19.5 15.14 16.14 18.5 12 18.5C7.86 18.5 4.5 15.14 4.5 11C4.5 7.75 6.5 5.25 9 4.1L8.5 3.12C5.5 4.5 3 7.5 3 11H12V2Z" />
         <path d="M12 21C12 21 10 19 8 16C6 13 6 10 6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="opacity-0" />
      </svg>

      {/* 2. Sparkles (Floating) */}
      <svg className="absolute top-2 right-4 w-3 h-3 text-yellow-100 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
      <svg className="absolute bottom-3 left-4 w-2 h-2 text-yellow-200 animate-pulse delay-75" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>

      {/* 3. Detailed Trophy Icon */}
      <div className="relative z-10 drop-shadow-lg">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cup Body */}
            <path d="M7 4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8V4Z" fill="#FCD34D" stroke="#B45309" strokeWidth="1.5"/>
            {/* Handles */}
            <path d="M17 5H19C20.1046 5 21 5.89543 21 7V8C21 9.10457 20.1046 10 19 10H17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 5H5C3.89543 5 3 5.89543 3 7V8C3 9.10457 3.89543 10 5 10H7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            {/* Stem */}
            <path d="M12 13V16" stroke="#B45309" strokeWidth="2" strokeLinecap="round"/>
            {/* Base */}
            <rect x="8" y="16" width="8" height="3" rx="1" fill="#78350F" stroke="#78350F" strokeWidth="1"/>
            {/* Shine on Cup */}
            <path d="M14 5V9" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ students, events, theme }) => {
  const [initialPoints, setInitialPoints] = useState<Record<HouseName, number>>({
    [HouseName.Yellow]: 0,
    [HouseName.Blue]: 0,
    [HouseName.Green]: 0,
    [HouseName.Red]: 0,
  });

  // Fetch initial points on mount
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

    // Calculate event points
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

    // Add initial points and sort
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
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <UserIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
              <EventsIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalEvents}</p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
                <TrophyIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Events</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{completedEvents}</p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                <EventsIcon />
            </div>
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
                      <div className={`w-12 h-12 rounded-full ${house.color} flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white dark:border-gray-700`}>
                        <span>{index + 1}</span>
                      </div>
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