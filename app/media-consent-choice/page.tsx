'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SignaturePad from '../components/SignaturePad';

export default function MediaConsentChoice() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        child_name: '',
        father_name: '',
        unique_id: '',
        admission_date: '',
        mother_signature: '',
        mother_signature_date: '',
        father_signature: '',
        father_signature_date: '',
        media_consent: ''
    });

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (storedId) {
            const fetchAdmission = async () => {
                try {
                    const response = await fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            id: storedId,
                            child_name: data.child_name || '',
                            father_name: data.father_name || '',
                            unique_id: data.unique_id || '',
                            admission_date: data.admission_date || '',
                            mother_signature: data.mother_signature || '',
                            mother_signature_date: data.mother_signature_date || '',
                            father_signature: data.father_signature || '',
                            father_signature_date: data.father_signature_date || '',
                            media_consent: data.media_consent || ''
                        });
                    }
                } catch (error) {
                    console.error('[MediaConsentChoice] Fetch error:', error);
                }
            };
            fetchAdmission();
        }
    }, []);

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

    const handleSignatureSave = async (dataUrl: string, type: 'mother' | 'father') => {
        if (!dataUrl) {
            setFormData(prev => ({
                ...prev,
                [`${type}_signature`]: '',
                [`${type}_signature_date`]: ''
            }));
            return;
        }

        try {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `${type}_signature.png`, { type: 'image/png' });

            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('type', 'signature');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await response.json();
            if (data.success) {
                const today = new Date().toISOString().split('T')[0];
                setFormData(prev => ({
                    ...prev,
                    [`${type}_signature`]: data.url,
                    [`${type}_signature_date`]: today
                }));
            }
        } catch (err) {
            console.error('Signature upload error:', err);
        }
    };

    const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, media_consent: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                localStorage.removeItem('currentAdmissionId');
                router.push('/contact-corporate-info');
            } else {
                const errorData = await response.json();
                alert(`Failed to save: ${errorData.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-10 px-4 font-inter text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">

                <div className="bg-primary p-6 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold font-display">Child Photo / Video Consent Form</h1>
                        <p className="mt-2 opacity-90 font-medium">Section 16 - Admission Application</p>
                    </div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                </div>

                <div className="p-8 md:p-12 space-y-8">
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg font-medium leading-relaxed">
                            I give permission to responsibly take photographs and / or video of my child as long as it is appropriate. I grant full rights to use the images resulting from the photography / video filming, and any reproductions or adaptations of the images for marketing or advertising or other purpose to help achieve the school's aims.
                        </p>
                        <p className="text-slate-600 text-sm italic">
                            This might include (but is not limited to), the right to use them in their printed and online publicity, bulletin boards, marketing or advertising, and/or marketing updates posted via social media channels, website or any print forms.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10">
                        <label className="flex items-center p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-primary/20 transition-colors group">
                            <input
                                className="w-5 h-5 text-primary border-slate-300 focus:ring-primary"
                                name="consent"
                                type="radio"
                                value="allow"
                                checked={formData.media_consent === 'allow'}
                                onChange={handleConsentChange}
                            />
                            <span className="ml-4 font-semibold text-lg">I allow the use of the photos taken involving my child</span>
                            <span className="ml-auto material-icons text-slate-300 group-hover:text-primary">check_circle</span>
                        </label>
                        <label className="flex items-center p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-red-200 transition-colors group">
                            <input
                                className="w-5 h-5 text-red-500 border-slate-300 focus:ring-red-500"
                                name="consent"
                                type="radio"
                                value="deny"
                                checked={formData.media_consent === 'deny'}
                                onChange={handleConsentChange}
                            />
                            <span className="ml-4 font-semibold text-lg">I do not allow the use of the photos taken involving my child</span>
                            <span className="ml-auto material-icons text-slate-300 group-hover:text-red-400">cancel</span>
                        </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Name of the Child</label>
                            <input
                                className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium"
                                placeholder="Enter child's full name"
                                type="text"
                                value={formData.child_name}
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wider text-slate-500">Name of the Parent / Guardian</label>
                            <input
                                className="w-full bg-slate-50 border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 font-medium"
                                placeholder="Enter your full name"
                                type="text"
                                value={formData.father_name}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-primary">
                        <h3 className="font-display text-xl font-bold mb-4 flex items-center">
                            <span className="material-icons mr-2 text-primary">security</span>
                            Declaration of Commitment
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span className="text-slate-700">We will respect every child's dignity and private boundaries, and prevent photography of anything that could be inappropriate, embarrassing or compromising for the child.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span className="text-slate-700">We will choose images and related messages based on values of respect for equality, solidarity, and justice.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span className="text-slate-700">We will ensure the safety of every child during the photography session.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span className="text-slate-700">All media will be stored securely through encryption to ensure child's privacy.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-[#fffde1] p-8 md:p-12 border-t border-primary/20">
                    <div className="text-slate-600 text-sm mb-10 leading-relaxed italic">
                        By signing below the parent or guardian fully understands and agrees to the entire content of the facility's policies and Terms &amp; Conditions. The Parent / Guardian ensures that the data provided by them is accurate.
                    </div>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <SignaturePad
                                label="Mother's Signature"
                                onSave={(url) => handleSignatureSave(url, 'mother')}
                                savedSignatureUrl={formData.mother_signature}
                            />
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Mother's Signature</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Date: {formatDate(formData.mother_signature_date)}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <SignaturePad
                                label="Father's Signature"
                                onSave={(url) => handleSignatureSave(url, 'father')}
                                savedSignatureUrl={formData.father_signature}
                            />
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Father's Signature</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Date: {formatDate(formData.father_signature_date)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <span>Unique ID:</span>
                            <span className="text-primary font-bold border-b border-dotted border-primary/40 flex-grow min-w-[50px]">{formData.unique_id || '................'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Date of Admission:</span>
                            <span className="text-primary font-bold border-b border-dotted border-primary/40 flex-grow min-w-[50px]">{formatDate(formData.admission_date) || '................'}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 bg-slate-50 flex justify-between items-center border-t border-slate-200">
                    <Link href="/consent-introduction" className="px-6 py-2 border border-slate-300 text-slate-500 font-semibold rounded-lg hover:bg-white transition-colors">
                        Back
                    </Link>
                    <div className="flex gap-4">
                        <button type="button" className="px-6 py-2 text-slate-500 font-semibold hover:text-slate-700 transition-colors">Save Draft</button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary hover:bg-opacity-90 disabled:opacity-50 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            {isSaving ? 'Submitting...' : 'Submit Consent'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="max-w-4xl mx-auto mt-8 flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs px-4">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <span className="material-icons text-primary">verified_user</span>
                    <span>Secure Child Data Processing - SAARC Group Compliance</span>
                </div>
                <div className="flex gap-6">
                    <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                    <a className="hover:text-primary transition-colors" href="#">Contact Support</a>
                </div>
            </div>
        </div>
    );
}
