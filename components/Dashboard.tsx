import React, { useMemo, useState, useEffect } from 'react';
import { type Student, type SportEvent, type Theme, HouseName } from '../types';
import { HOUSES } from '../constants';
import Card from './common/Card';
import { TrophyIcon, UserIcon, EventsIcon } from './Icons';
import api from '../src/api';

interface DashboardProps {
  students: Student[];
  events: SportEvent[];
  theme: Theme;
}

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
      .map(([name, score]) => ({ 
          name: name as HouseName, 
          score: score + (initialPoints[name as HouseName] || 0) // Add initial points here
      }))
      .sort((a, b) => b.score - a.score);
  }, [students, events, initialPoints]);

  const totalStudents = students.length;
  const totalEvents = events.length;
  const completedEvents = events.filter(e => e.status === 'Completed').length;
  const ongoingEvents = events.filter(e => e.status === 'Ongoing').length;
  const upcomingEvents = totalEvents - completedEvents - ongoingEvents;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Sports Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <UserIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
              <EventsIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold">{totalEvents}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
                <TrophyIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Events</p>
              <p className="text-2xl font-bold">{completedEvents}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                <EventsIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ongoing Events</p>
              <p className="text-2xl font-bold">{ongoingEvents}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-2xl font-semibold mb-4">House Points Leaderboard</h2>
          <div className="space-y-4">
            {housePoints.map((house, index) => {
              const houseDetails = HOUSES.find(h => h.name === house.name);
              return (
                <div key={house.name} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${houseDetails?.color} flex items-center justify-center text-white font-bold text-lg mr-4`}>
                    {index === 0 ? <TrophyIcon /> : <span>{index + 1}</span>}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{house.name}</p>
                  </div>
                  <p className="text-xl font-bold">{house.score} pts</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold mb-4">Event Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-blue-700 dark:text-white">Upcoming</span>
                <span className="text-sm font-medium text-blue-700 dark:text-white">{upcomingEvents}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: totalEvents > 0 ? `${(upcomingEvents/totalEvents)*100}%` : '0%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-green-700 dark:text-white">Ongoing</span>
                <span className="text-sm font-medium text-green-700 dark:text-white">{ongoingEvents}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-green-500 h-2.5 rounded-full" style={{width: totalEvents > 0 ? `${(ongoingEvents/totalEvents)*100}%` : '0%'}}></div>
              </div>
            </div>
             <div>
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-gray-700 dark:text-white">Completed</span>
                <span className="text-sm font-medium text-gray-700 dark:text-white">{completedEvents}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-gray-400 h-2.5 rounded-full" style={{width: totalEvents > 0 ? `${(completedEvents/totalEvents)*100}%` : '0%'}}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;