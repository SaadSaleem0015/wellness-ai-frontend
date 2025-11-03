export interface AssistantData {
  id?: number;
  name: string;
  provider: string;
  first_message: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  transcribe_provider: string;
  transcribe_language: string;
  transcribe_model: string;
  voice_provider: string;
  voice: string;
  voice_model: string;
  forwardingPhoneNumber: string;
  endCallPhrases: string[];
  attached_Number: string | undefined;
  draft: boolean;
  assistant_toggle: boolean | null;
  leadsfile: number[];
  tools: string[];
  // success_evalution: string | null;
}

