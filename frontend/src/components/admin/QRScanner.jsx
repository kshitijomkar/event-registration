// src/components/admin/QRScanner.jsx
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../api/axiosConfig';

const QRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [scanError, setScanError] = useState('');
    const [scanInProgress, setScanInProgress] = useState(true);
    const [checkinData, setCheckinData] = useState(null);

    useEffect(() => {
        if (scanInProgress) {
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            }, false);

            const onScanSuccess = (qrCodeMessage) => {
                scanner.clear();
                setScanInProgress(false);
                setScanResult(qrCodeMessage);
                verifyQrCode(qrCodeMessage);
            };

            const onScanFailure = (error) => {
                // console.warn(error);
            };

            scanner.render(onScanSuccess, onScanFailure);

            return () => {
                // Ensure scanner is cleared on component unmount if it's still running
                if (scanner && scanner.getState() === 2) { // 2 is SCANNING state
                    scanner.clear().catch(error => console.error("Failed to clear scanner", error));
                }
            };
        }
    }, [scanInProgress]);

    const verifyQrCode = async (qrData) => {
        try {
            const { data } = await api.post('/admin/scan-qr', { qrData });
            setCheckinData(data);
            setScanError('');
        } catch (error) {
            setCheckinData(null);
            setScanError(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    const handleScanNext = () => {
        setScanResult(null);
        setScanError('');
        setCheckinData(null);
        setScanInProgress(true);
    };

    const getResultBorderClass = () => {
        if (checkinData) return 'border-green-500';
        if (scanError) return 'border-red-500';
        return 'border-gray-300';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Event Check-in Scanner</h1>
            <div className="max-w-xl mx-auto">
                {scanInProgress ? (
                    <div id="reader" className="w-full"></div>
                ) : (
                    <div className={`p-6 bg-white shadow-md rounded-lg border-4 ${getResultBorderClass()}`}>
                        {checkinData && (
                            <div className="text-center text-green-700">
                                <h2 className="text-3xl font-bold mb-2">✔️ Check-in Successful!</h2>
                                <p className="text-xl">Name: <strong>{checkinData.data.fullName}</strong></p>
                                <p className="text-lg">Roll No: {checkinData.data.rollNumber}</p>
                            </div>
                        )}
                        {scanError && (
                            <div className="text-center text-red-700">
                                <h2 className="text-3xl font-bold mb-2">❌ Check-in Failed</h2>
                                <p className="text-xl">{scanError}</p>
                            </div>
                        )}
                        <button onClick={handleScanNext} className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-lg">
                            Scan Next Ticket
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRScanner;