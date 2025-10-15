import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import QRCode from "react-qr-code";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '', rollNo: '', year: '1', section: 'A', mobile: '',
  });
  const [registrationId, setRegistrationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const qrCodeRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegistrationId(null);
    try {
      const res = await axios.post(`${API_URL}/api/register`, formData);
      setRegistrationId(res.data.registrationId);
      toast.success('Registration Successful! Here is your QR Code.');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeRef.current) return;

    const svg = qrCodeRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${formData.rollNo}-QRCode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card border rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-foreground">Event Registration</h2>
        {!registrationId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Fields */}
            <div>
              <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Full Name</label>
              <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label htmlFor="rollNo" className="text-sm font-medium text-muted-foreground">Roll Number</label>
              <input id="rollNo" name="rollNo" type="text" required value={formData.rollNo} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="text-sm font-medium text-muted-foreground">Year</label>
                <select id="year" name="year" value={formData.year} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                  {[1, 2, 3].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="section" className="text-sm font-medium text-muted-foreground">Section</label>
                <select id="section" name="section" value={formData.section} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="mobile" className="text-sm font-medium text-muted-foreground">Mobile Number</label>
              <input id="mobile" name="mobile" type="tel" required value={formData.mobile} onChange={handleChange} className="w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button type="submit" disabled={loading} className="w-full px-4 py-3 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 text-base">
              {loading ? 'Registering...' : 'Get QR Code'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-5">
            <h3 className="text-xl font-semibold text-primary">Your QR Code for Entry</h3>
            <div className="bg-white p-4 rounded-lg border">
                <QRCode
                  value={registrationId}
                  size={256}
                  viewBox={`0 0 256 256`}
                  // The SVG is rendered inside a div, so we get the ref from the parent
                  ref={{
                      current: qrCodeRef.current?.querySelector('svg')
                  }}
                  id="qr-code-svg"
                />
            </div>
            <p className="text-center text-muted-foreground text-sm">Please download or screenshot this code. Your registration is <span className="font-bold text-foreground">pending approval</span>.</p>
            <div className="w-full space-y-3">
              <button onClick={handleDownload} className="w-full px-4 py-3 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary-hover">
                Download QR Code
              </button>
              <button onClick={() => setRegistrationId(null)} className="w-full px-4 py-3 font-semibold text-primary bg-muted hover:bg-border rounded-md">
                Register Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;