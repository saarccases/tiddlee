'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactCorporateInfo() {
    const router = useRouter();

    useEffect(() => {
        // If form was not submitted (no flag set), redirect to home
        const submitted = localStorage.getItem('formSubmitted');
        if (!submitted) {
            router.replace('/');
            return;
        }
        // Clear the flag so refreshing this page also redirects to home
        localStorage.removeItem('formSubmitted');
    }, [router]);

    return (
        <div className="bg-white min-h-screen flex flex-col transition-colors duration-300 font-display text-slate-800">

            <main className="flex-grow flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="max-w-4xl w-full flex flex-col items-center space-y-12">

                    <div className="relative w-full max-w-2xl h-72 flex items-end justify-center">
                        {/* Trees (behind butterfly) */}
                        <div className="flex items-end justify-center gap-3 relative z-0">
                            <div className="flex flex-col items-center">
                                <div className="w-14 h-14 bg-primary rounded-full opacity-70"></div>
                                <div className="w-1 bg-primary h-16"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-primary rounded-full opacity-80"></div>
                                <div className="w-1 bg-primary h-20"></div>
                            </div>
                            <div className="flex flex-col items-center relative">
                                <div className="w-28 h-28 bg-primary rounded-full opacity-90"></div>
                                <div className="w-1 bg-primary h-24"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-primary rounded-full opacity-60"></div>
                                <div className="w-1 bg-primary h-12"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-primary rounded-full opacity-75"></div>
                                <div className="w-1 bg-primary h-16"></div>
                            </div>
                        </div>

                        {/* Animated butterfly - flies over the tree tops */}
                        <div className="absolute z-10" style={{
                            bottom: '45%',
                            left: '50%',
                            animation: 'butterflyFly 10s ease-in-out infinite',
                        }}>
                            <div style={{ animation: 'butterflyBob 2s ease-in-out infinite' }}>
                                <img src="/butterfly.png" alt="Tiddlee Butterfly" className="h-24 w-auto drop-shadow-lg" style={{
                                    animation: 'butterflyWings 0.3s ease-in-out infinite alternate',
                                }} />
                            </div>
                        </div>

                        <style jsx>{`
                            @keyframes butterflyFly {
                                0% { transform: translateX(-50%) translateY(0); }
                                10% { transform: translateX(-160px) translateY(-20px); }
                                20% { transform: translateX(-120px) translateY(15px); }
                                35% { transform: translateX(-30px) translateY(-25px); }
                                50% { transform: translateX(40px) translateY(10px); }
                                65% { transform: translateX(120px) translateY(-15px); }
                                80% { transform: translateX(60px) translateY(20px); }
                                90% { transform: translateX(-20px) translateY(-10px); }
                                100% { transform: translateX(-50%) translateY(0); }
                            }
                            @keyframes butterflyBob {
                                0%, 100% { transform: translateY(0px) rotate(-5deg); }
                                50% { transform: translateY(-10px) rotate(5deg); }
                            }
                            @keyframes butterflyWings {
                                0% { transform: scaleX(1); }
                                100% { transform: scaleX(0.65); }
                            }
                        `}</style>
                    </div>

                    <div className="text-center space-y-6">
                        <h1 className="text-4xl font-bold text-primary">Submission Complete!</h1>
                        <p className="text-lg text-slate-600">Thank you for choosing Tiddlee. Your admission process is being reviewed.</p>
                        <a href="/" className="inline-block px-8 py-3 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all">
                            Return to Home
                        </a>
                    </div>
                </div>
            </main>

            <footer className="w-full bg-[#fffde1] border-t-4 border-primary pt-12 pb-8 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <span className="material-icons text-primary text-3xl">child_care</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold tracking-tight text-slate-900">SAARC <span className="text-primary">CASES</span></span>
                                    <span className="text-[10px] uppercase font-semibold text-slate-500">Tiddlee Education Services</span>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-600">
                                TIDDLERS Education Services Pvt. Ltd. is a proud part of the SAARC Group of Companies, dedicated to early childhood excellence.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Corporate Office</h4>
                                <address className="text-sm not-italic text-slate-700 space-y-1">
                                    <p className="font-semibold">Tiddlers Education Services Pvt. Ltd.</p>
                                    <p>Maithili Pride, Vartak Nagar, Pokhran Road No-1,</p>
                                    <p>Thane (West), Mumbai - 400606</p>
                                </address>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Registered Office</h4>
                                <address className="text-sm not-italic text-slate-700 space-y-1">
                                    <p className="font-semibold">Tiddlers Education Services Pvt. Ltd.</p>
                                    <p>31/A, Abbigere Main Road,</p>
                                    <p>Kammagondanahalli, Bengaluru - 560090</p>
                                </address>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Contact Us</h4>
                            <div className="space-y-3">
                                <a className="flex items-center space-x-3 text-sm text-slate-700 hover:text-primary transition-colors" href="tel:+919930812692">
                                    <span className="material-icons text-primary text-lg">phone_android</span>
                                    <span>+91 9930812692, +91 8097621539</span>
                                </a>
                                <a className="flex items-center space-x-3 text-sm text-slate-700 hover:text-primary transition-colors" href="mailto:care@mytiddlee.com">
                                    <span className="material-icons text-primary text-lg">mail_outline</span>
                                    <span>admin@mytiddlee.com</span>
                                </a>
                                <a className="flex items-center space-x-3 text-sm text-slate-700 hover:text-primary transition-colors" href="https://www.mytiddlee.com" target="_blank" rel="noopener noreferrer">
                                    <span className="material-icons text-primary text-lg">language</span>
                                    <span>www.mytiddlee.com</span>
                                </a>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end justify-start">
                            <div className="bg-white p-3 rounded-xl shadow-md inline-block">
                                <div className="w-32 h-32 bg-slate-100 relative flex items-center justify-center overflow-hidden rounded-lg">
                                    {/* Decorative QR code pattern */}
                                    <div className="grid grid-cols-8 gap-1 w-full h-full p-2 opacity-80">
                                        {[...Array(64)].map((_, i) => (
                                            <div key={i} className={`bg-slate-800 ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                                        ))}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white p-1 rounded">
                                            <span className="material-icons text-primary text-xl">qr_code_2</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase text-center md:text-right">Scan for more info</p>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                        <p>© {new Date().getFullYear()} TIDDLERS Education Services Pvt. Ltd.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a className="hover:text-primary" href="#">Privacy Policy</a>
                            <a className="hover:text-primary" href="#">Terms &amp; Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
