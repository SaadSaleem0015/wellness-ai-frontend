import React, { useState, useEffect, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { GrFormPrevious } from 'react-icons/gr';
import { MdOutlineNavigateNext } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { backendRequest } from '../Helpers/backendRequest';

interface QAItem {
  question: string;
  answer: string;
}

interface ScheduledCall {
  id: number;
  lead_name: string;
  lead_phone: string; // kept for backward compatibility
  scheduled_time: string;
  status: string;
  assistant_name?: string;
  notes?: string;
  email?: string;
  questions_answers?: QAItem[];
  uuid?: string;
  cancel_url?: string;
}

interface CalendarDay {
  date: Date;
  events: (ScheduledCall & { display_time: string })[];
}

interface CalendarViewProps {
  scheduledCalls: ScheduledCall[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ scheduledCalls }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState<CalendarDay[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ScheduledCall | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayAppointments, setDayAppointments] = useState<(ScheduledCall & { display_time: string })[]>([]);
  const [dayModalTitle, setDayModalTitle] = useState<string>("");

  const generateCalendar = useCallback(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: CalendarDay[] = [];
    let day = startDate;

    while (day <= endDate) {
      // Collect events for each day from scheduled calls, keeping identity
      const events = scheduledCalls
        .map((call) => {
          const parsedDate = parseISO(call.scheduled_time);
          if (isSameDay(parsedDate, day)) {
            return {
              ...call,
              display_time: format(parsedDate, 'hh:mm aa'),
            };
          }
          return null;
        })
        .filter((event) => event !== null) as (ScheduledCall & { display_time: string })[];

      days.push({
        date: day,
        events: isSameMonth(day, monthStart) ? events : [],
      });
      day = addDays(day, 1);
    }

    setDaysInMonth(days);
  }, [currentDate, scheduledCalls]);

  useEffect(() => {
    generateCalendar();
  }, [generateCalendar]);

  const handleNextMonth = () => setCurrentDate(addDays(endOfMonth(currentDate), 1));
  const handlePreviousMonth = () => setCurrentDate(addDays(startOfMonth(currentDate), -1));

  const openDayModal = (date: Date, events: (ScheduledCall & { display_time: string })[]) => {
    setDayAppointments(events);
    setDayModalTitle(format(date, 'MMMM dd, yyyy'));
    setIsDayModalOpen(true);
  };

  const closeDayModal = () => {
    setIsDayModalOpen(false);
    setDayAppointments([]);
    setDayModalTitle("");
  };

  const handleAppointmentClick = async (appointment: ScheduledCall) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
    if (!appointment.uuid) return;
    try {
      setIsDetailLoading(true);
      const detail = await backendRequest<{ name: string; email: string; appointment_date: string; questions_answers?: QAItem[]; status: string; cancel_url?: string }>(
        'GET',
        `/booking/appointments/${appointment.uuid}`
      );
      if ('email' in detail) {
        setSelectedAppointment(prev => prev ? {
          ...prev,
          lead_name: detail.name || prev.lead_name,
          email: detail.email || prev.email,
          lead_phone: prev.lead_phone,
          scheduled_time: detail.appointment_date || prev.scheduled_time,
          status: detail.status || prev.status,
          questions_answers: Array.isArray(detail.questions_answers) ? detail.questions_answers : prev.questions_answers,
          cancel_url: detail.cancel_url || prev.cancel_url,
        } : prev);
      }
    } catch {
      // noop: keep existing minimal info if detail fetch fails
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-1 bg-gradient-to-br from-slate-50 to-slate-100 rounded-md shadow-lg">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 p-4">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="flex space-x-1">
          <button
            onClick={handlePreviousMonth}
            className="flex items-center p-1 sm:p-2 bg-primary text-white rounded-full shadow-md hover:bg-hoverdPrimary transition duration-200"
          >
            <GrFormPrevious />
          </button>
          <button
            onClick={handleNextMonth}
            className="flex items-center p-1 sm:p-2 bg-primary text-white rounded-full shadow-md hover:bg-hoverdPrimary transition duration-200"
          >
            <MdOutlineNavigateNext />
          </button>
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden">
        <div className="min-w-[700px] grid grid-cols-7 gap-2 text-center text-xs sm:text-base font-semibold text-gray-600 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="uppercase tracking-wide text-gray-700">
              {day}
            </div>
          ))}
        </div>

        <div className="min-w-[700px] grid grid-cols-7 gap-3">
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={`p-1 sm:p-2 border rounded-md h-28 sm:h-28 transition-all duration-200 shadow-sm hover:shadow-md overflow-x-auto custom-scrollbar space-y-2 ${
                isSameMonth(day.date, currentDate)
                  ? day.events.length > 0
                    ? 'bg-blue-50'
                    : 'bg-white'
                  : 'bg-gray-200'
              } ${
                isSameDay(day.date, new Date()) ? 'border-primary ' : 'border-gray-200'
            } cursor-pointer`}
            onClick={() => openDayModal(day.date, day.events)}
          >
              <div
                className={`text-xs sm:text-base sm:font-semibold mb-1 ${
                  isSameDay(day.date, new Date()) ? 'text-primary' : 'text-gray-800'
                }`}
              >
                {format(day.date, 'd')}
              </div>
            {day.events.map((event, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col text-xs rounded-lg px-2 py-1 mt-1 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${
                    event.status === 'active'
                      ? 'bg-green-100 border-l-2 border-green-500 hover:bg-green-200'
                      : event.status === 'canceled'
                      ? 'bg-red-50 border-l-2 border-red-400 hover:bg-red-100'
                      : 'bg-gray-100 border-l-2 border-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 truncate">
                      {event.lead_name}
                    </span>
                    <span className="text-xs text-gray-600 ml-1">
                      {event.display_time}
                    </span>
                  </div>
                  {event.assistant_name && (
                    <span className="text-xs text-gray-600 truncate mt-0.5">
                      {event.assistant_name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    {/* Day Appointments Modal */}
    {isDayModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Appointments - {dayModalTitle}</h2>
            <button onClick={closeDayModal} className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <IoClose size={24} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {dayAppointments.length === 0 && (
              <div className="text-sm text-gray-600">No appointments for this date.</div>
            )}
            {dayAppointments.map((appt, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded border ${
                  appt.status === 'active'
                    ? 'bg-green-50 border-green-300'
                    : appt.status === 'canceled'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">{appt.lead_name}</span>
                  <span className="text-xs text-gray-600">{appt.display_time}{appt.assistant_name ? ` • ${appt.assistant_name}` : ''}</span>
                </div>
                <button
                  onClick={() => {
                    closeDayModal();
                    handleAppointmentClick(appt);
                  }}
                  className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-hoverdPrimary"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

      {/* Appointment Detail Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Appointment Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Appointment Overview
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="text-gray-800 font-semibold">{selectedAppointment.lead_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="text-gray-800">{selectedAppointment.email || selectedAppointment.lead_phone}</span>
                  </div>
                  {selectedAppointment.uuid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Reference:</span>
                      <span className="text-gray-800 truncate">{selectedAppointment.uuid}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Appointment Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Date & Time:</span>
                    <span className="text-gray-800 font-semibold">
                      {format(parseISO(selectedAppointment.scheduled_time), 'MMM dd, yyyy - hh:mm aa')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAppointment.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </span>
                  </div>
                  {isDetailLoading && (
                    <div className="text-xs text-gray-500">Loading details…</div>
                  )}
                  {selectedAppointment.assistant_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Meeting Type:</span>
                      <span className="text-gray-800">{selectedAppointment.assistant_name}</span>
                    </div>
                  )}
                  {selectedAppointment.cancel_url && selectedAppointment.status !== 'canceled' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Cancel Link:</span>
                      <a href={selectedAppointment.cancel_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm">Open</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions & Answers */}
              {selectedAppointment.questions_answers && selectedAppointment.questions_answers.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Questions & Answers
                  </h3>
                  <div className="space-y-3">
                    {selectedAppointment.questions_answers.map((qa, idx) => (
                      <div key={idx} className="">
                        <div className="text-sm font-semibold text-gray-800">{qa.question}</div>
                        <div className="text-sm text-gray-700 mt-0.5">{qa.answer || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {selectedAppointment.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Notes
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Here you can add functionality to edit or manage the appointment
                    console.log('Edit appointment:', selectedAppointment.id);
                  }}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-hoverdPrimary transition-colors duration-200 font-medium"
                >
                  Manage Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
