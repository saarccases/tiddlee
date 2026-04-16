'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SignaturePad from '../components/SignaturePad';

type FormErrors = { consent?: string; signature?: string };

export default function ConsentIntroduction() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
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
        }
    };

    const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, media_consent: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: FormErrors = {};
        if (!formData.media_consent) {
            newErrors.consent = 'Please select a consent option before submitting.';
        }
        if (!formData.mother_signature && !formData.father_signature) {
            newErrors.signature = 'At least one parent / guardian signature is required before submitting.';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setIsSaving(true);

        try {
            const response = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                localStorage.removeItem('currentAdmissionId');
                localStorage.setItem('formSubmitted', 'true');
                router.replace('/contact-corporate-info');
            } else {
                const errorData = await response.json();
                alert(`Failed to save: ${errorData.message || 'Please try again.'}`);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-6 md:py-10 px-4 font-display text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl overflow-hidden rounded-xl border border-slate-200">
                <div className="p-5 md:p-8 border-b border-primary">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-primary font-bold">Child Photo / Video Consent Form</span>
                    </h1>
                    <div className="h-1.5 w-full bg-primary mt-4 rounded-full"></div>
                </div>

                <div className="px-4 md:px-10 py-6 md:py-8 leading-relaxed">
                    <div className="mb-8 font-medium">
                        <p className="font-bold text-lg mb-4">Dear TIDDLEE Parent/ Guardian,</p>
                        <p className="mb-6">
                            We wish to document the growth and the story of your little <strong>TIDDLEE</strong> through photos and/or videos captured during Daily/Routine Activities, Celebrations, Incursions, Excursions, Special Sessions and if we are lucky, a serendipitous moment that can end up hanging on your wall!
                        </p>
                        <p className="mb-6">
                            It is our commitment to responsibly present these photos in weekly reports to you, bulletin boards, social media, the TIDDLEE website, marketing collateral, communication material, and other print forms while abiding by the Guiding Principles laid by <strong>Child Rights International Network (CRIN)</strong>.
                        </p>
                        <p className="mb-6">
                            We would be grateful if you would fill the form behind to give us consent for the aforementioned.
                        </p>
                        <div className="flex flex-col gap-1">
                            <p className="font-bold">Regards</p>
                            <p className="font-bold text-primary">Team TIDDLEE</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 md:px-10 pb-6 md:pb-8 space-y-6 md:space-y-8">
                    <div className="pt-8 border-t border-slate-100">
                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg font-medium leading-relaxed">
                                I give permission to responsibly take photographs and / or video of my child as long as it is appropriate. I grant full rights to use the images resulting from the photography / video filming, and any reproductions or adaptations of the images for marketing or advertising or other purpose to help achieve the school&apos;s aims.
                            </p>
                            <p className="text-slate-600 text-sm italic mt-4">
                                This might include (but is not limited to), the right to use them in their printed and online publicity, bulletin boards, marketing or advertising, and/or marketing updates posted via social media channels, website or any print forms.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-bold text-red-600 flex items-center gap-1">
                            <span className="material-icons text-sm">info</span>
                            Required — please select one option
                        </p>
                        <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors group ${formData.media_consent === 'allow' ? 'border-primary bg-primary/5' : errors.consent ? 'border-red-300 bg-red-50/50' : 'border-slate-200 hover:border-primary/40'}`}>
                            <input
                                className="w-5 h-5 shrink-0 text-primary border-slate-300 focus:ring-primary"
                                name="consent"
                                type="radio"
                                value="allow"
                                checked={formData.media_consent === 'allow'}
                                onChange={handleConsentChange}
                            />
                            <span className="font-semibold text-base md:text-lg flex-1">I allow the use of the photos taken involving my child</span>
                            <span className="material-icons text-slate-300 group-hover:text-primary shrink-0">check_circle</span>
                        </label>
                        <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors group ${formData.media_consent === 'deny' ? 'border-red-400 bg-red-50' : errors.consent ? 'border-red-300 bg-red-50/50' : 'border-slate-200 hover:border-red-200'}`}>
                            <input
                                className="w-5 h-5 shrink-0 text-red-500 border-slate-300 focus:ring-red-500"
                                name="consent"
                                type="radio"
                                value="deny"
                                checked={formData.media_consent === 'deny'}
                                onChange={handleConsentChange}
                            />
                            <span className="font-semibold text-base md:text-lg flex-1">I do not allow the use of the photos taken involving my child</span>
                            <span className="material-icons text-slate-300 group-hover:text-red-400 shrink-0">cancel</span>
                        </label>
                        {errors.consent && (
                            <p className="flex items-center gap-2 text-red-500 text-sm font-semibold">
                                <span className="material-icons text-base">error</span>{errors.consent}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <span className="material-icons mr-2 text-primary">security</span>
                            Declaration of Commitment
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                <span className="text-slate-700">We will respect every child&apos;s dignity and private boundaries, and prevent photography of anything that could be inappropriate, embarrassing or compromising for the child.</span>
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
                                <span className="text-slate-700">All media will be stored securely through encryption to ensure child&apos;s privacy.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-[#fffde1] p-5 md:p-8 lg:p-12 border-t border-primary/20">
                    <p className="text-sm font-bold text-red-600 flex items-center gap-1 mb-4">
                        <span className="material-icons text-sm">draw</span>
                        Required — at least one parent / guardian must sign below
                    </p>
                    <div className="text-slate-600 text-sm mb-10 leading-relaxed italic">
                        By signing below the parent or guardian fully understands and agrees to the entire content of the facility&apos;s policies and Terms &amp; Conditions. The Parent / Guardian ensures that the data provided by them is accurate.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-4">
                            <SignaturePad
                                label="Mother's Signature"
                                onSave={(url) => handleSignatureSave(url, 'mother')}
                                savedSignatureUrl={formData.mother_signature}
                            />
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold uppercase text-slate-400">Mother&apos;s Signature</span>
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
                                <span className="text-[10px] font-bold uppercase text-slate-400">Father&apos;s Signature</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Date: {formatDate(formData.father_signature_date)}</span>
                            </div>
                        </div>
                    </div>

                    {errors.signature && (
                        <p className="flex items-center gap-2 text-red-500 text-sm font-semibold mt-6">
                            <span className="material-icons text-base">error</span>{errors.signature}
                        </p>
                    )}
                    <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-xs font-medium text-slate-500">
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

                <form onSubmit={handleSubmit} className="p-5 md:p-8 flex justify-end gap-4 no-print bg-white border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <><span className="material-icons animate-spin text-sm">sync</span> Submitting...</>
                        ) : (
                            <>Submit Consent <span className="material-icons text-sm">check_circle</span></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
