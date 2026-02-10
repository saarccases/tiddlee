'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUpload from './components/PhotoUpload';

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [pendingChildName, setPendingChildName] = useState('');
    const [formData, setFormData] = useState({
        id: '',
        child_name: '',
        child_nickname: '',
        child_dob: '',
        child_age: '',
        child_gender: '',
        child_photo: '',
        child_residence_address: '',
        emergency_contact1_name: '',
        emergency_contact1_phone: '',
        emergency_contact1_relation: '',
        emergency_contact2_name: '',
        emergency_contact2_phone: '',
        emergency_contact2_relation: '',
        languages_spoken: '',
        programs_selected: [] as string[],
        // Hidden state for auto-fill
        mother_name: '',
        mother_cell_phone: '',
        mother_relationship: '',
        father_name: '',
        father_cell_phone: '',
        father_relationship: '',
        unique_id: '',
        admission_date: ''
    });

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (storedId && storedId !== 'undefined' && storedId !== 'null') {
            setShowResumePrompt(true);
            // Fetch just the name for the prompt
            fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`)
                .then(res => res.json())
                .then(data => {
                    if (data.child_name) setPendingChildName(data.child_name);
                })
                .catch(err => console.error('Error fetching pending name:', err));
        }
    }, []);

    const handleResume = async () => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (!storedId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                console.log('[Home] Data successfully retrieved:', data);

                const programs = Array.isArray(data.programs_selected)
                    ? data.programs_selected
                    : [];

                const ageToDisplay = data.child_dob ? calculateAge(data.child_dob) : (data.child_age || '');

                let mName = data.mother_name || '';
                let mPhone = data.mother_cell_phone || '';
                let fName = data.father_name || '';
                let fPhone = data.father_cell_phone || '';

                if (!mName) {
                    if (data.emergency_contact1_relation === 'Mother') mName = data.emergency_contact1_name || '';
                    else if (data.emergency_contact2_relation === 'Mother') mName = data.emergency_contact2_name || '';
                }
                if (!mPhone) {
                    if (data.emergency_contact1_relation === 'Mother') mPhone = data.emergency_contact1_phone || '';
                    else if (data.emergency_contact2_relation === 'Mother') mPhone = data.emergency_contact2_phone || '';
                }
                if (!fName) {
                    if (data.emergency_contact1_relation === 'Father') fName = data.emergency_contact1_name || '';
                    else if (data.emergency_contact2_relation === 'Father') fName = data.emergency_contact2_name || '';
                }
                if (!fPhone) {
                    if (data.emergency_contact1_relation === 'Father') fPhone = data.emergency_contact1_phone || '';
                    else if (data.emergency_contact2_relation === 'Father') fPhone = data.emergency_contact2_phone || '';
                }

                setFormData({
                    id: String(storedId),
                    child_name: data.child_name || '',
                    child_nickname: data.child_nickname || '',
                    child_dob: data.child_dob || '',
                    child_age: ageToDisplay,
                    child_gender: data.child_gender || '',
                    child_photo: data.child_photo || '',
                    child_residence_address: data.child_residence_address || '',
                    emergency_contact1_name: data.emergency_contact1_name || '',
                    emergency_contact1_phone: data.emergency_contact1_phone || '',
                    emergency_contact1_relation: data.emergency_contact1_relation || '',
                    emergency_contact2_name: data.emergency_contact2_name || '',
                    emergency_contact2_phone: data.emergency_contact2_phone || '',
                    emergency_contact2_relation: data.emergency_contact2_relation || '',
                    languages_spoken: data.languages_spoken || '',
                    programs_selected: programs,
                    mother_name: mName,
                    mother_cell_phone: mPhone,
                    mother_relationship: data.mother_relationship || (mName ? 'Mother' : ''),
                    father_name: fName,
                    father_cell_phone: fPhone,
                    father_relationship: data.father_relationship || (fName ? 'Father' : ''),
                    unique_id: data.unique_id || '',
                    admission_date: data.admission_date || ''
                });
                setShowResumePrompt(false);
            }
        } catch (error) {
            console.error('[Home] Resume error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartNew = () => {
        localStorage.removeItem('currentAdmissionId');
        setFormData({
            id: '',
            child_name: '',
            child_nickname: '',
            child_dob: '',
            child_age: '',
            child_gender: '',
            child_photo: '',
            child_residence_address: '',
            emergency_contact1_name: '',
            emergency_contact1_phone: '',
            emergency_contact1_relation: '',
            emergency_contact2_name: '',
            emergency_contact2_phone: '',
            emergency_contact2_relation: '',
            languages_spoken: '',
            programs_selected: [],
            mother_name: '',
            mother_cell_phone: '',
            mother_relationship: '',
            father_name: '',
            father_cell_phone: '',
            father_relationship: '',
            unique_id: '',
            admission_date: ''
        });
        setShowResumePrompt(false);
    };

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const calculateAge = (dob: string) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();

        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }

        if (today.getDate() < birthDate.getDate()) {
            if (months > 0) months--;
        }

        if (years > 0) {
            return `${years} Year(s) ${months} Month(s)`;
        } else {
            return `${months} Month(s)`;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'child_dob') {
            const age = calculateAge(value);
            setFormData(prev => ({ ...prev, [name]: value, child_age: age }));
        }
        // Sync logic for Emergency Contact 1
        else if (name === 'emergency_contact1_name') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact1_relation === 'Mother') updates.mother_name = value;
                if (prev.emergency_contact1_relation === 'Father') updates.father_name = value;
                return { ...prev, ...updates };
            });
        }
        else if (name === 'emergency_contact1_phone') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact1_relation === 'Mother') updates.mother_cell_phone = value;
                if (prev.emergency_contact1_relation === 'Father') updates.father_cell_phone = value;
                return { ...prev, ...updates };
            });
        }
        else if (name === 'emergency_contact1_relation') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (value === 'Mother') {
                    if (prev.mother_name) updates.emergency_contact1_name = prev.mother_name;
                    else updates.mother_name = prev.emergency_contact1_name;

                    if (prev.mother_cell_phone) updates.emergency_contact1_phone = prev.mother_cell_phone;
                    else updates.mother_cell_phone = prev.emergency_contact1_phone;

                    updates.mother_relationship = 'Mother';
                }
                if (value === 'Father') {
                    if (prev.father_name) updates.emergency_contact1_name = prev.father_name;
                    else updates.father_name = prev.emergency_contact1_name;

                    if (prev.father_cell_phone) updates.emergency_contact1_phone = prev.father_cell_phone;
                    else updates.father_cell_phone = prev.emergency_contact1_phone;

                    updates.father_relationship = 'Father';
                }
                return { ...prev, ...updates };
            });
        }
        // Sync logic for Emergency Contact 2
        else if (name === 'emergency_contact2_name') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact2_relation === 'Mother') updates.mother_name = value;
                if (prev.emergency_contact2_relation === 'Father') updates.father_name = value;
                return { ...prev, ...updates };
            });
        }
        else if (name === 'emergency_contact2_phone') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact2_relation === 'Mother') updates.mother_cell_phone = value;
                if (prev.emergency_contact2_relation === 'Father') updates.father_cell_phone = value;
                return { ...prev, ...updates };
            });
        }
        else if (name === 'emergency_contact2_relation') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (value === 'Mother') {
                    if (prev.mother_name) updates.emergency_contact2_name = prev.mother_name;
                    else updates.mother_name = prev.emergency_contact2_name;

                    if (prev.mother_cell_phone) updates.emergency_contact2_phone = prev.mother_cell_phone;
                    else updates.mother_cell_phone = prev.emergency_contact2_phone;

                    updates.mother_relationship = 'Mother';
                }
                if (value === 'Father') {
                    if (prev.father_name) updates.emergency_contact2_name = prev.father_name;
                    else updates.father_name = prev.emergency_contact2_name;

                    if (prev.father_cell_phone) updates.emergency_contact2_phone = prev.father_cell_phone;
                    else updates.father_cell_phone = prev.emergency_contact2_phone;

                    updates.father_relationship = 'Father';
                }
                return { ...prev, ...updates };
            });
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                return { ...prev, programs_selected: [...prev.programs_selected, value] };
            } else {
                return { ...prev, programs_selected: prev.programs_selected.filter(p => p !== value) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure we use the existing ID if it's in localStorage but not in state yet
        let submissionData = { ...formData };
        if (!submissionData.id) {
            const storedId = localStorage.getItem('currentAdmissionId');
            if (storedId) {
                submissionData.id = storedId;
            }
        }

        try {
            const response = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.id) {
                    localStorage.setItem('currentAdmissionId', data.id.toString());
                    setFormData(prev => ({ ...prev, id: data.id.toString() }));
                }
                router.push('/parent-info');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while saving.');
        }
    };

    return (
        <main className="font-display">
            <header className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4 mb-6 md:mb-0">
                        <div className="bg-white p-2 rounded-xl shadow-md">
                            <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-lg text-white">
                                <span className="material-icons text-4xl">flutter_dash</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">TIDDLEE</h1>
                            <p className="text-sm font-medium text-primary mt-1">Technology unplugged, Childhood plugged-in</p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admission Form & Policy</h2>
                        <p className="text-slate-500 dark:text-slate-400">Preschool with Daycare Program</p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                    <svg className="relative block w-full h-8" data-name="Layer 1" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
                        <path className="fill-background-light dark:fill-background-dark" d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C41.39,36.19,161,64.84,321.39,56.44Z"></path>
                    </svg>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 mt-8">
                <div className="flex justify-center space-x-8 mb-8">
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                            <img alt="Cute boy cartoon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKDc-46ZYKifEmrTfmzILDma3UgR82cCouJChL6IAi2xrH1UD-yQHsSDMosTaXjxUHoAYbvT1UBtOz_upbDEHA-vpm_l4FLWDIn-2VlAd89x3kDDgeIwyLQEQLzxm4Q-ruulwjmxNybyMguXED5CrHTcU6Jy-CgFr65LY2jvefD2JDTeOVytA1_OSiwrWIJQj3WTZLGtrl8TYR3HnA7WWB8tSU9KsakKtOPx0xtjYK1L9j9qLpxhQ-LmTYscJ4dhE_yW0Hjp83XlA" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                            <img alt="Cute girl cartoon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqh3CI7aiEhZTt9XWKsSwxVj8KqofC_RgJUzXxkgc4s-BDb70mPxxhYjkGbLo-KLSeqx6SMmGjTRCWdry-VXqQs7fFww9qbFi7ssh4ilPfug-JM0J64-FCSgGc4QWs5WIQmEwITBW_1j46obulzaT2hLOuTFC14xLBYQFNQSRCm1ZSlT9yk2ERyc12EkO63lDSQSrU1-zveZSkTU4Z1vqQVfSCdOwuNvhyc-DOmkz-R8srBQSOiYJDZcClV-4tbavoqTBFbZQNM3k" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                            <img alt="Cute kid cartoon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwdFFeCqYKpUsVXET_Y9Z5JryunkLmAA0g0osMl11PEGUAeVLvtwNH8E-2fN-nRQYY8ootdepMFSYdQbInam42W3dgjHHen16zJtz97Gb1uqUkrCod53hfAdPXC7N10XjwxNdohkizL0jVVVcsVgGha0WpsUH1GU2g4yEfAPHujM9RXdyFVw_yC3EKzmp6J3Zb9wDtyB_RKmoV-UVIpR6054VgNi5IvRQi56ZvA4lzNDEvaBr1lb5-cZ2IoEfNv6MYoDklLGqYrgU" />
                        </div>
                    </div>
                </div>
                {showResumePrompt && (
                    <div className="bg-lime-50 dark:bg-lime-900/40 border-2 border-primary/30 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-in fade-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="material-icons text-primary text-3xl">history</span>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Pending form detected</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    You have a partially completed form for <span className="text-primary font-bold">{pendingChildName || 'a child'}</span>.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                onClick={handleStartNew}
                                className="flex-1 md:flex-none px-6 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
                            >
                                Start Fresh
                            </button>
                            <button
                                onClick={handleResume}
                                className="flex-1 md:flex-none px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-lime-600 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Continue Previous Form
                                <span className="material-icons text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {loading && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center justify-center animate-pulse">
                            <span className="material-icons animate-spin mr-3 text-blue-500">sync</span>
                            <span className="text-blue-700 dark:text-blue-300 font-semibold">Synchronizing your saved data...</span>
                        </div>
                    )}
                    <div className="bg-primary px-6 py-4 rounded-xl shadow-md text-center">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Application (For TIDDLEE)</h3>
                    </div>
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Name of the Child</label>
                                        <input
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all"
                                            placeholder="Full name"
                                            type="text"
                                            name="child_name"
                                            value={formData.child_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Nickname</label>
                                        <input
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all"
                                            placeholder="Preferred name"
                                            type="text"
                                            name="child_nickname"
                                            value={formData.child_nickname}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Birth Date</label>
                                        <input
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all"
                                            type="date"
                                            name="child_dob"
                                            value={formData.child_dob}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Age</label>
                                        <input
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all"
                                            placeholder="Years/Months"
                                            type="text"
                                            name="child_age"
                                            value={formData.child_age}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                                        <select
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all"
                                            name="child_gender"
                                            value={formData.child_gender}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Residence Address</label>
                                    <textarea
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg transition-all"
                                        placeholder="Complete home address"
                                        rows={3}
                                        name="child_residence_address"
                                        value={formData.child_residence_address}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="w-full lg:w-48 flex flex-col items-center">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Child's Photo</label>
                                <PhotoUpload
                                    onPhotoUploaded={async (url) => {
                                        setFormData(prev => ({ ...prev, child_photo: url }));

                                        // Auto-save photo to database immediately
                                        const currentId = formData.id || localStorage.getItem('currentAdmissionId');
                                        if (currentId) {
                                            try {
                                                await fetch('/api/submit-admission', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        id: currentId,
                                                        child_photo: url
                                                    }),
                                                });
                                            } catch (error) {
                                                console.error('Error auto-saving photo:', error);
                                            }
                                        }
                                    }}
                                    currentPhotoUrl={formData.child_photo}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                            <span className="material-icons text-red-500 mr-2">contact_emergency</span>
                            Emergency Contact Information
                        </h4>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg"
                                    placeholder="Contact 1 Name"
                                    type="text"
                                    name="emergency_contact1_name"
                                    value={formData.emergency_contact1_name}
                                    onChange={handleChange}
                                />
                                <input
                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg"
                                    placeholder="Phone Number"
                                    type="tel"
                                    name="emergency_contact1_phone"
                                    value={formData.emergency_contact1_phone}
                                    onChange={handleChange}
                                />
                                <select
                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg"
                                    name="emergency_contact1_relation"
                                    value={formData.emergency_contact1_relation}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Relation</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Uncle">Uncle</option>
                                    <option value="Aunt">Aunt</option>
                                    <option value="Grandparent">Grandparent</option>
                                    <option value="Neighbor">Neighbor</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg"
                                    placeholder="Contact 2 Name"
                                    type="text"
                                    name="emergency_contact2_name"
                                    value={formData.emergency_contact2_name}
                                    onChange={handleChange}
                                />
                                <input
                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg"
                                    placeholder="Phone Number"
                                    type="tel"
                                    name="emergency_contact2_phone"
                                    value={formData.emergency_contact2_phone}
                                    onChange={handleChange}
                                />
                                <select
                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg"
                                    name="emergency_contact2_relation"
                                    value={formData.emergency_contact2_relation}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Relation</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Uncle">Uncle</option>
                                    <option value="Aunt">Aunt</option>
                                    <option value="Grandparent">Grandparent</option>
                                    <option value="Neighbor">Neighbor</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                            <span className="material-icons text-primary mr-2">school</span>
                            Program Selection
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {['Toddlers', 'Kamblee', 'Pupalee', 'Tiddlee', 'Daycare'].map((program) => (
                                <label key={program} className="flex items-center space-x-3 cursor-pointer group">
                                    <input
                                        className="w-5 h-5 text-primary rounded border-slate-300 dark:border-slate-700 focus:ring-primary"
                                        type="checkbox"
                                        value={program}
                                        checked={formData.programs_selected.includes(program)}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{program}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-8 space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Languages spoken and understood</label>
                            <input
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg"
                                placeholder="e.g. English, Spanish"
                                type="text"
                                name="languages_spoken"
                                value={formData.languages_spoken}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    <div className="flex flex-col md:flex-row gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex-1">
                            <label className="block text-primary font-bold mb-1">Unique ID</label>
                            <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 dark:text-gray-200 font-medium">
                                {formData.unique_id || <span className="text-sm text-gray-400 italic">Office use only</span>}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-primary font-bold mb-1">Date of Admission</label>
                            <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 dark:text-gray-200 font-medium whitespace-nowrap overflow-hidden">
                                {formatDate(formData.admission_date)}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
                        <button className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" type="button">
                            <span className="material-icons">print</span>
                            <span className="font-semibold">Print Form for Manual Fill</span>
                        </button>
                        <div className="flex space-x-4">
                            <button
                                className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                type="reset"
                                onClick={() => {
                                    localStorage.removeItem('currentAdmissionId');
                                    setFormData({
                                        id: '',
                                        child_name: '',
                                        child_nickname: '',
                                        child_dob: '',
                                        child_age: '',
                                        child_gender: '',
                                        child_photo: '',
                                        child_residence_address: '',
                                        emergency_contact1_name: '',
                                        emergency_contact1_phone: '',
                                        emergency_contact1_relation: '',
                                        emergency_contact2_name: '',
                                        emergency_contact2_phone: '',
                                        emergency_contact2_relation: '',
                                        languages_spoken: '',
                                        programs_selected: [],
                                        mother_name: '',
                                        mother_cell_phone: '',
                                        mother_relationship: '',
                                        father_name: '',
                                        father_cell_phone: '',
                                        father_relationship: '',
                                        unique_id: '',
                                        admission_date: ''
                                    });
                                }}
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                className="bg-primary hover:bg-lime-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transform active:scale-95 transition-all text-center"
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <footer className="max-w-5xl mx-auto px-4 mt-16 text-center text-slate-400 text-sm pb-12">
                <p>© 2024 TIDDLEE Learning Center. All rights reserved.</p>
                <p className="mt-1">Nurturing curiosity, one step at a time.</p>
            </footer>

            <button
                className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 z-50 transition-colors"
                onClick={toggleDarkMode}
            >
                <span className="material-icons dark:hidden text-yellow-500">dark_mode</span>
                <span className="material-icons hidden dark:block text-yellow-300">light_mode</span>
            </button>
        </main>
    );
}
