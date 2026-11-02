import React, { useState, useEffect } from 'react';
import { UserProfile, HangoutCard, ActivityType } from '../types';
import { storage } from '../services/storage';
import {
  X,
  MapPin,
  RefreshCw,
  Loader2,
  Sparkles,
  Camera,
  Calendar,
  Users,
  ShieldAlert,
  Info,
  Repeat,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostHangoutModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (hangout: HangoutCard) => void;
}

const PRESET_ACTIVITIES = [
  '⚽ Football', '🏏 Cricket', '🏸 Badminton',
  '☕ Coffee', '🍕 Food', '🚶 Walk',
  '🎮 Gaming', '📚 Study', '🎬 Movie',
  '✈️ Travel', '🎵 Music', '🏋️ Gym',
];

const QUICK_TIME_OPTIONS = [
  'Right now', 'In 1 hour', 'This evening', 'Tomorrow',
];

export const PostHangoutModal: React.FC<PostHangoutModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onCreated,
}) => {
  // Activity state (FR-H1, FR-H2)
  const [selectedActivity, setSelectedActivity] = useState<string>('☕ Coffee');
  const [isCustomActivity, setIsCustomActivity] = useState<boolean>(false);
  const [customActivityText, setCustomActivityText] = useState<string>('');

  // Title and Description (FR-H7)
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Timing (FR-H3, FR-H4)
  const [timeMode, setTimeMode] = useState<'quick' | 'custom'>('quick');
  const [quickTime, setQuickTime] = useState<string>('In 1 hour');
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [customStartTime, setCustomStartTime] = useState<string>('18:00');
  const [customEndTime, setCustomEndTime] = useState<string>('20:00');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringSchedule, setRecurringSchedule] = useState<string>('Weekly on this day');

  // Group size (FR-H5: 2 to 50 people)
  const [groupSize, setGroupSize] = useState<number>(4);

  // Location & Exact Meeting Spot (FR-H6, FR-J3, NFR-3)
  const [locationLabel, setLocationLabel] = useState<string>('📍 Detecting your location...');
  const [exactMeetingPoint, setExactMeetingPoint] = useState<string>('');
  const [lat, setLat] = useState<number>(40.7128);
  const [lng, setLng] = useState<number>(-74.0060);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(false);
  const [customLocation, setCustomLocation] = useState<string>('');

  // Optional Rules (FR-H9)
  const [sameGenderOnly, setSameGenderOnly] = useState<boolean>(false);
  const [hasAgeFilter, setHasAgeFilter] = useState<boolean>(false);
  const [ageMin, setAgeMin] = useState<number>(18);
  const [ageMax, setAgeMax] = useState<number>(35);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Photo Attachment (FR-H8)
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Check rate limit (FR-H13: maximum 3 active cards per user)
  useEffect(() => {
    if (isOpen) {
      const activeCount = storage.getUserActiveHangoutCount(currentUser.uid);
      if (activeCount >= 3) {
        setRateLimitError(
          'Rate limit reached: You can have a maximum of 3 active hangout posts at a time.'
        );
      } else {
        setRateLimitError(null);
      }
      detectLocation();
    }
  }, [isOpen, currentUser.uid]);

  const detectLocation = () => {
    setIsLocating(true);
    setLocationLabel('📍 Detecting your location...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude);
          setLng(longitude);

          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`
          )
            .then((res) => res.json())
            .then((data) => {
              const suburb =
                data.address?.suburb ||
                data.address?.neighbourhood ||
                data.address?.city ||
                data.address?.town ||
                'Downtown Area';
              setLocationLabel(`📍 ${suburb}`);
              setIsLocating(false);
            })
            .catch(() => {
              setLocationLabel('📍 Nearby (Downtown District)');
              setIsLocating(false);
            });
        },
        () => {
          setLocationLabel('📍 Nearby (Central Square)');
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setLocationLabel('📍 Nearby (Central Square)');
      setIsLocating(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rateLimitError) {
      alert(rateLimitError);
      return;
    }

    const activity = isCustomActivity
      ? (customActivityText.trim() ? `✨ ${customActivityText.trim()}` : null)
      : selectedActivity;

    if (!activity) {
      alert('Please specify an activity');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a short title for your hangout');
      return;
    }

    if (groupSize < 2 || groupSize > 50) {
      alert('Group size must be between 2 and 50 people');
      return;
    }

    setIsSubmitting(true);

    const now = Date.now();
    let timeWindowFormatted = quickTime;
    let startAt = now + 3600 * 1000;
    let expiresAt = now + 24 * 3600 * 1000;

    if (timeMode === 'quick') {
      if (quickTime.includes('now')) {
        startAt = now;
        expiresAt = now + 45 * 60 * 1000;
      } else if (quickTime.includes('1 hour')) {
        startAt = now + 3600 * 1000;
        expiresAt = now + 3 * 3600 * 1000;
      } else if (quickTime.includes('evening')) {
        startAt = now + 5 * 3600 * 1000;
        expiresAt = now + 8 * 3600 * 1000;
      } else {
        startAt = now + 24 * 3600 * 1000;
        expiresAt = now + 30 * 3600 * 1000;
      }
    } else {
      const startDateTime = new Date(`${customDate}T${customStartTime}`);
      startAt = startDateTime.getTime();
      const endDateTime = new Date(`${customDate}T${customEndTime}`);
      expiresAt = endDateTime.getTime();
      timeWindowFormatted = `${customDate} at ${customStartTime}`;
    }

    const finalLocation = isEditingLocation && customLocation.trim()
      ? `📍 ${customLocation.trim()}`
      : locationLabel;

    setTimeout(() => {
      const created = storage.addHangout({
        postedByName: currentUser.firstName,
        postedByUid: currentUser.uid,
        postedByPhoto: currentUser.photoUri,
        title: title.trim(),
        activityType: activity,
        customActivity: isCustomActivity ? customActivityText.trim() : undefined,
        description: description.trim(),
        timeWindow: timeWindowFormatted,
        startAt,
        endAt: expiresAt,
        locationLabel: finalLocation.replace(/^📍\s*/, ''),
        exactMeetingPoint: exactMeetingPoint.trim() || undefined,
        lat,
        lng,
        maxPeople: groupSize,
        currentPeople: 1,
        photoUrls: photoUrl.trim() ? [photoUrl.trim()] : undefined,
        rules: {
          sameGenderOnly,
          ageRangeMin: hasAgeFilter ? ageMin : undefined,
          ageRangeMax: hasAgeFilter ? ageMax : undefined,
          verifiedOnly,
        },
        status: 'active',
        expiresAt,
        isRecurring,
        recurringSchedule: isRecurring ? recurringSchedule : undefined,
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // no-op
      }

      setIsSubmitting(false);
      onCreated(created);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white p-5 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-[#FF7E5F]" /> Post a Hangout Card
            </h2>
            <p className="text-xs text-[#CCC3E8]">
              Connect around sports, coffee, studies, or activities &middot; Strictly friendship only
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {rateLimitError && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-start space-x-2 text-xs text-red-700">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{rateLimitError}</span>
            </div>
          )}

          {/* Section 1: Activity (FR-H1, FR-H2) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                1. Activity
              </label>
              <button
                type="button"
                onClick={() => setIsCustomActivity(!isCustomActivity)}
                className="text-xs text-[#FF7E5F] font-semibold hover:underline"
              >
                {isCustomActivity ? 'Use Presets' : '+ Type Custom Activity'}
              </button>
            </div>

            {isCustomActivity ? (
              <input
                type="text"
                placeholder="e.g. Vintage Thrifting, Tennis Singles, Coding Jam"
                value={customActivityText}
                onChange={(e) => setCustomActivityText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F]"
              />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {PRESET_ACTIVITIES.map((act) => {
                  const isSelected = selectedActivity === act;
                  return (
                    <button
                      type="button"
                      key={act}
                      onClick={() => setSelectedActivity(act)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition border ${
                        isSelected
                          ? 'bg-[#FF7E5F] text-white border-[#FF7E5F] shadow-xs'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-[#FF7E5F]/50 hover:bg-[#FFF9F7]'
                      }`}
                    >
                      {act}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Title & Description (FR-H7) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                2. Hangout Title
              </label>
              <input
                type="text"
                placeholder="e.g. Afternoon Tennis match at Community Courts"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Description (Up to 500 characters)
                </label>
                <span className="text-[10px] text-gray-400">{description.length}/500</span>
              </div>
              <textarea
                placeholder="Tell others what you plan to do, what to bring, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F] resize-none"
              />
            </div>
          </div>

          {/* Section 3: Time & Schedule (FR-H3, FR-H4, FR-H12) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                3. Date & Time
              </label>
              <div className="flex space-x-1 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeMode('quick')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    timeMode === 'quick' ? 'bg-[#2D2640] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Quick Horizon
                </button>
                <button
                  type="button"
                  onClick={() => setTimeMode('custom')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    timeMode === 'custom' ? 'bg-[#2D2640] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Exact Date/Time
                </button>
              </div>
            </div>

            {timeMode === 'quick' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUICK_TIME_OPTIONS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setQuickTime(t)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition border ${
                      quickTime === t
                        ? 'bg-[#2D2640] text-white border-[#2D2640]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Date</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Start Time</label>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">End Time</label>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Recurring toggle (FR-H12) */}
            <div className="mt-2.5 flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
              />
              <label htmlFor="isRecurring" className="text-xs text-gray-600 flex items-center cursor-pointer">
                <Repeat className="w-3.5 h-3.5 mr-1 text-[#FF7E5F]" /> Mark as recurring hangout (e.g. weekly)
              </label>
            </div>
          </div>

          {/* Section 4: Group Size (FR-H5: 2 to 50 people) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                4. Group Size (2 to 50 people)
              </label>
              <span className="text-xs font-bold text-[#FF7E5F]">{groupSize} total participants</span>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={2}
                max={50}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="flex-1 accent-[#FF7E5F]"
              />
              <div className="flex space-x-1">
                {[2, 4, 8, 12].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setGroupSize(n)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                      groupSize === n
                        ? 'bg-[#FF7E5F] text-white border-[#FF7E5F]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Location & Privacy (FR-H6, FR-J3, NFR-3) */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-gray-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">5. Location</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="text-xs text-[#FF7E5F] font-semibold hover:underline flex items-center"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isLocating ? 'animate-spin' : ''}`} />
                  Auto GPS
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLocation(!isEditingLocation)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  {isEditingLocation ? 'Done' : 'Edit Area'}
                </button>
              </div>
            </div>

            {isEditingLocation ? (
              <input
                type="text"
                placeholder="Area name (e.g. North Brooklyn or Central Park)"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF7E5F]"
              />
            ) : (
              <p className="text-xs font-semibold text-[#2D2640] flex items-center">
                <MapPin className="w-3.5 h-3.5 text-[#FF7E5F] mr-1" />
                {locationLabel} (Public Area)
              </p>
            )}

            {/* Exact meeting point field (FR-J3, NFR-3) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                Exact Meeting Point (Revealed ONLY to approved attendees)
              </label>
              <input
                type="text"
                placeholder="e.g. Under the clock tower near east gate / Court #3"
                value={exactMeetingPoint}
                onChange={(e) => setExactMeetingPoint(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF7E5F]"
              />
            </div>
          </div>

          {/* Section 6: Rules & Filters (FR-H9) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              6. Optional Member Guidelines
            </label>

            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameGenderOnly}
                  onChange={(e) => setSameGenderOnly(e.target.checked)}
                  className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
                />
                <span className="text-gray-700">Same gender attendees only</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
                />
                <span className="text-gray-700">Verified identity accounts only</span>
              </label>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ageFilter"
                  checked={hasAgeFilter}
                  onChange={(e) => setHasAgeFilter(e.target.checked)}
                  className="rounded text-[#FF7E5F] focus:ring-[#FF7E5F]"
                />
                <label htmlFor="ageFilter" className="text-gray-700 cursor-pointer">
                  Specific age range:
                </label>
                {hasAgeFilter && (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min={15}
                      max={90}
                      value={ageMin}
                      onChange={(e) => setAgeMin(Number(e.target.value))}
                      className="w-12 px-1.5 py-0.5 border rounded text-xs text-center"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      min={15}
                      max={90}
                      value={ageMax}
                      onChange={(e) => setAgeMax(Number(e.target.value))}
                      className="w-12 px-1.5 py-0.5 border rounded text-xs text-center"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 7: Card Photo Attachment (FR-H8) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              7. Hangout Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or paste image link"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#FF7E5F]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !!rateLimitError}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FF7E5F] hover:bg-[#ff6844] active:scale-[0.99] text-white font-bold text-sm transition shadow-md shadow-[#FF7E5F]/25 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting Hangout...
              </>
            ) : (
              'Publish Hangout 🎉'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
