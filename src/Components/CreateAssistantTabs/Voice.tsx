import React, { useEffect } from "react";
interface AssistantData {
  voice_provider: string;
  voice: string;
  voice_model: string;
}

interface VoiceProps {
  assistantData: AssistantData;
  handleChange: (key: keyof AssistantData, value: string) => void;
}

const Voice: React.FC<VoiceProps> = ({ handleChange, assistantData }) => {

  // Enforce ElevenLabs provider and default model
  useEffect(() => {
    if (assistantData.voice_provider !== "11labs") {
      handleChange("voice_provider", "11labs");
    }
    if (assistantData.voice_model !== "eleven_flash_v2_5") {
      handleChange("voice_model", "eleven_flash_v2_5");
    }
  }, [assistantData.voice_provider, assistantData.voice_model, handleChange]);

  // No preset voices; only custom ElevenLabs voice ID input is shown

  return (
    <div className="bg-light p-1 sm:p-4">
      <div className="flex justify-between flex-row">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Voices</h1>
          <p className="text-gray-500 text-sm mb-3">
            This section allows you to configure the voice and provider for the assistant.
          </p>
        </div>
      </div>
      <hr className="bg-gray-200 pt-[.8px] mb-5" />

      <div className="grid grid-cols-1 gap-4">
        <div className="border rounded-lg p-6">
          <h2 className="font-semibold">Use your voice</h2>
          <p className="text-sm text-gray-700">Provide your ElevenLabs voice ID</p>
          <div className="mt-4">
            <input
              type="text"
              value={assistantData.voice || ""}
              onChange={(e) => {
                handleChange("voice_provider", "11labs");
                handleChange("voice_model", "eleven_flash_v2_5");
                handleChange("voice", e.target.value);
              }}
              placeholder="Enter your ElevenLabs voice ID"
              className="w-full p-2 rounded border border-gray-300 text-gray-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voice;