'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type DocKey = 'aadhar_front' | 'aadhar_back' | 'birth_certificate' | 'father_aadhar_front' | 'father_aadhar_back' | 'mother_aadhar_front' | 'mother_aadhar_back' | 'guardian1_aadhar_front' | 'guardian1_aadhar_back' | 'guardian2_aadhar_front' | 'guardian2_aadhar_back' | 'address_proof';

export default function DocumentUpload() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [hasAadhar, setHasAadhar] = useState<boolean | null>(null);
    const [uploading, setUploading] = useState<Record<DocKey, boolean>>({
        aadhar_front: false,
        aadhar_back: false,
        birth_certificate: false,
        father_aadhar_front: false,
        father_aadhar_back: false,
        mother_aadhar_front: false,
        mother_aadhar_back: false,
        guardian1_aadhar_front: false,
        guardian1_aadhar_back: false,
        guardian2_aadhar_front: false,
        guardian2_aadhar_back: false,
        address_proof: false,
    });
    const [errors, setErrors] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        id: '',
        child_name: '',
        aadhar_front: '',
        aadhar_back: '',
        birth_certificate: '',
        father_aadhar_front: '',
        father_aadhar_back: '',
        mother_aadhar_front: '',
        mother_aadhar_back: '',
        guardian1_aadhar_front: '',
        guardian1_aadhar_back: '',
        guardian2_aadhar_front: '',
        guardian2_aadhar_back: '',
        address_proof: '',
    });
    const [hasParents, setHasParents] = useState<boolean | null>(null);
    const [parentNames, setParentNames] = useState({
        father_name: '',
        mother_name: '',
        guardian1_name: '',
        guardian2_name: '',
    });

    const aadharFrontRef = useRef<HTMLInputElement>(null);
    const aadharBackRef = useRef<HTMLInputElement>(null);
    const birthCertRef = useRef<HTMLInputElement>(null);
    const fatherAadharFrontRef = useRef<HTMLInputElement>(null);
    const fatherAadharBackRef = useRef<HTMLInputElement>(null);
    const motherAadharFrontRef = useRef<HTMLInputElement>(null);
    const motherAadharBackRef = useRef<HTMLInputElement>(null);
    const guardian1AadharFrontRef = useRef<HTMLInputElement>(null);
    const guardian1AadharBackRef = useRef<HTMLInputElement>(null);
    const guardian2AadharFrontRef = useRef<HTMLInputElement>(null);
    const guardian2AadharBackRef = useRef<HTMLInputElement>(null);
    const addressProofRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (storedId) {
            fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`)
                .then(r => r.json())
                .then(data => {
                    const hasExistingAadhar = !!(data.aadhar_front || data.aadhar_back);
                    const hasBothParents = !!(data.father_name && data.mother_name);
                    const hasGuardians = !!(data.guardian_name || data.guardian1_name || data.guardian2_name);

                    setFormData({
                        id: storedId,
                        child_name: data.child_name || '',
                        aadhar_front: data.aadhar_front || '',
                        aadhar_back: data.aadhar_back || '',
                        birth_certificate: data.birth_certificate || '',
                        father_aadhar_front: data.father_aadhar_front || '',
                        father_aadhar_back: data.father_aadhar_back || '',
                        mother_aadhar_front: data.mother_aadhar_front || '',
                        mother_aadhar_back: data.mother_aadhar_back || '',
                        guardian1_aadhar_front: data.guardian1_aadhar_front || '',
                        guardian1_aadhar_back: data.guardian1_aadhar_back || '',
                        guardian2_aadhar_front: data.guardian2_aadhar_front || '',
                        guardian2_aadhar_back: data.guardian2_aadhar_back || '',
                        address_proof: data.address_proof || '',
                    });

                    setParentNames({
                        father_name: data.father_name || '',
                        mother_name: data.mother_name || '',
                        guardian1_name: data.guardian1_name || data.guardian_name || '',
                        guardian2_name: data.guardian2_name || '',
                    });

                    // Auto-set hasParents based on form data
                    if (hasBothParents) {
                        setHasParents(true);
                    } else if (hasGuardians) {
                        setHasParents(false);
                    }

                    if (hasExistingAadhar) setHasAadhar(true);
                    else if (data.birth_certificate) setHasAadhar(false);
                })
        }
    }, []);

    const uploadFile = async (file: File, field: DocKey) => {
        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            let folder = 'tiddlee/documents/aadhar';
            if (field === 'birth_certificate') folder = 'tiddlee/documents/birth-certificates';
            else if (field.includes('father_aadhar')) folder = 'tiddlee/documents/father-aadhar';
            else if (field.includes('mother_aadhar')) folder = 'tiddlee/documents/mother-aadhar';
            else if (field.includes('guardian1_aadhar')) folder = 'tiddlee/documents/guardian1-aadhar';
            else if (field.includes('guardian2_aadhar')) folder = 'tiddlee/documents/guardian2-aadhar';
            else if (field === 'address_proof') folder = 'tiddlee/documents/address-proof';

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
        if (hasParents === null) {
            setErrors('Please select whether you have both parents available.');
            return;
        }
        if (hasParents) {
            if (!formData.father_aadhar_front || !formData.father_aadhar_back) {
                setErrors('Please upload both front and back of Father\'s Aadhaar.');
                return;
            }
            if (!formData.mother_aadhar_front || !formData.mother_aadhar_back) {
                setErrors('Please upload both front and back of Mother\'s Aadhaar.');
                return;
            }
        } else {
            if (!formData.guardian1_aadhar_front || !formData.guardian1_aadhar_back) {
                setErrors('Please upload both front and back of Guardian 1\'s Aadhaar.');
                return;
            }
            if (!formData.guardian2_aadhar_front || !formData.guardian2_aadhar_back) {
                setErrors('Please upload both front and back of Guardian 2\'s Aadhaar.');
                return;
            }
        }
        if (!formData.address_proof) {
            setErrors('Please upload the Address Proof.');
            return;
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
            if (hasParents) {
                payload.father_aadhar_front = formData.father_aadhar_front;
                payload.father_aadhar_back = formData.father_aadhar_back;
                payload.mother_aadhar_front = formData.mother_aadhar_front;
                payload.mother_aadhar_back = formData.mother_aadhar_back;
                payload.guardian1_aadhar_front = null;
                payload.guardian1_aadhar_back = null;
                payload.guardian2_aadhar_front = null;
                payload.guardian2_aadhar_back = null;
            } else {
                payload.father_aadhar_front = null;
                payload.father_aadhar_back = null;
                payload.mother_aadhar_front = null;
                payload.mother_aadhar_back = null;
                payload.guardian1_aadhar_front = formData.guardian1_aadhar_front;
                payload.guardian1_aadhar_back = formData.guardian1_aadhar_back;
                payload.guardian2_aadhar_front = formData.guardian2_aadhar_front;
                payload.guardian2_aadhar_back = formData.guardian2_aadhar_back;
            }
            payload.address_proof = formData.address_proof;

            const res = await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const programType = localStorage.getItem('selectedProgramType');
                if (programType === 'daycare') {
                    router.push('/daycare-policies');
                } else {
                    // preschool or both
                    router.push('/preschool-policies');
                }
            } else {
                alert('Failed to save. Please try again.');
            }
        } catch (err) {
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
        const getInputRef = () => {
            switch (field) {
                case 'aadhar_front': return aadharFrontRef;
                case 'aadhar_back': return aadharBackRef;
                case 'birth_certificate': return birthCertRef;
                case 'father_aadhar_front': return fatherAadharFrontRef;
                case 'father_aadhar_back': return fatherAadharBackRef;
                case 'mother_aadhar_front': return motherAadharFrontRef;
                case 'mother_aadhar_back': return motherAadharBackRef;
                case 'guardian1_aadhar_front': return guardian1AadharFrontRef;
                case 'guardian1_aadhar_back': return guardian1AadharBackRef;
                case 'guardian2_aadhar_front': return guardian2AadharFrontRef;
                case 'guardian2_aadhar_back': return guardian2AadharBackRef;
                case 'address_proof': return addressProofRef;
                default: return addressProofRef;
            }
        };
        const inputRef = getInputRef();
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
        <div className="bg-slate-50 min-h-screen py-6 md:py-10 px-3 md:px-4 font-display text-slate-800">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="bg-primary py-6 px-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.15em]">Document Upload</h1>
                    <p className="mt-1 text-white/80 text-sm font-medium">Required identification documents for {formData.child_name || 'your child'}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-5 md:p-8 lg:p-12 space-y-8 md:space-y-10">

                    {/* Aadhar toggle */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                            <span className="material-icons text-primary">badge</span>
                            Student Identity Document
                        </h2>
                        <p className="text-sm text-slate-500">Please select the document available for your child.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            <button
                                type="button"
                                onClick={() => { setHasAadhar(true); setErrors(null); setFormData(prev => ({ ...prev, birth_certificate: '' })); }}
                                className={`p-3 md:p-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                                    ${hasAadhar === true ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/30'}`}
                            >
                                <span className="material-icons text-base">credit_card</span>
                                Aadhar Card Available
                            </button>
                            <button
                                type="button"
                                onClick={() => { setHasAadhar(false); setErrors(null); setFormData(prev => ({ ...prev, aadhar_front: '', aadhar_back: '' })); }}
                                className={`p-3 md:p-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                                    ${hasAadhar === false ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/30'}`}
                            >
                                <span className="material-icons text-base">article</span>
                                No Aadhar — Birth Certificate
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

                    {/* Parent/Guardian selection */}
                    <div className="space-y-4 border-t pt-8 border-slate-200">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                            <span className="material-icons text-primary">family_restroom</span>
                            Parent / Guardian Information
                        </h2>
                        <p className="text-sm text-slate-500">Please upload the Aadhaar documents for the guardians listed below.</p>

                        {/* Show buttons only if parent names aren't auto-detected */}
                        {!parentNames.father_name && !parentNames.guardian1_name && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setHasParents(true); setErrors(null); }}
                                    className={`p-3 md:p-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                                        ${hasParents === true ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/30'}`}
                                >
                                    <span className="material-icons text-base">people</span>
                                    Both Parents Available
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setHasParents(false); setErrors(null); }}
                                    className={`p-3 md:p-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2
                                        ${hasParents === false ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/30'}`}
                                >
                                    <span className="material-icons text-base">supervisor_account</span>
                                    Guardians / Not Both Parents
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Father & Mother Aadhaar upload */}
                    {(hasParents === true || parentNames.father_name) && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">
                                {parentNames.father_name ? `${parentNames.father_name}'s` : "Father's"} Aadhaar Card — Front &amp; Back
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadBox field="father_aadhar_front" label="Aadhaar Front" icon="credit_card" />
                                <UploadBox field="father_aadhar_back" label="Aadhaar Back" icon="credit_card" />
                            </div>

                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest pt-4">
                                {parentNames.mother_name ? `${parentNames.mother_name}'s` : "Mother's"} Aadhaar Card — Front &amp; Back
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadBox field="mother_aadhar_front" label="Aadhaar Front" icon="credit_card" />
                                <UploadBox field="mother_aadhar_back" label="Aadhaar Back" icon="credit_card" />
                            </div>
                        </div>
                    )}

                    {/* Guardian 1 & 2 Aadhaar upload */}
                    {(hasParents === false || parentNames.guardian1_name) && !parentNames.father_name && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">
                                {parentNames.guardian1_name ? `${parentNames.guardian1_name}'s` : "Guardian 1's"} Aadhaar Card — Front &amp; Back
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadBox field="guardian1_aadhar_front" label="Aadhaar Front" icon="credit_card" />
                                <UploadBox field="guardian1_aadhar_back" label="Aadhaar Back" icon="credit_card" />
                            </div>

                            {parentNames.guardian2_name && (
                                <>
                                    <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest pt-4">
                                        {parentNames.guardian2_name}'s Aadhaar Card — Front &amp; Back
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <UploadBox field="guardian2_aadhar_front" label="Aadhaar Front" icon="credit_card" />
                                        <UploadBox field="guardian2_aadhar_back" label="Aadhaar Back" icon="credit_card" />
                                    </div>
                                </>
                            )}

                            {!parentNames.guardian2_name && (
                                <>
                                    <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest pt-4">Guardian 2 Aadhaar Card — Front &amp; Back</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <UploadBox field="guardian2_aadhar_front" label="Aadhaar Front" icon="credit_card" />
                                        <UploadBox field="guardian2_aadhar_back" label="Aadhaar Back" icon="credit_card" />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Address Proof */}
                    {(hasParents !== null) && (
                        <div className="space-y-4 border-t pt-8 border-slate-200">
                            <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">Address Proof</h3>
                            <p className="text-xs text-slate-500 italic">If the address mentioned on the Aadhaar card differs from your current residential address, please submit a valid address proof reflecting your present residence.</p>
                            <UploadBox field="address_proof" label="Upload Address Proof" icon="location_on" />
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
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => router.push('/care-routines')}
                            className="w-full sm:w-auto px-8 py-3 border-2 border-slate-200 rounded-full text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto px-10 py-3 bg-primary hover:bg-lime-600 text-white rounded-full font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
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
