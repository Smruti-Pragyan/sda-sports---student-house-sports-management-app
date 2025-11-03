import React, { useState, useMemo } from 'react';
import { type Student, type SportEvent, type HouseName } from '../types';
import { HOUSES } from '../constants';
import Card from './common/Card';
import { TrophyIcon, UserIcon } from './Icons';
import Pagination from './common/Pagination';

interface HouseDashboardProps {
  houseName: HouseName;
  students: Student[];
  events: SportEvent[];
}

const HouseDashboard: React.FC<HouseDashboardProps> = ({ houseName, students, events }) => {
  const houseDetails = HOUSES.find(h => h.name === houseName);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  if (!houseDetails) {
    return <div className="p-8 text-center text-red-500">House not found!</div>;
  }

  const houseStudents = useMemo(() => students.filter(s => s.house === houseName)
    .sort((a, b) => a.fullName.localeCompare(b.fullName)), 
  [students, houseName]);

  const houseTotalPoints = useMemo(() => {
    let points = 0;
    events.forEach(event => {
      event.participants.forEach(p => {
        const student = houseStudents.find(s => s.id === p.studentId);
        if (student) {
          points += p.score;
        }
      });
    });
    return points;
  }, [events, houseStudents]);
  
  const studentParticipatedEvents = useMemo(() => {
    const participatedEvents: Record<string, string[]> = {};
    
    houseStudents.forEach(student => {
        participatedEvents[student.id] = [];
    });

    events.forEach(event => {
        event.participants.forEach(p => {
            if (participatedEvents[p.studentId]) {
                participatedEvents[p.studentId].push(event.name);
            }
        });
    });

    return participatedEvents;
  }, [events, houseStudents]);

  const totalPages = Math.ceil(houseStudents.length / ITEMS_PER_PAGE);
  const paginatedHouseStudents = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return houseStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [houseStudents, currentPage]);
  
  return (
    <div className="p-8">
      <div className={`p-6 rounded-lg mb-8 bg-gradient-to-r from-gray-700 to-gray-800 border-l-8 ${houseDetails.accentColor}`}>
        <h1 className="text-4xl font-bold text-white">{houseDetails.name} House</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
            <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    <UserIcon />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</p>
                    <p className="text-2xl font-bold">{houseStudents.length}</p>
                </div>
            </div>
        </Card>
        <Card>
            <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500">
                    <TrophyIcon />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Points</p>
                    <p className="text-2xl font-bold">{houseTotalPoints}</p>
                </div>
            </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-2xl font-semibold mb-4">House Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              {/* THIS IS YOUR REQUESTED CHANGE (snippet 2) */}
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3">Full Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">UID</th>
                <th className="p-3">Events Participated</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHouseStudents.map(student => {
                const participatedEvents = studentParticipatedEvents[student.id] || [];
                return (
                  <tr key={student.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="p-3">{student.fullName}</td>
                    <td className="p-3">{student.class}</td>
                    <td className="p-3">{student.uid}</td> {/* CHANGED from student.rollNumber */}
                    <td className="p-3">{participatedEvents.length > 0 ? participatedEvents.join(', ') : 'None'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
            {paginatedHouseStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    This house has no members yet.
                </div>
            )}
        </div>
         <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
};

export default HouseDashboard;