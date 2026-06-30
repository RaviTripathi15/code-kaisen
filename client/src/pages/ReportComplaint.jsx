import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Navigation, AlertCircle, Camera, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const mapPickerIcon = L.divIcon({
  html: '<div class="w-5 h-5 rounded-full bg-gov-500 border-2 border-slate-950 shadow-lg ring-4 ring-gov-500/35"></div>',
  className: 'map-picker-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const ReportComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState([23.2599, 77.4126]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      latitude: 23.2599,
      longitude: 77.4126,
      priority: 'Medium',
    },
  });

  const MapClickEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const roundedLat = parseFloat(lat.toFixed(6));
        const roundedLng = parseFloat(lng.toFixed(6));

        setCoords([lat, lng]);
        setValue('latitude', roundedLat);
        setValue('longitude', roundedLng);
        toast.info(`Location set: ${roundedLat}, ${roundedLng}`);
      },
    });
    return null;
  };

  const handleGPSCapture = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.info('Retrieving GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const roundedLat = parseFloat(latitude.toFixed(6));
        const roundedLng = parseFloat(longitude.toFixed(6));

        setCoords([latitude, longitude]);
        setValue('latitude', roundedLat);
        setValue('longitude', roundedLng);
        toast.success('GPS coordinates retrieved!');
      },
      () => {
        toast.error('Unable to retrieve GPS. Click on the map instead.');
      }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('latitude', data.latitude);
      formData.append('longitude', data.longitude);
      formData.append('ward', data.ward);
      formData.append('complaintType', data.complaintType);
      formData.append('priority', data.priority);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await axios.post('/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Complaint submitted successfully!');
        navigate('/tracking');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Citizen Services"
        breadcrumb="Report Complaint"
        title="Report Utility Issue"
        subtitle="Submit issues like unauthorized digging, leaks, open trenches, or road damage. Your report will be routed to the relevant department."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl border border-slate-850 p-6 sm:p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">Issue Type</label>
                <select
                  className={`glass-select text-sm ${errors.complaintType ? 'glass-input-error' : ''}`}
                  {...register('complaintType', { required: 'Please select an issue type' })}
                >
                  <option value="">Select type</option>
                  <option value="Road Digging">Unauthorized Road Digging</option>
                  <option value="Pothole">Potholes / Broken Surface</option>
                  <option value="Water Leakage">Water Main Leakage</option>
                  <option value="Cable Damage">Exposed / Cut Cables</option>
                  <option value="Open Trench">Unfilled Open Trench</option>
                  <option value="Other">Other Issues</option>
                </select>
                {errors.complaintType && (
                  <p className="form-error">
                    <AlertCircle className="h-3 w-3" />
                    {errors.complaintType.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Ward</label>
                <select
                  className={`glass-select text-sm ${errors.ward ? 'glass-input-error' : ''}`}
                  {...register('ward', { required: 'Please select your ward' })}
                >
                  <option value="">Select ward</option>
                  <option value="Ward 12 (TT Nagar)">Ward 12 (TT Nagar)</option>
                  <option value="Ward 45 (MP Nagar)">Ward 45 (MP Nagar)</option>
                  <option value="Ward 52 (Habibganj)">Ward 52 (Habibganj)</option>
                  <option value="Ward 80 (Kolar)">Ward 80 (Kolar)</option>
                </select>
                {errors.ward && (
                  <p className="form-error">
                    <AlertCircle className="h-3 w-3" />
                    {errors.ward.message}
                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={4}
                placeholder="Describe the issue, nearby landmarks, and severity..."
                className={`glass-textarea text-sm ${errors.description ? 'glass-input-error' : ''}`}
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="form-error">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input type="number" step="0.000001" className="glass-input text-sm opacity-70" {...register('latitude', { required: true })} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input type="number" step="0.000001" className="glass-input text-sm opacity-70" {...register('longitude', { required: true })} readOnly />
              </div>
            </div>

            <button type="button" onClick={handleGPSCapture} className="btn-secondary w-full">
              <Navigation className="h-4 w-4 text-gov-400" />
              Use My Current Location
            </button>

            <div className="form-group border-t border-slate-850 pt-5">
              <label className="form-label">Photo Evidence</label>
              <p className="form-hint mb-3">Optional — attach a photo of the damage or issue</p>

              <div className="flex items-center gap-4">
                <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-5 transition-all duration-200 hover:border-gov-500/60 hover:bg-gov-500/5">
                  <Camera className="mb-2 h-7 w-7 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-400">Upload JPG, PNG, WEBP</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>

                {photoPreview && (
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-700">
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Submit Complaint
                </>
              )}
            </button>
          </form>
        </div>

        <div className="glass-panel flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-850">
          <div className="border-b border-slate-850 bg-slate-900/60 p-5">
            <h3 className="section-title text-sm">
              <MapPin className="h-4 w-4 text-gov-400" />
              Pin Location on Map
            </h3>
            <p className="mt-1.5 text-xs text-slate-400">Click anywhere on the map to set the exact coordinates</p>
          </div>

          <div className="relative min-h-[320px] flex-1">
            <MapContainer center={coords} zoom={13} className="h-full w-full min-h-[320px]">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickEvents />
              <Marker position={coords} icon={mapPickerIcon} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportComplaint;
