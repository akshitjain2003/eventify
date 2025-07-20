'use client';

import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [venueId, setVenueId] = useState(null);
  const [events, setEvents] = useState([]);
  const [venue, setVenue] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const router = useRouter();

  useEffect(() => {
    let u = localStorage.getItem("venue");
    setVenue(JSON.parse(u));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setVenueId(decoded.venueId);
    } catch (error) {
      console.error('Invalid token', error);
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!venueId) return;
      try {
        const res = await fetch(`/api/events/by-venue?id=${venueId}`);
        const data = await res.json();
        if (res.ok) {
          setEvents(data);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, [venueId]);

  const handleDelete = async (eventId) => {
    const confirmDelete = confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/events/delete/${eventId}?venueId=${venueId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Event deleted successfully!");
        setEvents((prev) => prev.filter((event) => event._id !== eventId));
      } else {
        alert("Failed to delete event: " + data.error);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Something went wrong!");
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return eventDate >= today;
    } else {
      return eventDate < today;
    }
  });

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div className="logo">
          <img id="logo-topbar" src="Eventify - Copy.png" alt="logo" />
        </div>
        <div className="settings-container">
          <button className="settings-btn" title="Settings">⚙️</button>
          <div className="settings-dropdown" id="settingsDropdown">
            <div className="dropdown-item"><span className="dropdown-icon">👤</span> Edit Profile</div>
            <div className="dropdown-item"><span className="dropdown-icon">🚪</span> Logout</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-28">
        <div className="profile-section fade-in max-w-7xl mx-auto">
          {venue && (
            <div className="profile-header">
              <div className="profile-picture" title="Change Profile Picture">
                <Image src={venue.images[0]} alt={venue.venueName} width={100} height={100} id="profileInitial" />
              </div>
              <div className="profile-info">
                <h1 className="venue-name">{venue.venueName}</h1>
                <div className="venue-location">
                  <span className="location-icon">📍</span>
                  <span>{venue.location}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <a href="/dashboard/form">
              <button className="action-btn">
                <span className="btn-icon">✨</span> Create New Event
              </button>
            </a>
            <button className="action-btn secondary">
              <span className="btn-icon">📊</span> Dashboard
            </button>
          </div>

          {/* Toggle Buttons */}
          <div className="toggle-container max-w-7xl mx-auto mt-6 mb-4">
            <div className="toggle-buttons bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                className={`px-6 py-2 rounded-md transition-all duration-200 font-medium ${activeTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('upcoming')}
              >
                <span className="mr-2">📅</span> Upcoming Events
              </button>
              <button
                className={`px-6 py-2 rounded-md transition-all duration-200 font-medium ${activeTab === 'completed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('completed')}
              >
                <span className="mr-2">✅</span> Completed Events
              </button>
            </div>
          </div>
        </div>

        {/* Event Cards */}
        <div className="max-w-7xl mx-auto event-cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredEvents.length === 0 && (
            <p className="text-gray-600 text-center w-full">
              No {activeTab} events found.
            </p>
          )}
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-white shadow-md rounded-xl p-4 relative">
              <img
                src={event.performerImageUrl || '/default-event.jpg'}
                alt={event.eventName}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h2 className="text-lg font-semibold">{event.eventName}</h2>
              <p className="text-gray-600">{event.eventDescription}</p>
              <p className="text-sm mt-2">
                📅 {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
              </p>
              <p className="text-sm">🎤 Performer: {event.performerName}</p>
              <p className="text-sm">📍 Venue: {event.eventVenue}</p>
              <p className="text-sm">🎟️ ₹{event.passPrice} - {event.numberOfPasses} Passes</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => router.push(`/dashboard/form?eventId=${event._id}`)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                >
                  ✏️ Edit Event
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
