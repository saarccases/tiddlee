
import React from 'react';

export default function ContactCorporateInfo() {
    return (
        <div className="bg-white min-h-screen flex flex-col transition-colors duration-300 font-quicksand text-slate-800">

            <main className="flex-grow flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="max-w-4xl w-full flex flex-col items-center space-y-12">

                    <div className="relative w-full max-w-2xl h-64 flex flex-col items-end justify-end">
                        <div className="absolute top-0 right-1/4 animate-bounce">
                            <svg fill="none" height="120" viewBox="0 0 100 100" width="120" xmlns="http://www.w3.org/2000/svg">
                                <path className="opacity-80" d="M50 80C50 80 20 70 20 40C20 20 40 20 50 40C60 20 80 20 80 40C80 70 50 80 50 80Z" fill="#ffce00"></path>
                                <path className="opacity-90" d="M50 80C50 80 30 75 30 50C30 35 45 35 50 50C55 35 70 35 70 50C70 75 50 80 50 80Z" fill="#e91e63"></path>
                                <path d="M50 70L48 40L50 35L52 40L50 70Z" fill="#333"></path>
                            </svg>
                            <span className="sr-only">Colorful butterfly illustration</span>
                        </div>

                        <div className="flex items-end space-x-2">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-primary rounded-full opacity-60"></div>
                                <div className="w-1 bg-primary h-12"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-primary rounded-full opacity-80"></div>
                                <div className="w-1 bg-primary h-20"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-primary rounded-full"></div>
                                <div className="w-1 bg-primary h-16"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 bg-primary rounded-full opacity-90"></div>
                                <div className="w-1 bg-primary h-24"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-14 h-14 bg-primary rounded-full opacity-70"></div>
                                <div className="w-1 bg-primary h-10"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-primary rounded-full opacity-85"></div>
                                <div className="w-1 bg-primary h-14"></div>
                            </div>
                        </div>
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
                                    <span>care@mytiddlee.com</span>
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
