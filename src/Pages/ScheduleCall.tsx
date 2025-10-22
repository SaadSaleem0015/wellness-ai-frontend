import { useEffect, useState } from "react";
import { FaListUl, FaRegCalendarAlt } from "react-icons/fa";
import { DateTime } from "luxon";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import CalenderView from "../Components/CalenderView";
import "react-calendar/dist/Calendar.css";
import { FiX } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  scdedule?: object[];

}

type Day = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

const ScheduleCall = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);

  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const [timeZone, setTimeZone] = useState<string>("Eastern");
  const [scheduledCalls, setScheduledCalls] = useState<Call[]>([]);
  const [status, setStatus] = useState<"Pending" | "Completed" | "Failed">(
    "Pending"
  );
  const [title, setTitle] = useState("");
  const [selectedView, setSelectedView] = useState<"list" | "calendar">("list");

  const [updatebutton, setUpdateButton] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const callid = searchParams.get("id");
console.log("selectedAssistant",selectedAssistant);

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



  const navigate = useNavigate();

  useEffect(() => {
    if (callid) {
      const fetchCallData = async () => {
        try {
          const response = await backendRequest<Call[], []>(
            "GET",
            `/get_scheduled_call/${callid}`
          );
  
          if ("id" in response) {
            setTitle(response.title || "");
            setSelectedAssistant(response.vapi_assistant_id || "");
            setTimeZone(response.timeZone || "Eastern");
            setStatus(
              response.status === "Completed" ? "Completed" : "Pending"
            );
  
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
            setUpdateButton(true);
          } else {
            console.error("Error fetching call details:", response.detail);
          }
        } catch (error) {
          console.error("Error fetching call details:", error);
        }
      };
  
      fetchCallData();
    }
  }, [callid]);
  
  useEffect(() => {
    fetchAssistants();
  }, []);
  const handleEditCall = async () => {
    if (!selectedAssistant || !title ) {
      notifyResponse({ success: false, detail: "All fields are required" });
      return;
    }
    const schedule = Object.entries(weeklyHours).reduce((acc, [day, times]) => {
      if (times !== null) { 
        acc.push({ day, ...times });
      }
      return acc;
    }, [] as { day: string; start: string; end: string }[]);
  
    if (Object.values(weeklyHours).every(({ start, end }) => !start && !end)) {
      notifyResponse({ success: false, detail: "Please select a schedule" });
      return;
    }
    setLoading(true)
    
    const callData = {
      title: title,
      vapi_assistant_id: selectedAssistant,
      timeZone: timeZone,
      status: status,
      schedule:schedule
    };
    try {
      const response = await backendRequest(
        "PUT",
        `/update_scheduled_call/${callid}`,
        callData
      );
      notifyResponse(response);
      if (response.success) {
        setUpdateButton(false);
        resetForm();
        navigate("/allscheduledCall");
      }
    } catch (error) {
      console.error("Error fetching call details:", error);
    }finally{
    setLoading(false)

    }
  };

  
  const handleSchedule = async () => {


    if (selectedAssistant ==='No Assistant Found') {
      notifyResponse({ success: false, detail: "There is no active assistant" });
      return;
    }
    if ( !title) {
      notifyResponse({ success: false, detail: "Title is required" });
      return;
    }
    const schedule = Object.entries(weeklyHours).reduce((acc, [day, times]) => {
      if (times !== null) { 
        acc.push({ day, ...times });
      }
      return acc;
    }, [] as { day: string; start: string; end: string }[]);
  
    if (Object.values(weeklyHours).every(({ start, end }) => !start && !end)) {
      notifyResponse({ success: false, detail: "Please select a schedule" });
      return;
    }
    setLoading(true)
  
    const callData = {
      title,
      vapi_assistant_id: selectedAssistant,
      timeZone,
      status,
      schedule,
    };
    try {
      const response = await backendRequest("POST", "/scheduled-call", callData);
      notifyResponse(response);
  
      if (response.success) {
        navigate("/allscheduledCall")
        resetForm();
        setWeeklyHours(
          {
            MON: { start: "", end: "" },
            TUE: { start: "", end: "" },
            WED: { start: "", end: "" },
            THU: { start: "", end: "" },
            FRI: { start: "", end: "" },
            SAT: { start: "", end: "" },
            SUN: { start: "", end: "" },
          }
      )
      }
    } catch (error) {
      console.error("Error scheduling call:", error);
    }finally{
      setLoading(false)

    }
  };
  
  const convertToUTC = (date: Date, timeZone: string) => {
    if (!DateTime.isValidZone(timeZone)) {
      notifyResponse({ success: false, detail: `Invalid time zone: ${timeZone}` });
      return date; 
    }
    const zonedDate = DateTime.fromJSDate(date, { zone: timeZone });
    return zonedDate.toUTC().toJSDate();
  };
  
  const resetForm = () => {
    setTitle("");
    setTimeZone("Eastern");
    setStatus("Pending");
  };

  const handleToggle = (view: "list" | "calendar") => {
    setSelectedView(view);
  };

  const handleWeeklyHourChange = (day: Day, times: { start: string; end: string }) => {
    const [startHour, startMinute] = times.start.split(":").map(Number);
    const [endHour, endMinute] = times.end.split(":").map(Number);
  
    if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
      notifyResponse({ success: false, detail: "End time must be after start time" });
      return;
    }
  
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...times },
    }));
    
  };
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
      setSelectedAssistant(activeAssistant?.vapi_assistant_id || "No Assistant Found");
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };
  

  const fetchCalls = async () => {
    try {
      const response = await backendRequest<Call[], []>(
        "GET",
        "/get_schedule_calls"
      );
      setScheduledCalls(response);
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };
  useEffect(() => {
    fetchCalls();
  }, []);
console.log("selectedAssistant",selectedAssistant);

  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-2xl font-bold ">Schedule Call</h1>
        {updatebutton ? (
          <button
            onClick={handleEditCall}
            disabled = {loading}
            className={`bg-primary ${loading && 'bg-[#6aa3c2]'}  flex items-center gap-4 text-sm sm:text-base text-white py-2 sm:py-2 px-2 sm:px-6 rounded-md shadow-md hover:bg-hoverdPrimary`}
          >
            
            
{loading ? "Updating..." : "Update"}
          </button>
        ) : (
          <button
            disabled = {loading}

            onClick={handleSchedule}
            className={`bg-primary ${loading && 'bg-[#6aa3c2]'} flex items-center gap-4 text-sm sm:text-base text-white py-2 sm:py-2 px-2 sm:px-6 rounded-md shadow-md hover:bg-hoverdPrimary`}
          >

{loading ? "Scheduling..." : "Schedule"}
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
        <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 justify-start lg:space-x-10 gap-2">
          <div className="flex flex-col w-full md:w-1/2">
            <label
              htmlFor="assistantSelect"
              className="mb-1 text-sm sm:text-base text-gray-600 font-medium"
            >
              Assistant
            </label>
            <input
              id="assistantSelect"
              disabled
              className="p-3.5 w-full border border-gray-300 rounded-lg text-gray-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={
                assistants.find(
                  (assistant) => assistant.assistant_toggle === true
                )?.name || "No Assistant Found"
              }
            />
          </div>
          <div className="flex flex-col w-full md:w-1/2">
            <label className="mb-1 text-sm sm:text-base text-gray-600 font-medium">
              Schedule Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Call title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 text-xs sm:text-base sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start">
        {/* <div className="flex items-center p-2 ml-3 rounded-xl bg-slate-100">
          <button
            onClick={() => handleToggle("list")}
            className={`flex items-center px-4 py-2 rounded-xl transition ${
              selectedView === "list"
                ? "bg-white shadow-md text-primary font-semibold"
                : "text-gray-700"
            }`}
          >
            <FaListUl className="mr-2" />
            List view
          </button>
          <button
            onClick={() => handleToggle("calendar")}
            className={`flex items-center px-4 py-2 rounded-xl transition ${
              selectedView === "calendar"
                ? "bg-white shadow-md text-primary font-semibold"
                : "text-gray-700"
            }`}
          >
            <FaRegCalendarAlt className="mr-2" />
            Calendar view
          </button>
        </div> */}
      </div>
      {selectedView === "list" && (
        <div className="flex space-x-4 border-2 border-gray-300 mt-10">
          <div className="flex-1 space-y-4 px-12 py-6 border-r-2">
            <h3 className="text-lg font-semibold">Weekly Hours</h3>
            <div className="flex flex-col max-w-lg pb-3">
              <label
                htmlFor="timeZoneSelect"
                className="mb-1 text-sm sm:text-base text-gray-600 font-medium"
              >
                Time Zone
              </label>
              <select
                id="timeZoneSelect"
                className="p-2 sm:p-2.5 text-xs sm:text-base w-full border border-gray-300 rounded-lg text-gray-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
              >
                <option value="Eastern">Eastern Time</option>
                <option value="Central">Central Time</option>
                <option value="Pacific">Pacific Time</option>
              </select>
            </div>

            {Object.entries(weeklyHours).map(([day, { start, end }]) => (
  <div key={day} className="flex items-center space-x-6">
    <input
      type="checkbox"
      checked={!!start || !!end}
      onChange={(e) =>
        handleWeeklyHourChange(
          day as Day,
          e.target.checked ? { start: "09:00", end: "17:00" } : { start: "", end: "" }
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
            ...weeklyHours[day],
            start: e.target.value,
          })
        }
        className="border p-2 pr-5 rounded w-56"
      />
    ) : (
      <span className="w-48 text-gray-500">--:--</span>
    )}
    {end ? (
      <input
        type="time"
        value={end}
        onChange={(e) =>
          handleWeeklyHourChange(day as Day, {
            ...weeklyHours[day],
            end: e.target.value,
          })
        }
        className="border p-2 rounded w-56"
      />
    ) : (
      <span className="w-48 text-gray-500">--:--</span>
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
      )}

      {selectedView === "calendar" && (
        <div className=" mt-12">
          <CalenderView scheduledCalls={scheduledCalls} />
        </div>
      )}
    </div>
  );
};

export default ScheduleCall;
