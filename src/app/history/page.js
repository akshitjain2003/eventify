'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const router = useRouter();

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleEditProfile = () => {
    console.log('Edit Profile');
    toggleSettingsDropdown();
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setShowSettingsDropdown(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const decoded = jwtDecode(token);
        if (!decoded.accountType || decoded.accountType !== 'user') {
          router.push('/login');
          return;
        }

        console.log('Fetching bookings for user:', decoded.userId); // Debug log

        const res = await fetch('/api/bookings/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        console.log('Bookings response:', data); // Debug log
        
        if (res.ok) {
          setBookings(data);
        } else {
          console.error('Error fetching bookings:', data.error);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  return (
    <div className="min-h-screen flex justify-center items-center flex-col w-full bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white w-full shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="logo">
                <img id="logo-topbar" src="/Eventify - Copy.png" alt="logo" />
              </Link>
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
                    <div className="dropdown-item" onClick={() => router.push('/history')}>
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

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600 text-center">Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No bookings found.</p>
            <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.eventName}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📅 {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    🎫 {booking.ticketQuantity} ticket(s)
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    👤 {booking.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    📱 {booking.mobile}
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      ₹{booking.totalAmount}
                    </span>
                    <span className="text-xs text-gray-500">
                      Booking ID: {booking._id.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



