import { useEffect, useMemo, useState } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import { notifyResponse } from "../Helpers/notyf";
import { Card } from "../Components/Card";
import ConfirmationModal from "../Components/ConfirmationModal";
import { PageNumbers } from "../Components/PageNumbers";

interface Assistant {
  id: string | number;
  name: string;
}

interface LeadFile {
  id: number;
  name: string;
}

interface ScheduleItem {
  id: number;
  assistant_id: string | number;
  file_id: number;
  scheduled_at: string; // ISO string
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  detail?: string;
}

interface FileApiResponse {
  success: boolean;
  total: number;
  data: LeadFile[];
}

export default function Schedule() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [files, setFiles] = useState<LeadFile[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const [assistantId, setAssistantId] = useState<string | number>("");
  const [fileId, setFileId] = useState<number | "">("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [showModal, setShowModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAssistants = async () => {
    try {
      const res = await backendRequest<Assistant[] | ApiResponse<Assistant[]>>("GET", "/get-user-assistants");
      const data = Array.isArray(res) ? res : (res as ApiResponse<Assistant[]>)?.data || [];
      setAssistants(data);
      if (data.length > 0) setAssistantId(data[0].id);
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
      setAssistants([]);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await backendRequest<FileApiResponse | LeadFile[]>("GET", "/leads-file");
      if (res && 'success' in res && res.success) {
        setFiles(res.data || []);
        if (res.data?.length > 0) setFileId(res.data[0].id);
      } else if (Array.isArray(res)) {
        setFiles(res);
        if (res.length > 0) setFileId(res[0].id);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
      setFiles([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await backendRequest<ScheduleItem[] | ApiResponse<ScheduleItem[]>>("GET", "/schedules");
      const data = Array.isArray(res) ? res : (res as ApiResponse<ScheduleItem[]>)?.data || [];
      setSchedules(data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      setSchedules([]);
    }
  };

  useEffect(() => {
    fetchAssistants();
    fetchFiles();
    fetchSchedules();
  }, []);

  const toIsoFromLocal = (d: string, t: string): string | null => {
    if (!d || !t) return null;
    const iso = new Date(`${d}T${t}:00`);
    if (isNaN(iso.getTime())) return null;
    return iso.toISOString();
  };

  const handleCreate = async () => {
    if (!assistantId || !fileId || !date || !time) {
      notifyResponse({ success: false, detail: "All fields are required" } as ApiResponse<never>);
      return;
    }
    const scheduled_at = toIsoFromLocal(date, time);
    if (!scheduled_at) {
      notifyResponse({ success: false, detail: "Invalid date/time" } as ApiResponse<never>);
      return;
    }
    setLoading(true);
    try {
      const res = await backendRequest<ApiResponse<never>>("POST", "/schedule", {
        assistant_id: assistantId,
        file_id: fileId,
        scheduled_at,
      });
      notifyResponse(res);
      if (res.success) {
        await fetchSchedules();
        setDate("");
        setTime("");
      }
    } catch (error) {
      console.error("Failed to create schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    setScheduleToDelete(id);
    setShowModal(true);
  };

  const deleteSchedule = async () => {
    if (scheduleToDelete == null) return;
    try {
      const res = await backendRequest<ApiResponse<never>>("DELETE", `/schedule/${scheduleToDelete}`);
      notifyResponse(res);
      if (res.success) {
        setSchedules((prev) => prev.filter((s) => s.id !== scheduleToDelete));
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    } finally {
      setShowModal(false);
      setScheduleToDelete(null);
    }
  };

  const { filteredItems, pagesCount, pageNumbers } = useMemo(() => {
    const items = schedules.filter((s) => {
      const assistantName = assistants.find((a) => a.id === s.assistant_id)?.name || "";
      const fileName = files.find((f) => f.id === s.file_id)?.name || "";
      const hay = `${assistantName} ${fileName} ${s.scheduled_at}`.toLowerCase();
      return hay.includes(search.trim().toLowerCase());
    });
    const perPage = 10;
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const pages = Math.ceil(items.length / perPage) || 1;
    return {
      filteredItems: items.slice(start, end),
      pagesCount: pages,
      pageNumbers: Array.from({ length: Math.min(7, pages) }, (_, i) => i + 1),
    };
  }, [schedules, assistants, files, search, currentPage]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-2xl font-bold">Schedule Calls</h2>
        <div className="relative flex items-center">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setCurrentPage(1);
            }}
            placeholder="Search..."
            className="w-full md:w-64 pl-4 pr-4 py-2 text-sm sm:text-base rounded-lg border border-primary outline-none"
          />
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assistant</label>
            <select
              className="w-full p-2 border rounded"
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
            >
              {assistants.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead File</label>
            <select
              className="w-full p-2 border rounded"
              value={fileId}
              onChange={(e) => setFileId(Number(e.target.value))}
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input type="date" className="w-full p-2 border rounded" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time (hourly)</label>
            <input type="time" step="3600" className="w-full p-2 border rounded" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            disabled={loading}
            onClick={handleCreate}
            className={`bg-primary ${loading ? 'bg-[#6aa3c2]' : ''} text-white px-6 py-2 rounded`}
          >
            {loading ? "Scheduling..." : "Create Schedule"}
          </button>
        </div>
      </Card>

      <div className="mt-6">
        <Card>
          <div className="overflow-auto">
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left text-sm font-medium">ID</th>
                  <th className="p-4 text-left text-sm font-medium">Assistant</th>
                  <th className="p-4 text-left text-sm font-medium">Lead File</th>
                  <th className="p-4 text-left text-sm font-medium">Scheduled At</th>
                  <th className="p-4 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((s) => {
                  const assistantName = assistants.find((a) => a.id === s.assistant_id)?.name || "-";
                  const fileName = files.find((f) => f.id === s.file_id)?.name || "-";
                  return (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 align-middle">{s.id}</td>
                      <td className="p-4 align-middle">{assistantName}</td>
                      <td className="p-4 align-middle">{fileName}</td>
                      <td className="p-4 align-middle whitespace-nowrap">{new Date(s.scheduled_at).toLocaleString()}</td>
                      <td className="p-4 align-middle text-right">
                        <button
                          onClick={() => confirmDelete(s.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={100} className="text-center p-2">No schedules found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        <PageNumbers
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pagesCount={pagesCount}
        />
      </div>

      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={deleteSchedule}
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </div>
  );
}



