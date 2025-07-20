'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/check-auth', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setLoading(false))
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, []);

  const onSubmit = (data) => {
    console.log('Event Data:', data);
    // Handle form submission here
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  if (loading) return <p>Checking authentication...</p>;

  return (
    <div className="container">
      <div className="form-header">
        <h1 className="form-title">
          <span>✨</span> Create New Event
        </h1>
        <p className="form-subtitle">
          Fill in the details to create an amazing event experience
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-body">
        <div className="form-grid">
          {/* Event Name */}
          <div className="form-group full-width">
            <label className="form-label">🎪 Event Name</label>
            <input
              type="text"
              className="form-input"
              {...register('eventName', { required: true })}
              placeholder="Enter event name"
            />
            {errors.eventName && <p className="text-red-500">Event name is required</p>}
          </div>

          {/* Event Description */}
          <div className="form-group full-width">
            <label className="form-label">📝 Event Description</label>
            <textarea
              className="form-textarea"
              {...register('eventDescription', { required: true, maxLength: 1000 })}
              placeholder="Describe your event"
            />
            <div className="char-counter">
              {watch('eventDescription')?.length || 0}/1000 characters
            </div>
            {errors.eventDescription && (
              <p className="text-red-500">Event description is required</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="form-group">
            <label className="form-label">📅 Event Date</label>
            <input type="date" className="form-input" {...register('eventDate', { required: true })} />
          </div>
          <div className="form-group">
            <label className="form-label">⏰ Event Time</label>
            <input type="time" className="form-input" {...register('eventTime', { required: true })} />
          </div>

          {/* Performer Name */}
          <div className="form-group">
            <label className="form-label">🎤 Performer Name</label>
            <input
              type="text"
              className="form-input"
              {...register('performerName', { required: true })}
              placeholder="Enter performer/artist name"
            />
          </div>

          {/* Number of Passes */}
          <div className="form-group">
            <label className="form-label">🎫 Number of Passes</label>
            <input
              type="number"
              className="form-input"
              {...register('numberOfPasses', { required: true, min: 1 })}
              placeholder="Enter total passes"
            />
          </div>

          {/* Price per Pass */}
          <div className="form-group">
            <label className="form-label">💰 Price per Pass</label>
            <div className="price-input-group">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                step="0.01"
                className="form-input price-input"
                {...register('passPrice', { required: true, min: 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Venue/Location */}
          <div className="form-group">
            <label className="form-label">📍 Venue/Location</label>
            <input
              type="text"
              className="form-input"
              {...register('eventVenue', { required: true })}
              placeholder="Enter venue"
            />
          </div>

          {/* Performer Image */}
          <div className="form-group full-width">
            <label className="form-label">🖼️ Performer Image</label>
            <div className="file-upload-area">
              <span className="upload-icon">📸</span>
              <div className="upload-text">Click to upload or drag & drop</div>
              <div className="upload-subtext">PNG, JPG, GIF up to 5MB</div>
              {imagePreview && (
                <img src={imagePreview} className="image-preview" style={{ display: 'block' }} />
              )}
            </div>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              {...register('performerImage')}
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="form-note">
          💡 <strong>Pro Tip:</strong> High-quality images help attract more attendees!
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary w-full" onClick={() => reset()}>
            🔄 Reset Form
          </button>
          <button type="submit" className="btn btn-primary w-full h-full bg-primary">
            🚀 Create Event
          </button>
        </div>
      </form>

      {/* Success Animation (Optional) */}
      <div className="success-animation" id="successAnimation">
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Event Created Successfully!</h2>
          <p className="success-message">
            Your event has been created and is ready to go live.
          </p>
        </div>
      </div>
    </div>
  );
}
