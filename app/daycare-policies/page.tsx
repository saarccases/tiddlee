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
        <div className="bg-white min-h-screen p-4 md:p-8 font-display text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200">

                {/* Header with Image */}
                <div className="relative">
                    <div className="w-full bg-white flex items-center justify-center overflow-hidden py-6 gap-6 px-8">
                        <img alt="Children playing" className="h-32 md:h-40 object-contain" src="/images/care-1.png" />
                        <img alt="Children learning" className="h-32 md:h-40 object-contain" src="/images/care-2.png" />
                        <img alt="Children at daycare" className="h-32 md:h-40 object-contain" src="/images/care-3.png" />
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
                            <div>
                                <h2 className="text-xl font-bold mb-2">Arrival</h2>
                                <div className="space-y-2 text-slate-600">
                                    <p><span className="font-bold text-slate-800">Arrival:</span> Prompt arrival at the given/selected time is encouraged.</p>
                                    <p><span className="font-bold text-slate-800">Late Pick up Policy:</span> The Child needs to be picked up at the allotted time based on the time selected. <span className="text-red-500 font-bold">Rs. 50 will be charged for every 15 minute delay in pick up or 15 min early drop.</span></p>
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
                                    <p>It is very important that children settle down in a new environment with minimum discomfort. We settle children into the daily routine in small steps to make them comfortable in a new environment reduce stranger anxiety as well as reduce settling issues.</p>
                                    <div className="bg-primary/5 border-l-4 border-primary p-4 my-4">
                                        <p className="font-bold text-slate-800 mb-2 underline">First Three Days</p>
                                        <p>Children will be kept at the center for Minimum one hour and maximum two hours. Parents should share contact numbers and in case the child is distressed, we will call the parents to pick up the child. This helps reassure child that parents are near and are away only for some time.</p>
                                    </div>
                                    <p><span className="font-bold text-slate-800">Fourth &amp; Fifth Day:</span> The time will be increased to three/four hours depending on how the child has settled on the first three days. You can speak to the Center Manager regarding the settling time of your child, depending on your child's comfort /settling in at the Center.</p>
                                    <p>Please be assured that our aim is to ensure YOUR CHILD'S COMFORT AND YOUR PEACE OF MIND. We have seen majority of all children settle down within two/three weeks.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <span className="material-icons text-3xl">payments</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-slate-800">Daycare Payment Policy</h2>
                                <div className="space-y-3 text-slate-600 leading-relaxed">
                                    <p className="font-bold text-slate-800">Daycare services can be opted only as a Monthly Plan.</p>
                                    <p>Incase of daycare services less than 2 weeks &ndash; fees will be charged as emergency daycare services.*</p>
                                    <p>In case of extra hours, the fee will be charged at Rs. 50 per 15 minutes. Up to 3 hours per month are exempted from the extra hours consumed.</p>
                                    <p>No adjustments of hours will be made mid-month; the selected package will continue for the full month and can be changed the following month.</p>
                                    <p className="italic text-primary font-semibold text-sm">*Kindly contact the front office to know the charges.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <span className="material-icons text-3xl">local_taxi</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-slate-800">Pickup &amp; Drop</h2>
                                <p className="text-slate-600">Pick-up and drop-off for children coming from other schools will be done only at designated spot. No pick-up/drop across the road will be allowed at any time.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                <span className="material-icons text-3xl">restaurant</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-slate-800">Meal Time</h2>
                                <p className="text-slate-600">Meals will be served during designated daycare meal timings. Exceptions will be made only for children coming directly from other schools with prior intimation from parents.</p>
                            </div>
                        </div>
                    </div>

                </div>



                <div className="bg-slate-100 p-4 flex justify-between items-center px-8 text-slate-600">
                    <Link href="/document-upload" className="px-6 py-2 border border-slate-300 font-semibold rounded-full hover:bg-white transition-colors">
                        Back
                    </Link>
                    <Link href="/detailed-daycare-policies" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95">
                        Save &amp; Continue
                    </Link>
                </div>
            </div>
        </div>
    );
}
