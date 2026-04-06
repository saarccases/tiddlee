'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type DocKey = 'aadhar_front' | 'aadhar_back' | 'birth_certificate';

export default function DocumentUpload() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [hasAadhar, setHasAadhar] = useState<boolean | null>(null);
    const [uploading, setUploading] = useState<Record<DocKey, boolean>>({
        aadhar_front: false,
        aadhar_back: false,
        birth_certificate: false,
    });
    const [errors, setErrors] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        id: '',
        child_name: '',
        aadhar_front: '',
        aadhar_back: '',
        birth_certificate: '',
    });

    const aadharFrontRef = useRef<HTMLInputElement>(null);
    const aadharBackRef = useRef<HTMLInputElement>(null);
    const birthCertRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (storedId) {
            fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`)
                .then(r => r.json())
                .then(data => {
                    const hasExistingAadhar = !!(data.aadhar_front || data.aadhar_back);
                    setFormData({
                        id: storedId,
                        child_name: data.child_name || '',
                        aadhar_front: data.aadhar_front || '',
                        aadhar_back: data.aadhar_back || '',
                        birth_certificate: data.birth_certificate || '',
                    });
                    if (hasExistingAadhar) setHasAadhar(true);
                    else if (data.birth_certificate) setHasAadhar(false);
                })
                .catch(e => console.error('Fetch error:', e));
        }
    }, []);

    const uploadFile = async (file: File, field: DocKey) => {
        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const folder = field === 'birth_certificate' ? 'tiddlee/documents/birth-certificates' : 'tiddlee/documents/aadhar';
            const upload = new FormData();
            upload.append('file', file);
            upload.append('type', 'document');
            upload.append('folder', folder);

            const res = await fetch('/api/upload', { method: 'POST', body: upload });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, [field]: data.url }));
            } else {
                alert('Upload failed. Please try again.');
            }
        } catch (e) {
            console.error('Upload error:', e);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: DocKey) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file, field);
    };

    const handleRemove = (field: DocKey) => {
        setFormData(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (hasAadhar === null) {
            setErrors('Please select whether you have an Aadhar card.');
            return;
        }
        if (hasAadhar) {
            if (!formData.aadhar_front || !formData.aadhar_back) {
                setErrors('Please upload both front and back of the Aadhar card.');
                return;
            }
        } else {
            if (!formData.birth_certificate) {
                setErrors('Please upload the Birth Certificate.');
                return;
            }
        }
        setErrors(null);
        setIsSaving(true);

        try {
            const payload: any = { id: formData.id };
            if (hasAadhar) {
                payload.aadhar_front = formData.aadhar_front;
                payload.aadhar_back = formData.aadhar_back;
                payload.birth_certificate = null;
            } else {
                payload.birth_certificate = formData.birth_certificate;
                payload.aadhar_front = null;
                payload.aadhar_back = null;
            }

            const res = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const programType = localStorage.getItem('selectedProgramType');
                if (programType === 'daycare') {
                    router.push('/detailed-daycare-policies');
                } else {
                    router.push('/preschool-policies');
                }
            } else {
                alert('Failed to save. Please try again.');
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('An error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const UploadBox = ({
        field,
        label,
        icon,
    }: {
        field: DocKey;
        label: string;
        icon: string;
    }) => {
        const inputRef = field === 'aadhar_front' ? aadharFrontRef : field === 'aadhar_back' ? aadharBackRef : birthCertRef;
        const value = formData[field];
        const isUploading = uploading[field];
        const isImage = value && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.webp'));

        return (
            <div
                className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group min-h-[180px]
                    ${value ? 'border-primary bg-primary/5' : errors ? 'border-red-300 bg-red-50/50' : 'border-slate-200 hover:border-primary/50 bg-slate-50 hover:bg-primary/5'}`}
                onClick={() => !value && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, field)}
                />
                {isUploading ? (
                    <>
                        <span className="material-icons animate-spin text-primary text-4xl">sync</span>
                        <p className="text-sm font-semibold text-slate-500">Uploading...</p>
                    </>
                ) : value ? (
                    <>
                        {isImage ? (
                            <img src={value} alt={label} className="w-full max-h-32 object-contain rounded-lg" />
                        ) : (
                            <span className="material-icons text-primary text-5xl">description</span>
                        )}
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">{label} Uploaded</p>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemove(field); }}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                        >
                            <span className="material-icons text-red-500 text-sm">close</span>
                        </button>
                    </>
                ) : (
                    <>
                        <span className={`material-icons text-4xl ${errors ? 'text-red-300' : 'text-slate-300 group-hover:text-primary'} transition-colors`}>{icon}</span>
                        <p className="text-sm font-bold text-slate-600 text-center">{label}</p>
                        <p className="text-xs text-slate-400 text-center">Click to upload · JPG, PNG or PDF</p>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen py-10 px-4 font-display text-slate-800">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="bg-primary py-6 px-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.15em]">Document Upload</h1>
                    <p className="mt-1 text-white/80 text-sm font-medium">Required identification documents for {formData.child_name || 'your child'}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">

                    {/* Aadhar toggle */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                            <span className="material-icons text-primary">badge</span>
                            Student Identity Document
                        </h2>
                        <p className="text-sm text-slate-500">Please select the document available for your child.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => { setHasAadhar(true); setErrors(null); setFormData(prev => ({ ...prev, birth_certificate: '' })); }}
                                className={`p-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                                    ${hasAadhar === true ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/30'}`}
                            >
                                <span className="material-icons text-base">credit_card</span>
                                Aadhar Card Available
                            </button>
                            <button
                                type="button"
                                onClick={() => { setHasAadhar(false); setErrors(null); setFormData(prev => ({ ...prev, aadhar_front: '', aadhar_back: '' })); }}
                                className={`p-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                                    ${hasAadhar === false ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/30'}`}
                            >
                                <span className="material-icons text-base">article</span>
                                No Aadhar — Upload Birth Certificate
                            </button>
                        </div>
                    </div>

                    {/* Aadhar upload */}
                    {hasAadhar === true && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Aadhar Card — Front &amp; Back</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadBox field="aadhar_front" label="Aadhar Front" icon="credit_card" />
                                <UploadBox field="aadhar_back" label="Aadhar Back" icon="credit_card" />
                            </div>
                        </div>
                    )}

                    {/* Birth certificate upload */}
                    {hasAadhar === false && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Birth Certificate</h3>
                            <UploadBox field="birth_certificate" label="Upload Birth Certificate" icon="article" />
                        </div>
                    )}

                    {/* Error */}
                    {errors && (
                        <p className="flex items-center gap-2 text-red-500 text-sm font-semibold">
                            <span className="material-icons text-base">error</span>
                            {errors}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => router.push('/care-routines')}
                            className="px-8 py-3 border-2 border-slate-200 rounded-full text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-10 py-3 bg-primary hover:bg-lime-600 text-white rounded-full font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <><span className="material-icons animate-spin text-sm">sync</span> Saving...</>
                            ) : (
                                <><span>Save &amp; Continue</span><span className="material-icons text-sm">arrow_forward</span></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
