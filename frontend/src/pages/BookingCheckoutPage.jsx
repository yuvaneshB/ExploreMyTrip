import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import api, { getBackendUrl } from '../services/api.js';
import { CreditCard, Timer, Sparkles, Shield, User, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId;
  const initialTotal = location.state?.totalAmount || 0;
  const holdExpiresAt = location.state?.holdExpiresAt;

  const [timeLeft, setTimeLeft] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponId, setCouponId] = useState(null);

  // Addons states
  const [airportPickup, setAirportPickup] = useState(false);
  const [travelInsurance, setTravelInsurance] = useState(false);
  const [hotelUpgrade, setHotelUpgrade] = useState(false);

  // Billing states
  const [paymentType, setPaymentType] = useState('Full'); // 'Full' or 'Deposit'
  const [gateway, setGateway] = useState('Razorpay');
  const [confirming, setConfirming] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      travelers: [{ name: '', age: '', gender: 'Male', passportNumber: '', passportExpiry: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'travelers'
  });

  // Countdown timer
  useEffect(() => {
    if (!holdExpiresAt) return;

    const timer = setInterval(() => {
      const difference = new Date(holdExpiresAt) - new Date();
      if (difference <= 0) {
        setSessionExpired(true);
        setTimeLeft('00:00');
        clearInterval(timer);
        toast.error('Session expired. Seats returned to pool.');
      } else {
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(
          `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [holdExpiresAt]);

  if (!bookingId) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-slate-400">No active checkout session found.</p>
        <button onClick={() => navigate('/tours')} className="mt-4 text-gold-500 hover:underline font-bold">
          Browse Tours
        </button>
      </div>
    );
  }

  // Calculate dynamic totals based on Addons
  const numSeats = fields.length;
  let addonsCost = 0;
  if (airportPickup) addonsCost += 50 * numSeats;
  if (travelInsurance) addonsCost += 35 * numSeats;
  if (hotelUpgrade) addonsCost += 100 * numSeats;

  const currentSubtotal = initialTotal + addonsCost;
  const currentTotal = Math.max(0, currentSubtotal - discountAmount);
  const amountToPayNow = paymentType === 'Deposit' ? Math.round(currentTotal * 0.25) : currentTotal;

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const limitedValue = value.substring(0, 16);
    const formatted = limitedValue.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
    if (cardErrors.cardNumber) {
      setCardErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleCardHolderChange = (e) => {
    setCardHolder(e.target.value);
    if (cardErrors.cardHolder) {
      setCardErrors(prev => ({ ...prev, cardHolder: '' }));
    }
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setExpiryDate(formatted);
    if (cardErrors.expiryDate) {
      setCardErrors(prev => ({ ...prev, expiryDate: '' }));
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const limitedValue = value.substring(0, 4);
    setCvv(limitedValue);
    if (cardErrors.cvv) {
      setCardErrors(prev => ({ ...prev, cvv: '' }));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post('/bookings/coupon/validate', {
        code: couponCode,
        subTotal: currentSubtotal
      });
      if (res.data.success) {
        setDiscountAmount(res.data.discountAmount);
        setCouponId(res.data.couponId);
        toast.success(`Coupon applied: Save $${res.data.discountAmount}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const onCheckoutSubmit = async (formData) => {
    if (sessionExpired) {
      toast.error('Checkout expired. Please create a new booking hold.');
      return;
    }

    // Card validations
    const errors = {};
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      errors.cardNumber = 'Card number must be exactly 16 digits.';
    }
    
    const trimmedCardHolder = cardHolder.trim();
    if (!trimmedCardHolder) {
      errors.cardHolder = 'Cardholder name is required.';
    }

    if (expiryDate.length !== 5) {
      errors.expiryDate = 'Expiry date must be in MM/YY format.';
    } else {
      const [monthStr, yearStr] = expiryDate.split('/');
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);
      if (isNaN(month) || month < 1 || month > 12) {
        errors.expiryDate = 'Invalid expiration month (01-12).';
      } else {
        const today = new Date();
        const currentYear = today.getFullYear() % 100; // last 2 digits
        const currentMonth = today.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          errors.expiryDate = 'This card has expired.';
        }
      }
    }

    if (cvv.length !== 3 && cvv.length !== 4) {
      errors.cvv = 'CVV must be 3 or 4 digits.';
    }

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      toast.error('Please correct the card payment errors before proceeding.');
      return;
    }

    setConfirming(true);
    try {
      const payload = {
        bookingId,
        gateway,
        paymentType,
        paymentMethodId: 'pm_mock_card_' + Math.random().toString(36).substr(2, 9),
        amountPaid: amountToPayNow,
        addons: {
          airportPickup,
          travelInsurance,
          hotelUpgrade
        },
        travelers: formData.travelers,
        couponId
      };

      const res = await api.post('/bookings/confirm', payload);
      if (res.data.success) {
        toast.success('Booking checkout completed!');
        setSuccessData(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment confirmation failed');
    } finally {
      setConfirming(false);
    }
  };

  // Success Screen
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center font-sans space-y-8">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 animate-bounce" />
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">Payment Confirmed!</h1>
          <p className="text-slate-500 text-sm">
            Invoice Number: <strong className="text-slate-800">{successData.invoice?.invoiceNumber}</strong>
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-slate-200 flex flex-col items-center gap-6 shadow-md">
          <div className="text-xs text-slate-500 text-left w-full space-y-2">
            <p><strong className="text-slate-700">Tour name:</strong> {successData.booking?.tour?.title}</p>
            <p><strong className="text-slate-700">Departure:</strong> {new Date(successData.booking?.departureDate).toLocaleDateString()}</p>
            <p><strong className="text-slate-700">Pricing plan:</strong> {successData.booking?.pricingPlanName}</p>
            <p><strong className="text-slate-700">Total amount:</strong> ${successData.booking?.totalAmount}</p>
            <p><strong className="text-slate-700">Amount Paid:</strong> ${successData.booking?.amountPaid}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href={`${getBackendUrl()}/api/v1/bookings/${successData.booking?._id}/download-ticket?token=${successData.booking?.secureToken}`}
            download
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Download E-Ticket
          </a>
          <a
            href={`${getBackendUrl()}/api/v1/bookings/${successData.booking?._id}/download-itinerary?token=${successData.booking?.secureToken}`}
            download
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200"
          >
            <FileText className="w-4 h-4" /> Download Itinerary
          </a>

          <button
            onClick={() => navigate('/dashboard/customer')}
            className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-gold-500/10"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 font-sans grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Input details columns */}
      <div className="lg:col-span-2 space-y-8">
        {/* Hold Timer */}
        <div className="bg-gold-500/5 border border-gold-500/20 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Timer className="w-6 h-6 text-gold-600 animate-pulse" />
            <div>
              <strong className="text-slate-800 text-sm block">15-Minute Seat Lock Session</strong>
              <span className="text-xs text-slate-500">Complete checkout before the lock timer runs out</span>
            </div>
          </div>
          <span className={`text-2xl font-extrabold tracking-widest ${sessionExpired ? 'text-rose-600' : 'text-gold-600'}`}>
            {timeLeft}
          </span>
        </div>

        {/* Travelers Form */}
        <form onSubmit={handleSubmit(onCheckoutSubmit)} className="space-y-8">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-4">
              <User className="w-5 h-5 text-gold-500" /> Traveler Specifications
            </h3>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 border-b border-slate-200 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Passenger #{index + 1}</h4>
                  {index > 0 && (
                    <button type="button" onClick={() => remove(index)} className="text-xs text-rose-600 hover:underline">
                      Remove passenger
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                      {...register(`travelers.${index}.name`, { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Age</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                      {...register(`travelers.${index}.age`, { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Gender</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 cursor-pointer focus:border-gold-500 focus:outline-none"
                      {...register(`travelers.${index}.gender`)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Passport Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                      {...register(`travelers.${index}.passportNumber`, { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Passport Expiry</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-gold-500 focus:outline-none"
                      {...register(`travelers.${index}.passportExpiry`, { required: true })}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ name: '', age: '', gender: 'Male', passportNumber: '', passportExpiry: '' })}
              className="text-xs text-gold-600 hover:underline font-bold"
            >
              + Add Traveler Seat
            </button>
          </div>

          {/* Addon upgrades */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-4">
              <Sparkles className="w-5 h-5 text-gold-500" /> Premium Services & Upgrades
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-4 p-4 bg-slate-55/40 border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-350 transition-colors">
                <input
                  type="checkbox"
                  checked={airportPickup}
                  onChange={(e) => setAirportPickup(e.target.checked)}
                  className="w-4 h-4 text-gold-500 bg-white border-slate-300 focus:ring-0 rounded cursor-pointer"
                />
                <div>
                  <strong className="text-xs block text-slate-850">Airport Shuttle pickup (+$50 per seat)</strong>
                  <span className="text-[10px] text-slate-500">Doorstep drop to hotel chalet.</span>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 bg-slate-55/40 border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-350 transition-colors">
                <input
                  type="checkbox"
                  checked={travelInsurance}
                  onChange={(e) => setTravelInsurance(e.target.checked)}
                  className="w-4 h-4 text-gold-500 bg-white border-slate-300 focus:ring-0 rounded cursor-pointer"
                />
                <div>
                  <strong className="text-xs block text-slate-850">Global Travel Insurance (+$35 per seat)</strong>
                  <span className="text-[10px] text-slate-500">Covers medical delays, ski accidents, lost items.</span>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 bg-slate-55/40 border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-350 transition-colors">
                <input
                  type="checkbox"
                  checked={hotelUpgrade}
                  onChange={(e) => setHotelUpgrade(e.target.checked)}
                  className="w-4 h-4 text-gold-500 bg-white border-slate-300 focus:ring-0 rounded cursor-pointer"
                />
                <div>
                  <strong className="text-xs block text-slate-850">5-Star Suite room upgrade (+$100 per seat)</strong>
                  <span className="text-[10px] text-slate-500">Panoramic mountain views, jacuzzi bath, room service.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Checkout Payment Form */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-4">
              <CreditCard className="w-5 h-5 text-gold-500" /> Payment & Billing
            </h3>

            <div className="space-y-2">
              <div className="p-4 rounded-xl border border-gold-500 bg-gold-500/5 text-gold-650 text-xs font-bold text-center">
                Secure Payments Powered by Razorpay
              </div>
            </div>

            {/* Credit Card inputs simulation */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-850"
                />
                {cardErrors.cardNumber && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{cardErrors.cardNumber}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardHolder}
                  onChange={handleCardHolderChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-850"
                />
                {cardErrors.cardHolder && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{cardErrors.cardHolder}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-850"
                  />
                  {cardErrors.expiryDate && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{cardErrors.expiryDate}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">CVC / CVV</label>
                  <input
                    type="password"
                    placeholder="***"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-gold-500 focus:outline-none text-xs text-slate-850"
                  />
                  {cardErrors.cvv && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{cardErrors.cvv}</p>}
                </div>
              </div>
            </div>

            {/* Submit checkout */}
            <button
              type="submit"
              disabled={confirming || sessionExpired}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-gold-500/25 transition-all duration-200"
            >
              {confirming ? 'Processing Transaction...' : `Confirm & Pay $${amountToPayNow}`}
            </button>
          </div>
        </form>
      </div>

      {/* Summary column */}
      <div>
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-md space-y-6 sticky top-28">
          <h3 className="font-bold text-lg text-slate-800 border-b border-slate-200 pb-4">
            Booking Summary
          </h3>

          {/* Pricing Details */}
          <div className="text-xs text-slate-500 space-y-3.5">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-slate-800">${currentSubtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount applied:</span>
                <span>-${discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <span>Estimated Tax (15%):</span>
              <span className="text-slate-800">${Math.round(currentTotal * 0.15)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-850">
              <span>Order Total:</span>
              <span className="text-gold-650">${currentTotal + Math.round(currentTotal * 0.15)}</span>
            </div>
          </div>

          {/* Promo code entry */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase">Promo Coupon Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-gold-500 focus:outline-none uppercase"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Deposit selector */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase">Payment Schedule</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-slate-55/40 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-350 transition-colors">
                <input
                  type="radio"
                  name="paySchedule"
                  checked={paymentType === 'Full'}
                  onChange={() => setPaymentType('Full')}
                  className="w-4 h-4 text-gold-500 bg-white border-slate-300 focus:ring-0 rounded-full cursor-pointer"
                />
                <div>
                  <strong className="text-xs block text-slate-850">Full Payment (100%)</strong>
                  <span className="text-[10px] text-slate-500">Pay ${currentTotal + Math.round(currentTotal * 0.15)} now.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-55/40 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-350 transition-colors">
                <input
                  type="radio"
                  name="paySchedule"
                  checked={paymentType === 'Deposit'}
                  onChange={() => setPaymentType('Deposit')}
                  className="w-4 h-4 text-gold-500 bg-white border-slate-300 focus:ring-0 rounded-full cursor-pointer"
                />
                <div>
                  <strong className="text-xs block text-slate-850">Book with Deposit (25%)</strong>
                  <span className="text-[10px] text-slate-500">Pay ${Math.round((currentTotal + Math.round(currentTotal * 0.15)) * 0.25)} today.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex gap-2 text-[10px] text-slate-500">
            <Shield className="w-4 h-4 text-gold-600 shrink-0" />
            <span>Secure Payments. Protected Bookings. Complete Peace of Mind.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckoutPage;
