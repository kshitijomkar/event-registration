import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

const RegistrationReview = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events/admin/all');
                setEvents(data);
            } catch (error) { toast.error("Failed to fetch events."); }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            const fetchRegistrations = async () => {
                setLoading(true);
                try {
                    const { data } = await api.get(`/registrations/event/${selectedEvent}`);
                    setRegistrations(data);
                } catch (error) { toast.error("Failed to fetch registrations."); } 
                finally { setLoading(false); }
            };
            fetchRegistrations();
        }
    }, [selectedEvent]);

    const handleStatusUpdate = async (regId, status) => {
        const promise = api.put(`/registrations/${regId}/status`, { status });
        toast.promise(promise, {
            loading: 'Updating status...',
            success: 'Status updated!',
            error: 'Failed to update status.'
        });
        promise.then(() => {
            setRegistrations(prev => prev.map(reg => 
                reg._id === regId ? { ...reg, status } : reg
            ));
        });
    };
    
    const getStatusVariant = (status) => {
      switch (status) {
        case 'APPROVED': return 'approved';
        case 'REJECTED': return 'rejected';
        default: return 'pending';
      }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Registration Review</h1>
            <div className="mb-4">
                <select 
                    value={selectedEvent} 
                    onChange={e => setSelectedEvent(e.target.value)}
                    className="w-full p-2 border rounded-md bg-card"
                >
                    <option value="">-- Choose an Event --</option>
                    {events.map(event => (
                        <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                </select>
            </div>

            {loading && <p className="text-muted-foreground text-center">Loading...</p>}

            {selectedEvent && !loading && (
                <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left font-medium">User</th>
                                <th className="p-2 text-left font-medium hidden md:table-cell">Details</th>
                                <th className="p-2 text-left font-medium">Proof</th>
                                <th className="p-2 text-left font-medium">Status</th>
                                <th className="p-2 text-center font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map(reg => (
                                <tr key={reg._id} className="border-t">
                                    <td className="p-2 font-medium">{reg.userId.name}<br/><span className="text-muted-foreground font-normal">{reg.userId.email}</span></td>
                                    <td className="p-2 text-muted-foreground hidden md:table-cell">{reg.studentDetails?.rollNumber} - {reg.studentDetails?.department}</td>
                                    <td className="p-2">
                                        <a href={`http://localhost:5001/${reg.paymentScreenshot}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            View
                                        </a>
                                    </td>
                                    <td className="p-2"><Badge variant={getStatusVariant(reg.status)}>{reg.status}</Badge></td>
                                    <td className="p-2 text-center">
                                        {reg.status === 'PENDING' && (
                                            <div className="flex justify-center space-x-2">
                                                <Button size="sm" onClick={() => handleStatusUpdate(reg._id, 'APPROVED')}>Approve</Button>
                                                <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(reg._id, 'REJECTED')}>Reject</Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {registrations.length === 0 && <p className="text-center p-4 text-muted-foreground">No registrations for this event yet.</p>}
                </div>
            )}
        </div>
    );
};

export default RegistrationReview;