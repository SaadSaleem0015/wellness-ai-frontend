import { useState, useEffect } from "react";
import { backendRequest } from "../../Helpers/backendRequest";
import DatePicker from "react-datepicker";
import { formatDuration } from "../../Helpers/formatDuration";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { Loading } from "../Loading";

interface ReportData {
  company_name: string | null;
  minutes_used: number;
  calls_made: number;
  transfer_made: number;
  paid_sum: number;
  received_sum: number;
  call_log_cost: number;
  costPerMinute?: number;
  ratePerTransfer?: number;
  transfer_rate: number;
}

const AccountPLreportPage = ({ id }: { id: string }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [timeframe, setTimeframe] = useState("Today");
  const [conversionRate, setConversionRate] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Loading />
  }

  const companyId = id;

  useEffect(() => {
    setLoading(true)
    try {
      const fetchReportData = async (startDate?: Date, endDate?: Date) => {
        let queryParams = `timeframe=${timeframe}`;

        if (startDate && endDate) {
          setTimeframe("custom");
          queryParams += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        }

        const response = await backendRequest<ReportData>(
          "GET",
          `/account-pnl-report/${companyId}?${queryParams}`
        );

        if (response) {
          setReportData(response);
          calculateConversionRate(response);
        }
      };

      fetchReportData(startDate as Date, endDate as Date);
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
    finally {
      setLoading(false)
    }
  }, [timeframe, startDate, endDate]);

  const calculateConversionRate = (data: ReportData) => {
    const totalTransfers = data.transfer_made || 0;
    const totalCalls = data.calls_made || 0;
    setConversionRate(totalCalls > 0 ? totalTransfers / totalCalls : 0);
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const calculateCost = (minutesUsed: number) => (minutesUsed / 60) * 0.08;
  const calculateRevenue = (transfersMade: number, ratePerTransfer: number) =>
    transfersMade * ratePerTransfer || 0;
  const calculateROAS = (revenue: number, cost: number) =>
    cost > 0 ? revenue / cost : 0;
  const calculateAvgCostPerCall = (cost: number, callsMade: number) =>
    callsMade > 0 ? cost / callsMade : 0;


  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Profit & Loss Report
        </h2>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {["Today", "Last 7d", "Last 14d", "Last 30d", "Last 60d"].map(
          (time) => (
            <button
              key={time}
              onClick={() => setTimeframe(time)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeframe === time
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              {time}
            </button>
          )
        )}

        <div className="flex-1 min-w-[250px]">
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate as Date}
            endDate={endDate as Date}
            selectsRange
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholderText="Select Date Range"
          />
        </div>

        <button
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setTimeframe("Today");
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  Minutes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  Calls
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  Transfers
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  Cost
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  ROAS
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 captilize tracking-wider">
                  Avg/Call
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : reportData ? (
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reportData.company_name || "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(reportData.minutes_used || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reportData.calls_made || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reportData.transfer_made || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${calculateCost(reportData.minutes_used).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${calculateRevenue(
                      reportData.transfer_made,
                      reportData.transfer_rate
                    ).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateROAS(
                      calculateRevenue(reportData.transfer_made, 1),
                      calculateCost(reportData.minutes_used)
                    ).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${calculateAvgCostPerCall(
                      calculateCost(reportData.minutes_used),
                      reportData.calls_made
                    ).toFixed(2)}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700">
          Conversion Rate: <span className="font-semibold text-blue-600">{conversionRate.toFixed(2)}</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          (Transfers Made / Calls Made)
        </p>
      </div>
    </div>
  );
};

export default AccountPLreportPage;