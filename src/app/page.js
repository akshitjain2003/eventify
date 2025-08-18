'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, Users, Settings } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { jwtDecode } from 'jwt-decode';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showBuyTicketModal, setShowBuyTicketModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [buyerForm, setBuyerForm] = useState({
    name: '',
    contact: '',
    passes: 1
  });
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [adminResponses, setAdminResponses] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState({});
  const [showSoldOutOnly, setShowSoldOutOnly] = useState(false);

  // Helper function to check if event date has passed
  const isEventActive = (eventDate) => {
    const today = new Date();
    const eventDateTime = new Date(eventDate);
    
    // Set time to start of day for comparison
    today.setHours(0, 0, 0, 0);
    eventDateTime.setHours(0, 0, 0, 0);
    
    return eventDateTime >= today;
  };

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleEditProfile = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: ''
    });
    setShowEditProfileModal(true);
    toggleSettingsDropdown();
  };

  const handleHistory = () => {
    router.push('/history');
    toggleSettingsDropdown();
  };

  const handleLogout = () => {
    try {
      console.log('Logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setShowSettingsDropdown(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const handleProfileFormChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('email', profileForm.email);
      formData.append('phone', profileForm.phone);
      if (profileForm.newPassword) {
        formData.append('currentPassword', profileForm.currentPassword);
        formData.append('newPassword', profileForm.newPassword);
      }

      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        setUser(prev => ({ ...prev, name: profileForm.name, phone: profileForm.phone }));
        localStorage.setItem('user', JSON.stringify({ ...user, name: profileForm.name, phone: profileForm.phone }));
        setShowEditProfileModal(false);
      } else {
        alert('Failed to update profile: ' + data.error);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Something went wrong!');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    const confirmAgain = confirm("This will permanently delete all your data. Are you absolutely sure?");
    if (!confirmAgain) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Account deleted successfully!');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert('Failed to delete account: ' + data.error);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Something went wrong!');
    }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events/all');
        const data = await res.json();
        
        // Filter to show only active events (event date not passed)
        const activeEvents = data.filter(event => isEventActive(event.eventDate));
        setEvents(activeEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.performerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuyTicket = (eventId) => {
    console.log('Buy ticket clicked for event:', eventId);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please login to buy tickets');
      window.location.href = '/login';
      return;
    }

    try {
      const decoded = jwtDecode(token);
      
      if (!decoded.accountType || decoded.accountType !== 'user') {
        alert('Please login with a user account to buy tickets');
        window.location.href = '/login';
        return;
      }
      
      // Find the selected event
      const event = events.find(e => e._id === eventId);
      if (event) {
        setSelectedEvent(event);
        setShowBuyTicketModal(true);
        setBuyerForm({ name: '', contact: '', passes: 1 });
      }
      
    } catch (error) {
      console.error('Invalid token', error);
      alert('Please login to buy tickets');
      window.location.href = '/login';
      return;
    }
  };

  const upcomingEvents = events.slice(0, 4); // Optional: Replace or update based on real logic

  const handleFormChange = (field, value) => {
    setBuyerForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBuyerFormSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', buyerForm); // Debug log
    
    if (!buyerForm.name || !buyerForm.contact || buyerForm.passes < 1) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token); // Debug log
      
      const requestData = { 
        eventId: selectedEvent._id,
        buyerName: buyerForm.name,
        buyerMobile: buyerForm.contact,
        ticketQuantity: parseInt(buyerForm.passes)
      };
      
      console.log('Sending request with data:', requestData); // Debug log
      
      const res = await fetch('/api/events/buy-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', res.status); // Debug log
      const data = await res.json();
      console.log('Response data:', data); // Debug log

      if (res.ok) {
        alert(data.message);
        
        // Generate and download ticket
        generateTicket(selectedEvent, buyerForm, data.buyerId, data.totalAmount);
        
        setEvents(prev => prev.map(event => 
          event._id === selectedEvent._id 
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
              <span class="value">${buyer.contact}</span>
            </div>
            <div class="detail-row">
              <span class="label">Tickets:</span>
              <span class="value">${buyer.passes}</span>
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

  // Fetch admin responses for the user
  const fetchAdminResponses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const response = await fetch('/api/feedback/responses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ userEmail: user.email })
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
        body: JSON.stringify({ userEmail: user.email })
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
    if (user) {
      fetchAdminResponses();
    }
  }, [user]);

  return (
    <div className="min-h-screen flex justify-center items-center flex-col w-full bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white w-full shadow-sm ">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="logo">
                <img id="logo-topbar" src="Eventify - Copy.png" alt="logo" />
              </div>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Welcome back,</div>
                  <div className="font-semibold text-gray-900">{user.name}</div>
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
                    <div className="dropdown-item" onClick={handleHistory}>
                      <span className="dropdown-icon">📋</span> History
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
            ) : (
              <Link href="/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search events or performers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>
{/* Swiper Slideshow */}
{upcomingEvents.length > 0 && (
  <div className="max-w-7xl mx-auto py-10 w-full">
    <div className="relative overflow-hidden rounded-xl shadow-lg w-full" style={{ height: '500px' }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000 }}
        navigation
        pagination={{ clickable: true }}
        effect="fade"
        speed={1000}
        className="h-full w-full"
      >
        {upcomingEvents.map((event) => (
          <SwiperSlide key={event._id} className="w-full h-full">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-black/30 z-10"></div>
              <img
                src={event.performerImageUrl || "/default-performer.jpg"}
                alt={event.eventName}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.src = "/default-performer.jpg";
                  e.target.onerror = null;
                }}
                loading="eager"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-8">
                <div className="text-white">
                  <h2 className="text-4xl font-bold mb-4">{event.eventName}</h2>
                  <p className="text-xl mb-2">{event.eventDate}</p>
                  <p className="text-lg mb-2 line-clamp-2">{event.eventDescription}</p>
                  <p className="text-lg font-semibold">📍 {event.eventVenue}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </div>
)}

      {/* Event Cards Grid */}
      <div className="w-full">
        <div className="max-w-7xl m-auto py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Active Events</h2>

          {loading ? (
            <p className="text-gray-600 text-center">Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-gray-600 text-center">No active events found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event._id} className={`bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow relative`}>
                  {event.numberOfPasses <= 0 && (
                    <div className="absolute top-2 right-2 z-20">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-md font-bold text-xs">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  <img
                    src={event.performerImageUrl || "/default-performer.jpg"}
                    alt={event.eventName}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.src = "/default-performer.jpg";
                    }}
                  />
                  
                  <div className="py-2">
                    {/* Three dots menu */}
                    <div className="absolute top-52 right-6 z-20">
                      <button
                        onClick={() => toggleOptionsMenu(event._id)}
                        className="p-1 bg-white/90 hover:bg-white rounded-md transition-colors shadow-md"
                        title="Options"
                      >
                        <span className="text-gray-700 text-sm font-bold">⋮</span>
                      </button>
                      
                      {showOptionsMenu[event._id] && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-[150px]">
                          <button
                            onClick={() => {
                              // Show contact info for this event
                              alert(`Contact Info:\nVenue: ${event.eventVenue}\nOrganizer: ${event.performerName}\nFor more details, please contact the venue directly.`);
                              closeOptionsMenu(event._id);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            📞 Contact Info
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.eventName}</h3>
                    <p className="text-gray-600 mb-4">by {event.performerName || "Unknown Artist"}</p>
                    <p className="text-gray-600 mb-4">📍 {event.eventVenue}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.eventDate}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.numberOfPasses?.toLocaleString() || "N/A"} seats</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        ₹<span className="text-sm">{event.passPrice}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyTicket(event._id)}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                        event.numberOfPasses <= 0
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      }`}
                      disabled={event.numberOfPasses <= 0}
                    >
                      {event.numberOfPasses <= 0 ? 'Sold Out' : 'Buy Ticket'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 max-h-[90vh] overflow-y-auto border">
            <h3 className="text-xl font-bold mb-4">👤 Edit Profile</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => handleProfileFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => handleProfileFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password (required to change password)
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
      )}

      {/* Buy Ticket Modal */}
      {showBuyTicketModal && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <img
                src={selectedEvent.performerImageUrl || "/default-event.jpg"}
                alt={selectedEvent.eventName}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <h3 className="text-xl font-bold mb-2">{selectedEvent.eventName}</h3>
              <p className="text-gray-600 mb-2">{selectedEvent.eventDescription}</p>
              <p className="text-sm text-gray-700 mb-1">📅 {selectedEvent.eventDate} at {selectedEvent.eventTime}</p>
              <p className="text-sm text-gray-700 mb-1">💰 ₹{selectedEvent.passPrice} per pass</p>
              <p className="text-sm text-gray-700">🎟️ {selectedEvent.numberOfPasses} passes available</p>
            </div>
            
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
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={buyerForm.contact}
                  onChange={(e) => handleFormChange('contact', e.target.value)}
                  maxLength={10}
                  minLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact number"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Passes *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedEvent.numberOfPasses}
                  value={buyerForm.passes}
                  onChange={(e) => handleFormChange('passes', e.target.value)}
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
                  Pay ₹{selectedEvent.passPrice * buyerForm.passes}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Popup Button */}
      {user && (
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
}