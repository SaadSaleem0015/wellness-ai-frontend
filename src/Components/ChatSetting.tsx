import { useState, useEffect } from 'react';
import { FaArrowLeft, FaEye, FaEyeSlash, FaSave, FaSpinner } from 'react-icons/fa';
import { backendRequest } from '../Helpers/backendRequest';
import { notifyResponse } from '../Helpers/notyf';

interface Settings {
  id: number;
  openai_key: string;
  model: string;
  prompt: string;
  created_at: string;
  updated_at: string;
}

interface SettingsResponse {
  settings: Settings;
}

const ChatSettings = ({ onBack }: { onBack: () => void }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  const modelOptions = [
    'gpt-4o-mini',
    'gpt-4o',
    // 'gpt-4',
    'gpt-3.5-turbo'
  ];

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await backendRequest<SettingsResponse>("GET", "/settings");
        
        if (response && response.settings) {
          setSettings(response.settings);
        } else {
          throw new Error('Failed to fetch settings');
        }
        
        setError('');
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('prompt', settings.prompt);
      formData.append('model', settings.model);
      formData.append('openai_key', settings.openai_key);

      const response = await backendRequest("POST", "/settings", formData, {}, true);
      
      setSuccess('Settings saved successfully!');
      notifyResponse(response)
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Settings, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        [field]: value
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-poppins">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-poppins">
      <div className="">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <FaArrowLeft className="mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Chat Assistant Settings</h1>
                <p className="text-white mt-1">Configure your AI assistant preferences</p>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">{success}</p>
              </div>
            )}

            {/* OpenAI Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings?.openai_key || ''}
                  onChange={(e) => handleChange('openai_key', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  placeholder="Enter your OpenAI API key"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Your API key is stored securely and used only for chat interactions.
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                value={settings?.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose the AI model that powers your chat assistant.
              </p>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={settings?.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                placeholder="Enter the system prompt for your AI assistant..."
              />
              <p className="text-sm text-gray-500 mt-1">
                This prompt defines how your AI assistant behaves and responds to users.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-hoverdPrimary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Last Updated:</p>
              <p>{settings ? new Date(settings.updated_at).toLocaleString() : 'Never'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;