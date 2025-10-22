import { useEffect, useState } from 'react';
import { backendRequest } from '../Helpers/backendRequest';
import { notifyResponse } from '../Helpers/notyf';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

interface Setting {
    twilio_sid: string;
    twilio_auth: string;
    vapi_api_key: string;
    vapi_org_id: string;
}

export function Settings() {
    const [settings, setSettings] = useState<Setting>({
        twilio_sid: '',
        twilio_auth: '',
        vapi_api_key: '',
        vapi_org_id: '',
    });

    const [showTwilioAuth, setShowTwilioAuth] = useState(false); 
    const [showVapiOrgId, setShowVapiOrgId] = useState(false);  
    const [loading, setLoading] = useState(true); 

    const fetchSettingData = async () => {
        try {
            const response = await backendRequest<{ success: boolean; settings: Setting }>("GET", "/settings");
            
            if (response.success) {
                setSettings(response.settings);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await backendRequest("POST", "/settings", settings);
            notifyResponse(response);
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        fetchSettingData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-white p-4 sm:p-8">
            <div className="rounded-lg p-8 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">
                            Settings
                        </h1>
                        <p className="text-gray-500">
                            Update your Twilio and VAPI credentials below.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={handleUpdate}
                            className="py-2 sm:py-3 px-6 text-sm sm:text-md bg-primary text-white font-bold rounded-md hover:bg-primary-dark focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
                        >
                            Update Credentials
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Twilio SID
                        </label>
                        <input
                            type="text"
                            name="twilio_sid"
                            value={settings.twilio_sid}
                            onChange={handleChange}
                            placeholder="Enter Twilio SID"
                            className="w-full px-4 py-2 border border-primary rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Twilio Auth Token
                        </label>
                        <input
                            type={showTwilioAuth ? "text" : "password"}
                            name="twilio_auth"
                            value={settings.twilio_auth}
                            onChange={handleChange}
                            placeholder="Enter Twilio Auth Token"
                            className="w-full px-4 pe-8 py-2 border border-primary rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 pt-6 flex items-center cursor-pointer"
                            onClick={() => setShowTwilioAuth(!showTwilioAuth)}
                        >
                            {showTwilioAuth ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            VAPI API Key
                        </label>
                        <input
                            type="text"
                            name="vapi_api_key"
                            value={settings.vapi_api_key}
                            onChange={handleChange}
                            placeholder="Enter VAPI API Key"
                            className="w-full px-4 py-2 border border-primary rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            VAPI ORG ID
                        </label>
                        <input
                            type={showVapiOrgId ? "text" : "password"}
                            name="vapi_org_id"
                            value={settings.vapi_org_id}
                            onChange={handleChange}
                            placeholder="Enter VAPI ORG ID"
                            className="w-full px-4 py-2 pe-8  border border-primary rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 pt-6  flex items-center cursor-pointer"
                            onClick={() => setShowVapiOrgId(!showVapiOrgId)}
                        >
                            {showVapiOrgId ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
