// interface AssistantData {
//   success_evalution?: string
// }
// const Analytics = ({ assistantData, handleChange }: { assistantData: AssistantData; handleChange: (key: keyof AssistantData, value: string) => void }) => {
//   return (
//     <div className="p-4">
//       <div className="mb-8">
//         <h2 className="text-2xl font-bold text-primary mb-3">Success Evaluation</h2>
//         <p className="text-gray-400 mb-4">
//           Evaluate if your call was successful. You can use the Rubric standalone or in combination with the Success Evaluation Prompt. <br />
//           If both are provided, they are concatenated into appropriate instructions.
//         </p>
        
//         <div className="border border-primary rounded-lg px-4 py-2 mb-2">
//           <label className="text-primary mb-1">Success Evaluation</label>
//           <textarea
//             className="w-full h-28 border-none rounded-lg p-3 focus:ring-primary focus:outline-none"
//             value={assistantData.success_evalution || ""}
//             onChange={(e) => handleChange('success_evalution', e.target.value)}
//           />
//         </div>
//         <p className="text-gray-500">Your expert call evaluator.</p>
//       </div>
//     </div>
//   );
// };

// export default Analytics;
