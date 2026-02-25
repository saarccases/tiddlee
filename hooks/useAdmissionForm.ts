import { useState, useEffect } from 'react';
import { calculateAge } from '../lib/utils';

export const INITIAL_FORM_DATA = {
    id: '',
    child_name: '',
    child_nickname: '',
    child_dob: '',
    child_age: '',
    child_gender: '',
    child_photo: '',
    child_residence_address: '',
    languages_spoken: '',
    allergies: '',
    programs_selected: [] as string[],
    daycare_time_opted: '',
    mother_name: '',
    mother_cell_phone: '',
    mother_relationship: '',
    father_name: '',
    father_cell_phone: '',
    father_relationship: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relationship: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    unique_id: '',
    admission_date: ''
};

export function useAdmissionForm() {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [loading, setLoading] = useState(false);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [pendingChildName, setPendingChildName] = useState('');

    useEffect(() => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (storedId && storedId !== 'undefined' && storedId !== 'null') {
            setShowResumePrompt(true);
            fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`)
                .then(res => res.json())
                .then(data => {
                    if (data.child_name) setPendingChildName(data.child_name);
                })
                .catch(err => console.error('Error fetching pending name:', err));
        }
    }, []);

    const handleResume = async () => {
        const storedId = localStorage.getItem('currentAdmissionId');
        if (!storedId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/get-admission?id=${storedId}&t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                const programs = Array.isArray(data.programs_selected) ? data.programs_selected : [];
                const age = data.child_dob ? calculateAge(data.child_dob) : (data.child_age || '');

                setFormData({
                    ...INITIAL_FORM_DATA,
                    ...data,
                    id: String(storedId),
                    child_age: age,
                    programs_selected: programs
                });
                setShowResumePrompt(false);
            }
        } catch (error) {
            console.error('Resume error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartNew = () => {
        localStorage.removeItem('currentAdmissionId');
        setFormData(INITIAL_FORM_DATA);
        setShowResumePrompt(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            let updates: any = { [name]: value };

            if (name === 'child_dob') {
                updates.child_age = calculateAge(value);
            }

            return { ...prev, ...updates };
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            programs_selected: checked
                ? [...prev.programs_selected, value]
                : prev.programs_selected.filter(p => p !== value)
        }));
    };

    return {
        formData,
        setFormData,
        loading,
        setLoading,
        showResumePrompt,
        pendingChildName,
        handleResume,
        handleStartNew,
        handleChange,
        handleCheckboxChange
    };
}
