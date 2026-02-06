'use client';

import Link from 'next/link';

export default function ParentInfo() {
    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
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
                        <span className="text-sm font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">Section 2 of 3</span>
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
                    <div className="w-40 h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-4 text-center cursor-pointer hover:border-primary transition-colors group">
                        <span className="material-icons text-3xl text-slate-400 group-hover:text-primary mb-2">add_a_photo</span>
                        <p className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-primary tracking-tighter">TIDDLEE PARENT PHOTO</p>
                        <input className="hidden" type="file" />
                    </div>
                </div>

                <form className="space-y-8">
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
                                        <input className="w-5 h-5 text-primary border-slate-300 dark:border-slate-700 focus:ring-primary" name="attended_school" type="radio" />
                                        <span className="font-medium">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input className="w-5 h-5 text-primary border-slate-300 dark:border-slate-700 focus:ring-primary" name="attended_school" type="radio" />
                                        <span className="font-medium">No</span>
                                    </label>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name of the School/Play School/Nursery</label>
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="Enter school name" type="text" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                <textarea className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium resize-none" placeholder="Enter school address" rows={2}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="School contact number" type="tel" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Class and Division</label>
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="e.g. Nursery - A" type="text" />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Timings From</label>
                                    <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" type="time" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Timings To</label>
                                    <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" type="time" />
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
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="Name as per legal documents" type="text" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Residence Address</label>
                                <textarea className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium resize-none" placeholder="Your home address" rows={2}></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Employed by (Company/Organization)</label>
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="Organization name" type="text" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Address of Employment</label>
                                <textarea className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium resize-none" placeholder="Office/Work address" rows={2}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Work Phone</label>
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="Landline or extension" type="tel" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cell Phone</label>
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="Mobile number" type="tel" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="example@email.com" type="email" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Relationship to Child</label>
                                <input className="w-full bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary px-0 py-2 text-lg font-medium" placeholder="e.g. Mother, Grandmother, Guardian" type="text" />
                            </div>
                        </div>
                    </section>

                    <div className="bg-secondary/20 dark:bg-slate-800/50 p-6 md:p-10 rounded-xl border border-secondary/30">
                        <div className="flex flex-col md:flex-row gap-8 justify-between mb-10">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Unique ID</p>
                                <div className="border-b-2 border-primary/40 pb-2 font-mono text-primary font-bold">TID-2024-XXXX</div>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Admission</p>
                                <div className="border-b-2 border-primary/40 pb-2 font-mono text-primary font-bold">DD/MM/YYYY</div>
                            </div>
                        </div>
                        <p className="text-sm italic text-slate-600 dark:text-slate-400 mb-12 text-center max-w-2xl mx-auto">
                            By signing below the parent or guardian fully understands and agrees to the entire content of the facility's policies and Terms & Conditions. The Parent / Guardian ensures that the data provided by them is accurate.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="h-16 border-b-2 border-slate-300 dark:border-slate-700 flex items-end pb-2">
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-500">
                                    <span>Mother's/Guardian 1 Signature</span>
                                    <span>Date: ____________</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-16 border-b-2 border-slate-300 dark:border-slate-700 flex items-end pb-2">
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-500">
                                    <span>Father's/Guardian 2 Signature</span>
                                    <span>Date: ____________</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-8">
                        <Link href="/" className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                            <span className="material-icons">arrow_back</span>
                            Back
                        </Link>
                        <Link href="/guardian-info" className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-full font-bold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1">
                            Save and Continue
                            <span className="material-icons">arrow_forward</span>
                        </Link>
                    </div>
                </form>
            </div>

            <footer className="mt-20 py-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-slate-400 text-sm">© 2024 TIDDLEE Preschool & Daycare. All Rights Reserved.</p>
                </div>
            </footer>
        </main>
    );
}
