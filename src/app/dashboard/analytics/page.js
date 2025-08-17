'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Note: In your actual project, you'll need to install jsPDF and jsPDF-AutoTable:
// npm install jspdf jspdf-autotable

const VenueAnalytics = () => {
  const router = useRouter();
  const [venue, setVenue] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuyersModal, setShowBuyersModal] = useState(false);
  const [selectedEventBuyers, setSelectedEventBuyers] = useState([]);
  const [selectedEventName, setSelectedEventName] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalProfit: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const venueData = localStorage.getItem('venue');
    
    console.log('Token:', token ? 'exists' : 'missing');
    console.log('Venue data:', venueData);
    
    if (!token || !venueData) {
      router.push('/venue/login');
      return;
    }

    try {
      const parsedVenue = JSON.parse(venueData);
      console.log('Parsed venue:', parsedVenue);
      setVenue(parsedVenue);
      
      // Use the correct venue ID field
      const venueId = parsedVenue._id || parsedVenue.id;
      console.log('Using venue ID:', venueId);
      
      if (venueId) {
        fetchEventAnalytics(venueId);
      } else {
        console.error('No venue ID found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error parsing venue data:', error);
      router.push('/venue/login');
    }
  }, [router]);

  const fetchEventAnalytics = async (venueId) => {
    try {
      console.log('Fetching analytics for venue:', venueId);
      const res = await fetch(`/api/events/analytics?venueId=${venueId}`);
      const data = await res.json();
      
      console.log('Analytics response:', data);
      
      if (res.ok) {
        setEvents(data.events);
        calculateStats(data.events);
      } else {
        console.error('Error response:', data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (eventsData) => {
    console.log('Calculating stats for events:', eventsData);
    
    const stats = eventsData.reduce((acc, event) => {
      const ticketsSold = event.ticketsSold || 0;
      const revenue = event.revenue || (ticketsSold * event.passPrice);
      const commission = revenue * 0.05;
      const isUpcoming = new Date(event.eventDate) > new Date();

      console.log(`Event ${event.eventName}: sold=${ticketsSold}, revenue=${revenue}, commission=${commission}`);

      return {
        totalEvents: acc.totalEvents + 1,
        totalTicketsSold: acc.totalTicketsSold + ticketsSold,
        totalRevenue: acc.totalRevenue + revenue,
        totalCommission: acc.totalCommission + commission,
        totalProfit: acc.totalProfit + (revenue - commission),
        upcomingEvents: acc.upcomingEvents + (isUpcoming ? 1 : 0)
      };
    }, { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, totalCommission: 0, totalProfit: 0, upcomingEvents: 0 });

    console.log('Final stats:', stats);
    setTotalStats(stats);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="text-white text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const fetchEventBuyers = async (eventId, eventName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/buyers/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedEventBuyers(data.buyers || []);
        setSelectedEventName(eventName);
        setShowBuyersModal(true);
      } else {
        alert('Failed to fetch buyers');
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
      alert('Error fetching buyers');
    }
  };

  const downloadBuyersPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Create HTML content for PDF generation
      const totalBuyers = selectedEventBuyers.length;
      const totalTickets = selectedEventBuyers.reduce((sum, buyer) => sum + (buyer.ticketQuantity || 0), 0);
      const totalRevenue = selectedEventBuyers.reduce((sum, buyer) => sum + (buyer.totalAmount || 0), 0);
      
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Event Buyers Report</title>
            <meta charset="utf-8">
            <style>
              @page {
                margin: 0.75in;
                size: A4;
              }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0;
                padding: 20px;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
              }
              .header {
                border-bottom: 3px solid #4f46e5;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              h1 { 
                color: #4f46e5; 
                margin: 0 0 15px 0;
                font-size: 24px;
                font-weight: bold;
              }
              .event-info {
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                border-left: 4px solid #4f46e5;
              }
              .event-info p {
                margin: 5px 0;
                font-weight: 500;
              }
              .summary { 
                background: #f0f9ff;
                padding: 20px; 
                margin: 25px 0; 
                border-radius: 8px;
                border: 1px solid #0ea5e9;
              }
              .summary h3 {
                color: #0369a1;
                margin: 0 0 15px 0;
                font-size: 16px;
              }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
              }
              .summary-item {
                text-align: center;
                padding: 10px;
                background: white;
                border-radius: 6px;
                border: 1px solid #e0e7ff;
              }
              .summary-item .value {
                font-size: 18px;
                font-weight: bold;
                color: #4f46e5;
                margin-bottom: 5px;
              }
              .summary-item .label {
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 25px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
              }
              th { 
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                color: white;
                padding: 12px 8px;
                text-align: left;
                font-weight: 600;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              td { 
                padding: 10px 8px; 
                border-bottom: 1px solid #e5e7eb;
                font-size: 11px;
              }
              tr:nth-child(even) { 
                background-color: #f9fafb; 
              }
              tr:hover {
                background-color: #f3f4f6;
              }
              .amount {
                font-weight: 600;
                color: #059669;
              }
              .footer { 
                margin-top: 40px; 
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 10px; 
                color: #6b7280;
                text-align: center;
              }
              .no-data {
                text-align: center;
                padding: 40px;
                color: #6b7280;
                font-style: italic;
              }
              @media print {
                body { print-color-adjust: exact; }
                .summary { page-break-inside: avoid; }
                tr { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Event Buyers Report</h1>
            </div>
            
            <div class="event-info">
              <p><strong>Event:</strong> ${selectedEventName}</p>
              <p><strong>Venue:</strong> ${venue?.venueName || 'Unknown Venue'}</p>
              <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary">
              <h3>Executive Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="value">${totalBuyers}</div>
                  <div class="label">Total Buyers</div>
                </div>
                <div class="summary-item">
                  <div class="value">${totalTickets}</div>
                  <div class="label">Tickets Sold</div>
                </div>
                <div class="summary-item">
                  <div class="value">₹${totalRevenue.toLocaleString()}</div>
                  <div class="label">Total Revenue</div>
                </div>
              </div>
            </div>
            
            ${selectedEventBuyers.length === 0 ? 
              '<div class="no-data">No buyer data available for this event.</div>' :
              `<table>
                <thead>
                  <tr>
                    <th style="width: 25%">Buyer Name</th>
                    <th style="width: 20%">Mobile Number</th>
                    <th style="width: 15%">Tickets</th>
                    <th style="width: 20%">Amount Paid</th>
                    <th style="width: 20%">Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${selectedEventBuyers.map((buyer, index) => `
                    <tr>
                      <td><strong>${buyer.name || 'N/A'}</strong></td>
                      <td>${buyer.mobile || 'N/A'}</td>
                      <td style="text-align: center">${buyer.ticketQuantity || 0}</td>
                      <td class="amount">₹${(buyer.totalAmount || 0).toLocaleString()}</td>
                      <td>${buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`
            }
            
            <div class="footer">
              <p>This report was generated automatically by the venue management system.</p>
              <p>For any queries regarding this report, please contact the venue administration.</p>
              <p>Report ID: ${selectedEventName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}</p>
            </div>
          </body>
        </html>
      `;
      
      // Create and open print window
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
      }
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Close after printing
          printWindow.addEventListener('afterprint', () => {
            printWindow.close();
          });
          
          // Fallback close after 10 seconds
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
            }
          }, 10000);
        }, 500);
      });
      
      // Show success message
      setTimeout(() => {
        alert('Print dialog opened! Please save as PDF from the print options.');
      }, 800);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Simple fallback - create a CSV download
      try {
        const csvContent = [
          ['Buyer Name', 'Mobile', 'Tickets', 'Amount', 'Purchase Date'],
          ...selectedEventBuyers.map(buyer => [
            buyer.name || 'N/A',
            buyer.mobile || 'N/A',
            buyer.ticketQuantity || 0,
            buyer.totalAmount || 0,
            buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : 'N/A'
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedEventName.replace(/[^a-z0-9]/gi, '_')}_buyers_report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('PDF generation failed. Downloaded as CSV file instead.');
        
      } catch (csvError) {
        console.error('CSV fallback error:', csvError);
        alert('Unable to generate report. Please try again or contact support.');
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-800 text-4xl"
            >
              ← 
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          {venue && (
            <div className="flex items-center gap-3">
              <Image 
                src={venue.images?.[0] || '/default-venue.jpg'} 
                alt={venue.venueName}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium text-gray-700">{venue.venueName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={totalStats.totalEvents}
            icon="🎪"
            color="bg-blue-500"
          />
          <StatCard
            title="Tickets Sold"
            value={totalStats.totalTicketsSold}
            icon="🎫"
            color="bg-green-500"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${totalStats.totalRevenue.toLocaleString()}`}
            icon="💰"
            color="bg-purple-500"
          />
          <StatCard
            title="Commission Paid"
            value={`₹${totalStats.totalCommission.toLocaleString()}`}
            icon="💳"
            color="bg-red-500"
          />
          <StatCard
            title="Net Profit"
            value={`₹${totalStats.totalProfit.toLocaleString()}`}
            icon="📈"
            color="bg-emerald-500"
          />
          <StatCard
            title="Upcoming Events"
            value={totalStats.upcomingEvents}
            icon="📅"
            color="bg-orange-500"
          />
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Event History & Performance</h2>
          </div>
          
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {events.map((event) => {
                const ticketsSold = event.ticketsSold || 0;
                const revenue = event.revenue || (ticketsSold * event.passPrice);
                const totalTickets = event.originalPasses || event.numberOfPasses;
                const isUpcoming = new Date(event.eventDate) > new Date();
                
                const soldPercentage = totalTickets > 0 ? Math.min(100, ((ticketsSold / totalTickets) * 100)) : 0;

                return (
                  <div 
                    key={event._id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => fetchEventBuyers(event._id, event.eventName)}
                  >
                    <img
                      src={event.performerImageUrl || '/default-event.jpg'}
                      alt={event.eventName}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.eventName}</h3>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        📅 {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
                      </p>
                      <p className="text-gray-600">🎤 {event.performerName}</p>
                      
                      <div className="bg-gray-50 p-3 rounded-md mt-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Tickets Sold:</span>
                            <p className="font-semibold text-green-600">{ticketsSold}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Revenue:</span>
                            <p className="font-semibold text-purple-600">₹{revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <p className="font-semibold">₹{event.passPrice}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Available:</span>
                            <p className="font-semibold text-blue-600">{event.numberOfPasses}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Sold</span>
                            <span>{soldPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(100, soldPercentage)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isUpcoming 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isUpcoming ? 'Upcoming' : 'Completed'}
                        </span>
                        
                        {event.numberOfPasses <= 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            Sold Out
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        Click to view buyers →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Buyers Modal */}
      {showBuyersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Buyers for "{selectedEventName}"
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadBuyersPDF}
                  disabled={isGeneratingPDF || selectedEventBuyers.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isGeneratingPDF || selectedEventBuyers.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowBuyersModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {selectedEventBuyers.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No buyers found for this event.</p>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Buyers:</span>
                      <p className="font-semibold text-blue-600">{selectedEventBuyers.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Tickets:</span>
                      <p className="font-semibold text-blue-600">
                        {selectedEventBuyers.reduce((sum, buyer) => sum + (buyer.ticketQuantity || 0), 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Revenue:</span>
                      <p className="font-semibold text-blue-600">
                        ₹{selectedEventBuyers.reduce((sum, buyer) => sum + (buyer.totalAmount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Buyer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tickets
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchase Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedEventBuyers.map((buyer, index) => (
                        <tr key={buyer._id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {buyer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {buyer.mobile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {buyer.ticketQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{buyer.totalAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(buyer.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueAnalytics;