import { useEffect, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import "react-calendar/dist/Calendar.css";
import { FiX } from "react-icons/fi";
import RequirementsCard from "../Components/RequirementsCard";

interface Assistant {
  id: string;
  name: string;
  attached_Number: string | null;
  vapi_assistant_id: string | null;
  assistant_toggle: boolean;
}

interface Call {
  id: number;
  vapi_assistant_id: string;
  title?: string;
  date?: Date;
  call_id: string | null;
  status?: string;
  timeZone?: string;
  schedule?: object[];
}

type Day = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

const BusinessSchedule = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const [timeZone, setTimeZone] = useState<string>("US/Eastern");
  const [status, setStatus] = useState<"Pending" | "Completed" | "Failed">(
    "Pending"
  );
  const [title, setTitle] = useState("Business Schedule call");
  const [loading, setLoading] = useState<boolean>(false);
  const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);
  const [sheduldeId, setSheduldeId] = useState<number | null>(null);
  const [showRequirements, setShowRequirements] = useState<boolean>(true);

  const [weeklyHours, setWeeklyHours] = useState<
    Record<Day, { start: string; end: string }>
  >({
    MON: { start: "", end: "" },
    TUE: { start: "", end: "" },
    WED: { start: "", end: "" },
    THU: { start: "", end: "" },
    FRI: { start: "", end: "" },
    SAT: { start: "", end: "" },
    SUN: { start: "", end: "" },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await backendRequest<Call | { detail: string }>(
          "GET",
          `/get_scheduled_call`
        );

        if ("id" in response) {
          setIsUpdateMode(true);
          setTitle(response.title || "Business Schedule Call");
          setSelectedAssistant(response.vapi_assistant_id || "");
          setTimeZone(response.timeZone || "Eastern");
          setSheduldeId(response.id);


          const updatedWeeklyHours = {
            MON: { start: "", end: "" },
            TUE: { start: "", end: "" },
            WED: { start: "", end: "" },
            THU: { start: "", end: "" },
            FRI: { start: "", end: "" },
            SAT: { start: "", end: "" },
            SUN: { start: "", end: "" },
          };

          response.schedule?.forEach((daySchedule: any) => {
            updatedWeeklyHours[daySchedule.day as Day] = {
              start: daySchedule.start || "",
              end: daySchedule.end || "",
            };
          });
          setWeeklyHours(updatedWeeklyHours);
        }
      } catch (error) {
        console.error("Error fetching scheduled call:", error);
      }
    };

    fetchInitialData();
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const response = await backendRequest<Assistant[]>(
        "GET",
        "/get-user-assistants"
      );
      const assistantsData = Array.isArray(response) ? response : [];
      setAssistants(assistantsData);

      const activeAssistant = assistantsData.find(
        (assistant) => assistant.assistant_toggle === true
      );
      setSelectedAssistant(
        activeAssistant?.vapi_assistant_id || "No Assistant Found"
      );
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };

  const handleWeeklyHourChange = (
    day: Day,
    times: { start: string; end: string }
  ) => {
    const [startHour, startMinute] = times.start.split(":").map(Number);
    const [endHour, endMinute] = times.end.split(":").map(Number);

    if (
      startHour > endHour ||
      (startHour === endHour && startMinute >= endMinute)
    ) {
      notifyResponse({
        success: false,
        detail: "End time must be after start time",
      });
      return;
    }
    setTitle("Business Schedule Call");

    setWeeklyHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...times },
    }));
  };

  const getSchedulePayload = () => {
    return Object.entries(weeklyHours).reduce((acc, [day, times]) => {
      if (times.start && times.end) {
        acc.push({ day, ...times });
      }
      return acc;
    }, [] as { day: string; start: string; end: string }[]);
  };

  const resetForm = () => {
    setTitle("");
    setTimeZone("Eastern");
    setStatus("Pending");
  };

  const handleSchedule = async () => {
    if (isUpdateMode) {
      notifyResponse({
        success: false,
        detail: "You already have a scheduled call. Please update it.",
      });
      return;
    }
    console.log("selectedAssistant", selectedAssistant)
    if (!selectedAssistant) {
      notifyResponse({ success: false, detail: "All fields are required" });
      return;
    }

    const schedule = getSchedulePayload();

    if (schedule.length === 0) {
      notifyResponse({ success: false, detail: "Please select a schedule" });
      return;
    }

    setLoading(true);

    const callData = {
      title,
      vapi_assistant_id: selectedAssistant,
      timeZone:timeZone === "Eastern" ? "US/Eastern":timeZone,
      status,
      schedule,
    };

    try {
      const response = await backendRequest(
        "POST",
        "/scheduled-call",
        callData
      );
      notifyResponse(response);
      if (response.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error scheduling call:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCall = async () => {
    if (!selectedAssistant ) {
      notifyResponse({ success: false, detail: "All fields are required" });
      return;
    }

    const schedule = getSchedulePayload();

    if (schedule.length === 0) {
      notifyResponse({ success: false, detail: "Please select a schedule" });
      return;
    }

    setLoading(true);

    const callData = {
      title,
      vapi_assistant_id: selectedAssistant,
      timeZone:timeZone === "Eastern" ? "US/Eastern":timeZone,
      status,
      schedule,
    };

    try {
      const response = await backendRequest(
        "PUT",
        `/update_scheduled_call/${sheduldeId}`,
        callData
      );
      notifyResponse(response);
      if (response.success) {
        resetForm();
      }
    } catch (error) {
      console.error("Error updating call:", error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="container mx-auto p-2 sm:p-4 lg:p-6 bg-white">
      <RequirementsCard setShowRequirements={setShowRequirements} showRequirements = {showRequirements}/>
      <div className="flex justify-between items-center">
        <h1 className="text-lg sm:text-2xl font-medium text-gray-800 ml-2">
          Business Schedule Call
        </h1>
        <button
          onClick={isUpdateMode ? handleEditCall : handleSchedule}
          disabled={loading}
          className={`bg-primary ${loading && "bg-[#6aa3c2]"
            } flex items-center gap-4 text-sm sm:text-base text-white py-2 sm:py-2 px-2 sm:px-6 rounded-md shadow-md hover:bg-hoverdPrimary`}
        >
          {loading
            ? isUpdateMode
              ? "Updating..."
              : "Scheduling..."
            : isUpdateMode
              ? "Update"
              : "Schedule"}
        </button>
      </div>

      <div className="bg-white p-2 sm:p-4 md:p-6 pt-0 pb-0 rounded-lg shadow-sm mb-6 space-y-4">
        <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 justify-start lg:space-x-10 gap-2">
          <div className="flex flex-col w-full md:w-1/2">
            <label className="mb-1 text-sm sm:text-base text-gray-600 font-medium">
              Assistant
            </label>
            <input
              disabled
              className="p-3.5 w-full border border-gray-300 rounded-lg text-gray-700"
              value={
                assistants.find((assistant) => assistant.assistant_toggle)
                  ?.name || "No Assistant Found"
              }
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-4 border-none sm:border-2 sm:border-gray-300 mt-10">
        <div className="flex-1 space-y-4 px-2 sm:px-4 md:px-6 lg:px-12 py-6 pt-0  overflow-x-auto">
          <h3 className="text-lg font-semibold">Business Hours</h3>

          <div className="flex flex-col max-w-lg pb-3">
            <label className="mb-1 text-sm sm:text-base text-gray-600 font-medium">
              Time Zone
            </label>
            <select
              className="p-2 w-[150px] md:w-[200px] sm:p-2.5 text-xs sm:text-base border border-gray-300 rounded-lg text-gray-700 outline-none cursor-pointer"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            >
              <option value="US/Eastern">Eastern Time</option>
              <option value="US/Central">Central Time</option>
              <option value="US/Pacific">Pacific Time</option>

            </select>
          </div>

          <div className="overflow-x-auto">
            {Object.entries(weeklyHours).map(([day, { start, end }]) => (
              <div
                key={day}
                className="flex items-center space-x-6 min-w-[420px] max-w-lg"
              >
                <input
                  type="checkbox"
                  checked={!!start || !!end}
                  onChange={(e) =>
                    handleWeeklyHourChange(
                      day as Day,
                      e.target.checked
                        ? { start: "09:00", end: "17:00" }
                        : { start: "", end: "" }
                    )
                  }
                  className="h-4 w-4"
                />
                <span className="w-16">{day}</span>

                {start ? (
                  <input
                    type="time"
                    value={start}
                    onChange={(e) =>
                      handleWeeklyHourChange(day as Day, {
                        ...weeklyHours[day as Day],
                        start: e.target.value,
                      })
                    }
                    className="border p-2 pr-5 rounded w-40"
                  />
                ) : (
                  <span className="w-32 text-gray-500">--:--</span>
                )}

                {end ? (
                  <input
                    type="time"
                    value={end}
                    onChange={(e) =>
                      handleWeeklyHourChange(day as Day, {
                        ...weeklyHours[day as Day],
                        end: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-40"
                  />
                ) : (
                  <span className="w-32 text-gray-500">--:--</span>
                )}

                {(start || end) && (
                  <button
                    onClick={() =>
                      handleWeeklyHourChange(day as Day, { start: "", end: "" })
                    }
                    className="hover:text-red-700"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSchedule;
