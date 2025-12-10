import React, { useState, useMemo } from 'react';
import { type SportEvent, type Student, EventType, AgeCategory, HouseName } from '../types'; 
import Card from './common/Card';
import Modal from './common/Modal';
import { PlusIcon, ErrorIcon } from './Icons';
import api from '../src/api';
import { HOUSES } from '../constants'; 

interface EventManagementProps {
  events: SportEvent[];
  setEvents: React.Dispatch<React.SetStateAction<SportEvent[]>>;
  students: Student[];
}

const EventForm: React.FC<{ event?: SportEvent; onSave: (event: Omit<SportEvent, 'id' | 'participants' | 'createdAt' | 'updatedAt'> | SportEvent) => void; onCancel: () => void }> = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: event?.name || '',
    type: event?.type || EventType.Individual,
    status: event?.status || 'Upcoming',
    maxParticipants: event?.maxParticipants || 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'maxParticipants' ? parseInt(value, 10) : value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (event) {
      onSave({ ...event, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Event Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Type</label>
          <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500">
            {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500">
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
       <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Max Participants</label>
        <input type="number" name="maxParticipants" min="1" value={formData.maxParticipants} onChange={handleChange} required className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Save Event</button>
      </div>
    </form>
  );
};

const ManageParticipantsModal: React.FC<{
    event: SportEvent,
    students: Student[],
    events: SportEvent[], 
    onClose: () => void,
    setEvents: React.Dispatch<React.SetStateAction<SportEvent[]>>
}> = ({ event, students, events, onClose, setEvents }) => { 
    const [participants, setParticipants] = useState(event.participants.map(p => ({
        studentId: typeof p.studentId === 'string' ? p.studentId : (p.studentId._id || (p.studentId as any).id),
        score: p.score
    })));
    const [maxParticipants, setMaxParticipants] = useState(event.maxParticipants);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [classFilter, setClassFilter] = useState('all');
    const [houseFilters, setHouseFilters] = useState<Set<HouseName>>(new Set());

    const [scoreInputs, setScoreInputs] = useState<Record<string, string>>(() =>
        event.participants.reduce((acc, p) => {
            const id = typeof p.studentId === 'string' ? p.studentId : (p.studentId._id || (p.studentId as any).id);
            acc[id] = p.score.toString();
            return acc;
        }, {} as Record<string, string>)
    );
    const [scoreErrors, setScoreErrors] = useState<Record<string, boolean>>({});
    const [saveError, setSaveError] = useState<string | null>(null);
    const [addParticipantError, setAddParticipantError] = useState<string | null>(null);
    
    const handleHouseFilterChange = (house: HouseName) => {
        const newFilters = new Set(houseFilters);
        if (newFilters.has(house)) {
            newFilters.delete(house);
        } else {
            newFilters.add(house);
        }
        setHouseFilters(newFilters);
    };

    const availableStudents = useMemo(() => {
        return students.filter(s => {
            const studentId = s._id || s.id;
            const isAlreadyParticipant = participants.some(p => p.studentId === studentId);
            if (isAlreadyParticipant) return false;

            const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
            const matchesClass = classFilter === 'all' || s.class === classFilter;
            const matchesHouse = houseFilters.size === 0 || houseFilters.has(s.house);
            
            return matchesCategory && matchesClass && matchesHouse;
        });
    }, [students, participants, categoryFilter, classFilter, houseFilters]);

    const isFull = participants.length >= maxParticipants;
    const vacancies = maxParticipants - participants.length;

    const handleAddParticipant = () => {
        setAddParticipantError(null); 
        if (!selectedStudentId || isFull) return;

        // --- NEW FEATURE: CHECK 3 EVENT LIMIT ---
        const currentEventId = event._id || event.id;
        
        // Count how many events the student is currently enrolled in (excluding the current one we are editing)
        const enrolledCount = events.reduce((count, e) => {
            // Skip the event currently being edited to avoid staleness/double counting
            if ((e._id || e.id) === currentEventId) return count;

            const isEnrolled = e.participants.some(p => {
                const pId = typeof p.studentId === 'string' ? p.studentId : (p.studentId as any)._id || (p.studentId as any).id;
                return pId === selectedStudentId;
            });
            
            return isEnrolled ? count + 1 : count;
        }, 0);

        // If they are already in 3 or more OTHER events, adding them here would exceed the limit
        if (enrolledCount >= 3) {
            setAddParticipantError(`Cannot add student: Already enrolled in the maximum limit of 3 events.`);
            return;
        }
        // ----------------------------------------
        
        const newParticipant = { studentId: selectedStudentId, score: 0 };
        setParticipants(prev => [...prev, newParticipant]);
        setScoreInputs(prev => ({ ...prev, [selectedStudentId]: '0' }));
        setSelectedStudentId('');
    };
    
    const handleRemoveParticipant = (studentId: string) => {
        setParticipants(prev => prev.filter(p => p.studentId !== studentId));
        const newScoreInputs = { ...scoreInputs };
        delete newScoreInputs[studentId];
        setScoreInputs(newScoreInputs);
        const newScoreErrors = { ...scoreErrors };
        delete newScoreErrors[studentId];
        setScoreErrors(newScoreErrors);
    };

    const handleScoreChange = (studentId: string, value: string) => {
        setSaveError(null);
        setScoreInputs(prev => ({ ...prev, [studentId]: value }));
        if (/^\d*$/.test(value)) {
            setScoreErrors(prev => ({ ...prev, [studentId]: false }));
        } else {
            setScoreErrors(prev => ({ ...prev, [studentId]: true }));
        }
    };
    
    const handleSave = async () => {
        const hasErrors = Object.values(scoreErrors).some(err => err);
        if (hasErrors) {
            setSaveError("Please fix the errors in the scores. Scores must be whole numbers.");
            return;
        }

        const updatedParticipants = participants.map(p => ({
            ...p,
            score: parseInt(scoreInputs[p.studentId] || '0', 10),
        }));
        
        const updatedEventData = {
            ...event,
            participants: updatedParticipants,
            maxParticipants: maxParticipants,
        };

        try {
            const eventId = event._id || event.id;
            const { data: savedEvent } = await api.put(`/events/${eventId}`, updatedEventData);
            setEvents(prev => prev.map(e => (e._id || e.id) === eventId ? savedEvent : e));
            onClose();
        } catch (error) {
            console.error("Failed to update event participants", error);
            alert("Failed to save changes.");
        }
    };
    
    const classOptions = ['all', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

    return (
        <div className="space-y-4 text-gray-800 dark:text-gray-200">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <label htmlFor="max-participants" className="font-semibold text-lg">Event Slots:</label>
                    <input
                        id="max-participants"
                        type="number"
                        min="1"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(parseInt(e.target.value, 10) || 1)}
                        className="w-20 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-center focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{participants.length} / {maxParticipants} Filled</span>
            </div>
            
            <hr className="dark:border-gray-600"/>

            <h4 className="font-semibold text-lg">Add Participants</h4>
            
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md space-y-3">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Filters</label>
                <div className="grid grid-cols-2 gap-3">
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="all">All Categories</option>
                        {Object.values(AgeCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                        {classOptions.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                    </select>
                </div>
                {event.type === EventType.Team && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 self-center">Houses:</span>
                        {HOUSES.map(house => (
                            <label key={house.name} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={houseFilters.has(house.name)}
                                    onChange={() => handleHouseFilterChange(house.name)}
                                    className={`form-checkbox h-5 w-5 rounded focus:ring-0`}
                                    style={{ 
                                      backgroundColor: houseFilters.has(house.name) ? HOUSES.find(h=>h.name === house.name)?.color.replace('bg-','').replace('-500','') : '#cbd5e1',
                                      color: 'transparent'
                                    }}
                                />
                                <span className="text-sm">{house.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="flex space-x-2">
                <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} disabled={isFull} className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">Select a student</option>
                    {availableStudents.map(s => {
                        const studentId = s._id || s.id;
                        return <option key={studentId} value={studentId}>{s.fullName} ({s.class}) - {s.house}</option>
                    })}
                </select>
                <button onClick={handleAddParticipant} disabled={isFull || !selectedStudentId} className="px-4 py-2 bg-blue-600 text-white rounded-md self-end hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">Add</button>
            </div>
            
            {isFull ? (
                <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">
                    Event is full. ({participants.length} / {maxParticipants} Filled)
                </p>
            ) : (
                <p className="text-center text-sm text-green-600 dark:text-green-400">
                    {vacancies} {vacancies === 1 ? 'vacancy' : 'vacancies'} remaining.
                </p>
            )}

            {addParticipantError && ( 
                <p className="text-sm text-red-500 text-center pt-2 flex items-center justify-center font-semibold bg-red-100 dark:bg-red-900/30 p-2 rounded">
                    <ErrorIcon /> {addParticipantError}
                </p>
            )}
            
            <h4 className="font-semibold text-lg pt-4">Current Participants & Scores</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {participants.map(p => {
                    const student = students.find(s => (s._id || s.id) === p.studentId);
                    const isInvalid = scoreErrors[p.studentId];
                    return (
                        <div key={p.studentId} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <span>{student?.fullName} ({student?.house})</span>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={scoreInputs[p.studentId] ?? ''}
                                    onChange={(e) => handleScoreChange(p.studentId, e.target.value)}
                                    className={`w-20 bg-gray-200 dark:bg-gray-600 border rounded-md p-1 text-center ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-500 focus:ring-blue-500 focus:border-blue-500'}`}
                                    aria-invalid={isInvalid}
                                />
                                <button onClick={() => handleRemoveParticipant(p.studentId)} className="text-red-500 hover:text-red-400 font-bold text-xl">&times;</button>
                            </div>
                        </div>
                    );
                })}
                 {participants.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">No participants added yet.</p>}
            </div>
            
            {saveError && <p className="text-sm text-red-500 text-center pt-2">{saveError}</p>}
            
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500">Save Changes</button>
            </div>
        </div>
    );
}

const isDateWithinRange = (isoDateString: string, range: 'today' | 'week' | 'month'): boolean => {
    const date = new Date(isoDateString);
    const now = new Date();
    date.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    if (range === 'today') {
        return date.getTime() === now.getTime();
    }
    const pastDate = new Date(now);
    if (range === 'week') {
        pastDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
        pastDate.setDate(now.getDate() - 30);
    }
    return date >= pastDate;
};


const EventManagement: React.FC<EventManagementProps> = ({ events, setEvents, students }) => { 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SportEvent | undefined>(undefined);
  const [managingParticipantsEvent, setManagingParticipantsEvent] = useState<SportEvent | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [eventToDelete, setEventToDelete] = useState<SportEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || event.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
        const createdAt = (event as any).createdAt || new Date().toISOString();
        const matchesDate = dateFilter === 'all' || isDateWithinRange(createdAt, dateFilter as any);
        return matchesSearch && matchesType && matchesStatus && matchesDate;
      });
  }, [events, searchTerm, typeFilter, statusFilter, dateFilter]);
  
  const handleAddEvent = async (eventData: Omit<SportEvent, 'id' | 'participants' | 'createdAt' | 'updatedAt'>) => {
    try {
        const { data: newEvent } = await api.post('/events', {...eventData, participants: []});
        setEvents(prev => [...prev, newEvent]);
        setIsModalOpen(false);
    } catch (error: any) {
        console.error("Failed to add event", error);
        alert(`Failed to add event: ${error.response?.data?.message || 'Server error'}`);
    }
  };
  
  const handleEditEvent = async (eventData: SportEvent) => {
    try {
        const eventId = eventData._id || eventData.id;
        const { data: updatedEvent } = await api.put(`/events/${eventId}`, eventData);
        setEvents(prev => prev.map(e => (e._id || e.id) === eventId ? updatedEvent : e));
        setIsModalOpen(false);
        setEditingEvent(undefined);
    } catch (error: any) {
        console.error("Failed to update event", error);
        alert(`Failed to update event: ${error.response?.data?.message || 'Server error'}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
        try {
            const eventId = eventToDelete._id || eventToDelete.id;
            await api.delete(`/events/${eventId}`);
            setEvents(prev => prev.filter(e => (e._id || e.id) !== eventId));
            setEventToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete event", error);
            alert(`Failed to delete event: ${error.response?.data?.message || 'Server error'}`);
        }
    }
  };
  
  const openEditModal = (event: SportEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  }

  const openAddModal = () => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };
  
  const openParticipantModal = (event: SportEvent) => {
    setManagingParticipantsEvent(event);
    setIsParticipantModalOpen(true);
  }

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateFilter('all');
  };

  const isFiltered = searchTerm !== '' || typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all';
  const currentEvents = filteredEvents.map(e => ({...e, id: e._id || e.id}));

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Event Management</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                <input
                    type="text"
                    placeholder="Search by event name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter by type"
                >
                    <option value="all">All Types</option>
                    {Object.values(EventType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter by status"
                >
                    <option value="all">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                </select>
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter by date added"
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 30 days</option>
                </select>
                {isFiltered && (
                    <button 
                        onClick={handleClearFilters} 
                        className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                        title="Clear filters"
                    >
                        Clear
                    </button>
                )}
            </div>
            <div className="flex space-x-2">
                <button onClick={openAddModal} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
                    <PlusIcon /> Add Event
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEvents.map(event => {
            // --- LOGIC FOR THE SLOT STATUS MESSAGE ---
            const vacancies = event.maxParticipants - event.participants.length;
            const isNotFull = vacancies > 0;
            // --- END OF LOGIC ---
            
            return (
                <Card key={event.id} className="flex flex-col">
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold mb-2">{event.name}</h2>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                                event.status === 'Completed' ? 'bg-gray-500' : event.status === 'Ongoing' ? 'bg-green-500' : 'bg-blue-500'
                            }`}>{event.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{event.type} Event</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Participants: {event.participants.length} / {event.maxParticipants}</p>
                        
                        {isNotFull && (
                            <p className="text-red-500 dark:text-red-400 text-sm font-medium mt-2 flex items-center">
                                <ErrorIcon />
                                {vacancies} {vacancies === 1 ? 'slot' : 'slots'} not filled yet.
                            </p>
                        )}

                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex justify-end space-x-2">
                        <button onClick={() => openParticipantModal(event)} className="text-sm px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800">Manage</button>
                        <button onClick={() => openEditModal(event)} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800">Edit</button>
                        <button onClick={() => setEventToDelete(event)} className="text-sm px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800">Delete</button>
                    </div>
                </Card>
            )
        })}
      </div>
       {events.length === 0 && (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <p className="text-lg">No events created yet.</p>
                <p className="mt-2">Click "Add Event" to get started.</p>
            </div>
        )}
       {events.length > 0 && filteredEvents.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No events match your filters.</p>
              <p className="mt-2">Try adjusting your search or filters.</p>
          </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? "Edit Event" : "Add New Event"}>
        <EventForm 
            event={editingEvent}
            onSave={(e) => editingEvent ? handleEditEvent(e as SportEvent) : handleAddEvent(e as Omit<SportEvent, 'id' | 'participants' | 'createdAt' | 'updatedAt'>)}
            onCancel={() => {setIsModalOpen(false); setEditingEvent(undefined);}} 
        />
      </Modal>

      {managingParticipantsEvent && (
        <Modal isOpen={isParticipantModalOpen} onClose={() => setIsParticipantModalOpen(false)} title={`Manage: ${managingParticipantsEvent.name}`}>
            <ManageParticipantsModal
                event={managingParticipantsEvent}
                students={students}
                events={events} 
                onClose={() => setIsParticipantModalOpen(false)}
                setEvents={setEvents}
            />
        </Modal>
      )}

      <Modal isOpen={!!eventToDelete} onClose={() => setEventToDelete(null)} title="Confirm Deletion">
        {eventToDelete && (
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete the event <span className="font-semibold">{eventToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setEventToDelete(null)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventManagement;