import React, { useEffect, useState } from 'react';
import { FaRobot, FaMicrophone } from 'react-icons/fa';
import { backendRequest } from '../../Helpers/backendRequest';
import { notifyResponse } from '../../Helpers/notyf';
import Model from '../../Components/AdminUpdateAssistantTabs/Model';
import Transcribe from '../../Components/AdminUpdateAssistantTabs/Transcribe';
import Voice from '../../Components/AdminUpdateAssistantTabs/Voice';
import Functions from '../../Components/AdminUpdateAssistantTabs/Functions';
import Advanced from '../../Components/AdminUpdateAssistantTabs/Advanced';
import Analysis from '../../Components/AdminUpdateAssistantTabs/Analysis';
import { Loading } from '../../Components/Loading';

interface AdminUpdateAssistantProps {
  assistantId: string;
  onUpdateSuccess: (data: any) => void;
  onCancel: () => void;
  initialData: any;
}

const AdminUpdateAssistant: React.FC<AdminUpdateAssistantProps> = ({ 
  assistantId, 
  onUpdateSuccess, 
  onCancel,
  initialData 
}) => {
  const [activeTab, setActiveTab] = useState<'Model' | 'Transcribe' | 'Voice' | 'Functions' | 'Advanced' | 'Analysis'>('Model');
  const [loading, setLoading] = useState(false);
  const [assistantData, setAssistantData] = useState<any>(initialData);

  const handleChange = (key: string, value: any) => {
    setAssistantData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await backendRequest('PUT', `/update_admin_assistants/${assistantId}`, assistantData);
      notifyResponse(response);
      if (response.success) {
        onUpdateSuccess(assistantData);
      }
    } catch (error) {
      console.error("Failed to update assistant:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!assistantData) {
    return <Loading/>;
  }

  return (
    <div className="bg-white text-gray-900 p-4 pb-2 md:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex flex-wrap justify-center md:justify-start space-x-2 md:space-x-4 border-b pb-4 overflow-auto">
          <button
            onClick={() => setActiveTab('Model')}
            className={`py-2 px-8 flex items-center space-x-2 gap-2 ${activeTab === 'Model' ? 'rounded bg-blue-600 text-white' : 'text-gray-700'}`}
          >
            <FaRobot /> <span>Model</span>
          </button>

          <button
            onClick={() => setActiveTab('Transcribe')}
            className={`py-2 px-8 flex items-center space-x-2 gap-2 ${activeTab === 'Transcribe' ? 'rounded bg-blue-600 text-white' : 'text-gray-700'}`}
          >
            <FaMicrophone /> <span>Transcribe</span>
          </button>

          {/* Other tab buttons... */}
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'Model' && (
          <Model assistantData={assistantData} handleChange={handleChange} />
        )}
        {activeTab === 'Transcribe' && (
          <Transcribe assistantData={assistantData} handleChange={handleChange} />
        )}
        {/* Other tab contents... */}
      </div>
    </div>
  );
};

export default AdminUpdateAssistant;