import React, { useEffect, useState } from "react";
import { backendRequest } from "../../Helpers/backendRequest";
import { notifyResponse } from "../../Helpers/notyf";
import { FaSearch, FaPencilAlt } from "react-icons/fa";

interface VvSetting {
  id?: number;
  max_call_duration: number;
  max_calls: number;
  transfer_rate: number;
  monthly_fee: number;
  seconds_per_dollar: number;
  call_period_minutes: number;
  call_frequency: number;
  max_call_limit_free_trial: number;
  max_lead_limit_free_trial: number;
  total_duration?: number;
  total_cost?: number;
  total_calls?: number;
  transferred_calls?: number;
  result?: number;
  profit?: number;
  profit_status?: string;
}

interface User {
  user_id: number;
  user_name: string | null;
  email: string | null;
  role: string | null;
  is_free_trial?: boolean;
  settings: VvSetting[] | null;
}

interface VvAdminSettingProps {
  company_id: string;
}

const VvAdminSetting: React.FC<VvAdminSettingProps> = ({ company_id }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<VvSetting>({
    max_call_duration: 120,
    max_calls: 3,
    transfer_rate: 10,
    monthly_fee: 100,
    seconds_per_dollar: 0,
    call_period_minutes: 60,
    call_frequency: 0,
    max_call_limit_free_trial: 2000,
    max_lead_limit_free_trial: 3000,
  });
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchSetting = async () => {
    setLoading(true);
    try {
      const response = await backendRequest<User>("GET", `/get_vv_setting/${company_id}`);
      if (response && response.result) {
        setUserData(response.result);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    const userSettings = user.settings?.[0] || {
      max_call_duration: 120,
      max_calls: 3,
      transfer_rate: 10,
      monthly_fee: 100,
      seconds_per_dollar: 0,
      call_period_minutes: 60,
      call_frequency: 0,
      max_call_limit_free_trial: 2000,
      max_lead_limit_free_trial: 3000,
    };

    const totalDuration = Math.round((userSettings.max_call_duration * userSettings.max_calls * 20) / 60);
    const secsInMin = Math.max(Math.round(userSettings.seconds_per_dollar / 60), 1);
    const perMinutePrice = 1 / secsInMin;
    const totalCalls = userSettings.max_calls * 20;
    const totalCost = totalDuration * perMinutePrice;
    const transferredCalls = totalCalls * 0.2;
    const result = transferredCalls * userSettings.transfer_rate;
    const profit = result - totalCost;
    const profitStatus = isNaN(profit) ? "N/A" : profit >= 0 ? "Profit" : "Loss";

    setFormData({
      ...userSettings,
      total_duration: totalDuration,
      total_cost: totalCost,
      total_calls: totalCalls,
      transferred_calls: transferredCalls,
      result: result,
      profit: profit,
      profit_status: profitStatus,
    });

    setIsDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = Math.max(Number(value), 0);

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [name]:
          name === "seconds_per_dollar"
            ? isNaN(parsedValue)
              ? 0
              : parsedValue * 60
            : isNaN(parsedValue)
              ? 0
              : parsedValue,
      };

      const maxCallDuration = updatedFormData.max_call_duration || 1;
      const maxCalls = updatedFormData.max_calls || 1;
      const secondsPerDollar = updatedFormData.seconds_per_dollar || 1;
      const transferRate = updatedFormData.transfer_rate || 1;

      const totalDuration = Math.round((maxCallDuration * maxCalls * 20) / 60);
      const secsInMin = Math.max(Math.round(secondsPerDollar / 60), 1);
      const perMinutePrice = 1 / secsInMin;
      const totalCalls = maxCalls * 20;
      const totalCost = totalDuration * perMinutePrice;
      const transferredCalls = totalCalls * 0.2;
      const result = transferredCalls * transferRate;
      const profit = result - totalCost;
      const profitStatus = isNaN(profit) ? "N/A" : profit >= 0 ? "Profit" : "Loss";

      return {
        ...updatedFormData,
        total_duration: totalDuration,
        total_cost: totalCost,
        total_calls: totalCalls,
        transferred_calls: transferredCalls,
        result,
        profit,
        profit_status: profitStatus,
      };
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const dataToSend = {
        max_call_duration: formData.max_call_duration,
        max_calls: formData.max_calls,
        transfer_rate: formData.transfer_rate,
        monthly_fee: formData.monthly_fee,
        seconds_per_dollar: formData.seconds_per_dollar,
        call_period_minutes: formData.call_period_minutes,
        call_frequency: formData.call_frequency,
        max_call_limit_free_trial: formData.max_call_limit_free_trial,
        max_lead_limit_free_trial: formData.max_lead_limit_free_trial, // Include in POST request
      };

      const response = await backendRequest("POST", `/vv_setting/${selectedUser.user_id}`, dataToSend);
      if (response.success) {
        setIsDialogOpen(false);
        fetchSetting();
        notifyResponse(response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  const userVisible =
    userData &&
    (!search ||
      userData.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      userData.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <div className="flex-col justify-center">
        <div className="bg-white rounded-lg w-full px-1 mb-4">
          {userVisible && (
            <div className="overflow-x-auto mb-2" style={{
              overflowY: 'scroll',
              scrollbarWidth: 'thin',
              msOverflowStyle: 'none',
            }}>
              <div className="w-full bg-white rounded-lg shadow-sm  overflow-hidden">
                {loading ? (
                  <div className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">Loading user settings...</p>
                  </div>
                ) : userData ? (
                  <div className="p-0">
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex flex-col justify-end items-end gap-4">
                        <button
                          className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 hover:scale-105 text-white rounded-lg transition-colors duration-200 gap-2"
                          onClick={() => handleEditClick(userData)}
                        >
                          <FaPencilAlt size={14} />
                          Edit Settings
                        </button>
                      </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Call Settings
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Max Calls (daily)</span>
                            <span className="font-medium text-gray-800">{userData.settings?.[0]?.max_calls || "2"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Max Duration</span>
                            <span className="font-medium text-gray-800">
                              {userData.settings?.[0]?.max_call_duration || "120"}s
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Call Period</span>
                            <span className="font-medium text-gray-800">
                              {userData.settings?.[0]?.call_period_minutes || "60"}min
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Call Frequency</span>
                            <span className="font-medium text-gray-800">{userData.settings?.[0]?.call_frequency || "0"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Billing Settings */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Billing Settings
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Warm Rate</span>
                            <span className="font-medium text-gray-800">{userData.settings?.[0]?.transfer_rate || "10"}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Minutes per $1</span>
                            <span className="font-medium text-gray-800">
                              {userData.settings?.[0]?.seconds_per_dollar
                                ? (userData.settings[0].seconds_per_dollar / 60).toFixed(1)
                                : "0"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Monthly Fee</span>
                            <span className="font-medium text-gray-800">${userData.settings?.[0]?.monthly_fee || "10"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          Trial Limits
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Max Call Limit</span>
                            <span className={`font-medium ${userData.is_free_trial ? "text-orange-600" : "text-gray-800"}`}>
                              {userData.settings?.[0]?.max_call_limit_free_trial || "2000"}
                              {userData.is_free_trial && <span className="text-xs ml-1">(Active)</span>}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Max Lead Limit</span>
                            <span className={`font-medium ${userData.is_free_trial ? "text-blue-600" : "text-gray-800"}`}>
                              {userData.settings?.[0]?.max_lead_limit_free_trial || "1000"}
                              {userData.is_free_trial && <span className="text-xs ml-1">(Active)</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No data available</p>
                    <p className="text-gray-400 text-sm mt-1">Please check your connection and try again</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <form className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-primary px-6 py-4">
                <h2 className="text-xl font-bold text-white">Edit User Settings</h2>
                <p className="text-blue-100 text-sm mt-1">Configure call settings and view calculated metrics</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6" style={{
                overflowY: 'scroll',
                scrollbarWidth: 'thin',
                msOverflowStyle: 'none',
              }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Call Duration</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="max_call_duration"
                            value={formData.max_call_duration}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                            placeholder="Enter seconds"
                          />
                          <span className="absolute right-3 top-3 text-sm text-gray-500">sec</span>
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Calls (Daily)</label>
                        <input
                          type="number"
                          name="max_calls"
                          value={formData.max_calls}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                          placeholder="Enter daily limit"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warm Transfer Rate</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            name="transfer_rate"
                            value={formData.transfer_rate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                            placeholder="0.00"
                          />
                          <span className="absolute right-3 top-3 text-sm text-gray-500">%</span>
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minutes per $1</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            name="seconds_per_dollar"
                            value={formData.seconds_per_dollar / 60}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                            placeholder="0.00"
                          />
                          <span className="absolute right-3 top-3 text-sm text-gray-500">min</span>
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Fee</label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-sm text-gray-500">$</span>
                          <input
                            type="number"
                            name="monthly_fee"
                            value={formData.monthly_fee}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Calculated Results</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Call Duration</label>
                        <p className="text-2xl font-bold text-blue-600">{formData.total_duration} <span className="text-sm font-normal text-gray-500">min</span></p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Calls</label>
                        <p className="text-2xl font-bold text-purple-600">{formData.total_calls}</p>
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Transferred Calls</label>
                        <p className="text-2xl font-bold text-orange-600">{formData.transferred_calls}</p>
                      </div>

                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profit</label>
                        <p className="text-2xl font-bold text-emerald-600">
                          ${formData.profit === Infinity || formData.profit === -Infinity ? "N/A" : formData.profit?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Call Control Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Call Period</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="call_period_minutes"
                            value={formData.call_period_minutes}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                            placeholder="Enter minutes"
                          />
                          <span className="absolute right-3 top-3 text-sm text-gray-500">min</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Time window for call frequency limit</p>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Call Frequency</label>
                        <input
                          type="number"
                          name="call_frequency"
                          value={formData.call_frequency}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                          placeholder="Number of calls allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Actual call limit within the period</p>
                      </div>
                       
                       <div className="font-semibold ">Trail Limits</div>
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Call Limit (Free Trial)
                          {selectedUser?.is_free_trial && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Active
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          name="max_call_limit_free_trial"
                          value={formData.max_call_limit_free_trial}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                          placeholder="2000"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum calls allowed during free trial period. Only applies to users on free trial.
                        </p>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Lead Limit (Free Trial)
                          {selectedUser?.is_free_trial && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
                        </label>
                        <input
                          type="number"
                          name="max_lead_limit_free_trial"
                          value={formData.max_lead_limit_free_trial}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                          placeholder="1000"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum leads allowed during free trial period. Default is 3000. Only applies to users on free trial.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default VvAdminSetting;