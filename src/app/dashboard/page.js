'use client';

console.log('File is being loaded');

import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [venueId, setVenueId] = useState(null);
  const [events, setEvents] = useState([]);
  const [venue, setVenue] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showSoldOutOnly, setShowSoldOutOnly] = useState(false);
  const router = useRouter();
  const [showBuyTicketModal, setShowBuyTicketModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [buyerForm, setBuyerForm] = useState({
    name: '',
    mobile: '',
    quantity: 1
  });
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    venueName: '',
    email: '',
    contact: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    logo: null
  });
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [adminResponses, setAdminResponses] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState({});

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleEditProfile = () => {
    setProfileForm({
      venueName: venue?.venueName || '',
      email: venue?.email || '',
      contact: venue?.contact || '',
      address: venue?.address || '',
      currentPassword: '',
      newPassword: '',
      logo: null
    });
    setShowEditProfileModal(true);
    toggleSettingsDropdown();
  };

  const handleProfileFormChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileForm(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    console.log('Form data being sent:', profileForm); // Debug log
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('venueName', profileForm.venueName);
      formData.append('email', profileForm.email);
      formData.append('contact', profileForm.contact);
      formData.append('address', profileForm.address);
      
      if (profileForm.newPassword) {
        formData.append('currentPassword', profileForm.currentPassword);
        formData.append('newPassword', profileForm.newPassword);
      }
      if (profileForm.logo) {
        formData.append('logo', profileForm.logo);
      }

      console.log('Sending request to API...'); // Debug log

      const response = await fetch('/api/venues/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('API response:', data); // Debug log

      if (response.ok) {
        alert('Profile updated successfully!');
        const updatedVenue = {
          ...venue,
          venueName: profileForm.venueName,
          contact: profileForm.contact,
          address: profileForm.address,
          images: data.venue.images || venue.images
        };
        setVenue(updatedVenue);
        localStorage.setItem('venue', JSON.stringify(updatedVenue));
        setShowEditProfileModal(false);
      } else {
        console.error('API error:', data);
        alert('Failed to update profile: ' + data.error);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Something went wrong: ' + error.message);
    }
  };

  const handleLogout = () => {
    try {
      console.log('Logging out...'); // Debug log
      localStorage.removeItem('token');
      localStorage.removeItem('venue');
      setShowSettingsDropdown(false);
      
      // Force redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      window.location.href = '/login';
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("Are you sure you want to delete your venue account? This action cannot be undone.");
    if (!confirmDelete) return;

    const confirmAgain = confirm("This will permanently delete all your events and data. Are you absolutely sure?");
    if (!confirmAgain) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/venues/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: venue.email })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Account deleted successfully!');
        localStorage.removeItem('token');
        localStorage.removeItem('venue');
        window.location.href = '/login';
      } else {
        alert('Failed to delete account: ' + data.error);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Something went wrong!');
    }
  };

  const fetchVenueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/venues/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVenue(data.venue);
        localStorage.setItem('venue', JSON.stringify(data.venue));
      }
    } catch (error) {
      console.error('Error fetching venue data:', error);
    }
  };

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

  // Add this useEffect to test if JavaScript is running
  useEffect(() => {
    console.log('Dashboard page loaded successfully');
  }, []);

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

  const handleBuyTicket = (eventId) => {
    setSelectedEventId(eventId);
    setShowBuyTicketModal(true);
    setBuyerForm({ name: '', mobile: '', quantity: 1 });
  };

  const handleBuyerFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!buyerForm.name || !buyerForm.mobile || buyerForm.quantity < 1) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events/buy-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          eventId: selectedEventId,
          buyerName: buyerForm.name,
          buyerMobile: buyerForm.mobile,
          ticketQuantity: parseInt(buyerForm.quantity)
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        
        // Generate and download ticket
        const selectedEvent = events.find(e => e._id === selectedEventId);
        const totalAmount = selectedEvent.passPrice * buyerForm.quantity;
        generateTicket(selectedEvent, buyerForm, data.buyerId || Date.now(), totalAmount);
        
        setEvents(prev => prev.map(event => 
          event._id === selectedEventId 
            ? { ...event, numberOfPasses: data.remainingPasses }
            : event
        ));
        setShowBuyTicketModal(false);
      } else {
        alert("Failed to buy ticket: " + data.error);
      }
    } catch (error) {
      console.error("Buy ticket error:", error);
      alert("Something went wrong!");
    }
  };

  const handleFormChange = (field, value) => {
    setBuyerForm(prev => ({ ...prev, [field]: value }));
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

  const generateTicket = (event, buyer, buyerId, totalAmount) => {
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f0f0; }
          .ticket { background: white; border: 2px dashed #333; border-radius: 10px; padding: 20px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 15px; }
          .event-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .ticket-id { font-size: 12px; color: #666; }
          .event-details, .buyer-details { margin-bottom: 15px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .footer { text-align: center; border-top: 2px solid #333; padding-top: 15px; margin-top: 15px; }
          .total-amount { font-size: 20px; font-weight: bold; color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div class="event-name">${event.eventName}</div>
            <div class="ticket-id">Ticket ID: ${buyerId}</div>
          </div>
          
          <div class="event-details">
            <h3 style="margin-top: 0; color: #333;">Event Details</h3>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${event.eventDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${event.eventTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">Venue:</span>
              <span class="value">${event.eventVenue}</span>
            </div>
            <div class="detail-row">
              <span class="label">Performer:</span>
              <span class="value">${event.performerName}</span>
            </div>
          </div>
          
          <div class="buyer-details">
            <h3 style="margin-top: 0; color: #333;">Buyer Details</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${buyer.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Contact:</span>
              <span class="value">${buyer.mobile}</span>
            </div>
            <div class="detail-row">
              <span class="label">Tickets:</span>
              <span class="value">${buyer.quantity}</span>
            </div>
          </div>
          
          <div class="footer">
            <div class="total-amount">Total: ₹${totalAmount}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
              Thank you for your purchase!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([ticketHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${event.eventName.replace(/\s+/g, '-')}-${buyerId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fetch admin responses for the venue
  const fetchAdminResponses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !venue) return;

      const response = await fetch('/api/feedback/responses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ userEmail: venue.email })
      });

      if (response.ok) {
        const data = await response.json();
        const responsesWithReplies = data.feedback.filter(item => item.adminResponse);
        setAdminResponses(responsesWithReplies);
        
        // Count unread responses
        const unread = responsesWithReplies.filter(item => !item.readByUser).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching admin responses:', error);
    }
  };

  // Mark responses as read
  const markResponsesAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/feedback/mark-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userEmail: venue.email })
      });

      if (response.ok) {
        setUnreadCount(0);
        setAdminResponses(prev => prev.map(item => ({ ...item, readByUser: true })));
      }
    } catch (error) {
      console.error('Error marking responses as read:', error);
    }
  };

  const toggleOptionsMenu = (eventId) => {
    setShowOptionsMenu(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const closeOptionsMenu = (eventId) => {
    setShowOptionsMenu(prev => ({
      ...prev,
      [eventId]: false
    }));
  };

  useEffect(() => {
    if (venue) {
      fetchAdminResponses();
    }
  }, [venue]);

  return (
    <div>
      {/* Topbar */}
      <div className="topbar" style={{ background: 'white' }}>
        <div className="logo">
          <img id="logo-topbar" src="Eventify - Copy.png" alt="logo" />
        </div>
        <div className="settings-container">
          <button 
            className={`settings-btn ${showSettingsDropdown ? 'active' : ''}`}
            onClick={toggleSettingsDropdown}
            title="Menu"
          >
            ☰
          </button>
          <div className={`settings-dropdown ${showSettingsDropdown ? 'show' : ''}`}>
            <div className="dropdown-item" onClick={handleEditProfile}>
              <span className="dropdown-icon">👤</span> Edit Profile
            </div>
            <div className="dropdown-item" onClick={() => router.push('/contact')}>
              <span className="dropdown-icon">📧</span> Contact Us
            </div>
            <div 
              className="dropdown-item" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
            >
              <span className="dropdown-icon">🚪</span> Logout
            </div>
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
            <button 
              className="action-btn secondary"
              onClick={() => router.push('/dashboard/analytics')}
            >
              <span className="btn-icon">📊</span> Dashboard
            </button>
          </div>

          {/* Toggle Buttons */}
          <div className="toggle-container max-w-7xl mx-auto mt-6 mb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
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
        </div>

        {/* Event Cards */}
        <div className="max-w-7xl mx-auto event-cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredEvents.length === 0 && (
            <p className="text-gray-600 text-center w-full">
              No {activeTab} events found.
            </p>
          )}
          {filteredEvents.map((event) => (
            <div key={event._id} className={`bg-white shadow-md rounded-xl p-4 relative`}>
              {event.numberOfPasses <= 0 && (
                <div className="absolute top-2 right-2 z-20">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-md font-bold text-xs">
                    SOLD OUT
                  </span>
                </div>
              )}

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
                            
              <div className="mt-4 flex gap-2">
                {activeTab === 'upcoming' ? (
                  <>
                    <button
                      onClick={() => handleBuyTicket(event._id)}
                      className={`flex-1 px-3 py-2 rounded transition ${
                        event.numberOfPasses <= 0 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      disabled={event.numberOfPasses <= 0}
                    >
                      🎫 {event.numberOfPasses <= 0 ? 'Sold Out' : 'Buy Ticket'}
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/form?eventId=${event._id}`)}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition"
                    >
                      🗑️ Delete
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-2 text-gray-500 text-sm">
                    Event Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buy Ticket Modal */}
      {showBuyTicketModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">🎫 Buy Tickets</h3>
            <form onSubmit={handleBuyerFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name *
                </label>
                <input
                  type="text"
                  value={buyerForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter buyer's full name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={buyerForm.mobile}
                  onChange={(e) => handleFormChange('mobile', e.target.value)}
                   maxLength={10}
                   minLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets *
                </label>
                <input
                  type="number"
                  min="1"
                  max={events.find(e => e._id === selectedEventId)?.numberOfPasses || 1}
                  value={buyerForm.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBuyTicketModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Buy Tickets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-24">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Topbar - Similar to Dashboard */}
            <div style={{
              background: 'white',
              padding: '15px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '8px 8px 0 0',
              margin: 0,
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <h3 className="text-xl font-bold text-gray-900">Edit Venue Profile</h3>
            </div>
            
            {/* Form Section */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-60px)]">
              <form onSubmit={handleSaveProfile}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.venueName}
                    onChange={(e) => handleProfileFormChange('venueName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter venue name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.contact}
                    onChange={(e) => handleProfileFormChange('contact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contact number"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => handleProfileFormChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter venue address"
                    rows="3"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current logo</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password (required for password change)
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => handleProfileFormChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => handleProfileFormChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="border-t pt-4">
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  🗑️ Delete Account
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Popup Button */}
      {venue && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              setShowChatPopup(!showChatPopup);
              if (!showChatPopup && unreadCount > 0) {
                markResponsesAsRead();
              }
            }}
            className="relative w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            title="Admin Messages"
          >
            <span className="text-xl">💬</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Chat Popup */}
          {showChatPopup && (
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border max-h-96 overflow-hidden">
              <div className="bg-purple-600 text-white p-3 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Admin Messages</h3>
                  <button
                    onClick={() => setShowChatPopup(false)}
                    className="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto p-4">
                {adminResponses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No messages from admin</p>
                ) : (
                  <div className="space-y-4">
                    {adminResponses.map((item) => (
                      <div key={item._id} className="border-b pb-3 last:border-b-0">
                        <div className="bg-gray-50 p-2 rounded mb-2">
                          <p className="text-xs text-gray-600 mb-1">Your feedback:</p>
                          <p className="text-sm">{item.feedback}</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-xs text-purple-600 mb-1">Admin response:</p>
                          <p className="text-sm">{item.adminResponse}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
