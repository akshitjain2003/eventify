'use client';

import React, { useEffect, useState } from 'react';
import { Search, Calendar, Users, DollarSign } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Link from 'next/link';



const page = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

useEffect(()=>{
  let u = localStorage.getItem("user")
  setUser( JSON.parse(u))

},[])
  // Mock slideshow data for upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: "Rock Concert 2025",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      date: "July 25, 2025",
      description: "Amazing rock concert featuring top artists"
    },
    {
      id: 2,
      title: "Jazz Festival",
      image: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&h=400&fit=crop",
      date: "August 10, 2025",
      description: "Smooth jazz performances all day long"
    },
    {
      id: 3,
      title: "Comedy Night",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
      date: "August 15, 2025",
      description: "Stand-up comedy with renowned comedians"
    },
    {
      id: 4,
      title: "Classical Symphony",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      date: "September 5, 2025",
      description: "Orchestra performance of classical masterpieces"
    }
  ];

  // Mock event cards data
  const eventCards = [
    {
      id: 1,
      performer: "The Rock Stars",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      eventName: "Summer Rock Festival",
      date: "July 25, 2025",
      seats: 5000,
      price: 85
    },
    {
      id: 2,
      performer: "Jazz Collective",
      image: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=300&h=200&fit=crop",
      eventName: "Smooth Jazz Night",
      date: "August 10, 2025",
      seats: 1200,
      price: 65
    },
    {
      id: 3,
      performer: "Comedy Masters",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
      eventName: "Stand-Up Comedy Show",
      date: "August 15, 2025",
      seats: 800,
      price: 45
    },
    {
      id: 4,
      performer: "City Orchestra",
      image: "https://images.unsplash.com/photo-1465847899943-d11726c01ba4?w=300&h=200&fit=crop",
      eventName: "Classical Symphony",
      date: "September 5, 2025",
      seats: 2000,
      price: 120
    },
    {
      id: 5,
      performer: "Electronic DJs",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=200&fit=crop",
      eventName: "Electronic Music Festival",
      date: "September 20, 2025",
      seats: 8000,
      price: 95
    },
    {
      id: 6,
      performer: "Folk Singers",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      eventName: "Folk Music Evening",
      date: "October 1, 2025",
      seats: 600,
      price: 35
    },
    {
      id: 7,
      performer: "Hip Hop Artists",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      eventName: "Hip Hop Block Party",
      date: "October 15, 2025",
      seats: 3000,
      price: 75
    },
    {
      id: 8,
      performer: "Country Band",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      eventName: "Country Music Night",
      date: "November 1, 2025",
      seats: 1500,
      price: 55
    },
    {
      id: 9,
      performer: "Blues Musicians",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      eventName: "Blues & Soul Evening",
      date: "November 20, 2025",
      seats: 900,
      price: 40
    }
  ];

  const handleBuyTicket = (eventId) => {
    alert(`Redirecting to purchase tickets for event ID: ${eventId}`);
};

  const filteredEvents = eventCards.filter(event =>
    event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.performer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex justify-center items-center flex-col  w-full bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white w-full shadow-sm border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
                EventHub
              </div>
            </div>
            
            {/* User Welcome */}
            {user?<div className="text-right">
              <div className="text-sm text-gray-600">Welcome back,</div>
              <div className="font-semibold text-gray-900">{user.name}</div>
            </div>: <Link
                href="/login"
                  className=" bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  Login
                </Link>}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events or performers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Swiper Slideshow */}
      <div className="max-w-7xl mx-auto py-10 ">
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            navigation={true}
            pagination={{
              clickable: true,
            }}
            effect="fade"
            fadeEffect={{
              crossFade: true
            }}
            speed={1000}
            className="h-96 rounded-xl"
          >
            {upcomingEvents.map((event) => (
              <SwiperSlide key={event.id}>
                <div className="relative h-96">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-4xl font-bold mb-4">{event.title}</h2>
                      <p className="text-xl mb-2">{event.date}</p>
                      <p className="text-lg">{event.description}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className=" w-full  ">
      <div className=" max-w-7xl m-auto  py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl p-4 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src={event.image}
                alt={event.performer}
                className="w-full h-48 object-cover"
              />
              <div className=" py-2">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.eventName}</h3>
                <p className="text-gray-600 mb-4">by {event.performer}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.seats.toLocaleString()} seats</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span className="text-sm">${event.price}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleBuyTicket(event.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  Buy Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );

 }
 export default page