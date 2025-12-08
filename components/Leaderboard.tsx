import React, { useState, useMemo } from 'react';
import { type Student, type SportEvent, HouseName, AgeCategory } from '../types';
import { usePoints } from '../src/hooks/usePoints';
import { HOUSES } from '../constants';
import Card from './common/Card';
import { TrophyIcon, UserIcon } from './Icons';

interface LeaderboardProps {
    students: Student[];
    events: SportEvent[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ students, events }) => {
    const { housePoints, studentPoints } = usePoints(students, events);

    const [activeTab, setActiveTab] = useState<'house' | 'student'>('house');
    const [classFilter, setClassFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [houseFilter, setHouseFilter] = useState('all');

    const filteredStudentPoints = useMemo(() => {
        return studentPoints.filter(sp => {
            if (!sp.student) return false;
            const matchesClass = classFilter === 'all' || sp.student.class === classFilter;
            const matchesCategory = categoryFilter === 'all' || sp.student.category === categoryFilter;
            const matchesHouse = houseFilter === 'all' || sp.student.house === houseFilter;
            return matchesClass && matchesCategory && matchesHouse;
        });
    }, [studentPoints, classFilter, categoryFilter, houseFilter]);

    const classOptions = ['all', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('house')}
                    className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'house'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    House Standings
                </button>
                <button
                    onClick={() => setActiveTab('student')}
                    className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'student'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Student Rankings
                </button>
            </div>

            {activeTab === 'house' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {housePoints.map((house, index) => {
                        const houseDetails = HOUSES.find(h => h.name === house.name);
                        return (
                            <Card key={house.name} className={`relative overflow-hidden ${index === 0 ? 'ring-4 ring-yellow-400' : ''}`}>
                                {index === 0 && (
                                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg">
                                        LEADER
                                    </div>
                                )}
                                <div className="flex flex-col items-center p-4">
                                    <div className={`w-20 h-20 rounded-full ${houseDetails?.color} flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg`}>
                                        {index === 0 ? <TrophyIcon /> : index + 1}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-1">{house.name}</h3>
                                    <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{house.score}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-2">Total Points</p>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {activeTab === 'student' && (
                <Card>
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Class</label>
                            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="all">All Classes</option>
                                {classOptions.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : `Class ${c}`}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Category</label>
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="all">All Categories</option>
                                {Object.values(AgeCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">House</label>
                            <select value={houseFilter} onChange={e => setHouseFilter(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="all">All Houses</option>
                                {Object.values(HouseName).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <th className="p-3 font-medium">Rank</th>
                                    <th className="p-3 font-medium">Student</th>
                                    <th className="p-3 font-medium">Class</th>
                                    <th className="p-3 font-medium">House</th>
                                    <th className="p-3 font-medium text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudentPoints.map((sp, index) => (
                                    <tr key={sp.studentId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="p-3">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-200 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="p-3 font-medium">{sp.student?.fullName}</td>
                                        <td className="p-3 text-gray-600 dark:text-gray-400">{sp.student?.class}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${HOUSES.find(h => h.name === sp.student?.house)?.color}`}>
                                                {sp.student?.house}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{sp.score}</td>
                                    </tr>
                                ))}
                                {filteredStudentPoints.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            No students found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Leaderboard;
