import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { backendRequest } from "../Helpers/backendRequest";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

interface CallLog {
  lead_id: string;
  call_started_at: string;
  call_ended_at: string;
  cost: number;
  customer_number: string;
}

interface File {
  id: number;
  name: string;
  url: string | null;
  sync_enable: boolean | null;
  sync_frequency: string | null;
  is_syncing: boolean | null;
  created_at: string;
}

interface Assistant {
  id: number;
  name: string;
  model: string;
  provider: string;
}

interface TeamMember {
  id: number;
  invited_user_email: string;
  is_accepted: boolean;
  role: string;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserDetails();
    }
  }, [isOpen]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await backendRequest("GET", `/user_summary/${userId}`);
      if (response.success) {
        setUserDetails(response.data);
      } else {
        setError("Failed to load user details.");
      }
    } catch {
      setError("An error occurred while fetching user details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading) return <div>Loading...</div>;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 bg-black bg-opacity-50">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white w-full max-w-6xl rounded-lg shadow-lg p-8 mt-12 mb-3 max-h-[90vh] flex flex-col">
          
          <div className="sticky top-0 bg-white z-10 border-b p-4 flex justify-between items-center">
  <h2 className="text-2xl font-bold mb-2">User Details</h2>
  <button
    onClick={onClose}
    className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-700"
  >
    Close
  </button>
</div>

{error && (
  <div className="text-center text-red-500 mt-2">
    <p>{error}</p>
  </div>
)}

        
          <div className="overflow-y-auto flex-grow p-2">
          <section className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Team</h3>
              <table className="w-full table-auto rounded-lg bg-slate-50">
                <thead>
                  <tr className="text-left  text-sm md:text-lg">
                    <th className="py-3 px-2 font-semibold md:px-6">#</th>
                    <th className="py-3 px-2 font-semibold md:px-6">Email</th>
                    <th className="py-3 px-2 font-semibold md:px-6">Status</th>
                    <th className="py-3 px-2 font-semibold md:px-6">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails?.team && userDetails.team.length > 0 ? (
                    userDetails.team.map((team: TeamMember, index: number) => (
                      <tr key={team.invited_user_email} className="border-b">
                        <td className="py-3 px-2 md:px-6">{index + 1}</td>
                        <td className="py-3 px-2 md:px-6">{team.invited_user_email}</td>
                        <td className={`py-3 px-2 md:px-6 ${team.is_accepted ? "text-primary" : "text-red-700"}`}>{team.is_accepted ? "Joined" : "Pending"}</td>
                        <td className="py-3 px-2 md:px-6">{team.role}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        No team members available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
            <section className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Call Logs</h3>
              <table className="w-full table-auto rounded-lg bg-slate-50">
                <thead>
                  <tr className="text-left text-sm md:text-lg">
                    <th className="py-3 px-2 md:px-6 font-semibold">#</th>
                    <th className="py-3 px-2 md:px-6 font-semibold">Start Time</th>
                    <th className="py-3 px-2 md:px-6 font-semibold">End Time</th>
                    <th className="py-3 px-2 md:px-6 font-semibold">Customer Number</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails?.call_logs && userDetails.call_logs.length > 0 ? (
                    userDetails.call_logs.map((log: CallLog, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-2 md:px-6">{index + 1}</td>
                        <td className="py-3 px-2 md:px-6">{new Date(log.call_started_at).toLocaleString()}</td>
                        <td className="py-3 px-2 md:px-6">{new Date(log.call_ended_at).toLocaleString()}</td>
                        <td className="py-3 px-2 md:px-6">{log.customer_number}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No call logs available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Assistants</h3>
              <table className="w-full table-auto rounded-lg bg-slate-50">
                <thead>
                  <tr className="text-left text-sm md:text-lg">
                    <th className="py-3 px-2 md:px-6  font-semibold">#</th>
                    <th className="py-3 px-2 md:px-6  font-semibold">Agent Name</th>
                    <th className="py-3 px-2 md:px-6 font-semibold">Transcriber</th>
                    <th className="py-3 px-2 md:px-6 font-semibold ">Voice Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails?.assistant && userDetails.assistant.length > 0 ? (
                    userDetails.assistant.map((assistant: Assistant, index: number) => (
                      <tr key={assistant.id} className="border-b">
                        <td className="py-3 px-2 md:px-6">{index + 1}</td>
                        <td className="py-3 px-2 md:px-6">{assistant.name}</td>
                        <td className="py-3 px-2 md:px-6">{assistant.model}</td>
                        <td className="py-3 px-2 md:px-6">{assistant.provider}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        No assistants found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

         

            <section className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Files</h3>
              <table className="w-full table-auto rounded-lg bg-slate-50">
                <thead>
                  <tr className="text-left text-sm md:text-lg">
                    <th className="py-3 px-2 md:px-6 font-semibold">#</th>
                    <th className="py-3 px-2 md:px-6 font-semibold">File Name</th>
                    <th className="py-3 px-2 md:px-6 font-semibold">Sync Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails?.files && userDetails.files.length > 0 ? (
                    userDetails.files.map((file: File, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-2 md:px-6">{index + 1}</td>
                        <td className="py-3 px-2 md:px-6">{file.name}</td>
                        <td className="py-3 px-2 md:px-6">{file.sync_enable ? "Yes" : "No"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-400">
                        No files available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>

        
        
        </div>
      </div>
    </Dialog>
  );
};
