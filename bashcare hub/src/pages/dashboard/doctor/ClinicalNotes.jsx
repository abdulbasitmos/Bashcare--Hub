import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Trash2, 
  Pin, 
  Save, 
  FileText, 
  X, 
  Download, 
  User, 
  Calendar, 
  Tag, 
  Copy, 
  Check,
  FileEdit,
  Loader,
  UserPlus,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../utils/db';

const SOAP_TEMPLATE = `[SUBJECTIVE]
Patient reports the following symptoms and history:


[OBJECTIVE]
Vitals and physical exam findings:


[ASSESSMENT]
Working diagnosis and clinical impressions:


[PLAN]
Treatment plan, medication changes, and follow-up timeline:
`;

const DIAGNOSIS_TEMPLATE = `Working Diagnosis:
- 

Differential Diagnosis:
1. 
2. 

Diagnostic Tests Ordered:
- 
`;

const FOLLOWUP_TEMPLATE = `Previous Status:
- 

Current Progress & Response to Treatment:
- 

Ongoing Adjustments:
- 
`;

const ClinicalNotes = ({ user }) => {
  const location = useLocation();
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Patient search states inside editor
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load notes on mount and handle route state
  useEffect(() => {
    const saved = localStorage.getItem(`bashcare_clinical_notes_${user.id}`);
    let loadedNotes = [];
    if (saved) {
      try {
        loadedNotes = JSON.parse(saved);
        setNotes(loadedNotes);
      } catch (err) {
        console.error("Error loading notes:", err);
      }
    }

    if (location.state?.patient) {
      const patient = location.state.patient;
      const patientId = patient.id || patient._id;
      const existing = loadedNotes.find(n => n.patientId === patientId);
      if (existing) {
        setActiveNote(existing);
        setSelectedPatient(patient);
      } else {
        const newNote = {
          id: 'note_' + Date.now(),
          title: `Consultation: ${patient.name}`,
          content: SOAP_TEMPLATE,
          category: 'soap',
          pinned: false,
          updatedAt: new Date().toISOString(),
          patientId,
          patientName: patient.name
        };
        const updated = [newNote, ...loadedNotes];
        setNotes(updated);
        localStorage.setItem(`bashcare_clinical_notes_${user.id}`, JSON.stringify(updated));
        setActiveNote(newNote);
        setSelectedPatient(patient);
      }
    }
  }, [user.id, location.state]);

  // Save notes to local storage helper
  const saveToLocalStorage = (newNotes) => {
    setNotes(newNotes);
    localStorage.setItem(`bashcare_clinical_notes_${user.id}`, JSON.stringify(newNotes));
  };

  // Patient search debounce
  useEffect(() => {
    if (!patientSearchQuery.trim()) {
      setPatientSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsSearchingPatients(true);
      try {
        const results = await db.searchUsersForChat(patientSearchQuery);
        setPatientSearchResults((results || []).filter(u => u.role === 'patient'));
      } catch (err) {
        console.error('Error searching patients:', err);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientSearchQuery]);

  // Create a new note
  const handleCreateNote = (templateType = 'general') => {
    let defaultContent = '';
    let defaultTitle = 'Untitled Note';
    let category = 'general';

    if (templateType === 'soap') {
      defaultContent = SOAP_TEMPLATE;
      defaultTitle = 'SOAP Consultation Note';
      category = 'soap';
    } else if (templateType === 'diagnosis') {
      defaultContent = DIAGNOSIS_TEMPLATE;
      defaultTitle = 'Clinical Diagnosis Plan';
      category = 'diagnosis';
    } else if (templateType === 'followup') {
      defaultContent = FOLLOWUP_TEMPLATE;
      defaultTitle = 'Follow-up Note';
      category = 'follow-up';
    }

    const newNote = {
      id: 'note_' + Date.now(),
      title: defaultTitle,
      content: defaultContent,
      category,
      pinned: false,
      updatedAt: new Date().toISOString(),
      patientId: '',
      patientName: ''
    };

    const updated = [newNote, ...notes];
    saveToLocalStorage(updated);
    setActiveNote(newNote);
    setSelectedPatient(null);
    setPatientSearchQuery('');
  };

  // Select note
  const handleSelectNote = (note) => {
    setActiveNote(note);
    if (note.patientId && note.patientName) {
      setSelectedPatient({ id: note.patientId, name: note.patientName });
    } else {
      setSelectedPatient(null);
    }
    setPatientSearchQuery('');
  };

  // Update active note fields
  const handleUpdateActiveNote = (fields) => {
    if (!activeNote) return;
    const updatedNote = { 
      ...activeNote, 
      ...fields, 
      updatedAt: new Date().toISOString() 
    };
    setActiveNote(updatedNote);
    
    // Update in list
    const updatedList = notes.map(n => n.id === activeNote.id ? updatedNote : n);
    saveToLocalStorage(updatedList);
  };

  // Link patient to active note
  const handleLinkPatient = (patient) => {
    const patientId = patient.id || patient._id;
    setSelectedPatient(patient);
    handleUpdateActiveNote({
      patientId,
      patientName: patient.name
    });
    setPatientSearchQuery('');
    setPatientSearchResults([]);
  };

  // Unlink patient
  const handleUnlinkPatient = () => {
    setSelectedPatient(null);
    handleUpdateActiveNote({
      patientId: '',
      patientName: ''
    });
  };

  // Delete note
  const handleDeleteNote = (id) => {
    if (confirm("Are you sure you want to delete this clinical note?")) {
      const updated = notes.filter(n => n.id !== id);
      saveToLocalStorage(updated);
      if (activeNote && activeNote.id === id) {
        setActiveNote(null);
        setSelectedPatient(null);
      }
    }
  };

  // Pin/Unpin note
  const handleTogglePin = (note, e) => {
    e.stopPropagation();
    const updatedNote = { ...note, pinned: !note.pinned };
    if (activeNote && activeNote.id === note.id) {
      setActiveNote(updatedNote);
    }
    const updatedList = notes.map(n => n.id === note.id ? updatedNote : n);
    // Sort pinned to top
    saveToLocalStorage(updatedList);
  };

  // Copy note content
  const handleCopyNote = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download/Export note
  const handleDownloadNote = () => {
    if (!activeNote) return;
    const element = document.createElement("a");
    const file = new Blob([
      `BASHCARE HUB - CLINICAL NOTE\n`,
      `=========================\n`,
      `Title: ${activeNote.title}\n`,
      `Date: ${new Date(activeNote.updatedAt).toLocaleString()}\n`,
      `Patient: ${activeNote.patientName || 'None'}\n`,
      `Category: ${activeNote.category.toUpperCase()}\n`,
      `-------------------------\n\n`,
      activeNote.content
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Convert note to official Clinical Record in DB
  const handleConvertToRecord = async () => {
    if (!activeNote) return;
    if (!activeNote.patientId || !activeNote.patientName) {
      alert("Please select and link a patient to this note before converting it to an official record.");
      return;
    }

    setSaving(true);
    try {
      await db.addRecord({
        patientId: activeNote.patientId,
        patientName: activeNote.patientName,
        diagnosis: activeNote.title,
        treatment: activeNote.category === 'soap' ? 'Refer to SOAP Consultation plan' : 'Review clinical workspace attachment',
        notes: activeNote.content,
        category: activeNote.category === 'soap' ? 'visit' : 'diagnosis'
      });

      await db.addNotification({
        userId: activeNote.patientId,
        title: 'New Health Record Entry',
        message: `Dr. ${user.name} finalized and saved clinical notes from your visit to your official medical record.`,
        type: 'record'
      });

      alert("Successfully converted this note into an official Medical Record entry! The patient has been notified.");
    } catch (err) {
      console.error("Error converting note to record:", err);
      alert("Failed to convert note: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filter notes
  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.patientName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Pinned items first, then date descending
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinical Workspace Notes</h1>
          <p className="text-slate-500 text-sm">Draft, organize, and compile clinical observations and convert them directly to medical records.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => handleCreateNote('general')}
            className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md"
          >
            <Plus size={14} /> New Note
          </button>
          <button 
            onClick={() => handleCreateNote('soap')}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md"
          >
            <FileEdit size={14} /> SOAP Template
          </button>
          <button 
            onClick={() => handleCreateNote('diagnosis')}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md"
          >
            <FileText size={14} /> Diagnosis Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Side: Notes list */}
        <div className="lg:col-span-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[24px] p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="Search notes, text, patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8fafc] border-none pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 select-none">
            {['all', 'general', 'soap', 'diagnosis', 'follow-up'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-blue-50/500 text-white shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' 
                    : 'bg-[#f8fafc] text-slate-500 hover:bg-white dark:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notes list */}
          <div className="flex-grow overflow-y-auto max-h-[420px] pr-1 space-y-2">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => {
                const isActive = activeNote && activeNote.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border text-left group ${
                      isActive 
                        ? 'bg-blue-50/50/70 border-blue-200   shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300' 
                        : 'bg-[#f8fafc] border-[var(--border-primary)]  hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-bold truncate flex-grow ${
                        isActive ? 'text-[#2563EB] ' : 'text-slate-900'
                      }`}>
                        {note.title || 'Untitled Note'}
                      </h3>
                      <button
                        onClick={(e) => handleTogglePin(note, e)}
                        className={`p-1 rounded-md transition-all hover:bg-slate-200/50 dark:bg-slate-700/50 ${
                          note.pinned 
                            ? 'text-[#F59E0B]' 
                            : 'text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Pin size={13} fill={note.pinned ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 my-2 min-h-[2rem]">
                      {note.content ? note.content.replace(/\[.*?\]/g, '') : 'No additional content'}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 ">
                      <div className="flex items-center gap-1.5">
                        {note.patientName && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100/60  text-[#2563EB]  rounded-md text-[10px] font-bold">
                            <User size={10} /> {note.patientName.split(' ')[0]}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-white  text-slate-500 rounded-md text-[10px] uppercase font-bold">
                          {note.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-xs text-slate-500">No workspace notes found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Note Editor */}
        <div className="lg:col-span-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[24px] p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300">
          {activeNote ? (
            <div className="flex-grow flex flex-col gap-5 h-full">
              {/* Header Details */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-primary)]">
                <div className="flex-grow space-y-2">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                    className="w-full text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none placeholder-gray-400 text-slate-900"
                    placeholder="Note Title"
                  />
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> Saved: {new Date(activeNote.updatedAt).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Tag size={13} />
                      <select
                        value={activeNote.category}
                        onChange={(e) => handleUpdateActiveNote({ category: e.target.value })}
                        className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-blue-500 capitalize cursor-pointer"
                      >
                        <option value="general">General</option>
                        <option value="soap">SOAP Note</option>
                        <option value="diagnosis">Diagnosis</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-1.5 self-start md:self-center">
                  <button
                    onClick={handleCopyNote}
                    title="Copy Note Text"
                    className="p-2.5 bg-[#f8fafc] hover:bg-white dark:bg-slate-800 text-slate-500 rounded-xl transition-all"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={handleDownloadNote}
                    title="Download Note File"
                    className="p-2.5 bg-[#f8fafc] hover:bg-white dark:bg-slate-800 text-slate-500 rounded-xl transition-all"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    title="Delete Note"
                    className="p-2.5 bg-red-50  hover:bg-red-100 dark:bg-red-900/30 text-[#EF4444] rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Patient linking section */}
              <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[var(--border-primary)] ">
                <h4 className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wide">Linked Patient Database Context</h4>
                {selectedPatient ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100  text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                        {(selectedPatient.name || '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{selectedPatient.name}</p>
                        <p className="text-[10px] text-slate-500">Linked to note workspace context</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConvertToRecord}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50/500 hover:bg-[#2563EB] disabled:bg-blue-300 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md transition-shadow fade-in hover:shadow-md transition-all duration-300 shadow-blue-500/10"
                      >
                        {saving ? (
                          <>
                            <Loader size={12} className="animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            Convert to official Record <ArrowUpRight size={12} />
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleUnlinkPatient}
                        className="p-1.5 hover:bg-white dark:bg-slate-800 rounded-lg text-slate-500"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search to link patient profile..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border-none rounded-xl text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    {patientSearchQuery.trim() && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)]  rounded-xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto">
                        {isSearchingPatients ? (
                          <div className="flex items-center justify-center gap-2 p-3 text-slate-500">
                            <Loader size={12} className="animate-spin" />
                            <span className="text-[10px] font-bold">Querying patients...</span>
                          </div>
                        ) : patientSearchResults.length > 0 ? (
                          patientSearchResults.map((result) => (
                            <button
                              key={result.id || result._id}
                              type="button"
                              onClick={() => handleLinkPatient(result)}
                              className="w-full px-3 py-2 flex items-center justify-between hover:bg-blue-50/50 dark:bg-slate-700 text-left border-b border-[var(--border-primary)]  last:border-none"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-white  flex items-center justify-center font-bold text-[10px] text-blue-500 flex-shrink-0">
                                  {(result.name || '').split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{result.name}</p>
                                  <p className="text-[9px] text-slate-500 truncate">{result.email}</p>
                                </div>
                              </div>
                              <UserPlus size={12} className="text-blue-500 flex-shrink-0" />
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center">
                            <p className="text-[10px] text-slate-500">No patient found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Text Area */}
              <div className="flex-grow flex flex-col relative min-h-[300px]">
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="Start typing your clinical notes..."
                  className="w-full flex-grow p-4 bg-[#f8fafc] border border-[var(--border-primary)]  focus:border-blue-300 dark:border-slate-700 rounded-2xl resize-none outline-none focus:ring-0 text-sm font-mono leading-relaxed text-slate-900"
                ></textarea>
                <div className="absolute bottom-3 right-4 flex items-center gap-2 text-[10px] text-slate-500 font-bold bg-[#f8fafc] px-2 py-1 rounded-md border border-[var(--border-primary)]">
                  <span>{activeNote.content ? activeNote.content.split(/\s+/).filter(Boolean).length : 0} words</span>
                  <span>|</span>
                  <span>{activeNote.content ? activeNote.content.length : 0} chars</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-blue-50/50  text-blue-500 rounded-[24px] flex items-center justify-center mb-5 animate-pulse">
                <FileEdit size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">No Note Selected</h2>
              <p className="text-xs text-slate-500 max-w-sm mb-6">Select an existing note from the list, or create a new clinical note with or without standard templates.</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleCreateNote('soap')}
                  className="px-3.5 py-2 bg-indigo-50  hover:bg-indigo-100 text-indigo-600  rounded-xl text-xs font-bold transition-all"
                >
                  Create SOAP Note
                </button>
                <button
                  onClick={() => handleCreateNote('general')}
                  className="px-3.5 py-2 bg-[#f8fafc] hover:bg-white dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-bold transition-all border border-[var(--border-primary)]"
                >
                  Create Blank Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalNotes;
