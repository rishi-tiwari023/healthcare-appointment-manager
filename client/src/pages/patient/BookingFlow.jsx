import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { patientApi } from '../../api/patient';
import { adminApi } from '../../api/admin';
import { Calendar as CalendarIcon, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

const BookingFlow = () => {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isReschedule = searchParams.get('reschedule') === 'true';
  const appId = searchParams.get('appId');

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [holdSuccess, setHoldSuccess] = useState(false);
  const [error, setError] = useState('');

  const navigation = [
    { name: 'Dashboard', href: '/patient/dashboard' },
    { name: 'Search Doctors', href: '/patient/doctors' },
    { name: 'Appointment History', href: '/patient/history' },
  ];
  
  const nextDates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await adminApi.getDoctorById(doctorId);
        setDoctor(res.data.data);
      } catch (err) {
        setError('Failed to load doctor details.');
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setError('');
      setSelectedSlot(null);
      setHoldSuccess(false);
      try {
        const res = await patientApi.getAvailableSlots(doctorId, selectedDate);
        setAvailableSlots(res.data.data || []);
      } catch (err) {
        setError('Failed to load availability for this date.');
      } finally {
        setIsLoadingSlots(false);
      }
    };
    
    fetchSlots();
  }, [doctorId, selectedDate]);

  const handleHold = async () => {
    if (!selectedSlot) return;
    setIsHolding(true);
    setError('');
    
    try {
      await patientApi.holdSlot({
        doctor_id: doctorId,
        appointment_date: selectedDate,
        slot_time: selectedSlot
      });
      setHoldSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to hold this slot. It might be taken.');
      setSelectedSlot(null);
    } finally {
      setIsHolding(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError('');

    try {
      if (isReschedule && appId) {
        await patientApi.rescheduleAppointment(appId, {
          doctor_id: doctorId,
          appointment_date: selectedDate,
          slot_time: selectedSlot
        });
      } else {
        await patientApi.bookAppointment({
          doctor_id: doctorId,
          appointment_date: selectedDate,
          slot_time: selectedSlot
        });
      }
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm booking.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <DashboardLayout title="Patient Portal" roleColor="emerald" navigation={navigation}>
      <div className="mb-6 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isReschedule ? 'Reschedule Appointment' : 'Book Appointment'}
        </h2>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {doctor && (
          <div className="mb-8 pb-8 border-b border-gray-200 flex items-center">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-200">
              <span className="text-xl font-bold text-emerald-700">{doctor.first_name[0]}{doctor.last_name[0]}</span>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900">Dr. {doctor.first_name} {doctor.last_name}</h3>
              <p className="text-sm text-gray-500">{doctor.specialisation}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Date and Slot Selection */}
          <div className={holdSuccess ? 'opacity-50 pointer-events-none' : ''}>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-emerald-600" />
              1. Select Date
            </h4>
            
            <div className="mb-4">
              <input 
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full max-w-sm border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-4 mb-4">
              {nextDates.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center p-3 w-16 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                        : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">{format(date, 'EEE')}</span>
                    <span className="text-lg font-bold">{format(date, 'd')}</span>
                  </button>
                );
              })}
            </div>

            <h4 className="text-lg font-medium text-gray-900 mb-4 mt-8 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-emerald-600" />
              2. Select Time Slot
            </h4>

            {isLoadingSlots ? (
              <p className="text-sm text-gray-500">Loading available times...</p>
            ) : availableSlots.length === 0 ? (
              <div className="bg-gray-50 rounded-md p-4 border border-gray-200 text-center">
                <p className="text-sm text-gray-600">No available slots for this date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-700'
                      }`}
                    >
                      {slot.substring(0, 5)}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="mt-8">
              <button
                onClick={handleHold}
                disabled={!selectedSlot || isHolding}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isHolding ? 'Holding...' : 'Hold Slot to Continue'}
              </button>
              <p className="mt-2 text-xs text-gray-500 text-center">
                You will have 5 minutes to confirm your booking after holding the slot.
              </p>
            </div>
          </div>

          {/* Right Column: Confirmation */}
          <div className={`transition-opacity duration-300 ${holdSuccess ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 h-full flex flex-col">
              <h4 className="text-lg font-medium text-emerald-900 mb-6 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-emerald-600" />
                3. Confirm Booking
              </h4>
              
              <div className="flex-grow space-y-4 text-emerald-900">
                <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium mb-1">Doctor</p>
                  <p className="font-semibold">{doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : '...'}</p>
                </div>
                <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium mb-1">Date</p>
                  <p className="font-semibold">{format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
                </div>
                <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium mb-1">Time</p>
                  <p className="font-semibold">{selectedSlot ? selectedSlot.substring(0, 5) : '...'}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-200">
                <button
                  onClick={handleConfirm}
                  disabled={!holdSuccess || isConfirming}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {isConfirming ? 'Confirming...' : (isReschedule ? 'Confirm Reschedule' : 'Confirm Appointment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingFlow;
