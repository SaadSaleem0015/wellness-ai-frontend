import { TbFileSad } from "react-icons/tb";

interface LeadModalProps {
  lead: {
    first_name?: string;
    last_name?: string;
    email?: string;
    add_date?: string;
    mobile?: string;
    salesforce_id?: string;
    other_data?: string[];
    state?: string | null;
    name?: string | null;
    phone?: string | null;
    city?: string | null;
    country?: string | null;
    tags?: string[] | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

function LeadModal({ lead, isOpen, onClose }: LeadModalProps) {
  if (!isOpen) return null;


  const displayName = lead?.name || [lead?.first_name, lead?.last_name].filter(Boolean).join(' ') || '--';
  const displayEmail = lead?.email || '--';
  const displayDate = lead?.add_date || '--';
  const displayPhone = lead?.phone || lead?.mobile || '--';
  const displayCity = (lead?.city ?? '--');
  const displayState = (lead?.state ?? '--');
  const displayCountry = (lead?.country ?? '--');
  const tagList = Array.isArray(lead?.tags) ? lead!.tags! : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2 sm:px-4 py-4">
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-4 md:p-8 relative overflow-y-auto "  style={{
          maxHeight: 'calc(100vh - 40px)', 
          marginTop: '40px',               
          marginBottom: '40px',            
        }}>
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-500 hover:text-red-500 text-4xl focus:outline-none"
          aria-label="Close Modal"
        >
          &times;
        </button>

        {!lead ? (
          <div className="flex items-center flex-col space-y-6 text-center py-4">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Oops!</h2>
            <TbFileSad className="text-6xl text-center" />
            <p className="text-xl text-gray-600">File with this lead has been deleted or not found.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-4 border-gray-200">
              Lead Details
            </h2>

            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-900">{displayName}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-900">{displayEmail}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Added:</span>
                <span className="text-gray-900">{displayDate}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Phone:</span>
                <span className="text-gray-900">{displayPhone}</span>
              </div>
             
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">City:</span>
                <span className="text-gray-900">{displayCity || '--'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">State:</span>
                <span className="text-gray-900">{displayState || '--'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Country:</span>
                <span className="text-gray-900">{displayCountry || '--'}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-md shadow-sm">
                <span className="font-semibold text-gray-700">Tags:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tagList.length > 0 ? (
                    tagList.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 text-sm bg-gray-200 rounded-md">{tag}</span>
                    ))
                  ) : (
                    <span className="text-gray-900">--</span>
                  )}
                </div>
              </div>
            
            </div>
          </>
        )}

        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="bg-primary text-white font-semibold px-6 py-2.5 rounded-lg transition duration-300 hover:bg-primary-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadModal;
