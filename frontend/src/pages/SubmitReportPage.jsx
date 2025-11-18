import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js'; 
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from 'axios'; 

import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { 
  FaCamera, 
  FaChevronLeft, 
  FaSpinner, 
  FaCopy,
  FaLocationCrosshairs // For "Locate Me" button
} from "react-icons/fa6"; 
import{
      FaMapMarkerAlt,
    FaCheckCircle
}from"react-icons/fa";
// Leaflet
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Reverse Geocoding Helper ---
const getAddressFromCoords = async (lat, lng) => {
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    if (res.data && res.data.display_name) {
      return res.data.display_name;
    }
    return "";
  } catch (err) {
    console.error("Address lookup failed:", err.message);
    return ""; 
  }
};

// --- Map Controller Component ---
// Handles map clicks and "FlyTo" animations
function MapController({ onLocationSet, onAddressSet, centerLocation }) {
    const map = useMap();
    const [marker, setMarker] = useState(null);

    // Handle manual map clicks
    useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng;
            setMarker(e.latlng);
            onLocationSet({ lat, lng });
            
            const toastId = toast.loading('Fetching address...');
            const address = await getAddressFromCoords(lat, lng);
            toast.dismiss(toastId);
            
            if (address) {
              onAddressSet(address);
            }
        },
    });

    // Update map view when centerLocation changes (e.g. via GPS)
    useEffect(() => {
        if (centerLocation) {
            map.flyTo([centerLocation.lat, centerLocation.lng], 15);
            setMarker([centerLocation.lat, centerLocation.lng]);
        }
    }, [centerLocation, map]);

    return marker ? <Marker position={marker} /> : null;
}

function SubmitReportPage() {
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('Joura'); 
    const [address, setAddress] = useState(''); // Optional address
    const [severity, setSeverity] = useState('Low');
    const [image, setImage] = useState(null);
    
    // Location state
    const [location, setLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(null); // For auto-centering

    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [submittedReportId, setSubmittedReportId] = useState(null);

    const navigate = useNavigate();

    // --- Auto-Detect Location on Mount ---
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const lat = latitude;
                    const lng = longitude;
                    
                    // Set location state
                    setLocation({ lat, lng });
                    setMapCenter({ lat, lng }); // Trigger map flyTo

                    // Auto-fill address
                    const detectedAddress = await getAddressFromCoords(lat, lng);
                    if (detectedAddress) {
                        setAddress(detectedAddress);
                        toast.success("Location detected & address filled!");
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    // Default fallback is handled by initial MapContainer center
                }
            );
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(submittedReportId);
        toast.success('Report ID copied!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) return toast.error("Please upload an image.");
        if (!location) return toast.error("Please select a location on the map.");
        if (!city) return toast.error("Please enter your city.");

        setIsLoading(true);
        const loadingToast = toast.loading('Submitting report...');

        const formData = new FormData();
        formData.append('image', image);
        formData.append('description', description);
        formData.append('city', city);
        formData.append('severity', severity);
        formData.append('lat', location.lat);
        formData.append('lng', location.lng);
        formData.append('address', address); 

        try {
            const response = await api.post('/reports/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.dismiss(loadingToast);
            toast.success('Report submitted!');
            setSubmittedReportId(response.data.reportId);

        } catch (error) {
            toast.dismiss(loadingToast);
            setIsLoading(false);
            console.error("Report error:", error);
            toast.error(error.response?.data?.message || "Submit failed");
        }
    };

    // --- SUCCESS VIEW ---
    if (submittedReportId) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="text-center p-8">
                        <FaCheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900">Report Submitted!</h1>
                        <p className="text-gray-600 mt-2">Thank you. Track your report status using this ID:</p>
                        
                        <div className="my-6 p-4 bg-green-50 border border-green-200 rounded-xl font-mono text-xl font-bold text-green-800 break-all tracking-wider">
                            {submittedReportId}
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <Button variant="primary" onClick={copyToClipboard} className="w-full flex justify-center items-center gap-2 py-3 text-lg">
                                <FaCopy /> Copy Report ID
                            </Button>
                            <Button variant="outline" onClick={() => navigate(`/track/${submittedReportId}`)} className="w-full py-3">
                                Track Status Now
                            </Button>
                        </div>
                        
                        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-green-600 mt-8 block underline">
                            Back to Home
                        </Link>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // --- FORM VIEW ---
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto p-4 flex items-center">
                    <Link to="/" className="text-gray-600 hover:text-green-600">
                        <FaChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800 ml-4">Submit a New Report</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4">
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="space-y-8 p-6 md:p-8">
                        
                        {/* 1. Image Upload (Bigger & Better) */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                1. Upload Photo <span className="text-red-500">*</span>
                            </label>
                            <label 
                                htmlFor="file-upload" 
                                className={`
                                    relative flex flex-col justify-center items-center w-full h-80 
                                    border-3 border-dashed rounded-xl cursor-pointer overflow-hidden
                                    transition-all duration-200 group
                                    ${imagePreview 
                                        ? 'border-green-500 bg-black' 
                                        : 'border-gray-300 hover:border-green-500 hover:bg-green-50'}
                                `}
                            >
                                {imagePreview ? (
                                    <>
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="absolute inset-0 w-full h-full object-contain z-10" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <FaCamera /> Click to Change
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-4 bg-green-100 rounded-full mb-3 text-green-600 group-hover:bg-green-200 transition-colors">
                                            <FaCamera className="w-8 h-8" />
                                        </div>
                                        <p className="mb-2 text-lg text-gray-600">
                                            <span className="font-bold text-green-700">Click to upload</span>
                                        </p>
                                        <p className="text-sm text-gray-500">JPG, PNG, or JPEG</p>
                                    </div>
                                )}
                                <input type="file" id="file-upload" className="hidden"
                                    accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        {/* 2. Location (With "Locate Me") */}
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <label className="block text-lg font-semibold text-gray-800">
                                    2. Location <span className="text-red-500">*</span>
                                </label>
                                {location && (
                                     <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">
                                        {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                     </span>
                                )}
                            </div>
                            
                            <div className="h-72 w-full rounded-xl overflow-hidden border border-gray-300 shadow-inner z-0 relative">
                                <MapContainer center={[26.2183, 78.1828]} zoom={13}
                                    style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapController 
                                        onLocationSet={setLocation} 
                                        onAddressSet={setAddress} 
                                        centerLocation={mapCenter}
                                    />
                                </MapContainer>
                                
                                {/* GPS Button overlay */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            setMapCenter({ 
                                                lat: pos.coords.latitude, 
                                                lng: pos.coords.longitude 
                                            });
                                        });
                                    }}
                                    className="absolute bottom-4 right-4 z-[400] bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 text-gray-700"
                                    title="Use My Current Location"
                                >
                                    <FaLocationCrosshairs className="w-6 h-6" />
                                </button>

                                {!location && (
                                    <div className="absolute top-0 left-0 w-full bg-yellow-50/90 text-yellow-800 text-sm py-2 text-center z-[400] border-b border-yellow-200">
                                        Tap map or use GPS button to pin location.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Address (Auto-filled) */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-green-600 text-xs font-normal">(Auto-Detected, Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Pinned address will appear here..."
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                                    placeholder="e.g., Joura"
                                    required
                                />
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <select
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none bg-white transition-all"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(Optional)</span></label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none transition-all"
                                placeholder="Describe the waste issue..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    variant="primary"
                                    size="lg"
                                    className="w-full flex justify-center items-center shadow-lg py-4 text-lg"
                                >
                                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : "Submit Report"}
                                </Button>
                            </motion.div>
                        </div>

                    </Card>
                </motion.form>
            </main>
        </div>
    );
}

export default SubmitReportPage;