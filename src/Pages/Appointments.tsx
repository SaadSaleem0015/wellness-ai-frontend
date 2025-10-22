import { useState, useEffect, useCallback } from "react";
import CalenderView from "../Components/CalenderView";
import { backendRequest } from "../Helpers/backendRequest";

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
}

interface CustomAppointment {
  uuid: string;
  name: string;
  email?: string;
  appointment_date: string;
  questions_answers?: QAItem[];
  status?: string;
  cancel_url?: string;
}

interface CustomAppointmentsResponse {
  appointments: CustomAppointment[];
}

export default function Appointments() {
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);

  // New format from backend: { appointments: [ { uuid, name, email, appointment_date, questions_answers, status, cancel_url } ] }
  const transformCustomAppointments = (appointments: CustomAppointment[]): ScheduledCall[] => {
    return appointments.map((appt, idx) => {
      const safeIdSource = `${appt.email || ''}-${appt.appointment_date || ''}-${idx}`;
      const id = Math.abs(Array.from(safeIdSource).reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0), 0));
      return {
        id,
        lead_name: appt.name || 'Unknown',
        lead_phone: appt.email || '',
        scheduled_time: appt.appointment_date,
        status: appt.status || 'active',
        assistant_name: undefined,
        notes: undefined,
        email: appt.email || '',
        questions_answers: Array.isArray(appt.questions_answers) ? appt.questions_answers : [],
        uuid: appt.uuid,
      } as ScheduledCall;
    });
  };

  const fetchScheduledCalls = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backendRequest<CustomAppointmentsResponse>("GET", "/booking/appointments");

      if (response && 'appointments' in response && Array.isArray(response.appointments)) {
        const transformed = transformCustomAppointments(response.appointments);
        setScheduledCalls(transformed);
      } else {
        setScheduledCalls([]);
      }
    } catch (error) {
      console.error("Error fetching scheduled events:", error);
      setScheduledCalls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduledCalls();
  }, [fetchScheduledCalls]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointments</h1>
        <p className="text-gray-600">Manage and view your scheduled appointments and calls.</p>
        {!loading && scheduledCalls.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {scheduledCalls.length} active appointment{scheduledCalls.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : scheduledCalls.length > 0 ? (
          <CalenderView scheduledCalls={scheduledCalls} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">No Active Appointments</h3>
            <p className="text-center">You don't have any active appointments scheduled at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
