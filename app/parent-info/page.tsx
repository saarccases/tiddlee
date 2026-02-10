'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUpload from '../components/PhotoUpload';
import SignaturePad from '../components/SignaturePad';

export default function ParentInfo() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        child_attended_school: 'no',
        prev_school_name: '',
        prev_school_address: '',
        prev_school_phone: '',
        prev_school_class: '',
        prev_school_timings_from: '',
        prev_school_timings_to: '',
        mother_name: '',
        mother_residence_address: '',
        mother_employer: '',
        mother_employer_address: '',
        mother_work_phone: '',
        mother_cell_phone: '',
        mother_email: '',
        mother_relationship: '',
        mother_photo: '',
        unique_id: '',
        admission_date: '',
        mother_signature: '',
        mother_signature_date: '',
        // Sync fields
        emergency_contact1_name: '',
        emergency_contact1_phone: '',
        emergency_contact1_relation: '',
        emergency_contact2_name: '',
        emergency_contact2_phone: '',
        emergency_contact2_relation: ''
    });

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        console.log('[ParentInfo] currentAdmissionId:', storedId);

        if (storedId) {
            const fetchAdmission = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('[ParentInfo] Received data:', data);

                        // JIT Sync
                        let mName = data.mother_name || '';
                        let mPhone = data.mother_cell_phone || '';
                        if (!mName) {
                            if (data.emergency_contact1_relation === 'Mother') mName = data.emergency_contact1_name || '';
                            else if (data.emergency_contact2_relation === 'Mother') mName = data.emergency_contact2_name || '';
                        }
                        if (!mPhone) {
                            if (data.emergency_contact1_relation === 'Mother') mPhone = data.emergency_contact1_phone || '';
                            else if (data.emergency_contact2_relation === 'Mother') mPhone = data.emergency_contact2_phone || '';
                        }

                        setFormData({
                            id: storedId,
                            child_attended_school: data.child_attended_school || 'no',
                            prev_school_name: data.prev_school_name || '',
                            prev_school_address: data.prev_school_address || '',
                            prev_school_phone: data.prev_school_phone || '',
                            prev_school_class: data.prev_school_class || '',
                            prev_school_timings_from: data.prev_school_timings_from || '',
                            prev_school_timings_to: data.prev_school_timings_to || '',
                            mother_name: mName,
                            mother_residence_address: data.mother_residence_address || '',
                            mother_employer: data.mother_employer || '',
                            mother_employer_address: data.mother_employer_address || '',
                            mother_work_phone: data.mother_work_phone || '',
                            mother_cell_phone: mPhone,
                            mother_email: data.mother_email || '',
                            mother_relationship: data.mother_relationship || 'Mother',
                            mother_photo: data.mother_photo || '',
                            unique_id: data.unique_id || '',
                            admission_date: data.admission_date || '',
                            mother_signature: data.mother_signature || '',
                            mother_signature_date: data.mother_signature_date || '',
                            emergency_contact1_name: data.emergency_contact1_name || '',
                            emergency_contact1_phone: data.emergency_contact1_phone || '',
                            emergency_contact1_relation: data.emergency_contact1_relation || '',
                            emergency_contact2_name: data.emergency_contact2_name || '',
                            emergency_contact2_phone: data.emergency_contact2_phone || '',
                            emergency_contact2_relation: data.emergency_contact2_relation || ''
                        });
                    }
                } catch (error) {
                    console.error('[ParentInfo] Fetch error:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAdmission();
        }
    }, [router]);

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'mother_name') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                // Sync back to emergency contacts if needed
                if (prev.emergency_contact1_relation === 'Mother') updates.emergency_contact1_name = value;
                if (prev.emergency_contact2_relation === 'Mother') updates.emergency_contact2_name = value;
                return { ...prev, ...updates };
            });
        }
        else if (name === 'mother_cell_phone') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact1_relation === 'Mother') updates.emergency_contact1_phone = value;
                if (prev.emergency_contact2_relation === 'Mother') updates.emergency_contact2_phone = value;
                return { ...prev, ...updates };
            });
        }
        else if (name === 'mother_relationship') {
            setFormData(prev => {
                const updates: any = { [name]: value };
                if (prev.emergency_contact1_relation === 'Mother') updates.emergency_contact1_relation = value;
                if (prev.emergency_contact2_relation === 'Mother') updates.emergency_contact2_relation = value;
                return { ...prev, ...updates };
            });
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let submissionData = { ...formData };
        if (!submissionData.id) {
            const storedId = localStorage.getItem('currentAdmissionId');
            if (storedId) submissionData.id = storedId;
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
                router.push('/guardian-info');
            } else {
                alert('Failed to save data');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    const handleBack = async () => {
        // Save progress before going back
        let submissionData = { ...formData };
        if (!submissionData.id) {
            const storedId = localStorage.getItem('currentAdmissionId');
            if (storedId) submissionData.id = storedId;
        }

        try {
            await fetch('/api/submit-admission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });
        } catch (error) {
            console.error('Error saving on back:', error);
        }
        router.push('/');
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

    const handleSignatureSave = async (dataUrl: string) => {
        if (!dataUrl) {
            setFormData(prev => ({
                ...prev,
                mother_signature: '',
                mother_signature_date: ''
            }));
            return;
        }

        try {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `mother_signature_info.png`, { type: 'image/png' });

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
                    mother_signature: data.url,
                    mother_signature_date: today
                }));
            }
        } catch (err) {
            console.error('Signature upload error:', err);
        }
    };

    return (
        <main className="font-body bg-slate-50 dark:bg-background-dark text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-300 pb-12">
            <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center">
                                <span className="material-icons text-4xl text-primary">flutter_dash</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase leading-none font-display">TIDDLEE</h1>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Technology unplugged, Childhood plugged-in</p>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">Section 2 of 7</span>
                        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={toggleDarkMode}>
                            <span className="material-icons text-slate-600 dark:text-slate-300">dark_mode</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-8">
                    <div className="flex gap-4 items-end">
                        <div className="text-center group">
                            <div className="w-24 h-24 rounded-full border-4 border-secondary overflow-hidden bg-yellow-50 dark:bg-slate-800 mb-2 shadow-lg transition-transform group-hover:scale-105">
                                <img alt="Mother Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMG-ef9a4K7Hcot5tiWg8jVHTszYBugPeocQ8h7wXDZ9SQk2J5m2OPoGiUr7uwrUn-IXwemKQyOopEWAA8DETpx2PjxCgEsAQdr6Yi7Ctk4k1vAhL9Pp3Uq1XEu_0YXdVmsSH56q64Yzl6gbQU2juZa7DJSVI9LzQk67PC51NVLUTRymR5JXBNDass1bdOLD_tfF1BKLbzJBKPpk-k7Em5smo8O__0XmTxZVR1TTITNNNJAlizseidb-365oXw8RqjPSOSXn3eZLA" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mother</span>
                        </div>
                        <div className="text-center group">
                            <div className="w-20 h-20 rounded-full border-4 border-primary overflow-hidden bg-green-50 dark:bg-slate-800 mb-2 shadow-lg transition-transform group-hover:scale-105">
                                <img alt="Child Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDcFm0sEbfMIT-5PbneD017NCZx8KvsBTEj1lPOo0V3XIQE2bNq5HgnAn76G-MGDjBr9eyQR15R6ZhwXx2mUZXs_oq3bAKu7ezmnBDZGbzLon214gmCv0TCzyM0_3JJTg3_JnjaM819CFHobCN7a8eIOQ-gIrWhSHCsoHjPIyxA5OVKbtKM4aMQGXg-Om7UCpc-rH2vPaMbXp01GYHy7lacmkhlDhEK3eujorHcdEGzvT4-HbGTiAjvuOeieuBTHEBYQPhmZT8CnM" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Child</span>
                        </div>
                        <div className="text-center group">
                            <div className="w-24 h-24 rounded-full border-4 border-secondary overflow-hidden bg-yellow-50 dark:bg-slate-800 mb-2 shadow-lg transition-transform group-hover:scale-105">
                                <img alt="Father Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFYYnEE30Fqth1IITfdDUUo2S3BEmaxK4AphzDtKl57X3DQTHtQ8CJBU-31KGmUCD0m9YlYX_v8pmIS0jktuKtbiDCENm4J1ybXTpt8hGhspfMKCiJBV0obEdbVdTMeuZ-J9d4eLJ3b37TihBiVpEE5Loh9jKeiEUPEOtphCWbzn4c5dqs8oBukUg5VqZ36VwcihqQG-GFmo4y4nrT8DOLh63264PZgwkLEgYIu9SoCTcgsOqYHT-xhNTyCiX2zqNwaMyfootHRWg" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Father</span>
                        </div>
                    </div>
                    <PhotoUpload
                        onPhotoUploaded={async (url) => {
                            setFormData(prev => ({ ...prev, mother_photo: url }));

                            // Auto-save photo to database immediately
                            const currentId = formData.id || localStorage.getItem('currentAdmissionId');
                            if (currentId) {
                                try {
                                    await fetch('/api/submit-admission', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            id: currentId,
                                            mother_photo: url
                                        }),
                                    });
                                } catch (error) {
                                    console.error('Error auto-saving mother photo:', error);
                                }
                            }
                        }}
                        currentPhotoUrl={formData.mother_photo}
                    />
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {loading && (
                        <div className="bg-lime-50 dark:bg-lime-900/30 border border-lime-200 dark:border-lime-800 p-4 rounded-xl flex items-center justify-center animate-pulse mb-6">
                            <span className="material-icons animate-spin mr-3 text-lime-500">sync</span>
                            <span className="text-lime-700 dark:text-lime-300 font-semibold text-sm">Recovering your saved details...</span>
                        </div>
                    )}
                    <div className="bg-primary py-3 px-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight font-display">Application (For TIDDLEE Parent)</h2>
                    </div>



                    <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-icons text-primary">school</span>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Previous School Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-3 text-slate-600 dark:text-slate-400">Does the Child attend/attended school (nursery/play school, etc.)?</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            className="w-5 h-5 text-primary border-slate-300 dark:border-slate-700 focus:ring-primary"
                                            name="child_attended_school"
                                            type="radio"
                                            value="yes"
                                            checked={formData.child_attended_school === 'yes'}
                                            onChange={handleChange}
                                        />
                                        <span className="font-medium">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            className="w-5 h-5 text-primary border-slate-300 dark:border-slate-700 focus:ring-primary"
                                            name="child_attended_school"
                                            type="radio"
                                            value="no"
                                            checked={formData.child_attended_school === 'no'}
                                            onChange={handleChange}
                                        />
                                        <span className="font-medium">No</span>
                                    </label>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name of the School/Play School/Nursery</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="Enter school name"
                                    type="text"
                                    name="prev_school_name"
                                    value={formData.prev_school_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                <textarea
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium resize-none"
                                    placeholder="Enter school address"
                                    rows={2}
                                    name="prev_school_address"
                                    value={formData.prev_school_address}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="School contact number"
                                    type="tel"
                                    name="prev_school_phone"
                                    value={formData.prev_school_phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Class and Division</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="e.g. Nursery - A"
                                    type="text"
                                    name="prev_school_class"
                                    value={formData.prev_school_class}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Timings From</label>
                                    <input
                                        className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                        type="time"
                                        name="prev_school_timings_from"
                                        value={formData.prev_school_timings_from}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Timings To</label>
                                    <input
                                        className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                        type="time"
                                        name="prev_school_timings_to"
                                        value={formData.prev_school_timings_to}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-icons text-primary">person</span>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Mother's or Guardian 1 Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="Name as per legal documents"
                                    type="text"
                                    name="mother_name"
                                    value={formData.mother_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Residence Address</label>
                                <textarea
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium resize-none"
                                    placeholder="Your home address"
                                    rows={2}
                                    name="mother_residence_address"
                                    value={formData.mother_residence_address}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Employed by (Company/Organization)</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="Organization name"
                                    type="text"
                                    name="mother_employer"
                                    value={formData.mother_employer}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Address of Employment</label>
                                <textarea
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium resize-none"
                                    placeholder="Office/Work address"
                                    rows={2}
                                    name="mother_employer_address"
                                    value={formData.mother_employer_address}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Work Phone</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="Landline or extension"
                                    type="tel"
                                    name="mother_work_phone"
                                    value={formData.mother_work_phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cell Phone</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="Mobile number"
                                    type="tel"
                                    name="mother_cell_phone"
                                    value={formData.mother_cell_phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="example@email.com"
                                    type="email"
                                    name="mother_email"
                                    value={formData.mother_email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Relationship to Child</label>
                                <input
                                    className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium"
                                    placeholder="e.g. Mother, Grandmother, Guardian"
                                    type="text"
                                    name="mother_relationship"
                                    value={formData.mother_relationship}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="md:col-span-2 mt-8">
                                <SignaturePad
                                    label="Mother's Signature"
                                    onSave={handleSignatureSave}
                                    savedSignatureUrl={formData.mother_signature}
                                />
                                <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                    Date: {formatDate(formData.mother_signature_date)}
                                </div>
                            </div>
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

                    <div className="flex justify-between items-center pt-8">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <span className="material-icons">arrow_back</span>
                            Back
                        </button>
                        <button type="submit" className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-full font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1">
                            Save and Continue
                            <span className="material-icons">arrow_forward</span>
                        </button>
                    </div>
                </form>
            </div>

            <footer className="mt-20 py-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-slate-400 text-sm">© {new Date().getFullYear()} TIDDLEE Preschool & Daycare. All Rights Reserved.</p>
                </div>
            </footer>
        </main>
    );
}
