import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'TIDDLEE Preschool Admission',
    description: 'Admission Form for TIDDLEE Preschool with Daycare Program',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="light">
            <head>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
            </head>
            <body>{children}</body>
        </html>
    );
}
