import { useState } from 'react';
import Switch from 'react-switch';

const Functions = () => {
  const [endCallFunction, setEndCallFunction] = useState(false);
  const [dialKeypad, setDialKeypad] = useState(false);
  const [forwardingPhoneNumber, setForwardingPhoneNumber] = useState('');
  const [endCallPhrases, setEndCallPhrases] = useState('');

  return (
    <div className=" bg-white text-gray-800 p-4 flex flex-col justify-between">
      <div className="w-full mx-auto rounded-lg">
        <h2 className="text-2xl text-primary font-bold mb-6">Predefined Functions</h2>
        <p className="text-sm text-gray-600 mb-4">
          We've pre-built functions for common use cases. You can enable them and configure them below.
        </p>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="block text-lg font-medium text-primary">Enable End Call Function</label>
            <Switch
              onChange={() => setEndCallFunction(!endCallFunction)}
              checked={endCallFunction}
              onColor="#0077b6" 
              offColor="#cbd5e1"
              uncheckedIcon={false}
              checkedIcon={false}
              className="react-switch"
            />
          </div>
          <p className="text-sm text-gray-500">This will allow the assistant to end the call from its side. (Best for GPT-4 and bigger models.)</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="block text-lg font-medium text-primary">Dial Keypad</label>
            <Switch
              onChange={() => setDialKeypad(!dialKeypad)}
              checked={dialKeypad}
              onColor="#0077b6"
              offColor="#cbd5e1"
              uncheckedIcon={false}
              checkedIcon={false}
              className="react-switch"
            />
          </div>
          <p className="text-sm text-gray-500">This sets whether the assistant can dial digits on the keypad.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-2">Forwarding Phone Number</label>
          <input
            type="text"
            value={forwardingPhoneNumber}
            onChange={(e) => setForwardingPhoneNumber(e.target.value)}
            placeholder="Forwarding Phone Number"
            className="w-full px-4 py-2 border border-primary rounded-md focus:ring-2 focus:focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-2">End Call Phrases</label>
          <textarea
            value={endCallPhrases}
            onChange={(e) => setEndCallPhrases(e.target.value)}
            placeholder="Thank you for contacting."
            rows={5}
            className="w-full px-4 py-2 border border-primary rounded-md focus:ring-2 focus:focus:ring-primary focus:border-primary resize-none"
          />
        </div>
        <hr className='bg-gray-200 pt-[.8px] mb-5' />

      </div>
      <div className="w-full flex justify-end mt-5">
        <button className="w-36 bg-primary text-white py-2 rounded-md hover:bg-primary">
          Publish
        </button>
      </div>
    </div>
  );
};

export default Functions;
