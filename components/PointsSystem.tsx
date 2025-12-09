import React, { useState, useMemo, useEffect } from 'react';
import { type Student, type SportEvent, HouseName } from '../types';
import { usePoints } from '../src/hooks/usePoints';
import { HOUSES } from '../constants';
import Card from './common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrophyIcon, ChartIcon } from './Icons';
import api from '../src/api';

interface PointsSystemProps {
  students: Student[];
  events: SportEvent[];
}

const PointsSystem: React.FC<PointsSystemProps> = ({ students, events }) => {
  const { housePoints: eventPoints } = usePoints(students, events);
  
  // State for initial/bonus points input
  const [initialPoints, setInitialPoints] = useState<Record<HouseName, number>>({
    [HouseName.Yellow]: 0,
    [HouseName.Blue]: 0,
    [HouseName.Green]: 0,
    [HouseName.Red]: 0,
  });

  // Fetch initial points from backend on mount
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

  const handleInitialChange = async (house: HouseName, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    
    // Optimistic update (update UI immediately)
    setInitialPoints(prev => ({ ...prev, [house]: numValue }));

    // Debounce or just send request (sending on every keystroke is okay for low traffic, 
    // but better to use onBlur in production. For simplicity here, we send it directly).
    try {
        await api.put(`/houses/${house}`, { initialPoints: numValue });
    } catch (error) {
        console.error(`Failed to update ${house} points`, error);
    }
  };

  // Compute total points (Event Points + Initial Values)
  const chartData = useMemo(() => {
    return HOUSES.map(house => {
      const ePoints = eventPoints.find(hp => hp.name === house.name)?.score || 0;
      const iPoints = initialPoints[house.name];
      return {
        name: house.name,
        EventPoints: ePoints,
        InitialPoints: iPoints,
        Total: ePoints + iPoints,
        color: house.color.replace('bg-', '').replace('-500', '') 
      };
    });
  }, [eventPoints, initialPoints]);

  const leadingHouse = useMemo(() => {
    return [...chartData].sort((a, b) => b.Total - a.Total)[0];
  }, [chartData]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
            <ChartIcon />
        </div>
        <h1 className="text-4xl font-bold">Points Computation System</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Section */}
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">⚡</span> Initial Values Configuration
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter base points or handicap values for each house. These are added to the points earned from events.
          </p>
          
          <div className="space-y-4">
            {HOUSES.map(house => (
              <div key={house.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${house.color}`}></div>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{house.name}</span>
                </div>
                <input
                  type="number"
                  value={initialPoints[house.name]}
                  onChange={(e) => handleInitialChange(house.name, e.target.value)}
                  className="w-24 px-2 py-1 text-right bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Current Leader</h3>
            <div className="flex items-center space-x-3">
               <TrophyIcon />
               <span className="text-2xl font-bold">{leadingHouse.name} House</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Total Score: {leadingHouse.Total}
            </p>
          </div>
        </Card>

        {/* Right Column: Live Graph */}
        <Card className="lg:col-span-2 min-h-[500px] flex flex-col">
          <h2 className="text-xl font-semibold mb-6">Live Status Graph</h2>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="InitialPoints" name="Initial Points" stackId="a" fill="#94a3b8" radius={[0, 0, 4, 4]} />
                <Bar dataKey="EventPoints" name="Event Points" stackId="a" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => {
                     // Map house names to hex colors
                     const colors: Record<string, string> = {
                         Yellow: '#eab308',
                         Blue: '#3b82f6',
                         Green: '#22c55e',
                         Red: '#ef4444'
                     };
                     return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#8884d8'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PointsSystem;