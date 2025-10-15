import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';

const HomePage = () => {
    const [events, setEvents] = useState([]); // Start with an empty array for live data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch live data from the backend when the component mounts
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data);
            } catch (err) {
                setError('Failed to fetch events from the server.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchEvents();
    }, []); // Empty dependency array means this runs once on mount

    const EventCard = ({ event }) => (
        <Card className="flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">
                    {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                </p>
                <p className="text-sm text-foreground">{event.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-6">
                <p className="text-lg font-semibold text-foreground">
                    Fee: ${event.registrationFee}
                </p>
                <Button asChild>
                    <Link to={`/register-event/${event._id}`}>Register Now</Link>
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <section className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-4">
                    Origin Club Events
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                    Technical workshops, hackathons, and competitions at St. Peter’s Engineering College.
                </p>
            </section>

            {loading && <p className="text-center">Loading events...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            
            {!loading && !error && (
                <>
                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No upcoming events at the moment. Please check back later.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default HomePage;