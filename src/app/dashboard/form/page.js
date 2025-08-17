'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { jwtDecode } from 'jwt-decode';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId'); // will be set for editing
  const isEdit = Boolean(eventId);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  // Add state for slider time
  const [sliderTime, setSliderTime] = useState({ hours: 12, minutes: 0 });
  // Add state for Android clock picker
  const [showClockPicker, setShowClockPicker] = useState(false);
  const [clockTime, setClockTime] = useState({ hour: 12, minute: 0, period: 'AM' });
  const [clockMode, setClockMode] = useState('hour'); // 'hour' or 'minute'
  // Add state for venue info
  const [venue, setVenue] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  // Handle slider changes
  const handleSliderChange = (type, value) => {
    const newTime = { ...sliderTime, [type]: parseInt(value) };
    setSliderTime(newTime);
    
    const timeString = `${newTime.hours.toString().padStart(2, '0')}:${newTime.minutes.toString().padStart(2, '0')}`;
    setValue('eventTime', timeString);
  };

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    fetch('/api/check-auth', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error();
      setLoadingAuth(false);
    }).catch(() => {
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, []);

  // Fetch venue info on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const venueData = JSON.parse(localStorage.getItem('venue') || '{}');
        setVenue(venueData);
        
        // Pre-fill venue name if creating new event
        if (!isEdit && venueData.venueName) {
          setValue('eventVenue', venueData.venueName);
        }
      } catch (error) {
        console.error('Error getting venue info:', error);
      }
    }
  }, [setValue, isEdit]);

  // Fetch existing event for edit
  useEffect(() => {
    if (!isEdit) return;

    fetch(`/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        ['eventName','eventDescription','eventDate','eventTime','performerName','numberOfPasses','passPrice','eventVenue']
          .forEach(k => setValue(k, data[k]));
        if (data.performerImageUrl) {
          setImagePreview(data.performerImageUrl);
        }
      })
      .catch(console.error);
  }, [eventId, isEdit, setValue]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async formData => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authorized');

      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'performerImage') {
          if (v[0]) payload.append(k, v[0]);
        } else if (k === 'numberOfPasses') {
          payload.append(k, v);
          payload.append('totalPasses', v); // Set totalPasses same as numberOfPasses initially
        } else {
          payload.append(k, v);
        }
      });

      const url = isEdit ? `/api/events/update/${eventId}` : '/api/events/create';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      alert(`Event ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loadingAuth) return <p>Checking authentication...</p>;

  // Android clock picker component
  const AndroidClockPicker = () => {
    const centerX = 120;
    const centerY = 120;
    const radius = 80;
    
    const handleClockClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - centerX;
      const y = e.clientY - rect.top - centerY;
      const angle = Math.atan2(y, x) * 180 / Math.PI;
      const normalizedAngle = (angle + 90 + 360) % 360;
      
      if (clockMode === 'hour') {
        let hour = Math.round(normalizedAngle / 30) % 12;
        // Fix: Convert 0 back to 12 for display
        if (hour === 0) hour = 12;
        setClockTime(prev => ({ ...prev, hour }));
      } else {
        const minute = Math.round(normalizedAngle / 6) % 60;
        setClockTime(prev => ({ ...prev, minute }));
      }
    };
    
    const getClockNumbers = () => {
      if (clockMode === 'hour') {
        return Array.from({length: 12}, (_, i) => {
          const num = i === 0 ? 12 : i; // Fix: 12 should be at top (index 0)
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x = centerX + radius * 0.8 * Math.cos(angle);
          const y = centerY + radius * 0.8 * Math.sin(angle);
          
          return (
            <text
              key={num}
              x={x}
              y={y + 5}
              textAnchor="middle"
              className="clock-number"
              fill="#333"
              fontSize="14"
              fontWeight="600"
            >
              {num}
            </text>
          );
        });
      } else {
        return Array.from({length: 12}, (_, i) => {
          const num = i * 5;
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x = centerX + radius * 0.8 * Math.cos(angle);
          const y = centerY + radius * 0.8 * Math.sin(angle);
          
          return (
            <text
              key={num}
              x={x}
              y={y + 5}
              textAnchor="middle"
              className="clock-number"
              fill="#333"
              fontSize="12"
              fontWeight="600"
            >
              {num.toString().padStart(2, '0')}
            </text>
          );
        });
      }
    };
    
    const getClockHand = () => {
      let value = clockMode === 'hour' ? clockTime.hour : clockTime.minute;
      const maxValue = clockMode === 'hour' ? 12 : 60;
      
      // Fix: Convert 12 to 0 for angle calculation
      if (clockMode === 'hour' && value === 12) {
        value = 0;
      }
      
      const angle = ((value * (360 / maxValue)) - 90) * Math.PI / 180;
      const handLength = radius * 0.6;
      const x = centerX + handLength * Math.cos(angle);
      const y = centerY + handLength * Math.sin(angle);
      
      return (
        <g>
          <line
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="#667eea"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={x}
            cy={y}
            r="8"
            fill="#667eea"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="6"
            fill="#667eea"
          />
        </g>
      );
    };
    
    return (
      <div className="android-clock-picker">
        <div className="clock-header">
          <div className="time-display">
            <button
              type="button"
              className={`time-part ${clockMode === 'hour' ? 'active' : ''}`}
              onClick={() => setClockMode('hour')}
            >
              {clockTime.hour.toString().padStart(2, '0')}
            </button>
            <span className="time-separator">:</span>
            <button
              type="button"
              className={`time-part ${clockMode === 'minute' ? 'active' : ''}`}
              onClick={() => setClockMode('minute')}
            >
              {clockTime.minute.toString().padStart(2, '0')}
            </button>
            <div className="period-selector">
              <button
                type="button"
                className={`period-btn ${clockTime.period === 'AM' ? 'active' : ''}`}
                onClick={() => setClockTime(prev => ({ ...prev, period: 'AM' }))}
              >
                AM
              </button>
              <button
                type="button"
                className={`period-btn ${clockTime.period === 'PM' ? 'active' : ''}`}
                onClick={() => setClockTime(prev => ({ ...prev, period: 'PM' }))}
              >
                PM
              </button>
            </div>
          </div>
        </div>
        
        <div className="clock-face" onClick={handleClockClick}>
          <svg width="240" height="240">
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="rgba(102, 126, 234, 0.1)"
              stroke="rgba(102, 126, 234, 0.3)"
              strokeWidth="2"
            />
            {getClockNumbers()}
            {getClockHand()}
          </svg>
        </div>
        
        <div className="clock-actions">
          <button
            type="button"
            className="clock-btn cancel"
            onClick={() => setShowClockPicker(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="clock-btn ok"
            onClick={() => {
              const timeString = `${clockTime.hour.toString().padStart(2, '0')}:${clockTime.minute.toString().padStart(2, '0')} ${clockTime.period}`;
              setValue('eventTime', timeString);
              setShowClockPicker(false);
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="form-header">
        <h1 className="form-title">
          <span>✨</span> {isEdit ? 'Edit Event' : 'Create New Event'}
        </h1>
        <p className="form-subtitle">
          {isEdit ? 'Make changes & save' : 'Fill in the details to create an amazing event experience'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-body">
        <div className="form-grid">
          {/* fields */}
          {[
            { name: 'eventName', label: '🎪 Event Name', type: 'text', rules: { required: true } },
            { name: 'eventDescription', label: '📝 Event Description', type: 'textarea', rules: { required: true, maxLength: 1000 } },
            { name: 'eventDate', label: '📅 Event Date', type: 'date', rules: { required: true } },
            { name: 'eventTime', label: '⏰ Event Time', type: 'android-clock', rules: { required: true } },
            { name: 'performerName', label: '🎤 Performer Name', type: 'text', rules: { required: true } },
            { name: 'numberOfPasses', label: '🎫 Number of Passes', type: 'number', rules: { required: true, min: 1 } },
            { name: 'passPrice', label: '💰 Price per Pass', type: 'number', step: 0.01, rules: { required: true, min: 0 } },
            { name: 'eventVenue', label: '📍 Venue/Location', type: 'text', rules: { required: true }, readOnly: true },
          ].map(field => (
            <div key={field.name} className="form-group full-width">
              <label className="form-label">{field.label}</label>
              {field.type === 'android-clock' ? (
                <div className="android-time-input">
                  <input
                    type="text"
                    className="form-input"
                    value={watch('eventTime') || '12:00 AM'}
                    readOnly
                    onClick={() => setShowClockPicker(true)}
                    placeholder="Select time"
                  />
                  {showClockPicker && (
                    <div className="clock-overlay">
                      <div className="clock-modal">
                        <AndroidClockPicker />
                      </div>
                    </div>
                  )}
                </div>
              ) : field.type !== 'textarea' ? (
                <input
                  type={field.type}
                  step={field.step}
                  className={`form-input ${field.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  {...register(field.name, field.rules)}
                  placeholder={field.readOnly ? venue?.venueName || 'Venue Name' : `Enter ${field.label.split(' ').slice(1).join(' ')}`}
                  readOnly={field.readOnly}
                />
              ) : (
                <textarea
                  className="form-textarea"
                  {...register(field.name, field.rules)}
                  placeholder="Describe your event"
                />
              )}
              {errors[field.name] && <p className="text-red-500">{field.label} is required</p>}
              {field.name === 'eventDescription' && !errors.eventDescription && (
                <div className="char-counter">
                  {watch('eventDescription')?.length || 0}/1000 characters
                </div>
              )}
            </div>
          ))}

          {/* Image upload */}
          <div className="form-group full-width">
            <label className="form-label">🖼️ Performer Image</label>
            <div className="file-upload-area">
              <span className="upload-icon">📸</span>
              <div className="upload-text">Click to upload or drag & drop</div>
              <div className="upload-subtext">PNG, JPG, GIF up to 5MB</div>
              {imagePreview && <img src={imagePreview} className="image-preview" style={{ display: 'block' }} />}
            </div>
            <input
              type="file"
              accept="image/*"
              {...register('performerImage')}
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="form-note">
          💡 <strong>Pro Tip:</strong> High‑quality images help attract more attendees!
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary w-full" onClick={() => reset()}>
            🔄 Reset Form
          </button>
          <button type="submit" className="btn btn-primary w-full">
            {isEdit ? 'Save Changes' : '🚀 Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
