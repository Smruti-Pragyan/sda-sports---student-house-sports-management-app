import React, { useState, useMemo, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas'; // <--- Add this
import { jsPDF } from 'jspdf';
import { type Student, HouseName, AgeCategory, type SportEvent, EventType } from '../types';
import Card from './common/Card';
import Modal from './common/Modal';
import { PlusIcon, UploadIcon, TrashIcon, ReportIcon, ShareIcon } from './Icons';
import { HOUSES, STUDENT_CAPACITY } from '../constants';
import Pagination from './common/Pagination';
import api from '../src/api';

interface StudentManagementProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>; 
  events: SportEvent[];
}

const StudentForm: React.FC<{ student?: Student; onSave: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> | Student) => void; onCancel: () => void }> = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: student?.fullName || '',
    class: student?.class || '',
    uid: student?.uid || '', 
    phone: student?.phone || '',
    house: student?.house || HouseName.Yellow,
    category: student?.category || AgeCategory.U13,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
        onSave({ ...student, ...formData });
    } else {
        onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</label>
        <input 
          type="text" 
          name="fullName" 
          value={formData.fullName} 
          onChange={handleChange} 
          required 
          className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
          pattern="[A-Za-z ]+"
          title="Full name must contain only alphabets and spaces."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Class</label>
          <select 
            name="class" 
            value={formData.class} 
            onChange={handleChange} 
            required 
            className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>Select a class</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num.toString()}>{num}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Student UID</label>
          <input 
            type="text" 
            name="uid" 
            value={formData.uid} 
            onChange={handleChange} 
            required 
            className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
            pattern="[0-9]+"
            title="Student UID must contain only numbers."
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Phone</label>
        <input 
          type="tel" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          required 
          className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500" 
          pattern="[0-9]{10}"
          maxLength={10}
          title="Phone number must be exactly 10 digits (e.g., 1234567890)"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">House</label>
            <select name="house" value={formData.house} onChange={handleChange} className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(HouseName).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
         </div>
         <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500">
                {Object.values(AgeCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
         </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">Save Student</button>
      </div>
    </form>
  );
};

const BulkRegisterModal: React.FC<{onClose: () => void, setStudents: React.Dispatch<React.SetStateAction<Student[]>>, students: Student[]}> = ({ onClose, setStudents, students }) => {
    const [csvData, setCsvData] = useState('');
    
    const handleBulkAdd = async () => {
        const lines = csvData.trim().split('\n');
        let entryIndex = 0;
        const houseNames = Object.values(HouseName);
        const categories = Object.values(AgeCategory);
        
        const validClasses = new Set(Array.from({ length: 12 }, (_, i) => (i + 1).toString()));

        const newStudents = lines.map(line => {
            const [fullName, studentClass, uid, phone] = line.split(',').map(item => item.trim());
            
            if (fullName && studentClass && uid && phone) {
                if (!/^[A-Za-z ]+$/.test(fullName)) {
                    console.warn(`Skipping student ${fullName}: Name '${fullName}' must contain only letters and spaces.`);
                    return null;
                }
                 if (!/^[0-9]+$/.test(uid)) {
                    console.warn(`Skipping student ${fullName}: UID '${uid}' must contain only numbers.`);
                    return null;
                }
                if (!/^[0-9]{10}$/.test(phone)) {
                    console.warn(`Skipping student ${fullName}: Phone number '${phone}' is not 10 digits.`);
                    return null;
                }
                if (!validClasses.has(studentClass)) {
                     console.warn(`Skipping student ${fullName}: Class '${studentClass}' is not valid (must be 1-12).`);
                    return null;
                }

                const student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = {
                    fullName,
                    class: studentClass,
                    uid,
                    phone,
                    house: houseNames[entryIndex % houseNames.length],
                    category: categories[entryIndex % categories.length],
                };
                entryIndex++;
                return student;
            }
            return null;
        }).filter((s): s is Omit<Student, 'id' | 'createdAt' | 'updatedAt'> => s !== null);

        if (newStudents.length === 0) {
            alert('No valid student data found. Please check the format (FullName,Class,UID,PhoneNumber) and ensure names contain only letters/spaces, UIDs contain only numbers, phone numbers are 10 digits, and classes are 1-12.');
            return;
        }

        const availableSlots = STUDENT_CAPACITY - students.length;

        if (availableSlots <= 0) {
            alert(`Cannot add any new students. The maximum capacity of ${STUDENT_CAPACITY} has been reached.`);
            return;
        }

        const studentsToAdd = newStudents.slice(0, availableSlots);
        const rejectedCount = newStudents.length - studentsToAdd.length;

        try {
            const { data: createdStudents } = await api.post('/students/bulk', { students: studentsToAdd });
            setStudents(prev => [...prev, ...createdStudents]);
            
            let message = `Successfully added ${createdStudents.length} students.`;
            if (rejectedCount > 0) {
                message += `\n${rejectedCount} students were not added as the student capacity of ${STUDENT_CAPACITY} would be exceeded.`;
            }
            alert(message);
            onClose();
        } catch (error: any) { 
            console.error("Failed to bulk add students", error);
            alert(`An error occurred while adding students: ${error.response?.data?.message || 'Server error'}`);
        }
    }

    return (
        <div className="space-y-4 text-gray-800 dark:text-gray-200">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste student data in CSV format (one student per line):
                <br />
                <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded">FullName,Class,UID,PhoneNumber</code>
                <br />
                <span className="text-xs">Note: Name must be letters/spaces. Class must be 1-12. UID must be numbers. Phone number must be exactly 10 digits.</span>
            </p>
            <textarea
                value={csvData}
                onChange={e => setCsvData(e.target.value)}
                rows={10}
                className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe,10,101,1234567890&#10;Jane Smith,9,102,0987654321" 
            />
             <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={handleBulkAdd} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500">Add Students</button>
            </div>
        </div>
    )
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


const StudentManagement: React.FC<StudentManagementProps> = ({ students, setStudents, events }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [houseFilter, setHouseFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [reportingStudent, setReportingStudent] = useState<Student | null>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const isAdmin = true;
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [logoDataUri, setLogoDataUri] = useState<string>('');

  useEffect(() => {
    fetch('/sda-logo.png')
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoDataUri(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => console.error("Error fetching logo:", error));
  }, []);

  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (students.length >= STUDENT_CAPACITY) {
      alert(`Cannot add new student. The maximum capacity of ${STUDENT_CAPACITY} students has been reached.`);
      return;
    }
    try {
        const { data: newStudent } = await api.post('/students', studentData);
        setStudents(prev => [...prev, newStudent]);
        setIsModalOpen(false);
    } catch (error: any) { 
        console.error("Failed to add student", error);
        alert(`Failed to add student: ${error.response?.data?.message || 'Server error'}`);
    }
  };
  
  const handleEditStudent = async (studentData: Student) => {
    try {
        const id = (studentData as any)._id || studentData.id;
        const { data: updatedStudent } = await api.put(`/students/${id}`, studentData);
        setStudents(prev => prev.map(s => ((s as any)._id || s.id) === id ? updatedStudent : s));
        setIsModalOpen(false);
        setEditingStudent(undefined);
    } catch (error: any) {
        console.error("Failed to update student", error);
        alert(`Failed to update student: ${error.response?.data?.message || 'Server error'}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
        try {
            const id = (studentToDelete as any)._id || studentToDelete.id;
            await api.delete(`/students/${id}`);
            setStudents(prev => prev.filter(s => ((s as any)._id || s.id) !== id));
            setStudentToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete student", error);
            alert(`Failed to delete student: ${error.response?.data?.message || 'Server error'}`);
        }
    }
  };
  
  const handleConfirmBulkDelete = async () => {
    const idsToDelete = Array.from(selectedStudents);
    try {
        await api.delete('/students/bulk', { data: { ids: idsToDelete } });
        setStudents(prev => prev.filter(s => !idsToDelete.includes((s as any)._id || s.id)));
        setSelectedStudents(new Set());
        setIsBulkDeleteModalOpen(false);
    } catch (error: any) {
        console.error("Failed to bulk delete students", error);
        alert(`Failed to bulk delete students: ${error.response?.data?.message || 'Server error'}`);
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  }

  const openAddModal = () => {
    setEditingStudent(undefined);
    setIsModalOpen(true);
  };

  const filteredStudents = useMemo(() => {
    return students
      .slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .filter(s => {
        const matchesSearchTerm = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.uid.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesHouse = houseFilter === 'all' || s.house === houseFilter;
        const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
        const createdAt = (s as any).createdAt || new Date().toISOString();
        const matchesDate = dateFilter === 'all' || isDateWithinRange(createdAt, dateFilter as any);

        return matchesSearchTerm && matchesHouse && matchesCategory && matchesDate;
    });
  }, [students, searchTerm, houseFilter, categoryFilter, dateFilter]);

  const studentReportData = useMemo(() => {
    if (!reportingStudent) return null;
    const studentId = (reportingStudent as any)._id || reportingStudent.id;

    const participatedEvents = events
      .map(event => {
        const participant = event.participants.find(p => {
            const participantStudentId = (p.studentId as any)._id || p.studentId;
            return participantStudentId === studentId;
        });

        if (participant) {
          return {
            eventName: event.name,
            eventType: event.type,
            score: participant.score,
          };
        }
        return null;
      })
      .filter((e): e is { eventName: string; eventType: EventType; score: number } => e !== null);

    const totalPoints = participatedEvents.reduce((sum, e) => sum + e.score, 0);
    const totalEvents = participatedEvents.length;
    const averageScore = totalEvents > 0 ? (totalPoints / totalEvents).toFixed(2) : 'N/A';

    return {
      participatedEvents,
      totalPoints,
      totalEvents,
      averageScore,
    };
  }, [reportingStudent, events]);
  
const handleExport = async (action: 'pdf' | 'png' | 'share') => {
    if (!reportContentRef.current || !reportingStudent) return;
    
    setIsExporting(true);

    try {
        const canvas = await html2canvas(reportContentRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            onclone: (clonedDoc: Document) => {
                const reportNode = clonedDoc.getElementById('student-report-content');
                if (reportNode) {
                  reportNode.style.color = document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827';
                  reportNode.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff';
                }
                const logoInClone = clonedDoc.getElementById('report-logo-img') as HTMLImageElement | null;
                if (logoInClone) {
                    logoInClone.src = logoDataUri; 
                }
            }
        });

        const fileName = `progress-report-${reportingStudent.fullName.replace(/\s/g, '_')}`;

        if (action === 'share') {
            canvas.toBlob(async (blob: Blob | null) => {
                if (!blob) {
                    alert('Failed to generate image for sharing.');
                    setIsExporting(false);
                    return;
                }
                
                const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
                
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: 'Student Progress Report',
                            text: `Check out the progress report for ${reportingStudent.fullName}`,
                            files: [file]
                        });
                    } catch (err: any) {
                        if (err.name !== 'AbortError') {
                            console.error('Error sharing:', err);
                            alert('Failed to share via native sharing. Try downloading instead.');
                        }
                    }
                } else {
                    const image = canvas.toDataURL('image/png', 1.0);
                    const link = document.createElement('a');
                    link.href = image;
                    link.download = `${fileName}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    alert('Sharing is not supported on this device/browser. The report has been downloaded instead.');
                }
                setIsExporting(false);
            }, 'image/png');

        } else if (action === 'png') {
            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `${fileName}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsExporting(false);
        } else { // pdf
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasAspectRatio = canvas.width / canvas.height;

            let finalWidth = pdfWidth - 40;
            let finalHeight = finalWidth / canvasAspectRatio;

            if (finalHeight > pdfHeight - 40) {
                finalHeight = pdfHeight - 40;
                finalWidth = finalHeight * canvasAspectRatio;
            }
            
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            pdf.save(`${fileName}.pdf`);
            setIsExporting(false);
        }
    } catch (e) {
        console.error("Export/Share failed", e);
        alert("An error occurred while exporting/sharing. Please check the console for more details.");
        setIsExporting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedStudents(new Set());
  }, [searchTerm, houseFilter, categoryFilter, dateFilter]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelection = new Set(selectedStudents);
    if (checked) {
      newSelection.add(studentId);
    } else {
      newSelection.delete(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const handleSelectAllClick = (checked: boolean) => {
    if (checked) {
      const allVisibleIds = new Set(paginatedStudents.map(s => (s as any)._id || s.id));
      setSelectedStudents(allVisibleIds);
    } else {
      setSelectedStudents(new Set());
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setHouseFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
  };
  
  const isFiltered = searchTerm !== '' || houseFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all';
  const isAllOnPageSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudents.has((s as any)._id || s.id));
  const currentStudents = paginatedStudents.map(s => ({...s, id: (s as any)._id || s.id}));

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Student Management</h1>
        <div className="w-full sm:w-64">
            <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
                <span>Enrolled</span>
                <span>{students.length} / {STUDENT_CAPACITY}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
                <div className={`h-2 rounded-full ${students.length / STUDENT_CAPACITY > 0.9 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${(students.length / STUDENT_CAPACITY) * 100}%` }}></div>
            </div>
        </div>
      </div>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
             {selectedStudents.size > 0 ? (
                <button 
                  onClick={() => setIsBulkDeleteModalOpen(true)} 
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Selected ({selectedStudents.size})
                </button>
            ) : (
                <input
                  type="text"
                  placeholder="Search by name, class, or UID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
            )}
            <select
                value={houseFilter}
                onChange={(e) => setHouseFilter(e.target.value)}
                className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by house"
            >
                <option value="all">All Houses</option>
                {Object.values(HouseName).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by category"
            >
                <option value="all">All Categories</option>
                {Object.values(AgeCategory).map(c => <option key={c} value={c}>{c}</option>)}
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
            <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500">
                <UploadIcon /> Bulk Register
            </button>
            <button onClick={openAddModal} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
              <PlusIcon /> Add Student
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-3">Full Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">UID</th> 
                <th className="p-3">Category</th>
                <th className="p-3">House</th>
                <th className="p-3">Phone</th>
                {isAdmin && <th className="p-3">Actions</th>}
                <th className="p-3 w-4">
                  <input
                    type="checkbox"
                    checked={isAllOnPageSelected}
                    onChange={(e) => handleSelectAllClick(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map(student => (
                <tr 
                  key={student.id} 
                  className={`border-b border-gray-200 dark:border-gray-700 cursor-pointer ${selectedStudents.has(student.id) ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => setViewingStudent(student)}
                >
                  <td className="p-3">{student.fullName}</td>
                  <td className="p-3">{student.class}</td>
                  <td className="p-3">{student.uid}</td> 
                  <td className="p-3">{student.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${HOUSES.find(h => h.name === student.house)?.color}`}>
                      {student.house}
                    </span>
                  </td>
                  <td className="p-3">{student.phone}</td>
                  {isAdmin && (
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setReportingStudent(student)} className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300" title="View report">
                                <ReportIcon />
                            </button>
                            <button onClick={() => openEditModal(student)} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">Edit</button>
                            <button onClick={() => setStudentToDelete(student)} className="text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400" title="Delete student">
                                <TrashIcon />
                            </button>
                        </div>
                    </td>
                  )}
                  <td className="p-3 w-4" onClick={e => e.stopPropagation()}>
                     <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-blue-600 bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500"
                     />
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
           {paginatedStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No students found.
              </div>
          )}
        </div>
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? "Edit Student" : "Add New Student"}>
        <StudentForm 
            student={editingStudent}
            onSave={(s) => editingStudent ? handleEditStudent(s as Student) : handleAddStudent(s as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>)}
            onCancel={() => {setIsModalOpen(false); setEditingStudent(undefined);}} 
        />
      </Modal>
       <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="Bulk Register Students">
         <BulkRegisterModal onClose={() => setIsBulkModalOpen(false)} setStudents={setStudents} students={students} />
       </Modal>
       <Modal isOpen={!!studentToDelete} onClose={() => setStudentToDelete(null)} title="Confirm Deletion">
        {studentToDelete && (
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold">{studentToDelete.fullName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setStudentToDelete(null)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
       <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Confirm Bulk Deletion">
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete the selected <span className="font-semibold">{selectedStudents.size}</span> students? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setIsBulkDeleteModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
      </Modal>
      <Modal isOpen={!!viewingStudent} onClose={() => setViewingStudent(null)} title={viewingStudent?.fullName ?? 'Student Details'}>
        {viewingStudent && (
          <div className="space-y-4 text-gray-800 dark:text-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Student ID (Internal)</p>
              <p className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">{(viewingStudent as any)._id || viewingStudent.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Class</p>
                <p>{viewingStudent.class}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Student UID</p>
                <p>{viewingStudent.uid}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</p>
              <p>{viewingStudent.phone}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">House</p>
                <p>{viewingStudent.house}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</p>
                <p>{viewingStudent.category}</p>
              </div>
            </div>
             <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date Added</p>
                <p>{new Date((viewingStudent as any).createdAt).toLocaleString()}</p>
            </div>
            <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setViewingStudent(null)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Close</button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* --- REPORT MODAL --- */}
      <Modal isOpen={!!reportingStudent} onClose={() => setReportingStudent(null)} title="Progress Report" size="2xl">
        {reportingStudent && studentReportData && (
          <div>
            <div ref={reportContentRef} id="student-report-content" className="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <div className="flex justify-center mb-4">
                  {logoDataUri ? (
                    <img 
                      id="report-logo-img"
                      src={logoDataUri} 
                      alt="SDA Logo" 
                      className="h-16 w-auto"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-3xl font-bold">Progress Report</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">SDA Sports Management</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-2xl font-semibold">{reportingStudent.fullName}</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-4">
                            <span>Class: <strong>{reportingStudent.class}</strong></span>
                            <span>UID: <strong>{reportingStudent.uid}</strong></span> 
                            <div className="flex items-center">
                            <span>House: </span>
                            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full text-white ${HOUSES.find(h => h.name === reportingStudent.house)?.color}`}>
                                {reportingStudent.house}
                            </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <Card className="!p-4 bg-gray-50 dark:bg-gray-700/50">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Events Participated</p>
                            <p className="text-2xl font-bold">{studentReportData.totalEvents}</p>
                        </Card>
                        <Card className="!p-4 bg-gray-50 dark:bg-gray-700/50">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Points</p>
                            <p className="text-2xl font-bold">{studentReportData.totalPoints}</p>
                        </Card>
                        <Card className="!p-4 bg-gray-50 dark:bg-gray-700/50">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
                            <p className="text-2xl font-bold">{studentReportData.averageScore}</p>
                        </Card>
                    </div>

                    <div>
                    <h4 className="text-md font-semibold mb-2">Event Participation Details</h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full text-left">
                        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
                            <tr>
                            <th className="p-3 font-semibold">Event Name</th>
                            <th className="p-3 font-semibold">Event Type</th>
                            <th className="p-3 font-semibold">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentReportData.participatedEvents.length > 0 ? (
                            studentReportData.participatedEvents.map((event, index) => (
                                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                <td className="p-3">{event.eventName}</td>
                                <td className="p-3">{event.eventType}</td>
                                <td className="p-3 font-bold">{event.score}</td>
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan={3} className="text-center p-8 text-gray-500 dark:text-gray-400">
                                This student has not participated in any events yet.
                                </td>
                            </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                    </div>
                </div>
            </div>
            {/* --- EXPORT BUTTONS --- */}
            <div className="flex justify-end items-center space-x-2 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button type="button" onClick={() => handleExport('share')} disabled={isExporting} className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400">
                    <ShareIcon /><span>{isExporting ? 'Sharing...' : 'Share'}</span>
                </button>
                <button type="button" onClick={() => handleExport('png')} disabled={isExporting} className="flex items-center space-x-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                    <UploadIcon /><span>{isExporting ? 'Exporting...' : 'Save as Image'}</span>
                </button>
                <button type="button" onClick={() => handleExport('pdf')} disabled={isExporting} className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400">
                    <UploadIcon /><span>{isExporting ? 'Exporting...' : 'Save as PDF'}</span>
                </button>
                <button type="button" onClick={() => setReportingStudent(null)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentManagement;