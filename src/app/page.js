'use client';

import React, { useEffect, useState } from 'react';
import { Search, Calendar, Users, DollarSign } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Link from 'next/link';

const Page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events/all');
        const data = await res.json();
        setEvents(data);
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
    alert(`Redirecting to purchase tickets for event ID: ${eventId}`);
  };

  const upcomingEvents = events.slice(0, 4); // Optional: Replace or update based on real logic

  return (
    <div className="min-h-screen flex justify-center items-center flex-col w-full bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white w-full shadow-sm border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
                EventHub
              </div>
            </div>
            {user ? (
              <div className="text-right">
                <div className="text-sm text-gray-600">Welcome back,</div>
                <div className="font-semibold text-gray-900">{user.name}</div>
              </div>
            ) : (
              <Link href="/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events or performers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Swiper Slideshow */}
      {upcomingEvents.length > 0 && (
        <div className="max-w-7xl mx-auto py-10">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
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
              className="h-96 rounded-xl"
            >
              {upcomingEvents.map((event) => (
                <SwiperSlide key={event._id}>
                  <div className="relative h-96">
                    <img
                      src={event.performerImageUrl || "/default-banner.jpg"}
                      alt={event.eventName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">{event.eventName}</h2>
                        <p className="text-xl mb-2">{event.eventDate}</p>
                        <p className="text-lg">{event.eventDescription}</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">All Events</h2>

          {loading ? (
            <p className="text-gray-600 text-center">Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-gray-600 text-center">No events found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div key={event._id} className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src={event.performerImageUrl || "/default-performer.jpg"}
                    alt={event.performerName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="py-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.eventName}</h3>
                    <p className="text-gray-600 mb-4">by {event.performerName || "Unknown Artist"}</p>

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
                        {/* <DollarSign className="h-4 w-4 mr-2" /> */}₹
                        <span className="text-sm">{event.passPrice}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyTicket(event._id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                    >
                      Buy Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
