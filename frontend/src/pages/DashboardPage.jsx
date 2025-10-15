// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
//import QRCode from 'qrcode.react';
import QRCode from 'react-qr-code';
//import { QRCode } from 'qrcode.react';
import CryptoJS from 'crypto-js';

// IMPORTANT: This must match your backend QR_SECRET in the .env file
const QR_SECRET = 'A_DIFFERENT_SUPER_SECRET_KEY_FOR_QR_CODES';

const DashboardPage = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth(); // user starts as null
    const [showQR, setShowQR] = useState(null);

    const encryptData = (data) => {
        const dataString = JSON.stringify(data);
        return CryptoJS.AES.encrypt(dataString, QR_SECRET).toString();
    };

    useEffect(() => {
        // Only fetch registrations if the user object is available
        if (user) {
            const fetchRegistrations = async () => {
                try {
                    const { data } = await api.get('/registrations/my-events');
                    setRegistrations(data);
                } catch (err) {
                    setError('Failed to fetch your registrations.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchRegistrations();
        } else {
            // If there's no user, we're done loading
            setLoading(false);
        }
    }, [user]); // The effect re-runs when user changes from null to an object

    const getStatusClass = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const generateEncryptedQrValue = (reg) => {
        // Defensive check: Ensure user object exists before accessing its properties
        if (!user) return ''; 
        
        const dataToEncrypt = {
            userId: user.id,
            eventId: reg.eventId._id,
            registrationId: reg._id,
        };
        return encryptData(dataToEncrypt);
    };

    if (loading) {
        return <p className="text-center mt-8">Loading your dashboard...</p>;
    }

    if (error) {
        return <p className="text-center mt-8 text-red-500">{error}</p>;
    }
    
    // If there's no user after loading, prompt to log in.
    if (!user) {
        return <p className="text-center mt-8">Please log in to view your dashboard.</p>
    }

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                            <th className="py-3 px-5 text-left">Event</th>
                            <th className="py-3 px-5 text-left">Date</th>
                            <th className="py-3 px-5 text-left">Status</th>
                            <th className="py-3 px-5 text-center">Ticket</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {registrations.length > 0 ? registrations.map(reg => (
                            <tr key={reg._id} className="border-b border-gray-200 hover:bg-gray-100">
                                {/* Optional chaining ?. helps prevent crashes if eventId is missing */}
                                <td className="py-4 px-5">{reg.eventId?.title || 'Event Title Not Found'}</td>
                                <td className="py-4 px-5">{reg.eventId ? new Date(reg.eventId.date).toLocaleDateString() : 'N/A'}</td>
                                <td className="py-4 px-5">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(reg.status)}`}>
                                        {reg.status}
                                    </span>
                                </td>
                                <td className="py-4 px-5 text-center">
                                    {reg.status === 'APPROVED' ? (
                                        <button onClick={() => setShowQR(reg)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                                            View QR Code
                                        </button>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center p-6 text-gray-500">You haven't registered for any events yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg text-center shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">{showQR.eventId.title}</h2>
                        <QRCode value={generateEncryptedQrValue(showQR)} size={256} />
                        <p className="mt-4 text-gray-600">Present this QR code at the event entrance.</p>
                        <button onClick={() => setShowQR(null)} className="mt-6 bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;