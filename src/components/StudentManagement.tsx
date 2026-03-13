import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  UserPlus, 
  Trash2, 
  Edit2,
  Search, 
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowUpDown
} from 'lucide-react';
import Card from './common/Card';

interface Student {
  _id: string;
  fullName: string;
  class: string;
  uid: string;
  phone: string;
  house: 'Yellow' | 'Blue' | 'Green' | 'Red';
  category: string;
}

type SortOption = 'name-asc' | 'name-desc' | 'class-asc' | 'class-desc' | 'house';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  const initialFormState = {
    fullName: '',
    class: '1', 
    uid: '',
    phone: '',
    house: 'Yellow' as 'Yellow' | 'Blue' | 'Green' | 'Red',
    category: 'U13' 
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      showStatus('error', 'Failed to fetch student database.');
    }
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!/^\d+$/.test(formData.uid)) {
      return setFormError('UID must contain only numbers.');
    }
    if (formData.phone.length !== 10) {
      return setFormError('Phone number must be exactly 10 digits.');
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, formData);
        showStatus('success', 'Student updated successfully!');
      } else {
        await api.post('/students', formData);
        showStatus('success', 'Student enrolled successfully!');
      }
      closeModal();
      fetchStudents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setFormData({
      fullName: student.fullName,
      class: student.class,
      uid: student.uid,
      phone: student.phone,
      house: student.house,
      category: student.category
    });
    setEditingId(student._id);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setFormError(null);
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(prev => prev.filter(s => s._id !== id));
      showStatus('success', 'Student removed successfully.');
    } catch (error) {
      showStatus('error', 'Could not delete student.');
    }
  };

  // --- SEARCH & SORT LOGIC ---
  const processedStudents = students
    .filter(s => 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.uid.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.fullName.localeCompare(b.fullName);
        case 'name-desc':
          return b.fullName.localeCompare(a.fullName);
        case 'class-asc':
          return parseInt(a.class) - parseInt(b.class);
        case 'class-desc':
          return parseInt(b.class) - parseInt(a.class);
        case 'house':
          return a.house.localeCompare(b.house);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6 p-2 md:p-6 relative">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Student Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage house members and their details.</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
        >
          <UserPlus size={19} />
          Add Student
        </button>
      </div>

      {/* Status Alerts */}
      {message && (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><X size={18} /></button>
        </div>
      )}

      {/* Search & Sort Toolbar */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or UID..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2.5 rounded-xl">
              <ArrowUpDown size={18} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent border-none text-gray-700 dark:text-gray-200 outline-none font-medium cursor-pointer"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="class-asc">Class (Lowest)</option>
                <option value="class-desc">Class (Highest)</option>
                <option value="house">House (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-bold bg-blue-50 dark:bg-gray-700/50 px-4 py-2.5 rounded-xl">
              <Users size={20} className="text-blue-500" />
              <span>{processedStudents.length}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* TABLE FORMAT - Student List */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600 text-gray-600 dark:text-gray-300 uppercase text-xs font-bold tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">UID</th>
                <th className="p-4">Class</th>
                <th className="p-4">Category</th>
                <th className="p-4">House</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {processedStudents.length > 0 ? (
                processedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group">
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">{student.fullName}</td>
                    <td className="p-4 font-mono text-sm text-blue-600 dark:text-blue-400">{student.uid}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{student.class}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{student.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase text-white ${
                        student.house === 'Red' ? 'bg-red-500' :
                        student.house === 'Blue' ? 'bg-blue-500' :
                        student.house === 'Green' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>
                        {student.house}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{student.phone}</td>
                    <td className="p-4 flex items-center justify-center gap-3">
                      <button 
                        onClick={() => openEditModal(student)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteStudent(student._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- ADD / EDIT STUDENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingId ? 'Edit Student' : 'Enroll New Student'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm animate-slideDown">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. John Doe" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UID (Numbers Only)</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.uid} 
                    onChange={e => {
                      const val = e.target.value;
                      if (/[^0-9]/.test(val)) setFormError("UID can only contain numbers.");
                      else setFormError(null);
                      setFormData({...formData, uid: val.replace(/\D/g, '')});
                    }} 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g. 1001" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                  <select required value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">House</label>
                  <select required value={formData.house} onChange={e => setFormData({...formData, house: e.target.value as any})} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Yellow">Yellow</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Red">Red</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="U13">U13</option>
                    <option value="U16">U16</option>
                    <option value="U19">U19</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input 
                  required 
                  type="text" 
                  maxLength={10}
                  value={formData.phone} 
                  onChange={e => {
                    const val = e.target.value;
                    if (/[^0-9]/.test(val)) setFormError("Phone number can only contain numbers.");
                    else setFormError(null);
                    setFormData({...formData, phone: val.replace(/\D/g, '').slice(0, 10)});
                  }} 
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="10-digit number" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={`px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors ${isSubmitting ? 'opacity-70' : ''}`}>
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Student' : 'Save Student')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;