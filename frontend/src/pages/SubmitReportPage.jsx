import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js'; // --- FIXED: Added .js
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// --- FIXED --- All icons from fa6
import {
    FaCamera,
    FaChevronLeft,
    FaSpinner,
    FaMapMarkerAlt
} from "react-icons/fa";

// Leaflet
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Map click → set marker location
function LocationPicker({ onLocationSet }) {
    const [marker, setMarker] = useState(null);

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setMarker(e.latlng);
            onLocationSet({ lat, lng });
        },
    });

    return marker ? <Marker position={marker} /> : null;
}

function SubmitReportPage() {
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');
    const [severity, setSeverity] = useState('Low');
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) return toast.error("Please upload an image.");
        if (!location) return toast.error("Please select a location on the map.");
        if (!city) return toast.error("Please enter your city.");

        setIsLoading(true);
        const loadingToast = toast.loading('Submitting report...');

        // FormData for backend (multer expects field name: 'image')
        const formData = new FormData();
        formData.append('image', image);   // ✅ FIXED for multer
        formData.append('description', description);
        formData.append('city', city);
        formData.append('severity', severity);
        formData.append('lat', location.lat);
        formData.append('lng', location.lng);

        try {
            const response = await api.post('/reports/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.dismiss(loadingToast);
            toast.success('Report submitted successfully!');

            navigate(`/track/${response.data.reportId}`);

        } catch (error) {
            toast.dismiss(loadingToast);
            setIsLoading(false);
            console.error("Report error:", error);
            toast.error(error.response?.data?.message || "Submit failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="max-w-4xl mx-auto p-4 flex items-center">
                    <Link to="/" className="text-gray-600 hover:text-primary">
                        <FaChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800 ml-4">Submit a New Report</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4">
                <motion.form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-lg shadow-lg space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >

                    {/* Image upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            1. Upload Photo (Required)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 
                            border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="mx-auto h-40 w-auto rounded-md" />
                                ) : (
                                    <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                                )}

                                <div className="flex text-sm text-gray-600 justify-center items-center gap-1 mt-2">
                                    <label htmlFor="file-upload"
                                        className="cursor-pointer bg-white font-medium text-primary hover:text-primary-dark">
                                        Upload
                                        <input type="file" id="file-upload" className="sr-only"
                                            accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <span>or drag & drop</span>
                                </div>

                                <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            2. Pin the Location (Required)
                        </label>
                        <div className="h-64 w-full rounded-md overflow-hidden z-0">
                            <MapContainer center={[26.3364, 77.8093]} zoom={13}
                                style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationPicker onLocationSet={setLocation} />
                            </MapContainer>
                        </div>

                        {location && (
                            <p className="text-sm text-green-600 font-medium mt-2">
                                <FaMapMarkerAlt className="inline mr-1" />
                                Location Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">3. City (Required)</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-3 mt-1 border rounded-lg shadow-sm"
                            placeholder="e.g., Joura"
                        />
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">4. Severity</label>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="w-full px-4 py-3 mt-1 border rounded-lg shadow-sm"
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">5. Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 mt-1 border rounded-lg shadow-sm"
                            placeholder="e.g., Overflowing garbage near road."
                        />
                    </div>

                    {/* Submit */}
                    <div>
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 
             text-lg font-medium text-white bg-blue-600 rounded-lg
             hover:bg-blue-700 disabled:bg-gray-400"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? <FaSpinner className="animate-spin mr-2" /> : "Submit Report"}
                        </motion.button>
                    </div>

                </motion.form>
            </main>
        </div>
    );
}

export default SubmitReportPage;