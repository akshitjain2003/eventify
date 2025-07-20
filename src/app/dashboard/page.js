import React from 'react'

const page = () => {
  return (
    <div>
      <>
  {/* Topbar */}
  <div className="topbar">
    <div className="logo">
      <img id="logo-topbar" src="Eventify - Copy.png" alt="logo" />
    </div>
    <div className="settings-container">
      <button
        className="settings-btn"
        title="Settings"
      >
        ⚙️
      </button>
      <div className="settings-dropdown" id="settingsDropdown">
        <div className="dropdown-item">
          <span className="dropdown-icon">👤</span>
          Edit Profile
        </div>
        <div className="dropdown-item">
          <span className="dropdown-icon">🚪</span>
          Logout
        </div>
      </div>
    </div>
  </div>
  {/* Main Content */}
  <div className="main-content">
    {/* Cover Photo Section */}
    <div className="cover-section" >
      <div className="cover-overlay">
        <button className="cover-upload-btn">📸 Change Cover Photo</button>
      </div>
    </div>
    {/* Profile Section */}
    <div className="profile-section fade-in w-full">
      <div className="profile-header">
        <div
          className="profile-picture"
         
          title="Change Profile Picture"
        >
          <span id="profileInitial">GH</span>
        </div>
        <div className="profile-info">
          <h1 className="venue-name">Grand Hall Events</h1>
          <div className="venue-location">
            <span className="location-icon">📍</span>
            <span>123 Event Street, Downtown, City 12345</span>
          </div>
        </div>
      </div>
      {/* Action Buttons Section */}
      <div className="action-buttons">
        <a href="/dashboard/form">
          <button className="action-btn">
            <span className="btn-icon">✨</span>
            Create New Event
          </button>
        </a>
        <button className="action-btn secondary" >
          <span className="btn-icon">📊</span>
          Dashboard
        </button>
      </div>
    </div>
  </div>
  {/* Hidden File Inputs */}
  <input
    type="file"
    id="coverPhotoInput"
    className="file-input"
    accept="image/*"
    onchange="handleCoverPhotoUpload(event)"
  />
  <input
    type="file"
    id="profilePhotoInput"
    className="file-input"
    accept="image/*"
    onchange="handleProfilePhotoUpload(event)"
  />
</>

    </div>
  )
}

export default page
