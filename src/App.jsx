import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, X, Download, Upload, 
  Settings, BookOpen, Clock, MapPin, User,
  Eye, EyeOff, LayoutGrid, RotateCcw
} from 'lucide-react';

/**
 * UTILITIES & CONSTANTS
 */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Expanded 20-Color Palette
const COLORS = [
  { name: 'Emerald', bg: 'bg-emerald-500/85', border: 'border-emerald-500', text: 'text-white' },
  { name: 'Blue', bg: 'bg-blue-500/85', border: 'border-blue-500', text: 'text-white' },
  { name: 'Violet', bg: 'bg-violet-500/85', border: 'border-violet-500', text: 'text-white' },
  { name: 'Rose', bg: 'bg-rose-500/85', border: 'border-rose-500', text: 'text-white' },
  { name: 'Amber', bg: 'bg-amber-500/85', border: 'border-amber-500', text: 'text-white' },
  { name: 'Cyan', bg: 'bg-cyan-500/85', border: 'border-cyan-500', text: 'text-white' },
  { name: 'Fuchsia', bg: 'bg-fuchsia-500/85', border: 'border-fuchsia-500', text: 'text-white' },
  { name: 'Lime', bg: 'bg-lime-500/85', border: 'border-lime-500', text: 'text-white' },
  { name: 'Teal', bg: 'bg-teal-500/85', border: 'border-teal-500', text: 'text-white' },
  { name: 'Sky', bg: 'bg-sky-500/85', border: 'border-sky-500', text: 'text-white' },
  { name: 'Indigo', bg: 'bg-indigo-500/85', border: 'border-indigo-500', text: 'text-white' },
  { name: 'Purple', bg: 'bg-purple-500/85', border: 'border-purple-500', text: 'text-white' },
  { name: 'Pink', bg: 'bg-pink-500/85', border: 'border-pink-500', text: 'text-white' },
  { name: 'Red', bg: 'bg-red-500/85', border: 'border-red-500', text: 'text-white' },
  { name: 'Orange', bg: 'bg-orange-500/85', border: 'border-orange-500', text: 'text-white' },
  { name: 'Yellow', bg: 'bg-yellow-500/85', border: 'border-yellow-500', text: 'text-white' },
  { name: 'Slate', bg: 'bg-slate-500/85', border: 'border-slate-500', text: 'text-white' },
  { name: 'Zinc', bg: 'bg-zinc-500/85', border: 'border-zinc-500', text: 'text-white' },
  { name: 'Neutral', bg: 'bg-neutral-500/85', border: 'border-neutral-500', text: 'text-white' },
  { name: 'Stone', bg: 'bg-stone-500/85', border: 'border-stone-500', text: 'text-white' },
];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to parse week string "1-16" or "1,3,5" into array
const parseWeeks = (input) => {
  if (!input || input === '*') return Array.from({ length: 16 }, (_, i) => i + 1);
  const weeks = new Set();
  const parts = input.split(',');
  parts.forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) weeks.add(i);
    } else {
      weeks.add(Number(part));
    }
  });
  return Array.from(weeks).sort((a, b) => a - b);
};

/**
 * MAIN COMPONENT
 */
export default function App() {
  // -- State --
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('course-plus-v3-data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // The full course object being edited/viewed
  const [isEditMode, setIsEditMode] = useState(false); // Toggle between View/Edit inside modal
  const [importText, setImportText] = useState("");
  const [currentWeek, setCurrentWeek] = useState(1);

  // -- Persistence --
  useEffect(() => {
    localStorage.setItem('course-plus-v3-data', JSON.stringify(courses));
  }, [courses]);

  // -- Actions --

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setCourses([]);
    }
  };

  const toggleVisibility = (id) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c));
  };

  const deleteCourse = (id) => {
    if (window.confirm("Delete this course?")) {
      setCourses(prev => prev.filter(c => c.id !== id));
      setIsModalOpen(false);
    }
  };

  const handleSaveCourse = (courseData) => {
    if (courseData.id) {
      // Update existing
      setCourses(prev => prev.map(c => c.id === courseData.id ? courseData : c));
    } else {
      // Create new
      const newCourse = { ...courseData, id: generateId(), isVisible: true };
      setCourses(prev => [...prev, newCourse]);
    }
    setIsModalOpen(false);
  };

  // -- Import / Export --

  const handleFuzzyImport = () => {
    if (!importText.trim()) return;

    // Expected format: Name Teacher Room Day(1-7) Start-End Weeks
    // Wildcard '*' skips field (uses default)
    const parts = importText.trim().split(/\s+/);
    
    // Default values
    const defaults = {
      name: "New Course",
      teacher: "Unknown",
      room: "TBA",
      day: 1,
      start: 1,
      end: 2,
      weeks: "1-16"
    };

    const getVal = (idx, def) => (parts[idx] && parts[idx] !== '*') ? parts[idx] : def;

    // Parsing Logic
    const name = getVal(0, defaults.name);
    const teacher = getVal(1, defaults.teacher);
    const room = getVal(2, defaults.room);
    
    const dayRaw = getVal(3, defaults.day);
    const day = isNaN(dayRaw) ? 1 : parseInt(dayRaw);

    const timeRaw = getVal(4, `${defaults.start}-${defaults.end}`);
    const [s, e] = timeRaw.includes('-') ? timeRaw.split('-') : [timeRaw, parseInt(timeRaw)+1];
    
    const weeksRaw = getVal(5, defaults.weeks);

    const newSession = {
      id: generateId(),
      day: Math.min(Math.max(day, 1), 7),
      start: parseInt(s),
      end: parseInt(e),
      weeks: parseWeeks(weeksRaw)
    };

    const newCourse = {
      id: generateId(),
      name,
      teacher,
      room,
      credits: 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isVisible: true,
      sessions: [newSession]
    };

    setCourses(prev => [...prev, newCourse]);
    setImportText("");
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(courses));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "course_schedule.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          setCourses(json);
        } else {
          alert("Invalid JSON format");
        }
      } catch (err) {
        alert("Error reading file");
      }
    };
  };

  // -- Layout Calculation for Conflicts --
  const getLayoutForDay = (dayIndex) => {
    // 1. Flatten all visible sessions for this day
    const daySessions = [];
    courses.filter(c => c.isVisible).forEach(course => {
      course.sessions.forEach(session => {
        if (session.day === dayIndex + 1) {
          daySessions.push({ ...session, courseId: course.id, courseName: course.name, courseColor: course.color, room: course.room, teacher: course.teacher });
        }
      });
    });

    // 2. Sort by start time, then length (longer first)
    daySessions.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });

    // 3. Robust Packing Algorithm
    // Detect connected groups of overlaps first to determine shared width
    const columns = [];
    daySessions.forEach(session => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        // Check intersection with inclusive bounds (Period 1-2 intersects Period 2-3 at slot 2)
        const hasOverlap = col.some(s => 
          (session.start <= s.end && session.end >= s.start)
        );
        
        if (!hasOverlap) {
          col.push(session);
          session.colIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([session]);
        session.colIndex = columns.length - 1;
      }
    });

    // 4. Calculate final dimensions
    return daySessions.map(session => {
      // Find the "Group" this session belongs to. 
      // A group is defined by all columns that have at least one item intersecting with this session's time window.
      // We must check strict intersection for the count to be correct.
      
      let maxConcurrent = 0;
      
      // We iterate through all columns. If a column has ANY event that overlaps with our current session, 
      // we consider that column as part of the "active cluster" for this timeframe.
      columns.forEach(col => {
         if (col.some(s => (session.start <= s.end && session.end >= s.start))) {
             maxConcurrent++;
         }
      });

      // Fallback to ensure we at least account for the column index (fix for "shift to next day" bug)
      const totalCols = Math.max(maxConcurrent, session.colIndex + 1);

      return {
        ...session,
        style: {
          top: `${(session.start - 1) * (100 / 14)}%`,
          height: `${(session.end - session.start + 1) * (100 / 14)}%`,
          left: `${(session.colIndex / totalCols) * 100}%`,
          width: `${(1 / totalCols) * 100}%`,
          zIndex: session.colIndex + 10
        }
      };
    });
  };

  const totalCredits = courses.filter(c => c.isVisible).reduce((acc, curr) => acc + (parseInt(curr.credits) || 0), 0);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Course-Plus</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">v3.0</span>
          </div>
          <p className="text-xs text-slate-500">Advanced Academic Scheduler</p>
        </div>

        {/* Quick Import */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuzzy Import</div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Math * * 1 1-2 *"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-300 placeholder-slate-600"
              onKeyDown={(e) => e.key === 'Enter' && handleFuzzyImport()}
            />
            <button 
              onClick={handleFuzzyImport}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-slate-500">
            Seq: Name Teacher Room Day(1-7) Time(S-E) Weeks<br/>
            Use <code className="bg-slate-800 px-1 rounded text-slate-400">*</code> to skip fields.
          </div>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {courses.length === 0 && (
             <div className="text-center py-10 text-slate-600 italic text-sm">No courses added.<br/>Use import or add manually.</div>
          )}
          {courses.map(course => (
            <div key={course.id} className={`group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-800/50 transition-all ${!course.isVisible ? 'opacity-50 grayscale' : ''}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <button onClick={() => toggleVisibility(course.id)} className="text-slate-500 hover:text-blue-400">
                  {course.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <div 
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: course.color.text === 'text-white' ? course.color.bg.replace('/85', '').replace('bg-', '') : course.color.text.replace('text-', '').replace('-300', '-500') }} // Fixed color preview for new palette
                ></div>
                 <div className="flex flex-col truncate">
                  <span className="font-medium text-sm truncate">{course.name}</span>
                  <span className="text-xs text-slate-500 truncate">{course.teacher} • {course.credits}cr</span>
                 </div>
              </div>
              <button 
                onClick={() => { setEditingCourse(course); setIsEditMode(false); setIsModalOpen(true); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-slate-300">
            <span>Total Credits:</span>
            <span className="text-blue-400 font-bold">{totalCredits}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => { setEditingCourse(null); setIsEditMode(true); setIsModalOpen(true); }} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-3 h-3" /> New
            </button>
            <button onClick={exportData} className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white py-2 rounded flex items-center justify-center transition-colors" title="Export JSON">
              <Download className="w-4 h-4" />
            </button>
            <label className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white py-2 rounded flex items-center justify-center cursor-pointer transition-colors" title="Import JSON">
              <Upload className="w-4 h-4" />
              <input type="file" className="hidden" accept=".json" onChange={importData} />
            </label>
            <button onClick={handleReset} className="col-span-4 mt-2 text-xs text-rose-500 hover:text-rose-400 flex items-center justify-center gap-1 py-1">
              <RotateCcw className="w-3 h-3" /> Reset All Data
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN GRID */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header (Days) */}
        <header className="flex border-b border-slate-800 h-12 flex-shrink-0 bg-slate-900/80 z-20">
          <div className="w-12 border-r border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">#</div>
          {DAYS.map((day, i) => (
            <div key={day} className="flex-1 border-r border-slate-800 last:border-r-0 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-slate-300">{day}</span>
              {/* Optional: Add date calculation here if needed */}
            </div>
          ))}
        </header>

        {/* Scrollable Grid Area */}
        <div className="flex-1 overflow-y-auto relative">
          <div className="flex min-h-[1000px] relative">
            
            {/* Time Labels Column */}
            <div className="w-12 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900/30">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-1 flex items-center justify-center text-xs text-slate-600 font-mono border-b border-slate-800/50">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {DAYS.map((day, dayIndex) => {
              const sessions = getLayoutForDay(dayIndex);

              return (
                <div key={dayIndex} className="flex-1 relative border-r border-slate-800 last:border-r-0 group">
                  {/* Background Grid Lines */}
                  {Array.from({ length: 14 }).map((_, r) => (
                    <div key={r} className="absolute w-full border-b border-slate-800/30 h-[7.14%] top-[calc(7.14%*var(--r))]" style={{ '--r': r }}></div>
                  ))}

                  {/* Sessions */}
                  {sessions.map((s) => (
                    <div
                      key={s.id + s.start}
                      onClick={() => {
                         const parentCourse = courses.find(c => c.id === s.courseId);
                         setEditingCourse(parentCourse);
                         setIsEditMode(false);
                         setIsModalOpen(true);
                      }}
                      className={`absolute z-10 p-1 transition-all hover:brightness-110 cursor-pointer overflow-hidden rounded-md border-l-4 shadow-lg backdrop-blur-sm ${s.courseColor.bg} ${s.courseColor.border}`}
                      style={{
                        ...s.style,
                        // Add slight margins to separate overlaps nicely
                        width: `calc(${s.style.width} - 2px)`,
                        left: `calc(${s.style.left} + 1px)`,
                        top: `calc(${s.style.top} + 1px)`,
                        height: `calc(${s.style.height} - 2px)`
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`text-xs font-bold truncate leading-tight ${s.courseColor.text}`}>
                          {s.courseName}
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 opacity-90 ${s.courseColor.text}`}>
                          {s.room}
                        </div>
                        <div className={`text-[10px] truncate opacity-80 ${s.courseColor.text}`}>
                          {s.teacher}
                        </div>
                        
                        {/* Week Dots at bottom */}
                        <div className="mt-auto flex gap-[1px] pt-1 flex-wrap content-end">
                           {Array.from({ length: 16 }).map((_, w) => {
                             const weekNum = w + 1;
                             const isActive = s.weeks.includes(weekNum);
                             return (
                               <div 
                                 key={w} 
                                 className={`w-1 h-1 rounded-full ${isActive ? (weekNum === currentWeek ? 'bg-white' : 'bg-white/40') : 'bg-black/20'}`}
                               ></div>
                             );
                           })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Week Controller Overlay */}
        <div className="absolute bottom-4 right-6 bg-slate-900/90 border border-slate-700 rounded-full px-4 py-2 flex items-center gap-4 shadow-xl backdrop-blur">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Current Week</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentWeek(p => Math.max(1, p-1))} className="hover:text-blue-400"><RotateCcw className="w-3 h-3 rotate-90" /></button>
            <span className="text-lg font-mono font-bold text-blue-400 w-6 text-center">{currentWeek}</span>
            <button onClick={() => setCurrentWeek(p => Math.min(16, p+1))} className="hover:text-blue-400"><RotateCcw className="w-3 h-3 -rotate-90" /></button>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <CourseModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          course={editingCourse}
          isEditMode={isEditMode}
          setMode={setIsEditMode}
          onSave={handleSaveCourse}
          onDelete={deleteCourse}
        />
      )}
    </div>
  );
}

/**
 * SUB-COMPONENT: MODAL
 * Handles View & Edit Logic
 */
function CourseModal({ isOpen, onClose, course, isEditMode, setMode, onSave, onDelete }) {
  // Local state for the form
  const [formData, setFormData] = useState({
    name: '', teacher: '', room: '', credits: 3, color: COLORS[0], sessions: []
  });

  // Init form data when course changes
  useEffect(() => {
    if (course) {
      setFormData(JSON.parse(JSON.stringify(course))); // Deep copy
    } else {
      setFormData({
        name: '', teacher: '', room: '', credits: 3, color: COLORS[Math.floor(Math.random() * COLORS.length)], 
        sessions: [{ id: generateId(), day: 1, start: 1, end: 2, weeks: Array.from({length:16}, (_,i)=>i+1) }]
      });
    }
  }, [course, isOpen]);

  if (!isOpen) return null;

  const addSession = () => {
    setFormData(prev => ({
      ...prev,
      sessions: [...prev.sessions, { id: generateId(), day: 1, start: 1, end: 2, weeks: Array.from({length:16}, (_,i)=>i+1) }]
    }));
  };

  const removeSession = (idx) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== idx)
    }));
  };

  const updateSession = (idx, field, value) => {
    setFormData(prev => {
      const newSessions = [...prev.sessions];
      newSessions[idx] = { ...newSessions[idx], [field]: value };
      return { ...prev, sessions: newSessions };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {isEditMode ? (course ? 'Edit Course' : 'Add Course') : 'Course Details'}
          </h2>
          <div className="flex gap-2">
            {!isEditMode && (
              <button onClick={() => setMode(true)} className="p-2 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors" title="Edit">
                <Edit2 className="w-5 h-5" />
              </button>
            )}
             {!isEditMode && (
              <button onClick={() => onDelete(course.id)} className="p-2 hover:bg-slate-700 rounded-lg text-rose-400 transition-colors" title="Delete">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 uppercase font-semibold">Course Name</label>
              {isEditMode ? (
                <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Calculus I" />
              ) : <div className="text-lg font-medium text-white">{formData.name}</div>}
            </div>

            <div className="space-y-1 col-span-2">
               <label className="text-xs text-slate-500 uppercase font-semibold">Color Tag</label>
               {isEditMode ? (
                 <div className="grid grid-cols-10 gap-2">
                   {COLORS.map(c => (
                     <button 
                        key={c.name} 
                        onClick={() => setFormData({...formData, color: c})}
                        className={`w-full aspect-square rounded-full border-2 ${c.bg} ${formData.color.name === c.name ? 'border-white ring-2 ring-blue-500' : 'border-transparent'}`}
                        title={c.name}
                     />
                   ))}
                 </div>
               ) : (
                  <div className={`inline-block px-2 py-1 rounded text-xs border ${formData.color.bg} ${formData.color.border} ${formData.color.text}`}>
                    {formData.color.name}
                  </div>
               )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1"><User className="w-3 h-3" /> Teacher</label>
              {isEditMode ? (
                <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none" 
                  value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} />
              ) : <div className="text-slate-300">{formData.teacher}</div>}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" /> Room</label>
              {isEditMode ? (
                <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none" 
                  value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
              ) : <div className="text-slate-300">{formData.room}</div>}
            </div>
             
             <div className="space-y-1">
              <label className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1"><BookOpen className="w-3 h-3" /> Credits</label>
              {isEditMode ? (
                <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none" 
                  value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} />
              ) : <div className="text-slate-300">{formData.credits}</div>}
            </div>
          </div>

          <div className="border-t border-slate-800 my-4"></div>

          {/* SESSIONS MANAGER */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Time Sessions</label>
                {isEditMode && (
                  <button onClick={addSession} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded transition-colors">
                    + Add Slot
                  </button>
                )}
             </div>

             <div className="space-y-2">
                {formData.sessions.map((session, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-3 relative group">
                    {isEditMode && formData.sessions.length > 1 && (
                      <button onClick={() => removeSession(idx)} className="absolute top-2 right-2 text-slate-600 hover:text-rose-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-6 gap-3">
                       <div className="col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-500">Day</label>
                          {isEditMode ? (
                            <select 
                              value={session.day} 
                              onChange={(e) => updateSession(idx, 'day', parseInt(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm outline-none"
                            >
                              {DAYS.map((d, i) => <option key={d} value={i+1}>{d}</option>)}
                            </select>
                          ) : <div className="text-sm font-medium">{DAYS[session.day - 1]}</div>}
                       </div>

                       <div className="col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-500">Time (Start-End)</label>
                          {isEditMode ? (
                            <div className="flex items-center gap-1">
                               <input type="number" min="1" max="14" value={session.start} onChange={e => updateSession(idx, 'start', parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-center" />
                               <span className="text-slate-600">-</span>
                               <input type="number" min="1" max="14" value={session.end} onChange={e => updateSession(idx, 'end', parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-center" />
                            </div>
                          ) : <div className="text-sm">Period {session.start} - {session.end}</div>}
                       </div>

                       <div className="col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-500">Weeks</label>
                          {isEditMode ? (
                            <input 
                              type="text" 
                              placeholder="1-16 or 1,3,5"
                              defaultValue={
                                // Simple formatter for display. 
                                // Real app would likely need controlled component logic for array->string.
                                // Here we assume if they edit it, they re-enter logic.
                                "1-16" 
                              }
                              onBlur={(e) => updateSession(idx, 'weeks', parseWeeks(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm"
                            />
                          ) : (
                             <div className="flex flex-wrap gap-0.5">
                                {Array.from({ length: 16 }).map((_, w) => (
                                  <div key={w} className={`w-1.5 h-1.5 rounded-full ${session.weeks.includes(w+1) ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* Footer */}
        {isEditMode && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
             <button onClick={() => isEditMode && course ? setMode(false) : onClose()} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
             <button onClick={() => onSave(formData)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded shadow-lg shadow-blue-500/20 transition-all">
               Save Changes
             </button>
          </div>
        )}
      </div>
    </div>
  );
}