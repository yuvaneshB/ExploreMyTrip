import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import { Book } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchDestinationSuggestions } from '../services/geoapifyService.js';

const AgentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('tours'); // 'tours', 'create', 'setup', 'reviews'

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/create-tour')) {
      setActiveTab('create');
    } else if (path.endsWith('/locations')) {
      setActiveTab('setup');
    } else if (path.endsWith('/reviews')) {
      setActiveTab('reviews');
    } else if (path.endsWith('/bookings')) {
      setActiveTab('bookings');
    } else {
      setActiveTab('tours');
    }
  }, [location.pathname]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName !== 'create' || !editingTourId) {
      setEditingTourId(null);
      resetFormFields();
    }
    if (tabName === 'tours') {
      navigate('/dashboard/agent');
    } else if (tabName === 'create') {
      navigate('/dashboard/agent/create-tour');
    } else if (tabName === 'setup') {
      navigate('/dashboard/agent/locations');
    } else if (tabName === 'reviews') {
      navigate('/dashboard/agent/reviews');
    } else if (tabName === 'bookings') {
      navigate('/dashboard/agent/bookings');
    }
  };
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsStats, setBookingsStats] = useState(null);

  // Seeder fields for Category & Destination
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [destName, setDestName] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');

  // Tour Builder Fields
  const [tourTitle, setTourTitle] = useState('');
  const [tourStartTime, setTourStartTime] = useState('');

  const formatTime12hr = (timeStr) => {
    if (!timeStr) return '09:00 AM';
    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
      return timeStr;
    }
    const [hourStr, minStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const hour12Str = hour12 < 10 ? `0${hour12}` : `${hour12}`;
    return `${hour12Str}:${minStr || '00'} ${ampm}`;
  };
  const [tourLocation, setTourLocation] = useState('');
  const [tourDesc, setTourDesc] = useState('');
  const [tourDays, setTourDays] = useState(3);
  const [tourCat, setTourCat] = useState('');
  const [tourDests, setTourDests] = useState([]);
  const [tourStandardPrice, setTourStandardPrice] = useState('');
  const [tourDeluxePrice, setTourDeluxePrice] = useState('');
  const [tourLuxuryPrice, setTourLuxuryPrice] = useState('');
  const [tourHighlights, setTourHighlights] = useState('');
  const [tourInclusions, setTourInclusions] = useState('');
  const [tourExclusions, setTourExclusions] = useState('');
  const [depDate, setDepDate] = useState('');
  const [depSeats, setDepSeats] = useState(20);
  const [departuresList, setDeparturesList] = useState([]);
  
  // Map fields
  const [startLocName, setStartLocName] = useState('');
  const [startLat, setStartLat] = useState('');
  const [startLng, setStartLng] = useState('');
  const [endLocName, setEndLocName] = useState('');
  const [endLat, setEndLat] = useState('');
  const [endLng, setEndLng] = useState('');

  // Auto-fill coordinates state
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState(null);
  const [lastResolvedStartName, setLastResolvedStartName] = useState('');

  const [endSuggestions, setEndSuggestions] = useState([]);
  const [endLoading, setEndLoading] = useState(false);
  const [endError, setEndError] = useState(null);
  const [lastResolvedEndName, setLastResolvedEndName] = useState('');

  // Start Location Resolution Debounce Effect
  useEffect(() => {
    if (!startLocName || startLocName.trim() === '') {
      setStartSuggestions([]);
      setStartLat('');
      setStartLng('');
      setStartError(null);
      return;
    }
    if (startLocName === lastResolvedStartName) {
      setStartSuggestions([]);
      return;
    }

    // Immediately clear coordinates if the name has changed and doesn't match last resolved
    setStartLat('');
    setStartLng('');
    setStartError(null);

    const delayDebounce = setTimeout(async () => {
      setStartLoading(true);
      setStartError(null);
      try {
        const results = await fetchDestinationSuggestions(startLocName);
        setStartSuggestions(results);
      } catch (err) {
        console.error('Start location suggestions fetch failed:', err.message);
      } finally {
        setStartLoading(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [startLocName, lastResolvedStartName]);

  // End Location Resolution Debounce Effect
  useEffect(() => {
    if (!endLocName || endLocName.trim() === '') {
      setEndSuggestions([]);
      setEndLat('');
      setEndLng('');
      setEndError(null);
      return;
    }
    if (endLocName === lastResolvedEndName) {
      setEndSuggestions([]);
      return;
    }

    // Immediately clear coordinates if the name has changed and doesn't match last resolved
    setEndLat('');
    setEndLng('');
    setEndError(null);

    const delayDebounce = setTimeout(async () => {
      setEndLoading(true);
      setEndError(null);
      try {
        const results = await fetchDestinationSuggestions(endLocName);
        setEndSuggestions(results);
      } catch (err) {
        console.error('End location suggestions fetch failed:', err.message);
      } finally {
        setEndLoading(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [endLocName, lastResolvedEndName]);

  // Suggestion selection handlers
  const handleSelectStartSuggestion = (s) => {
    setStartLocName(s.formattedAddress);
    setStartLat(s.latitude);
    setStartLng(s.longitude);
    setLastResolvedStartName(s.formattedAddress);
    setStartSuggestions([]);
    setStartError(null);
  };

  const handleSelectEndSuggestion = (s) => {
    setEndLocName(s.formattedAddress);
    setEndLat(s.latitude);
    setEndLng(s.longitude);
    setLastResolvedEndName(s.formattedAddress);
    setEndSuggestions([]);
    setEndError(null);
  };

  // Blur resolution handlers
  const resolveStartLocationFromName = async (name) => {
    if (!name || name.trim() === '') return;
    setStartLoading(true);
    setStartError(null);
    try {
      const results = await fetchDestinationSuggestions(name);
      if (results && results.length > 0) {
        const topResult = results[0];
        setStartLat(topResult.latitude);
        setStartLng(topResult.longitude);
        setStartLocName(topResult.formattedAddress);
        setLastResolvedStartName(topResult.formattedAddress);
      } else {
        setStartError('Unable to find coordinates for this location. Please enter a more specific location name.');
        setStartLat('');
        setStartLng('');
      }
    } catch (err) {
      setStartError('Geocoding service error. Please try again.');
      setStartLat('');
      setStartLng('');
    } finally {
      setStartLoading(false);
    }
  };

  const resolveEndLocationFromName = async (name) => {
    if (!name || name.trim() === '') return;
    setEndLoading(true);
    setEndError(null);
    try {
      const results = await fetchDestinationSuggestions(name);
      if (results && results.length > 0) {
        const topResult = results[0];
        setEndLat(topResult.latitude);
        setEndLng(topResult.longitude);
        setEndLocName(topResult.formattedAddress);
        setLastResolvedEndName(topResult.formattedAddress);
      } else {
        setEndError('Unable to find coordinates for this location. Please enter a more specific location name.');
        setEndLat('');
        setEndLng('');
      }
    } catch (err) {
      setEndError('Geocoding service error. Please try again.');
      setEndLat('');
      setEndLng('');
    } finally {
      setEndLoading(false);
    }
  };

  const handleStartBlur = () => {
    setTimeout(() => {
      setStartSuggestions([]);
      if (startLocName && startLocName.trim() !== '' && startLocName !== lastResolvedStartName) {
        resolveStartLocationFromName(startLocName);
      }
    }, 250);
  };

  const handleEndBlur = () => {
    setTimeout(() => {
      setEndSuggestions([]);
      if (endLocName && endLocName.trim() !== '' && endLocName !== lastResolvedEndName) {
        resolveEndLocationFromName(endLocName);
      }
    }, 250);
  };

  // Review reply state
  const [replyTexts, setReplyTexts] = useState({});

  // Image Upload Fields
  const [tourImageUrl, setTourImageUrl] = useState('');
  const [tourImagePublicId, setTourImagePublicId] = useState('');
  const [tourImagePreview, setTourImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit & Delete states
  const [editingTourId, setEditingTourId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDeleteCatId, setSelectedDeleteCatId] = useState('');
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState(null);
  const [confirmDeleteCatName, setConfirmDeleteCatName] = useState('');
  const [isDeletingCat, setIsDeletingCat] = useState(false);
  const [isAddingCat, setIsAddingCat] = useState(false);

  const resetFormFields = () => {
    setTourTitle('');
    setTourLocation('');
    setTourDesc('');
    setTourDays(3);
    if (categories.length > 0) {
      setTourCat(categories[0]._id);
    } else {
      setTourCat('');
    }
    setTourDests([]);
    setTourStandardPrice('');
    setTourDeluxePrice('');
    setTourLuxuryPrice('');
    setTourHighlights('');
    setTourInclusions('');
    setTourExclusions('');
    setDeparturesList([]);
    setStartLocName('');
    setStartLat('');
    setStartLng('');
    setEndLocName('');
    setEndLat('');
    setEndLng('');
    setTourImageUrl('');
    setTourImagePublicId('');
    setTourImagePreview('');
    setTourStartTime('');

    setStartSuggestions([]);
    setStartLoading(false);
    setStartError(null);
    setLastResolvedStartName('');
    setEndSuggestions([]);
    setEndLoading(false);
    setEndError(null);
    setLastResolvedEndName('');
  };

  const loadAgentBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await api.get('/bookings/agent/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
        setBookingsStats(res.data.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch your bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadAgentData = async () => {
    try {
      const [toursRes, catsRes, destsRes, revsRes] = await Promise.all([
        api.get('/agent-tours'),
        api.get('/tours/categories'),
        api.get('/tours/destinations'),
        api.get('/reviews/moderation') // Agents/Managers access
      ]);

      if (toursRes.data.success) setTours(toursRes.data.tours);
      if (catsRes.data.success) {
        setCategories(catsRes.data.categories);
        if (catsRes.data.categories.length > 0) setTourCat(catsRes.data.categories[0]._id);
      }
      if (destsRes.data.success) setDestinations(destsRes.data.destinations);
      if (revsRes.data.success) setReviews(revsRes.data.reviews);
    } catch (err) {
      console.warn('Failed to load agent configurations:', err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadAgentBookings();
    } else {
      loadAgentData();
      api.get('/bookings/agent/my-bookings')
        .then(res => {
          if (res.data.success) {
            setBookings(res.data.bookings);
            setBookingsStats(res.data.stats);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  // Handle Tour status workflow changes
  const handleUpdateStatus = async (tourId, status) => {
    try {
      const res = await api.put(`/agent-tours/${tourId}`, { status });
      if (res.data.success) {
        toast.success(`Tour status updated to: ${status}`);
        loadAgentData();
      }
    } catch (err) {
      toast.error('Failed to update tour status');
    }
  };

  const handleAddDeparture = () => {
    if (!depDate) {
      toast.error('Please select a departure date.');
      return;
    }
    if (!depSeats || Number(depSeats) <= 0) {
      toast.error('Enter the number of seats.');
      return;
    }
    setDeparturesList([...departuresList, { 
      date: depDate, 
      totalSeats: Number(depSeats),
      availableSeats: Number(depSeats),
      heldSeats: 0
    }]);
    setDepDate('');
    setDepSeats(20);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    // Validate size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image must be under 10MB.');
      return;
    }


    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setTourImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setUploadingImage(true);
    setUploadProgress(10);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/tours/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (res.data.success) {
        setTourImageUrl(res.data.url);
        setTourImagePublicId(res.data.public_id);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(res.data.message || 'Upload failed');
        setTourImagePreview('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload image. Server/Cloudinary error.');
      setTourImagePreview('');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setTourImageUrl('');
    setTourImagePublicId('');
    setTourImagePreview('');
  };

  // Build & Post/Update Tour
  const handleCreateTour = async (e) => {
    e.preventDefault();

    if (!tourImageUrl) {
      toast.error('Please upload a tour cover image before saving the tour.');
      return;
    }

    if (departuresList.length === 0) {
      toast.error('Add at least one departure date');
      return;
    }

    // Coordinates auto-fill validation
    if (!tourLocation || tourLocation.trim() === '') {
      toast.error('Tour Location is required.');
      return;
    }

    if (!startLocName || startLocName.trim() === '') {
      toast.error('Start Location Name is required.');
      return;
    }
    if (startLat === '' || startLat === undefined || startLat === null) {
      toast.error('Start Latitude is required. Please enter a valid location.');
      return;
    }
    if (startLng === '' || startLng === undefined || startLng === null) {
      toast.error('Start Longitude is required. Please enter a valid location.');
      return;
    }
    const sLat = Number(startLat);
    const sLng = Number(startLng);
    if (isNaN(sLat) || sLat < -90 || sLat > 90) {
      toast.error('Start Latitude must be a number between -90 and 90.');
      return;
    }
    if (isNaN(sLng) || sLng < -180 || sLng > 180) {
      toast.error('Start Longitude must be a number between -180 and 180.');
      return;
    }

    if (!endLocName || endLocName.trim() === '') {
      toast.error('End Location Name is required.');
      return;
    }
    if (endLat === '' || endLat === undefined || endLat === null) {
      toast.error('End Latitude is required. Please enter a valid location.');
      return;
    }
    if (endLng === '' || endLng === undefined || endLng === null) {
      toast.error('End Longitude is required. Please enter a valid location.');
      return;
    }
    const eLat = Number(endLat);
    const eLng = Number(endLng);
    if (isNaN(eLat) || eLat < -90 || eLat > 90) {
      toast.error('End Latitude must be a number between -90 and 90.');
      return;
    }
    if (isNaN(eLng) || eLng < -180 || eLng > 180) {
      toast.error('End Longitude must be a number between -180 and 180.');
      return;
    }

    if (!tourStartTime) {
      toast.error('Tour Start Time is required.');
      return;
    }

    try {
      const pricingPlans = [
        { name: 'Standard', price: Number(tourStandardPrice), description: 'Standard Plan' },
        { name: 'Deluxe', price: Number(tourDeluxePrice), description: 'Deluxe Plan' },
        { name: 'Luxury', price: Number(tourLuxuryPrice), description: 'Luxury Plan' }
      ];

      const payload = {
        title: tourTitle,
        description: tourDesc,
        durationDays: Number(tourDays),
        category: tourCat,
        destinations: tourDests,
        location: tourLocation.trim(),
        images: [tourImageUrl],
        imagePublicId: tourImagePublicId,
        highlights: tourHighlights ? tourHighlights.split(',').map(s => s.trim()).filter(Boolean) : [],
        inclusions: tourInclusions ? tourInclusions.split(',').map(s => s.trim()).filter(Boolean) : [],
        exclusions: tourExclusions ? tourExclusions.split(',').map(s => s.trim()).filter(Boolean) : [],
        pricingPlans,
        departures: departuresList,
        startLocation: { name: startLocName, latitude: sLat, longitude: sLng },
        endLocation: { name: endLocName, latitude: eLat, longitude: eLng },
        tourStartTime
      };

      if (editingTourId) {
        const res = await api.put(`/agent-tours/${editingTourId}`, payload);
        if (res.data.success) {
          toast.success('Tour updated successfully');
          setEditingTourId(null);
          resetFormFields();
          handleTabChange('tours');
        }
      } else {
        const res = await api.post('/agent-tours', payload);
        if (res.data.success) {
          toast.success(res.data.message);
          resetFormFields();
          handleTabChange('tours');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to construct tour');
    }
  };

  // Edit Tour action handler
  const handleEditTour = (tour) => {
    setEditingTourId(tour._id);
    setTourTitle(tour.title || '');
    setTourLocation(tour.location || '');
    setTourDesc(tour.description || '');
    setTourDays(tour.durationDays || 3);
    setTourCat(tour.category?._id || tour.category || '');
    setTourDests(tour.destinations?.map(d => d._id || d) || []);
    
    // Pricing
    const stdPlan = tour.pricingPlans?.find(p => p.name === 'Standard') || tour.pricingPlans?.[0];
    const dlxPlan = tour.pricingPlans?.find(p => p.name === 'Deluxe') || tour.pricingPlans?.[1];
    const luxPlan = tour.pricingPlans?.find(p => p.name === 'Luxury') || tour.pricingPlans?.[2];
    setTourStandardPrice(stdPlan ? stdPlan.price : '');
    setTourDeluxePrice(dlxPlan ? dlxPlan.price : '');
    setTourLuxuryPrice(luxPlan ? luxPlan.price : '');

    setTourHighlights(tour.highlights?.join(', ') || '');
    setTourInclusions(tour.inclusions?.join(', ') || '');
    setTourExclusions(tour.exclusions?.join(', ') || '');
    setTourStartTime(tour.tourStartTime || '');

    // Departures
    const formattedDepartures = [];
    const seenDates = new Set();
    if (tour.departures) {
      for (const d of tour.departures) {
        if (!d.date) continue;
        let dString = '';
        try {
          dString = new Date(d.date).toISOString().split('T')[0];
        } catch (e) {
          dString = d.date;
        }
        if (!seenDates.has(dString)) {
          seenDates.add(dString);
          formattedDepartures.push({
            date: dString,
            totalSeats: d.totalSeats,
            availableSeats: d.availableSeats !== undefined ? d.availableSeats : d.totalSeats,
            heldSeats: d.heldSeats || 0
          });
        }
      }
    }
    setDeparturesList(formattedDepartures);

    setStartLocName(tour.startLocation?.name || '');
    setStartLat(tour.startLocation?.latitude || '');
    setStartLng(tour.startLocation?.longitude || '');
    setLastResolvedStartName(tour.startLocation?.name || '');
    setEndLocName(tour.endLocation?.name || '');
    setEndLat(tour.endLocation?.latitude || '');
    setEndLng(tour.endLocation?.longitude || '');
    setLastResolvedEndName(tour.endLocation?.name || '');

    // Image
    setTourImageUrl(tour.images?.[0] || '');
    setTourImagePublicId(tour.imagePublicId || '');
    setTourImagePreview(tour.images?.[0] || '');

    // Navigate to create-tour Builder form
    navigate('/dashboard/agent/create-tour');
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/agent-tours/${confirmDeleteId}`);
      if (res.data.success) {
        toast.success('Tour deleted successfully');
        setConfirmDeleteId(null);
        loadAgentData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete tour');
    } finally {
      setIsDeleting(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName || catName.trim() === '') {
      toast.error('Category name is required');
      return;
    }
    setIsAddingCat(true);
    try {
      const slug = catName.trim().toLowerCase().replace(/ /g, '-');
      const res = await api.post('/tours/categories', { 
        name: catName.trim(), 
        slug, 
        description: catDesc 
      });
      if (res.data.success) {
        toast.success('Category created successfully!');
        setCatName('');
        setCatDesc('');
        loadAgentData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setIsAddingCat(false);
    }
  };

  // Remove Category Confirmation Handler
  const handleConfirmDeleteCat = async () => {
    if (!confirmDeleteCatId) return;
    setIsDeletingCat(true);
    try {
      const res = await api.delete(`/tours/categories/${confirmDeleteCatId}`);
      if (res.data.success) {
        toast.success('Category removed successfully');
        setConfirmDeleteCatId(null);
        setConfirmDeleteCatName('');
        setSelectedDeleteCatId('');
        loadAgentData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove category');
    } finally {
      setIsDeletingCat(false);
    }
  };

  // Post review reply
  const handlePostReply = async (reviewId) => {
    const text = replyTexts[reviewId];
    if (!text) return;

    try {
      const res = await api.post(`/reviews/${reviewId}/reply`, { text });
      if (res.data.success) {
        toast.success('Response posted successfully');
        setReplyTexts({ ...replyTexts, [reviewId]: '' });
        loadAgentData();
      }
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
      <Sidebar role="Agent" />

      {/* Main Panel — owns its own scroll */}
      <div className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto h-full">
        {/* Banner */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-800">Agent Workspace</h1>
            <p className="text-xs text-slate-500 mt-1">Create tour itineraries, manage departures and availability and assist customers with their bookings.</p>
          </div>
          <Book className="w-10 h-10 text-gold-500" />
        </div>

        {/* Workspace tabs */}
        <div className="flex gap-4 border-b border-slate-200 pb-3">
          <button 
            onClick={() => handleTabChange('tours')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'tours' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            My Tours ({tours.length})
          </button>
          <button 
            onClick={() => handleTabChange('create')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'create' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Tour Builder
          </button>
          <button 
            onClick={() => handleTabChange('bookings')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'bookings' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            My Tour Bookings ({bookings.length})
          </button>
          <button 
            onClick={() => handleTabChange('setup')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'setup' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Metadata Settings
          </button>
          <button 
            onClick={() => handleTabChange('reviews')}
            className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'reviews' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Reviews Feedback ({reviews.length})
          </button>
        </div>

        {/* Tours Workspace Tab */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            {tours.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No tours configured yet. Build one below!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tours.map(t => (
                  <div key={t._id} className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          t.status === 'Published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                          t.status === 'Draft' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                          'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {t.status}
                        </span>
                        <h3 className="font-bold text-base text-slate-800 mt-2">{t.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">{t.category?.name} | {t.durationDays} Days | {t.location || 'Location not specified'}</p>
                      </div>
                    </div>

                    {/* Workflow status triggers */}
                    <div className="flex gap-2 pt-2 border-t border-slate-150">
                      <button 
                        onClick={() => handleUpdateStatus(t._id, 'Published')}
                        disabled={t.status === 'Published'}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition-colors shadow-sm"
                      >
                        Publish
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(t._id, 'Draft')}
                        disabled={t.status === 'Draft'}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition-colors shadow-sm"
                      >
                        Draft
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(t._id, 'Archived')}
                        disabled={t.status === 'Archived'}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition-colors shadow-sm border border-slate-300"
                      >
                        Archive
                      </button>
                      <button 
                        onClick={() => handleEditTour(t)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm ml-auto cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(t._id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tour Builder Tab */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateTour} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Box core details */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3">
                {editingTourId ? 'Edit Tour Specifications' : 'Tour Specifications'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Tour Title</label>
                  <input
                    type="text"
                    value={tourTitle}
                    onChange={(e) => setTourTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    placeholder="Enter Title"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Location</label>
                  <input
                    type="text"
                    value={tourLocation}
                    onChange={(e) => setTourLocation(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    placeholder="Enter city, state, or country"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Description</label>
                  <textarea
                    rows="3"
                    value={tourDesc}
                    onChange={(e) => setTourDesc(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    placeholder="Enter details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Duration (Days)</label>
                    <input
                      type="number"
                      value={tourDays}
                      onChange={(e) => setTourDays(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Category</label>
                    <select
                      value={tourCat}
                      onChange={(e) => setTourCat(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800 cursor-pointer"
                    >
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Tour Cover Image Upload */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Tour Cover Image</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      {tourImagePreview ? (
                        <div className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200">
                          <img src={tourImagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 border-none cursor-pointer flex items-center justify-center shadow-sm"
                            style={{ padding: '2px' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex-1 flex flex-col items-center justify-center h-20 border-2 border-dashed border-slate-200 hover:border-gold-500 rounded-xl cursor-pointer transition-all bg-slate-50">
                          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Click to Upload Cover Image</span>
                          <span className="text-[9px] text-slate-350 mt-0.5">JPG, PNG, WebP up to 10MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {uploadingImage && (
                      <div className="text-[10px] text-gold-600 font-bold animate-pulse">
                        Uploading image... {uploadProgress}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Plans */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-2">Standard ($)</label>
                    <input
                      type="number"
                      value={tourStandardPrice}
                      onChange={(e) => setTourStandardPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-2">Deluxe ($)</label>
                    <input
                      type="number"
                      value={tourDeluxePrice}
                      onChange={(e) => setTourDeluxePrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-2">Luxury ($)</label>
                    <input
                      type="number"
                      value={tourLuxuryPrice}
                      onChange={(e) => setTourLuxuryPrice(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box departures & coordinates */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-6">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3">Departures & Locations</h3>

                {/* Departures sub-adder */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase">Departure dates schedule</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={depDate} 
                      onChange={(e) => setDepDate(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                    />
                    <input 
                      type="number" 
                      value={depSeats} 
                      onChange={(e) => setDepSeats(e.target.value)}
                      className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                      placeholder="Seats"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddDeparture}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 rounded-lg text-xs transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {/* Small tags list */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {departuresList.map((d, i) => (
                      <span key={i} className="bg-slate-50 text-slate-650 px-3 py-1 rounded-full text-[10px] border border-slate-200">
                        {d.date} ({d.totalSeats} seats)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Lists formatting */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Highlights (comma separated)</label>
                    <input
                      type="text"
                      value={tourHighlights}
                      onChange={(e) => setTourHighlights(e.target.value)}
                      placeholder="Matterhorn hike, Glacier Express"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Inclusions</label>
                    <input
                      type="text"
                      value={tourInclusions}
                      onChange={(e) => setTourInclusions(e.target.value)}
                      placeholder="4-star hotel, Breakfast"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                  <div className="relative">
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Start Location Name</label>
                    <input
                      type="text"
                      value={startLocName}
                      onChange={(e) => setStartLocName(e.target.value)}
                      onBlur={handleStartBlur}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                      placeholder="start Your location"
                    />
                    {startLoading && (
                      <p className="text-[10px] text-slate-400 mt-1 italic animate-pulse">Finding coordinates...</p>
                    )}
                    {startError && (
                      <p className="text-[10px] text-red-500 mt-1">{startError}</p>
                    )}
                    {startSuggestions.length > 0 && (
                      <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded shadow-lg max-h-40 overflow-y-auto text-xs mt-1">
                        {startSuggestions.map((s, idx) => (
                          <li
                            key={idx}
                            onMouseDown={() => handleSelectStartSuggestion(s)}
                            className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-slate-700 transition-colors"
                          >
                            {s.flag} {s.formattedAddress}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">End Location Name</label>
                    <input
                      type="text"
                      value={endLocName}
                      onChange={(e) => setEndLocName(e.target.value)}
                      onBlur={handleEndBlur}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                      placeholder="End location"
                    />
                    {endLoading && (
                      <p className="text-[10px] text-slate-400 mt-1 italic animate-pulse">Finding coordinates...</p>
                    )}
                    {endError && (
                      <p className="text-[10px] text-red-500 mt-1">{endError}</p>
                    )}
                    {endSuggestions.length > 0 && (
                      <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded shadow-lg max-h-40 overflow-y-auto text-xs mt-1">
                        {endSuggestions.map((s, idx) => (
                          <li
                            key={idx}
                            onMouseDown={() => handleSelectEndSuggestion(s)}
                            className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-slate-700 transition-colors"
                          >
                            {s.flag} {s.formattedAddress}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Tour Start Time</label>
                <input
                  type="time"
                  value={tourStartTime}
                  onChange={(e) => setTourStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">Select the scheduled start time for this tour.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-gold-500/10 cursor-pointer"
              >
                {editingTourId ? 'Update Tour' : 'Construct & Save Tour'}
              </button>
              {editingTourId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTourId(null);
                    resetFormFields();
                    handleTabChange('tours');
                  }}
                  className="w-full mt-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all border border-slate-300 cursor-pointer text-center text-xs"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}

        {/* Metadata setup tab */}
        {activeTab === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category manager */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3">Category Management</h3>
              
              {/* Create Category form */}
              <form onSubmit={handleAddCategory} className="space-y-4 pb-6 border-b border-slate-200">
                <h4 className="font-semibold text-slate-700 text-xs">Add New Category</h4>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Category Name</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    placeholder="Adventure, Honeymoon..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Description</label>
                  <textarea
                    rows="3"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                    placeholder="Enter short details..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingCat}
                  className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAddingCat ? 'Creating...' : 'Create Category'}
                </button>
              </form>

              {/* Remove Category section */}
              <div className="space-y-4 pt-2">
                <h4 className="font-semibold text-slate-700 text-xs">Remove Existing Category</h4>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Select Category</label>
                  <select
                    value={selectedDeleteCatId}
                    onChange={(e) => setSelectedDeleteCatId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-800"
                  >
                    <option value="">-- Choose Category to Remove --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={!selectedDeleteCatId}
                  onClick={() => {
                    const catObj = categories.find(c => c._id === selectedDeleteCatId);
                    if (catObj) {
                      setConfirmDeleteCatId(selectedDeleteCatId);
                      setConfirmDeleteCatName(catObj.name);
                    }
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  Remove Category
                </button>
              </div>
            </div>

            {/* Destinations manager */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 text-slate-500 text-xs shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3 mb-4">Location Assets Registry</h3>
              <p className="mb-4">Current Registered Destinations: <strong className="text-slate-800">{destinations.length}</strong></p>
              <ul className="space-y-2 border-t border-slate-200 pt-4">
                {destinations.map(d => (
                  <li key={d._id} className="flex justify-between items-center py-1">
                    <span className="text-slate-700">{d.name} ({d.city?.name || 'Zurich'}, {d.country?.name || 'Switzerland'})</span>
                    <span className="text-[10px] text-slate-500">Lat: {d.coordinates?.latitude}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3">Reviews moderation & Agent Replies</h3>
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No reviews recorded.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map(r => (
                  <div key={r._id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-slate-800">{r.user?.name}</strong> reviewed <strong className="text-gold-600 font-bold">{r.tour?.title}</strong>
                      </div>
                      <span className="text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 italic">"{r.comment}"</p>

                    {r.managerReply ? (
                      <div className="pl-4 border-l border-emerald-500/50 text-[10px] text-slate-500">
                        <strong>Reply posted:</strong> {r.managerReply.text}
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write reply..."
                          value={replyTexts[r._id] || ''}
                          onChange={(e) => setReplyTexts({ ...replyTexts, [r._id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-[11px] text-slate-800 focus:border-gold-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handlePostReply(r._id)}
                          className="bg-gold-500 hover:bg-gold-600 text-white px-4 rounded text-[10px] font-bold transition-colors shadow-sm"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {bookingsStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
                  <h4 className="text-xl md:text-2xl font-extrabold text-slate-800">{bookingsStats.totalBookings}</h4>
                </div>
                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed Bookings</span>
                  <h4 className="text-xl md:text-2xl font-extrabold text-slate-800">{bookingsStats.confirmedBookings}</h4>
                </div>
                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Travelers</span>
                  <h4 className="text-xl md:text-2xl font-extrabold text-slate-800">{bookingsStats.totalTravelers}</h4>
                </div>
                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking Revenue</span>
                  <h4 className="text-xl md:text-2xl font-extrabold text-slate-800">${bookingsStats.bookingRevenue}</h4>
                </div>
              </div>
            )}

            {/* Bookings Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm bg-white">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-3">My Tour Bookings</h3>
              {bookingsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 italic">Fetching bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">No bookings have been made for your tours yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Booking Ref</th>
                        <th className="py-3 px-4">Tour</th>
                        <th className="py-3 px-4">Destination</th>
                        <th className="py-3 px-4">Tour Date</th>
                        <th className="py-3 px-4">Tour Time</th>
                        <th className="py-3 px-4 text-center">Seats</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Booked On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map(b => (
                        <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block">{b.user?.name || 'Deleted User'}</span>
                            <span className="text-[10px] text-slate-400 block">{b.user?.email || 'N/A'}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                            TX-{b._id.toString().substring(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {b.tour?.title || 'Unknown Tour'}
                          </td>
                          <td className="py-3 px-4 text-slate-650">
                            {b.tour?.location || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-slate-650 font-medium">
                            {new Date(b.departureDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 text-slate-650 font-medium">
                            {formatTime12hr(b.tour?.tourStartTime)}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-700">
                            {b.numSeats}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            ${b.totalAmount}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider inline-block ${
                              b.status === 'Fully Paid' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                              b.status === 'Deposited' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                              b.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                              b.status === 'Hold' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' :
                              'bg-rose-50/50 text-rose-500 border border-rose-100'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-450">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl text-center font-sans">
            <h3 className="font-extrabold text-slate-800 text-base">Confirm Delete</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this tour? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={isDeleting}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Category Delete Confirmation Modal */}
      {confirmDeleteCatId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl text-center font-sans">
            <h3 className="font-extrabold text-slate-800 text-base">Confirm Remove Category</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to remove the category <strong className="text-slate-800">"{confirmDeleteCatName}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteCatId(null);
                  setConfirmDeleteCatName('');
                }}
                disabled={isDeletingCat}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCat}
                disabled={isDeletingCat}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeletingCat ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AgentDashboard);
