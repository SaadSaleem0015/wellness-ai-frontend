import { useState } from 'react';
import Switch from 'react-switch';
import Slider from 'react-input-slider';
const Advance = () => {
  const [hipaaCompliance, setHipaaCompliance] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [silenceTimeout, setSilenceTimeout] = useState(560);
  const [responseDelay, setResponseDelay] = useState(1);
  const [llmRequestDelay, setLlmRequestDelay] = useState(2.5);
  const [interruptionThreshold, setInterruptionThreshold] = useState(3);
  const [maxDuration, setMaxDuration] = useState(3100);
  return (
    <div className="p-4">
      <h2 className="text-2xl text-primary font-bold">Privacy</h2>
      <p className='text-gray-500 text-sm'>
        This section allows you to configure the privacy settings for the assistant.
      </p>

    
      <div className="flex items-center justify-between mb-4 mt-4">
        <div>
          <label className="text-primary font-medium">HIPAA Compliance</label>
          <p className='text-gray-500 text-sm'>
            When this is enabled, no logs, recordings, or transcriptions will be stored.
          </p>
        </div>
        <Switch
          onChange={setHipaaCompliance}
          checked={hipaaCompliance}
          onColor="#0077b6"
          offColor="#D1D5DB"
          uncheckedIcon={false}
          checkedIcon={false}
        />
      </div>

      <div className="flex items-center justify-between mb-4 mt-4">
        <div>
          <label className="text-primary font-medium">Audio Recording</label>
          <p className='text-gray-500 text-sm'>Record the conversation with the assistant.</p>
        </div>
        <Switch
          onChange={setAudioRecording}
          checked={audioRecording}
          onColor="#0077b6"
          offColor="#D1D5DB"
          uncheckedIcon={false}
          checkedIcon={false}
        />
      </div>

      <div className="flex items-center justify-between mb-4 mt-4">
        <div>
          <label className="text-primary font-medium">Video Recording</label>
          <p className='text-gray-500 text-sm'>
            Enable or disable video recording during a web call. This will record the video of your user.
          </p>
        </div>
        <Switch
          onChange={setVideoRecording}
          checked={videoRecording}
          onColor="#0077b6"
          offColor="#D1D5DB"
          uncheckedIcon={false}
          checkedIcon={false}
        />
      </div>

      <div className="my-8"></div>

    


      <div className=" shadow-sm rounded-lg">
      <h2 className="text-2xl  text-primary font-bold">Pipeline Configuration</h2>
      <p className="text-gray-400 text-sm mb-4">
        This section allows you to configure the pipeline settings for the assistant.
      </p>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="text-primary font-medium">Silence Timeout</label>
          <p className="text-gray-400 text-xs">How long to wait before a call is automatically ended due to inactivity.</p>
        </div>
        <div className="flex items-center">
          <Slider
            axis="x"
            x={silenceTimeout}
            xmax={600}
            xmin={0}
            onChange={({ x }) => setSilenceTimeout(x)}
            styles={{
              track: { backgroundColor: '#0077b6' },
              active: { backgroundColor: '#00B4D8' },
              thumb: { width: 20, height: 20 },
            }}
          />
          <input
            type="number"
            value={silenceTimeout}
            className="ml-4 w-20 p-2 rounded-md"
            onChange={(e) => setSilenceTimeout(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="text-primary font-medium">Response Delay</label>
          <p className="text-gray-400 text-xs">The minimum number of seconds the assistant waits after user speech before it starts speaking.</p>
        </div>
        <div className="flex items-center">
          <Slider
            axis="x"
            x={responseDelay}
            xmax={5}
            xmin={0}
            onChange={({ x }) => setResponseDelay(x)}
            styles={{
              track: { backgroundColor: '#0077b6' },
              active: { backgroundColor: '#00B4D8' },
              thumb: { width: 20, height: 20 },
            }}
          />
          <input
            type="number"
            value={responseDelay}
            className="ml-4 w-20 p-2  rounded-md"
            onChange={(e) => setResponseDelay(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="text-primary font-medium">LLM Request Delay</label>
          <p className="text-gray-400 text-xs">The minimum number of seconds to wait after punctuation before sending a request to the LLM.</p>
        </div>
        <div className="flex items-center">
          <Slider
            axis="x"
            x={llmRequestDelay}
            xmax={5}
            xmin={0}
            onChange={({ x }) => setLlmRequestDelay(x)}
            styles={{
              track: { backgroundColor: '#0077b6' },
              active: { backgroundColor: '#00B4D8' },
              thumb: { width: 20, height: 20 },
            }}
          />
          <input
            type="number"
            value={llmRequestDelay}
            className="ml-4 w-20 p-2 rounded-md"
            onChange={(e) => setLlmRequestDelay(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="text-primary font-medium">Interruption Threshold</label>
          <p className="text-gray-400 text-xs">The number of words the user must say before the assistant considers being interrupted.</p>
        </div>
        <div className="flex items-center">
          <Slider
            axis="x"
            x={interruptionThreshold}
            xmax={10}
            xmin={1}
            onChange={({ x }) => setInterruptionThreshold(x)}
            styles={{
              track: { backgroundColor: '#0077b6' },
              active: { backgroundColor: '#00B4D8' },
              thumb: { width: 20, height: 20 },
            }}
          />
          <input
            type="number"
            value={interruptionThreshold}
            className="ml-4 w-20 p-2  rounded-md"
            onChange={(e) => setInterruptionThreshold(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="text-primary font-medium">Maximum Duration</label>
          <p className="text-gray-400 text-xs">The maximum number of seconds a call will last.</p>
        </div>
        <div className="flex items-center">
          <Slider
            axis="x"
            x={maxDuration}
            xmax={3600}
            xmin={0}
            onChange={({ x }) => setMaxDuration(x)}
            styles={{
              track: { backgroundColor: '#0077b6' },
              active: { backgroundColor: '#00B4D8' },
              thumb: { width: 20, height: 20 },
            }}
          />
          <input
            type="number"
            value={maxDuration}
            className="ml-4 w-20 p-2  rounded-md"
            onChange={(e) => setMaxDuration(Number(e.target.value))}
          />
        </div>
      </div>
    </div>

    <div className=" bg-white shadow-sm rounded-lg mt-10">
        <h2 className="text-xl  text-primary font-bold mt-5">Messages</h2>
        <p className="text-gray-500 text-sm mb-4">
          Message configuration for messages that are sent to and from the assistant.
        </p>

        <div className="mb-4">
          <label className="text-primary font-medium">Client Messages</label>
          <input type="text" className="w-full border border-primary p-2 rounded-lg" />
        </div>

        <div className="mb-4">
          <label className="text-primary font-medium">Server Messages</label>
          <input type="text" className="w-full border border-primary p-2 rounded-lg" />
        </div>

        <div className="mb-4">
          <label className="text-primary  font-medium">End Call Message</label>
          <input type="text" value="See you soon" className="w-full border border-primary p-2 rounded-lg" />
        </div>

        <div className="mb-4">
          <label className="text-primary font-medium">Idle Messages</label>
          <input type="text" className="w-full border border-primary p-2 rounded-lg" />
        </div>

        <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="text-primary font-medium">Max Idle Messages</label>
          <p className="text-gray-400 text-xs">Maximum number of times idle messages can be spoken during the call.</p>
        </div>
        <div className="flex items-center">
          <Slider
            axis="x"
            x={silenceTimeout}
            xmax={600}
            xmin={0}
            onChange={({ x }) => setSilenceTimeout(x)}
            styles={{
              track: { backgroundColor: '#0077b6' },
              active: { backgroundColor: '#00B4D8' },
              thumb: { width: 20, height: 20 },
            }}
          />
          <input
            type="number"
            value={silenceTimeout}
            className="ml-4 w-20 p-2 rounded-md"
            onChange={(e) => setSilenceTimeout(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="text-primary font-medium">Idle Timeout</label>
          <p className="text-gray-400 text-xs">Timeout in seconds before an idle message is spoken.</p>
        </div>
        <div className="flex items-center">
          <Slider
            axis="x"
            x={silenceTimeout}
            xmax={600}
            xmin={0}
            onChange={({ x }) => setSilenceTimeout(x)}
            styles={{
              track: { backgroundColor: '#0077b6' },
              active: { backgroundColor: '#00B4D8' },
              thumb: { width: 20, height: 20 },
            }}
          />
          <input
            type="number"
            value={silenceTimeout}
            className="ml-4 w-20 p-2 rounded-md"
            onChange={(e) => setSilenceTimeout(Number(e.target.value))}
          />
        </div>
      </div>
      </div>
    </div>
  );
}

export default Advance;
