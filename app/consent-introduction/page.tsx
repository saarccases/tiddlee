'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConsentIntroduction() {
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
                    console.error('[ConsentIntroduction] Fetch error:', error);
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
        <div className="bg-slate-50 min-h-screen py-10 px-4 font-inter text-slate-800">
            <div className="max-w-4xl mx-auto bg-white shadow-xl border border-slate-200 overflow-hidden rounded-2xl">
                <div className="relative pt-12 pb-6 px-8 text-center bg-white">
                    <div className="flex justify-center mb-8">
                        <div className="flex space-x-4 items-end">
                            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
                                <span className="material-icons text-pink-400 text-5xl">face</span>
                            </div>
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="material-icons text-blue-400 text-4xl">child_care</span>
                            </div>
                            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="material-icons text-yellow-500 text-5xl">menu_book</span>
                            </div>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="material-icons text-green-400 text-4xl">toys</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-primary py-4 px-6 rounded-lg inline-block">
                        <h1 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide">Child Photo / Video Consent Form</h1>
                    </div>
                </div>

                <div className="px-10 py-8 leading-relaxed">
                    <div className="mb-8 font-medium">
                        <p className="font-bold text-lg mb-4">Dear TIDDLEE Parent/ Guardian,</p>
                        <p className="mb-6">
                            We wish to document the growth and the story of your little <strong>TIDDLEE</strong> through photos and/or videos captured during Daily/Routine Activities, Celebrations, Incursions, Excursions, Special Sessions and if we are lucky, a serendipitous moment that can end up hanging on your wall!
                        </p>
                        <p className="mb-6">
                            It is our commitment to responsibly present these photos in weekly reports to you, bulletin boards, social media, the TIDDLEE website, marketing collateral, communication material, and other print forms while abiding by the Guiding Principles laid by <strong>Child Rights International Network (CRIN)</strong>.
                        </p>
                        <p className="mb-10">
                            We would be grateful if you would fill the form behind to give us consent for the aforementioned.
                        </p>
                        <div className="flex flex-col gap-1">
                            <p className="font-bold">Regards</p>
                            <p className="font-bold text-primary">Team TIDDLEE</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row gap-8 pt-8 border-t border-slate-100">
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



                <div className="bg-white p-6 flex justify-between items-center border-t border-slate-100">
                    <Link href="/health-hygiene-policies" className="px-6 py-2 border border-slate-300 text-slate-600 font-semibold rounded-full hover:bg-slate-50 transition-colors">
                        Back
                    </Link>
                    <Link href="/media-consent-choice" className="px-8 py-3 bg-primary hover:bg-opacity-90 text-white font-bold rounded-full transition-all shadow-lg flex items-center space-x-2">
                        <span>Continue to Consent Details</span>
                        <span className="material-icons">chevron_right</span>
                    </Link>
                </div>
            </div>

            <footer className="max-w-4xl mx-auto mb-12 px-4 py-8 text-slate-500 text-xs text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="flex flex-col space-y-2 items-center md:items-start">
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="material-icons text-primary text-3xl">child_friendly</span>
                            <span className="font-bold text-lg text-slate-700">SAARC <span className="text-slate-400">CASES</span></span>
                        </div>
                        <p>TIDDLERS Education Services Pvt. Ltd., is a part of SAARC Group of Companies</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="font-bold text-slate-800">Corporate Office</p>
                            <p>Tiddlers Education Services Pvt. Ltd</p>
                            <p>Maithili Pride, Vartak Nagar, Pokhran Road No-1, Thane (West), Mumbai - 400606</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Registered Office</p>
                            <p>31/A, Abbigere Main Road, Kammagondanahalli, Bengaluru - 560090</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end space-y-2">
                        <div className="flex items-center space-x-2">
                            <span className="material-icons text-sm">phone</span>
                            <span>+91 9930812692, +91 8097621539</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="material-icons text-sm">email</span>
                            <span>care@mytiddlee.com</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="material-icons text-sm">language</span>
                            <span>www.mytiddlee.com</span>
                        </div>
                        <div className="mt-4 bg-slate-100 p-2 rounded">
                            <div className="w-16 h-16 bg-slate-300 flex items-center justify-center">
                                <span className="material-icons text-slate-600">qr_code_2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
