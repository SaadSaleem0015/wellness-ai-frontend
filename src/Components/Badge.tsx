import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseISO, isBefore, format } from 'date-fns';
import { backendRequest } from '../Helpers/backendRequest';
import { FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiArrowRight } from 'react-icons/fi';
import { formatInTimeZone } from 'date-fns-tz';

export function AppointmentBadge() {
  const [status, setStatus] = useState<string | null>(null);
  const [isStartTimeValid, setIsStartTimeValid] = useState<boolean>(true);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const response = await backendRequest('GET', '/appointment_status');
      
      if (response.success) {
        localStorage.setItem('appointmentNotification', 'success');
        localStorage.setItem('start_time', response.start_time || null);
        setStatus('success');
        setMeetingLink(response.meeting_link || null);
        const startTimeStr = response.start_time;
        if (startTimeStr) {
          const startTime = parseISO(startTimeStr);
          setIsStartTimeValid(!isBefore(startTime, new Date()));
        }
      }
    } catch (error) {
      console.error('Error fetching appointment status:', error);
      setStatus('failure');
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    checkStatus(); 
  }, []); 

  const handleClick = () => {
    if (!status) {
      navigate('/appointment');
    }
  };

  const formattedStartTime = localStorage.getItem('start_time')
    ? formatInTimeZone(localStorage.getItem('start_time')!, 'Asia/Karachi', 'eee, MMM d, hh:mm a')
    : null;

  if (isLoading) {
    return (
      <div className="relative flex items-center px-4 py-3 rounded-lg bg-blue-50 text-blue-800 shadow-md animate-pulse mb-4">
        <FiClock className="mr-2 animate-spin" />
        <span>Checking appointment status...</span>
      </div>
    );
  }

  if (status == null) {
    return (
      <div
        onClick={handleClick}
        className="relative flex items-center px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white shadow-sm  transition-all cursor-pointer group mb-4 "
      >
        <FiCalendar className="mr-2 text-xl" />
        <div>
          <p className="font-medium">
            Schedule a personalized onboarding call to discover how our platform can work for you
          </p>
          <p className="text-xs opacity-80">Click to book your appointment</p>
        </div>
        <FiArrowRight className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity absolute right-8" />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-start px-4 py-3 rounded-lg shadow-md cursor-pointer transition-all mb-4 ${
        status === 'success'
          ? isStartTimeValid
            ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-l-4 border-green-500'
            : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-l-4 border-amber-500'
          : 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-l-4 border-red-500'
      }`}
    >
      {status === 'success' ? (
        isStartTimeValid ? (
          <FiCheckCircle className="mr-2 text-xl text-green-500 mt-0.5" />
        ) : (
          <FiAlertCircle className="mr-2 text-xl text-amber-500 mt-0.5" />
        )
      ) : (
        <FiAlertCircle className="mr-2 text-xl text-red-500 mt-0.5" />
      )}
      <div>
        <p className="font-medium">
          {status === 'success'
            ? isStartTimeValid
              ? 'Appointment Confirmed!'
              : 'Appointment Expired'
            : 'Scheduling Failed'}
        </p>
        <p className="text-sm">
          {status === 'success'
            ? isStartTimeValid
              ? 'Your onboarding session is booked'
              : 'Your scheduled time has passed'
            : 'Click to try again'}
        </p>
        {formattedStartTime && (
          <div className={`mt-1 text-xs flex items-center ${isStartTimeValid ? 'text-green-600' : 'text-amber-600'}`}>
            <FiClock className="mr-1" />
            {formattedStartTime}
          </div>
        )}
        {meetingLink && isStartTimeValid && (
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800"
          >
            Join your meeting
          </a>
        )}
      </div>
    </div>
  );
}
