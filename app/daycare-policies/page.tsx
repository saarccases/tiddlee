'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DaycarePolicies() {
    const [formData, setFormData] = useState({
        unique_id: '',
        admission_date: ''
    });

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (storedId) {
            const fetchAdmission = async () => {
                try {
                    const response = await fetch(`/api/get-admission?id=${storedId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            unique_id: data.unique_id || '',
                            admission_date: data.admission_date || ''
                        });
                    }
                } catch (error) {
                    console.error('[DaycarePolicies] Fetch error:', error);
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

    return (
        <div className="bg-white min-h-screen p-4 md:p-8 font-quicksand text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">

                {/* Header with Image */}
                <div className="relative">
                    <div className="w-full h-64 bg-white flex items-center justify-center overflow-hidden relative">
                        {/* Placeholder for images */}
                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                            <span className="text-slate-400 font-medium italic">Children playing classroom illustration</span>
                        </div>
                    </div>
                    <div className="bg-primary text-white py-4 px-8 text-center sticky top-0 z-10">
                        <h1 className="text-3xl font-bold tracking-wide uppercase">Daycare Policies</h1>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <p className="text-lg font-medium text-slate-600">
                        Below is a list of our policies. These policies are put in effect in order to make the facility run smoothly as well as to ensure the safety of your children.
                    </p>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <span className="material-icons text-3xl">schedule</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2">Hours of Operation</h2>
                                <p className="mb-2">Our hours of operation are from <span className="font-bold">8:00 am to 8:00 pm</span>, Monday to Saturday. Children must not arrive before opening time.</p>
                                <p className="text-primary font-semibold">Services for children are closed on the 4th Saturday of every month.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <span className="material-icons text-3xl">directions_walk</span>
                            </div>
                            <div className="w-full">
                                <h2 className="text-xl font-bold mb-2">Arrival &amp; Departure</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="font-bold text-sm uppercase text-slate-500 mb-1">Morning Batch</p>
                                        <p className="text-lg font-bold">8:30 AM to 11:20 AM</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="font-bold text-sm uppercase text-slate-500 mb-1">Afternoon Batch</p>
                                        <p className="text-lg font-bold">11:45 AM to 2:35 PM</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2 text-slate-600">
                                    <p><span className="font-bold text-slate-800">Arrival:</span> Prompt arrival at the given/selected time is encouraged.</p>
                                    <p><span className="font-bold text-slate-800">Late Pick up Policy:</span> The Child needs to be picked up at the allotted time based on the time selected. <span className="text-red-500 font-bold">Rs. 50 will be charged for every 15 minute delay.</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <span className="material-icons text-3xl">child_care</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2">Settling Time</h2>
                                <div className="space-y-3 text-slate-600 leading-relaxed">
                                    <p>It is very important that children settle down in a new environment with minimum discomfort. We settle children into the daily routine in small steps to make them comfortable.</p>
                                    <div className="bg-primary/5 border-l-4 border-primary p-4 my-4">
                                        <p className="font-bold text-slate-800 mb-2 underline">First Three Days</p>
                                        <p>Children will be kept at the center for Minimum one hour and maximum two hours. Parents should share contact numbers and in case the child is distressed, we will call the parents to pick up the child. This helps reassure child that parents are near and are away only for some time.</p>
                                    </div>
                                    <p><span className="font-bold text-slate-800">Fourth &amp; Fifth Day:</span> The time will be increased to three/four hours depending on how the child has settled on the first three days.</p>
                                    <p className="italic text-slate-500 text-sm">Please be assured that our aim is to ensure YOUR CHILD'S COMFORT AND YOUR PEACE OF MIND.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="flex gap-4 items-start">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <span className="material-icons text-3xl">payments</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-2 text-slate-800">Daycare Payment Policy</h2>
                                    <p className="text-sm text-slate-600">Full month fees is applicable incase of any number days service is availed in a month. Emergency daycare services are charged at Rs. 50 per 15 minutes.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <span className="material-icons text-3xl">restaurant</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-2 text-slate-800">Meal Time</h2>
                                    <p className="text-sm text-slate-600">Meals will be served during designated daycare meal timings. Exceptions will be made only for children coming directly from other schools with prior intimation.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 pt-8 border-t border-slate-100">
                        <div className="flex-1">
                            <label className="block text-primary font-bold mb-1">Unique ID</label>
                            <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 font-medium">
                                {formData.unique_id || <span className="text-sm text-gray-400 italic">Office use only</span>}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-primary font-bold mb-1">Date of Admission</label>
                            <div className="border-b border-dotted border-gray-400 w-full h-8 flex items-end text-gray-800 font-medium">
                                {formatDate(formData.admission_date)}
                            </div>
                        </div>
                    </div>
                </div>



                <div className="bg-slate-100 p-4 flex justify-between items-center px-8 text-slate-600">
                    <Link href="/detailed-preschool-policies" className="px-6 py-2 border border-slate-300 font-semibold rounded-full hover:bg-white transition-colors">
                        Back
                    </Link>
                    <span className="text-xs font-bold text-slate-400 hidden md:block">SECTION 10 / DAYCARE POLICIES</span>
                    <Link href="/biting-policy" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95">
                        Save &amp; Continue
                    </Link>
                </div>
            </div>
        </div>
    );
}
