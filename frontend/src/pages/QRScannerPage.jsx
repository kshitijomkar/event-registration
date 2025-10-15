import React, { useEffect, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isContinuous, setIsContinuous] = useState(false);
  const [scanLog, setScanLog] = useState([]);

  const handleScan = useCallback(async (decodedText, scanner) => {
    // Prevent multiple scans of the same code in quick succession
    if (scanLog.length > 0 && scanLog[0].id === decodedText) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/admin/verify/${decodedText}`, {
            headers: { 'x-auth-token': token },
        });
        
        const result = { type: 'success', id: decodedText, data: res.data.student, timestamp: new Date() };
        if (isContinuous) {
            toast.success(`${result.data.name} - Checked In!`);
            setScanLog(prev => [result, ...prev].slice(0, 10)); // Keep last 10 scans
        } else {
            setScanResult(result);
            scanner.pause(true);
        }

    } catch (err) {
        const errorMsg = err.response?.data?.msg || 'Verification failed.';
        const studentInfo = err.response?.data?.student;
        const result = { type: 'error', id: decodedText, data: studentInfo, message: errorMsg, timestamp: new Date() };

        if (isContinuous) {
            toast.error(`${studentInfo ? studentInfo.name + ' - ' : ''}${errorMsg}`);
            setScanLog(prev => [result, ...prev].slice(0, 10));
        } else {
            setScanResult(result);
            scanner.pause(true);
        }
    }
  }, [isContinuous, scanLog]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
    
    const onScanSuccess = (decodedText) => handleScan(decodedText, scanner);
    const onScanError = () => { /* Ignore scan errors */ };
    
    scanner.render(onScanSuccess, onScanError);
    return () => { scanner.clear().catch(() => {}); };
  }, [handleScan]);

  const handleModeChange = () => {
    setScanResult(null); // Clear detailed view when changing mode
    setIsContinuous(!isContinuous);
  };
  
  const handleRescan = () => {
    setScanResult(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">QR Code Scanner</h1>
        
        <div className="mb-4">
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isContinuous} onChange={handleModeChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-foreground">Continuous Scan Mode</span>
            </label>
        </div>
        
        <div className="bg-card border rounded-lg p-4 mx-auto w-full max-w-sm" id="reader-container">
            <div id="reader" className={scanResult && !isContinuous ? 'hidden' : ''}></div>

            {scanResult && !isContinuous && (
                <div className="text-center">
                    {scanResult.type === 'success' && (
                        <div className="p-6 bg-green-50 border-2 border-green-500 rounded-lg">
                            <h2 className="text-2xl font-bold text-green-700 mb-2">✅ Access Granted</h2>
                            <p className="text-lg text-left"><strong>Name:</strong> {scanResult.data.name}</p>
                            <p className="text-lg text-left"><strong>Roll No:</strong> {scanResult.data.rollNo}</p>
                        </div>
                    )}
                    {scanResult.type === 'error' && (
                        <div className="p-6 bg-red-50 border-2 border-red-500 rounded-lg">
                            <h2 className="text-2xl font-bold text-red-700 mb-2">❌ Access Denied</h2>
                            <p className="text-lg">{scanResult.message}</p>
                            {scanResult.data?.name && <p><strong>Name:</strong> {scanResult.data.name}</p>}
                        </div>
                    )}
                    <button onClick={handleRescan} className="mt-6 w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold text-lg">Scan Next</button>
                </div>
            )}
        </div>

        {isContinuous && (
            <div className="mt-6 w-full max-w-md text-left">
                <h3 className="font-bold text-lg mb-2">Recent Scans</h3>
                <div className="bg-card border rounded-lg p-2 space-y-2 h-64 overflow-y-auto">
                    {scanLog.length === 0 && <p className="text-muted-foreground text-center p-4">Scan a QR code to see the log...</p>}
                    {scanLog.map((log, i) => (
                        <div key={i} className={`p-2 rounded ${log.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                            <p className="font-semibold">{log.type === 'success' ? '✅ ' : '❌ '}{log.data?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{log.message || `Checked in at ${log.timestamp.toLocaleTimeString()}`}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerPage;