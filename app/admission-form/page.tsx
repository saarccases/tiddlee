'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmissionForm, INITIAL_FORM_DATA } from '../../hooks/useAdmissionForm';
import { formatDate } from '../../lib/utils';
import PhotoUpload from '../components/PhotoUpload';
import { HomeHeader, ResumePrompt } from '../components/home/Header';

export default function AdmissionForm() {
    const router = useRouter();
    const {
        formData, setFormData, loading, showResumePrompt,
        pendingChildName, handleResume, handleStartNew,
        handleChange, handleCheckboxChange
    } = useAdmissionForm();

    // Pre-select programs based on user's choice from entry page
    const [programType, setProgramType] = useState<string | null>(null);
    const [isDobDateType, setIsDobDateType] = useState(false);

    // Ref for the hidden date input to trigger picker
    const dobInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setProgramType(localStorage.getItem('selectedProgramType'));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const admissionId = formData.id || localStorage.getItem('currentAdmissionId');
        const payload = { ...formData, id: admissionId };

        try {
            const res = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.id) localStorage.setItem('currentAdmissionId', data.id.toString());
                router.push('/parent-info');
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error('Submission failed:', error);
            alert('An error occurred while saving.');
        }
    };

    const toggleDarkMode = () => document.documentElement.classList.toggle('dark');

    return (
        <main className="font-display">
            <HomeHeader />

            <div className="max-w-5xl mx-auto px-4 mt-8">
                {/* Decorative Illustrations */}
                <div className="flex justify-center space-x-8 mb-8">
                    {[
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCKDc-46ZYKifEmrTfmzILDma3UgR82cCouJChL6IAi2xrH1UD-yQHsSDMosTaXjxUHoAYbvT1UBtOz_upbDEHA-vpm_l4FLWDIn-2VlAd89x3kDDgeIwyLQEQLzxm4Q-ruulwjmxNybyMguXED5CrHTcU6Jy-CgFr65LY2jvefD2JDTeOVytA1_OSiwrWIJQj3WTZLGtrl8TYR3HnA7WWB8tSU9KsakKtOPx0xtjYK1L9j9qLpxhQ-LmTYscJ4dhE_yW0Hjp83XlA",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCqh3CI7aiEhZTt9XWKsSwxVj8KqofC_RgJUzXxkgc4s-BDb70mPxxhYjkGbLo-KLSeqx6SMmGjTRCWdry-VXqQs7fFww9qbFi7ssh4ilPfug-JM0J64-FCSgGc4QWs5WIQmEwITBW_1j46obulzaT2hLOuTFC14xLBYQFNQSRCm1ZSlT9yk2ERyc12EkO63lDSQSrU1-zveZSkTU4Z1vqQVfSCdOwuNvhyc-DOmkz-R8srBQSOiYJDZcClW-4tbavoqTBFbZQNM3k",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCwdFFeCqYKpUsVXET_Y9Z5JryunkLmAA0g0osMl11PEGUAeVLvtwNH8E-2fN-nRQYY8ootdepMFSYdQbInam42W3dgjHHen16zJtz97Gb1uqUkrCod53hfAdPXC7N10XjwxNdohkizL0jVVVcsVgGha0WpsUH1GU2g4yEfAPHujM9RXdyFVw_yC3EKzmp6J3Zb9wDtyB_RKmoV-UVIpR6054VgNi5IvRQi56ZvA4lzNDEvaBr1lb5-cZ2IoEfNv6MYoDklLGqYrgU"
                    ].map((url, i) => (
                        <div key={i} className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden ${i === 0 ? 'bg-blue-100 dark:bg-blue-900' : i === 1 ? 'bg-pink-100 dark:bg-pink-900' : 'bg-teal-100 dark:bg-teal-900'}`}>
                            <img alt="Cartoon kid" className="w-full h-full object-cover" src={url} />
                        </div>
                    ))}
                </div>

                {showResumePrompt && (
                    <ResumePrompt
                        childName={pendingChildName}
                        onResume={handleResume}
                        onStartNew={handleStartNew}
                    />
                )}

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {loading && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center justify-center animate-pulse">
                            <span className="material-icons animate-spin mr-3 text-blue-500">sync</span>
                            <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm uppercase tracking-widest">Synchronizing saved data...</span>
                        </div>
                    )}

                    <div className="bg-primary px-6 py-4 rounded-xl shadow-md text-center">
                        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Application Form</h3>
                    </div>

                    {/* Child Details Section */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Name of the Child</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            placeholder="Full name as per records"
                                            type="text"
                                            name="child_name"
                                            value={formData.child_name || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Nickname</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            placeholder="How do you call them at home?"
                                            type="text"
                                            name="child_nickname"
                                            value={formData.child_nickname || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Birth Date</label>
                                        <div className="relative">
                                            <input
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg cursor-pointer font-medium"
                                                type="text"
                                                placeholder="DD/MM/YYYY"
                                                value={formatDate(formData.child_dob || '')}
                                                readOnly
                                                onClick={() => dobInputRef.current?.showPicker()}
                                            />
                                            <span
                                                className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                                                onClick={() => dobInputRef.current?.showPicker()}
                                            >
                                                event
                                            </span>
                                            <input
                                                ref={dobInputRef}
                                                className="invisible absolute bottom-0 left-0 w-0 h-0"
                                                type="date"
                                                name="child_dob"
                                                max={new Date().toISOString().split('T')[0]}
                                                value={formData.child_dob || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Current Age</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950/50 border-none rounded-lg font-bold text-primary"
                                            type="text"
                                            name="child_age"
                                            value={formData.child_age || ''}
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Gender</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20"
                                            name="child_gender"
                                            value={formData.child_gender || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Residence Address</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="Detailed home address"
                                        rows={3}
                                        name="child_residence_address"
                                        value={formData.child_residence_address || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="w-full lg:w-56 flex flex-col items-center">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide text-center">Child's Photo</label>
                                <PhotoUpload
                                    currentPhotoUrl={formData.child_photo}
                                    onPhotoUploaded={async (url) => {
                                        setFormData(prev => ({ ...prev, child_photo: url }));
                                        const currentId = formData.id || localStorage.getItem('currentAdmissionId');
                                        if (currentId) {
                                            fetch('/api/submit-admission', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ id: currentId, child_photo: url }),
                                            }).catch(e => console.error('Auto-save failed:', e));
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Parent / Guardian Details */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                            <span className="material-icons text-blue-500">family_restroom</span>
                            Parent / Guardian Details
                        </h4>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Father's Name</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="Father's full name"
                                        type="text"
                                        name="father_name"
                                        value={formData.father_name || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Contact Number</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="Contact Number"
                                        type="tel"
                                        name="father_cell_phone"
                                        value={formData.father_cell_phone || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Mother's Name</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="Mother's full name"
                                        type="text"
                                        name="mother_name"
                                        value={formData.mother_name || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Contact Number</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="Contact Number"
                                        type="tel"
                                        name="mother_cell_phone"
                                        value={formData.mother_cell_phone || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">If parents are unavailable</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Guardian Name</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            placeholder="Guardian's full name"
                                            type="text"
                                            name="guardian_name"
                                            value={formData.guardian_name || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Contact Number</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            placeholder="Contact Number"
                                            type="tel"
                                            name="guardian_phone"
                                            value={formData.guardian_phone || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Relationship</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            placeholder="Relationship to child"
                                            type="text"
                                            name="guardian_relationship"
                                            value={formData.guardian_relationship || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Emergency Contacts */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                            <span className="material-icons text-red-500">contact_emergency</span>
                            Emergency Contact Information
                        </h4>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Contact Person</label>
                                    <input
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-lg"
                                        placeholder="Full Name"
                                        type="text"
                                        name="emergency_contact_name"
                                        value={formData.emergency_contact_name || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                    <input
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-lg"
                                        placeholder="Different from parents"
                                        type="tel"
                                        name="emergency_contact_phone"
                                        value={formData.emergency_contact_phone || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Relationship</label>
                                    <select
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-lg"
                                        name="emergency_contact_relation"
                                        value={formData.emergency_contact_relation || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">Relation</option>
                                        {['Uncle', 'Aunt', 'Grandparent', 'Neighbor', 'Friend', 'Other'].map(rel => (
                                            <option key={rel} value={rel}>{rel}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Program & Languages */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-8 uppercase tracking-wider flex items-center gap-3">
                            <span className="material-icons text-primary">school</span>
                            Level of Program
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {programType !== 'daycare' && ['Toddlers', 'Kamblee', 'Pupalee', 'Tiddlee', 'Daycare']
                                .filter(program => programType === 'preschool' ? program !== 'Daycare' : true)
                                .map((program) => (
                                    <label key={program} className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.programs_selected.includes(program) ? 'bg-primary/5 border-primary text-primary shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-primary/20'}`}>
                                        <input
                                            className="hidden"
                                            type="checkbox"
                                            value={program}
                                            checked={formData.programs_selected.includes(program)}
                                            onChange={handleCheckboxChange}
                                        />
                                        <span className="font-bold text-sm tracking-wide">{program}</span>
                                    </label>
                                ))}

                            {/* Daycare Time Opted Field - Only shown if Daycare is selected or implicit */}
                            {(programType === 'daycare' || formData.programs_selected.includes('Daycare')) && (
                                <div className="col-span-2 md:col-span-5 mt-4 space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Time Opted For (Daycare)</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg font-medium"
                                        name="daycare_time_opted"
                                        value={formData.daycare_time_opted || ''}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Timing</option>
                                        <option value="9:00 AM - 1:00 PM">9:00 AM - 1:00 PM</option>
                                        <option value="9:00 AM - 3:00 PM">9:00 AM - 3:00 PM</option>
                                        <option value="9:00 AM - 6:00 PM">9:00 AM - 6:00 PM</option>
                                        <option value="Full Day">Full Day</option>
                                        <option value="Half Day">Half Day</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="mt-10 space-y-3">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Languages spoken and understood</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg font-medium"
                                placeholder="Example: English, Hindi, local language"
                                type="text"
                                name="languages_spoken"
                                value={formData.languages_spoken || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-6 space-y-3">
                            <label className="block text-sm font-bold text-pink-500 uppercase tracking-wide">Allergies (If Any)</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg font-medium"
                                placeholder="Please list any food or environmental allergies"
                                type="text"
                                name="allergies"
                                value={formData.allergies || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    {/* Office Use & Actions */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row gap-8 pb-8 border-b border-slate-50 dark:border-slate-800 mb-8">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Office Unique ID</label>
                                <div className="border-b border-slate-200 dark:border-slate-700 w-full h-10 flex items-center text-slate-800 dark:text-slate-200 font-bold text-lg">
                                    {formData.unique_id || <span className="text-sm font-medium text-slate-300 italic">Pre-assigned after review</span>}
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Date of Admission</label>
                                <div className="border-b border-slate-200 dark:border-slate-700 w-full h-10 flex items-center text-slate-800 dark:text-slate-200 font-bold text-lg">
                                    {formatDate(formData.admission_date)}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors uppercase text-xs font-black tracking-widest group" type="button">
                                <span className="material-icons text-lg">print</span>
                                <span>Export Physical Form</span>
                            </button>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    className="flex-1 md:flex-none px-6 py-4 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-sm uppercase tracking-widest"
                                    type="button"
                                    onClick={handleStartNew}
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 md:px-16 py-4 bg-primary hover:bg-lime-600 text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 transition-all transform active:scale-95"
                                >
                                    Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <footer className="max-w-5xl mx-auto px-4 mt-20 text-center pb-16">
                <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} TIDDLEE Pre-School. All rights reserved.</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-primary/60 font-black uppercase tracking-[0.5em]">
                    <span className="w-8 h-[1px] bg-primary/20"></span>
                    Nurturing curiosity
                    <span className="w-8 h-[1px] bg-primary/20"></span>
                </div>
            </footer>

            {/* Dark Mode Toggle */}
            <button className="fixed bottom-8 right-8 p-4 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 z-50 transform hover:scale-110 active:scale-95 transition-all group" onClick={toggleDarkMode}>
                <span className="material-icons dark:hidden text-orange-400 group-hover:rotate-12 transition-transform">light_mode</span>
                <span className="material-icons hidden dark:block text-blue-300 group-hover:-rotate-12 transition-transform">dark_mode</span>
            </button>
        </main>
    );
}
