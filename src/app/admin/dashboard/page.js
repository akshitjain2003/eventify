'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [feedbackType, setFeedbackType] = useState('users');
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }

    fetchUsers();
    fetchVenues();
    fetchEvents();
    fetchFeedback();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token:', adminToken ? 'Present' : 'Missing');

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setUsers(data.users);
        console.log('Users set:', data.users.length);
      } else {
        console.error('Failed to fetch users:', data.error);
        // If unauthorized, redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/venues', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues);
      } else {
        console.error('Failed to fetch venues');
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Events data:', data.events); // Debug log
        
        // Fetch analytics data for each event to get tickets sold
        const eventsWithAnalytics = await Promise.all(
          data.events.map(async (event) => {
            try {
              const analyticsRes = await fetch(`/api/events/analytics?venueId=${event.createdBy._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (analyticsRes.ok) {
                const analyticsData = await analyticsRes.json();
                const eventAnalytics = analyticsData.events.find(e => e._id === event._id);
                
                if (eventAnalytics) {
                  return {
                    ...event,
                    ticketsSold: eventAnalytics.ticketsSold || 0,
                    revenue: eventAnalytics.revenue || 0
                  };
                }
              }
            } catch (error) {
              console.log('Analytics fetch failed for event:', event._id);
            }
            
            return event;
          })
        );
        
        setEvents(eventsWithAnalytics);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const userTypeParam = feedbackType === 'users' ? '?userType=user' : '?userType=venue';
      
      console.log('Fetching feedback with type:', feedbackType);
      
      const response = await fetch(`/api/admin/feedback${userTypeParam}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched feedback data:', data);
        console.log('Debug info:', data.debug);
        setFeedback(data.feedback || []);
      } else {
        console.error('Failed to fetch feedback:', response.status);
        setFeedback([]);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedback([]);
    }
  };

  const migrateFeedback = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/feedback/migrate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Migration completed. Updated ${data.modifiedCount} records.`);
        fetchFeedback(); // Refresh the feedback list
      } else {
        alert('Migration failed');
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration error');
    }
  };

  // Update useEffect to refetch when feedbackType changes
  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab, feedbackType]);

  const handleFloatingButtonClick = () => {
    console.log('Floating button clicked!');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmDelete = confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    const confirmAgain = confirm("This will permanently delete all user data. Are you absolutely sure?");
    if (!confirmAgain) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('User deleted successfully!');
        // Remove user from local state
        setUsers(users.filter(user => user._id !== userId));
      } else {
        alert('Failed to delete user: ' + data.error);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Something went wrong while deleting user!');
    }
  };

  const handleViewVenue = (venue) => {
    setSelectedVenue(venue);
    setShowVenueModal(true);
  };

  const handleDeleteVenue = async (venueId, venueName) => {
    const confirmDelete = confirm(`Are you sure you want to delete venue "${venueName}"? This will also delete all events created by this venue.`);
    if (!confirmDelete) return;

    const confirmAgain = confirm("This will permanently delete all venue and event data. Are you absolutely sure?");
    if (!confirmAgain) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/venues/delete/${venueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Venue deleted successfully!');
        setVenues(venues.filter(venue => venue._id !== venueId));
      } else {
        alert('Failed to delete venue: ' + data.error);
      }
    } catch (error) {
      console.error('Delete venue error:', error);
      alert('Something went wrong while deleting venue!');
    }
  };

  const closeModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const closeVenueModal = () => {
    setShowVenueModal(false);
    setSelectedVenue(null);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackModal(true);
  };

  const handleRespondFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowRespondModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedFeedback(null);
  };

  const closeRespondModal = () => {
    setShowRespondModal(false);
    setSelectedFeedback(null);
  };

  const handleRespondSubmit = async () => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/feedback/respond', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedbackId: selectedFeedback._id,
          adminResponse: responseText,
          status: 'reviewed'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Response sent successfully!');
        
        // Update local feedback state
        setFeedback(prev => prev.map(item => 
          item._id === selectedFeedback._id 
            ? { ...item, adminResponse: responseText, status: 'reviewed' }
            : item
        ));
        
        setResponseText('');
        closeRespondModal();
      } else {
        alert('Failed to send response: ' + data.error);
      }
    } catch (error) {
      console.error('Response error:', error);
      alert('Something went wrong while sending response!');
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'users':
        return users;
      case 'venues':
        return venues;
      case 'events':
        return events;
      case 'feedback':
        console.log('Feedback tab - current feedback data:', feedback);
        console.log('First feedback item:', feedback[0]); // Show first item details
        console.log('Feedback length:', feedback.length);
        return feedback;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  
  const filteredData = currentData.filter(item => {
    console.log('Filtering item:', item); // Debug each item being filtered
    
    if (activeTab === 'feedback') {
      // Simple search in feedback - no user/venue filtering for now
      const searchFields = [item.userEmail, item.feedback, item.status];
      const result = searchFields.some(field =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('Feedback filter result:', result, 'for item:', item._id);
      return result;
    }
    
    // Other tab filtering logic...
    const searchFields = activeTab === 'users'
      ? [item.name, item.email]
      : activeTab === 'venues'
      ? [item.venueName, item.email, item.location]
      : [item.eventName, item.performerName, item.createdBy?.venueName];

    return searchFields.some(field =>
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = activeTab === 'users' ? a[sortField] : (sortField === 'name' ? a.venueName : a[sortField]);
    let bValue = activeTab === 'users' ? b[sortField] : (sortField === 'name' ? b.venueName : b[sortField]);

    aValue = aValue || '';
    bValue = bValue || '';

    if (sortField === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * usersPerPage;
  const indexOfFirstItem = indexOfLastItem - usersPerPage;
  const currentItems = activeTab === 'feedback' ? feedback : sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / usersPerPage);

  // Reset pagination when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => handleTabChange('users')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => handleTabChange('venues')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'venues'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Venues ({venues.length})
              </button>
              <button
                onClick={() => handleTabChange('events')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'events'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Events ({events.length})
              </button>
              <button
                onClick={() => handleTabChange('feedback')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'feedback'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Feedback ({feedback.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Search ${activeTab} by ${activeTab === 'users' ? 'name or email' : activeTab === 'feedback' ? 'email or feedback' : 'venue name, email or location'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {activeTab === 'feedback' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setFeedbackType('users')}
                  className={`px-4 py-2 rounded-lg ${feedbackType === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  User Feedback
                </button>
                <button
                  onClick={() => setFeedbackType('venues')}
                  className={`px-4 py-2 rounded-lg ${feedbackType === 'venues' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Venue Feedback
                </button>
              </div>
            )}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Total {activeTab}: {filteredData.length}
              </span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading {activeTab}...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {activeTab === 'feedback' ? (
                        <>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('userEmail')}
                          >
                            User Email {getSortIcon('userEmail')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Feedback
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('status')}
                          >
                            Status {getSortIcon('status')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('createdAt')}
                          >
                            Submitted Date {getSortIcon('createdAt')}
                          </th>
                        </>
                      ) : activeTab === 'users' ? (
                        <>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('name')}
                          >
                            Name {getSortIcon('name')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('email')}
                          >
                            Email {getSortIcon('email')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('age')}
                          >
                            Age {getSortIcon('age')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('createdAt')}
                          >
                            Joined Date {getSortIcon('createdAt')}
                          </th>
                        </>
                      ) : activeTab === 'venues' ? (
                        <>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('venueName')}
                          >
                            Venue Name {getSortIcon('venueName')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('email')}
                          >
                            Email {getSortIcon('email')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('location')}
                          >
                            Location {getSortIcon('location')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('createdAt')}
                          >
                            Joined Date {getSortIcon('createdAt')}
                          </th>
                        </>
                      ) : (
                        <>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('eventName')}
                          >
                            Event Name {getSortIcon('eventName')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('performerName')}
                          >
                            Performer {getSortIcon('performerName')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('eventDate')}
                          >
                            Event Date {getSortIcon('eventDate')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Venue
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('passPrice')}
                          >
                            Price {getSortIcon('passPrice')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('totalPasses')}
                          >
                            Total Passes {getSortIcon('totalPasses')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('numberOfPasses')}
                          >
                            Available {getSortIcon('numberOfPasses')}
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('commission')}
                          >
                            Commission (5%) {getSortIcon('commission')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        {activeTab === 'feedback' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.userEmail}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">{item.feedback}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                item.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewFeedback(item)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleRespondFeedback(item)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Respond
                              </button>
                            </td>
                          </>
                        ) : activeTab === 'users' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.age || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewUser(item)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteUser(item._id, item.name)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        ) : activeTab === 'events' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.eventName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.performerName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(item.eventDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.createdBy?.venueName || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">₹{item.passPrice}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.totalPasses || item.numberOfPasses}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <span className={`${item.numberOfPasses <= 0 ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
                                  {item.numberOfPasses}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                ₹{(() => {
                                  const ticketsSold = item.ticketsSold || 0;
                                  const revenue = item.revenue || (ticketsSold * item.passPrice);
                                  const commission = revenue * 0.05;
                                  console.log(`Event ${item.eventName}: sold=${ticketsSold}, revenue=${revenue}, commission=${commission}`);
                                  return commission.toFixed(2);
                                })()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewEvent(item)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(item._id, item.eventName)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.venueName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewVenue(item)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteVenue(item._id, item.venueName)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastItem, sortedData.length)}</span> of{' '}
                        <span className="font-medium">{sortedData.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User View Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{selectedUser.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <p className="text-sm text-gray-900">{selectedUser.age || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <p className="text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${selectedUser.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeModal();
                  handleDeleteUser(selectedUser._id, selectedUser.name);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venue View Modal */}
      {showVenueModal && selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Venue Details</h3>
              <button
                onClick={closeVenueModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                <p className="text-sm text-gray-900">{selectedVenue.venueName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedVenue.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900">{selectedVenue.location}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedVenue.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {selectedVenue.images && selectedVenue.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue Images</label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVenue.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Venue Image ${index + 1}`}
                          className="w-full h-auto rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/default-venue.jpg';
                          }}
                        />
                        <span className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index === 0 ? 'Logo' : `${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedVenue.images.length > 4 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Showing first 4 images of {selectedVenue.images.length} total
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeVenueModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeVenueModal();
                  handleDeleteVenue(selectedVenue._id, selectedVenue.venueName);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Venue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event View Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
              <button
                onClick={closeEventModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Name</label>
                <p className="text-sm text-gray-900">{selectedEvent.eventName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Performer</label>
                <p className="text-sm text-gray-900">{selectedEvent.performerName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Event Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedEvent.eventDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Event Time</label>
                <p className="text-sm text-gray-900">{selectedEvent.eventTime}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Venue</label>
                <p className="text-sm text-gray-900">{selectedEvent.createdBy?.venueName || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900">{selectedEvent.eventVenue}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pass Price</label>
                <p className="text-sm text-gray-900">₹{selectedEvent.passPrice}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Passes</label>
                <p className="text-sm text-gray-900">{selectedEvent.numberOfPasses}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{selectedEvent.eventDescription}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedEvent.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Venue Contact</label>
                <p className="text-sm text-gray-900">{selectedEvent.createdBy?.email || 'N/A'}</p>
              </div>

              {selectedEvent.performerImageUrl && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Performer Image</label>
                  <img
                    src={selectedEvent.performerImageUrl}
                    alt={selectedEvent.performerName}
                    className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = '/default-performer.jpg';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeEventModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeEventModal();
                  handleDeleteEvent(selectedEvent._id, selectedEvent.eventName);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Respond Modal */}
      {showRespondModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Respond to Feedback</h3>
              <button
                onClick={closeRespondModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User Email</label>
                <p className="text-sm text-gray-900">{selectedFeedback.userEmail}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Original Feedback</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-900">{selectedFeedback.feedback}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedFeedback.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  selectedFeedback.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedFeedback.status}
                </span>
              </div>

              {selectedFeedback.adminResponse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous Response</label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedFeedback.adminResponse}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response to the user..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeRespondModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRespondSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}









































