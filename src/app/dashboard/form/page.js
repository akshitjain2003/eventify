'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId'); // will be set for editing
  const isEdit = Boolean(eventId);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

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
            { name: 'eventTime', label: '⏰ Event Time', type: 'time', rules: { required: true } },
            { name: 'performerName', label: '🎤 Performer Name', type: 'text', rules: { required: true } },
            { name: 'numberOfPasses', label: '🎫 Number of Passes', type: 'number', rules: { required: true, min: 1 } },
            { name: 'passPrice', label: '💰 Price per Pass', type: 'number', step: 0.01, rules: { required: true, min: 0 } },
            { name: 'eventVenue', label: '📍 Venue/Location', type: 'text', rules: { required: true } },
          ].map(field => (
            <div key={field.name} className="form-group full-width">
              <label className="form-label">{field.label}</label>
              {field.type !== 'textarea' ? (
                <input
                  type={field.type}
                  step={field.step}
                  className="form-input"
                  {...register(field.name, field.rules)}
                  placeholder={`Enter ${field.label.split(' ').slice(1).join(' ')}`}
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
