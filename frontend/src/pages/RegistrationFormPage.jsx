import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import toast from 'react-hot-toast';

const RegistrationFormPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '', rollNumber: '', department: '', section: '', year: '', 
        phoneNumber: '', collegeName: 'St. Peter’s Engineering College', teamName: '', transactionId: ''
    });
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setPaymentScreenshot(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!paymentScreenshot) {
            toast.error('Payment screenshot is required.');
            return;
        }
        setLoading(true);

        const registrationData = new FormData();
        registrationData.append('eventId', eventId);
        Object.keys(formData).forEach(key => registrationData.append(key, formData[key]));
        registrationData.append('paymentScreenshot', paymentScreenshot);

        const regPromise = api.post('/registrations', registrationData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.promise(regPromise, {
            loading: 'Submitting registration...',
            success: () => {
                navigate('/dashboard');
                return 'Registered successfully! Your registration is pending approval.';
            },
            error: (err) => {
                if (err.response && err.response.status === 401) {
                    return 'Your session has expired. Please log in again.';
                }
                return err.response?.data?.message || 'Registration failed. You may be already registered.';
            }
        });

        regPromise.finally(() => setLoading(false));
    };

    return (
        <div className="container mx-auto max-w-3xl py-12">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Event Registration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="fullName" placeholder="Full Name (for certificate)" onChange={handleChange} required />
                            <Input name="rollNumber" placeholder="Roll Number" onChange={handleChange} required />
                            <Input name="department" placeholder="Department (e.g., CSE, IT)" onChange={handleChange} required />
                            <Input name="section" placeholder="Section" onChange={handleChange} required />
                            <Input name="year" placeholder="Year (e.g., 2nd, 3rd)" onChange={handleChange} required />
                            <Input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required />
                        </div>
                        <Input name="collegeName" placeholder="College Name" value={formData.collegeName} onChange={handleChange} required />
                        <Input name="teamName" placeholder="Team Name (if applicable)" onChange={handleChange} />
                        
                        <div className="space-y-2">
                            <label>Payment Proof</label>
                            <Input type="file" name="paymentScreenshot" onChange={handleFileChange} required className="pt-2"/>
                            <p className="text-xs text-muted-foreground">Upload a screenshot of your payment. Max size 2MB.</p>
                        </div>
                        <Input name="transactionId" placeholder="Transaction ID (optional)" onChange={handleChange} />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={loading} className="w-full" size="lg">
                            {loading ? 'Submitting...' : 'Complete Registration'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default RegistrationFormPage;