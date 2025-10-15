// src/components/admin/EventManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({
        title: '', description: '', date: '', venue: '', registrationFee: 0, status: 'ACTIVE'
    });

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/events/admin/all');
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const openModalForCreate = () => {
        setIsEditing(false);
        setCurrentEvent({ title: '', description: '', date: '', venue: '', registrationFee: 0, status: 'ACTIVE' });
        setModalIsOpen(true);
    };

    const openModalForEdit = (event) => {
        setIsEditing(true);
        setCurrentEvent({ ...event, date: new Date(event.date).toISOString().substring(0, 10) });
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentEvent(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiCall = isEditing 
            ? api.put(`/events/${currentEvent._id}`, currentEvent)
            : api.post('/events', currentEvent);
        
        try {
            await apiCall;
            fetchEvents();
            closeModal();
        } catch (error) {
            console.error('Failed to save event', error);
            alert('Error saving event.');
        }
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${eventId}`);
                fetchEvents();
            } catch (error) {
                console.error('Failed to delete event', error);
                alert('Error deleting event.');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Event Management</h1>
                <button onClick={openModalForCreate} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Create New Event
                </button>
            </div>
            
            {/* Event Table */}
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 text-left">Title</th>
                            <th className="py-2 px-4 text-left">Date</th>
                            <th className="py-2 px-4 text-left">Status</th>
                            <th className="py-2 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr key={event._id} className="border-t">
                                <td className="py-2 px-4">{event.title}</td>
                                <td className="py-2 px-4">{new Date(event.date).toLocaleDateString()}</td>
                                <td className="py-2 px-4">{event.status}</td>
                                <td className="py-2 px-4 flex justify-center space-x-2">
                                    <button onClick={() => openModalForEdit(event)} className="text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(event._id)} className="text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalIsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                        <h2 className="text-2xl mb-4">{isEditing ? 'Edit Event' : 'Create Event'}</h2>
                        <form onSubmit={handleSubmit}>
                            {/* Form fields */}
                            <input name="title" value={currentEvent.title} onChange={handleChange} placeholder="Title" required className="w-full p-2 border rounded mb-2"/>
                            <textarea name="description" value={currentEvent.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 border rounded mb-2"/>
                            <input type="date" name="date" value={currentEvent.date} onChange={handleChange} required className="w-full p-2 border rounded mb-2"/>
                            <input name="venue" value={currentEvent.venue} onChange={handleChange} placeholder="Venue" required className="w-full p-2 border rounded mb-2"/>
                            <input type="number" name="registrationFee" value={currentEvent.registrationFee} onChange={handleChange} placeholder="Fee" required className="w-full p-2 border rounded mb-2"/>
                            <select name="status" value={currentEvent.status} onChange={handleChange} className="w-full p-2 border rounded mb-4">
                                <option value="ACTIVE">Active</option>
                                <option value="EXPIRED">Expired</option>
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventManagement;