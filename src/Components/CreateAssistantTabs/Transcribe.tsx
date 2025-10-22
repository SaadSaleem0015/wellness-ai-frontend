import React, { useState, useEffect } from 'react';

interface AssistantData {
  transcribe_provider: string;
  transcribe_language: string;
  transcribe_model: string;
}

interface TranscribeProps {
  assistantData: AssistantData;
  handleChange: (key: keyof AssistantData, value: string) => void;
}

const Transcribe: React.FC<TranscribeProps> = ({ assistantData, handleChange }) => {
  const TranscribeOptions: Record<string, string[]> = {
    'deepgram': ['nova-2', 'nova-2-general', 'nova-2-meeting', 'nova-2-phonecall'],
    //  'Nova 2 Finance', 'Nova 2 Conversational AI', 'Nova 2 Voicemail', 'Nova 2 Video', 'Nova 2 Medical', 'Nova 2 Drive Thru', 'Nova 2 Automotive'
    // 'talkscriber': ['whisper'],
    // 'gladia': ['fast', 'accurate'],
  };

  const languageOptions = [
    { code: 'en', label: 'en' },
    { code: 'en-US', label: 'en-US' },
    // { code: 'es', label: 'Spanish' },
    // { code: 'fr', label: 'French' },
    // { code: 'ru', label: 'Russian' },
    // { code: 'zh', label: 'Chinese' },
    // { code: 'ko', label: 'Korean' },
    // { code: 'ja', label: 'Japanese' },
    // { code: 'pt', label: 'Portuguese' },
    // { code: 'tr', label: 'Turkish' },
    // { code: 'pl', label: 'Polish' },
    // { code: 'ca', label: 'Catalan' },
    // { code: 'nl', label: 'Dutch' },
    // { code: 'ar', label: 'Arabic' },
    // { code: 'sv', label: 'Swedish' },
    // { code: 'it', label: 'Italian' },
    // { code: 'id', label: 'Indonesian' },
    // { code: 'hi', label: 'Hindi' },
    // { code: 'fi', label: 'Finnish' },
    // { code: 'vi', label: 'Vietnamese' },
    // { code: 'he', label: 'Hebrew' },
    // { code: 'uk', label: 'Ukrainian' },
    // { code: 'ms', label: 'Malay' },
    // { code: 'cs', label: 'Czech' },
    // { code: 'ro', label: 'Romanian' },
    // { code: 'da', label: 'Danish' },
    // { code: 'hu', label: 'Hungarian' },
    // { code: 'ta', label: 'Tamil' },
    // { code: 'no', label: 'Norwegian' },
    // { code: 'th', label: 'Thai' },
    // { code: 'ur', label: 'Urdu' },
    // { code: 'hr', label: 'Croatian' },
    // { code: 'bg', label: 'Bulgarian' },
    // { code: 'lt', label: 'Lithuanian' },
    // { code: 'la', label: 'Latin' },
    // { code: 'ml', label: 'Malayalam' },
    // { code: 'si', label: 'Sinhalese' },
    // { code: 'kn', label: 'Kannada' },
    // { code: 'mk', label: 'Macedonian' },
    // { code: 'br', label: 'Breton' },
    // { code: 'eu', label: 'Basque' },
    // { code: 'is', label: 'Icelandic' },
    // { code: 'hy', label: 'Armenian' },
    // { code: 'ne', label: 'Nepali' },
    // { code: 'mn', label: 'Mongolian' },
    // { code: 'bs', label: 'Bosnian' },
    // { code: 'kk', label: 'Kazakh' },
    // { code: 'sq', label: 'Albanian' },
    // { code: 'sw', label: 'Swahili' },
    // { code: 'gl', label: 'Galician' },
    // { code: 'mr', label: 'Marathi' },
    // { code: 'pa', label: 'Punjabi' },
    // { code: 'yo', label: 'Yoruba' },
    // { code: 'so', label: 'Somali' },
    // { code: 'af', label: 'Afrikaans' },
    // { code: 'tl', label: 'Tagalog' },
    // { code: 'mg', label: 'Malagasy' },
    // { code: 'as', label: 'Assamese' },
    // { code: 'tt', label: 'Tatar' },
    // { code: 'ht', label: 'Haitian Creole' },
    // { code: 'uz', label: 'Uzbek' },
    // { code: 'fo', label: 'Faroese' },
    // { code: 'sd', label: 'Sindhi' },
    // { code: 'gu', label: 'Gujarati' },
    // { code: 'am', label: 'Amharic' },
    // { code: 'yi', label: 'Yiddish' },
    // { code: 'lo', label: 'Lao' },
    // { code: 'nn', label: 'Norwegian Nynorsk' },
    // { code: 'mt', label: 'Maltese' },
    // { code: 'sa', label: 'Sanskrit' },
    // { code: 'lb', label: 'Luxembourgish' },
    // { code: 'my', label: 'Burmese' },
    // { code: 'bo', label: 'Tibetan' },
    // { code: 'su', label: 'Sundanese' },
    // { code: 'yue', label: 'Cantonese' },
  ];

  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const newAvailableModels = TranscribeOptions[assistantData.transcribe_provider] || [];
    setAvailableModels(newAvailableModels);

    if (newAvailableModels.length > 0 && assistantData.transcribe_model !== newAvailableModels[0]) {
      handleChange('transcribe_model', newAvailableModels[0]); 
    }
  }, [assistantData.transcribe_provider]);

  return (
    <div className="bg-white text-gray-800 p-4">
      <div className="w-full mx-auto rounded-lg">
        <h1 className="text-2xl font-bold text-primary mb-2">Transcription</h1>
        <p className='text-gray-500 text-sm mb-3'>This section allows you to configure the transcription settings for the assistant.</p>
        <hr className='bg-gray-200 pt-[.8px] mb-5' />
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
            <select
              value={assistantData.transcribe_provider}
              onChange={(e) => handleChange('transcribe_provider', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {/* <option value="talkscriber">Talkscriber</option> */}
              <option value="deepgram">Deepgram</option>
              {/* <option value="gladia">Gladia</option> */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={assistantData.transcribe_language}
              onChange={(e) => handleChange('transcribe_language', e.target.value)}
              className="w-full px-4 py-2  border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <select
              value={assistantData.transcribe_model}
              onChange={(e) => handleChange('transcribe_model', e.target.value)}
              className="w-full px-4 py-2  border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="bg-gray-200 pt-[.8px] mb-5" />
      </div>
    </div>
  );
};

export default Transcribe;
