import React, { useState, useEffect } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiAdjustmentsHorizontal, HiArrowUturnLeft } from "react-icons/hi2";
import { BiExport } from "react-icons/bi";
import * as XLSX from "xlsx";

interface CallLog extends Record<string, unknown> {
  id?: number;
  customer_number?: string;
  call_started_at?: string;
  customer_name?: string;
  call_ended_at?: string;
  cost?: number;
  call_duration?: number;
  call_ended_reason?: string;
  status?: string;
  transcript?: string;
  recording_url?: string;
  call_id?: string;
  lead_id?: number;
  criteria_satisfied?: boolean;
}

const ReportDashboard: React.FC = () => {
  const [totalCalls, setTotalCalls] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [totalSuccessfulTransfers, setTotalSuccessfulTransfers] =
    useState<number>(0);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isDataFound, setIsDataFound] = useState<boolean>(true);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

    useState<boolean>(false);
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setTempStartDate(dates[0]);
    setTempEndDate(dates[1]);
  };

  const applyFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setFilterModalVisible(false);
  };

  const resetFilter = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setStartDate(null);
    setEndDate(null);
    setActiveFilter(null);
    setFilterModalVisible(false);
  };

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const logs = await backendRequest<CallLog[], []>(
          "GET",
          "/user/call-logs-detail"
        );

        // if (Array.isArray(logs)) {
          const sortedLogs = logs.sort((a, b) => {
            const dateA = new Date(a.call_started_at || 0);
            const dateB = new Date(b.call_started_at || 0);
            return dateB.getTime() - dateA.getTime();
          });

          // console.log("sorted logs are ",sortedLogs)
          setCallLogs(sortedLogs);
        // } else {
        //   console.error("Expected an array but got:", logs);
        //   setCallLogs([]);
        // }
      } catch (error) {
        console.error("Failed to fetch call logs:", error);
      }
    };

    fetchCallLogs();
  }, []);

  const applyQuickFilter = (filterType: string) => {
    const now = new Date();
    let start: Date | null, end: Date | null;

    switch (filterType) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        start = new Date(now.setDate(now.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case "last7days":
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case "last14days":
        start = new Date(now.setDate(now.getDate() - 14));
        end = new Date();
        break;
      case "last30days":
        start = new Date(now.setDate(now.getDate() - 30));
        end = new Date();
        break;
      default:
        start = null;
        end = null;
        break;
    }

    setTempStartDate(start);
    setTempEndDate(end);
    setActiveFilter(filterType);
  };

  const exportToExcel = () => {
    if (callLogs.length === 0) {
      alert("No data available to export.");
      return;
    }

    const filteredData = callLogs.filter((log) => {
      if (!startDate || !endDate) return true;
      const logDate = new Date(log.call_started_at || "");
      return logDate >= startDate && logDate <= endDate;
    });

    const worksheetData = filteredData.map((log) => ({
      "Customer Name": log.customer_name || "N/A",
      "Customer Number": log.customer_number || "N/A",
      "Call Duration (Minutes)": log.call_duration
        ? (log.call_duration / 60).toFixed(2)
        : "0",
      "Call Started At": log.call_started_at || "N/A",
      "Call Ended Reason": log.call_ended_reason || "N/A",
      Status: log.status || "N/A",
      "Criteria Satisfied": log.criteria_satisfied ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usage Report");

    XLSX.writeFile(workbook, `Usage_Report_${new Date().toISOString()}.xlsx`);
  };


 
  
  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await backendRequest<CallLog[], []>(
          "GET",
          "/user/call-logs-detail"
        );
  
        if (!Array.isArray(response)) {
          throw new Error("Unexpected response format");
        }
  
        let callLogs: CallLog[] = response;
  
        // Filter records for the selected date range
        if (startDate && endDate) {
          callLogs = callLogs.filter((log: CallLog) => {
            const logDate = new Date(log.call_started_at || "");
            return logDate >= startDate && logDate <= endDate;
          });
        }
  
        if (callLogs.length === 0) {
          setIsDataFound(false);
        } else {
          setIsDataFound(true);
        }
  
        setCallLogs(callLogs);
  
        const convertToMinutes = (seconds?: number): number =>
          seconds ? parseFloat((seconds / 100).toFixed(2)) : 0;
  
        const totalCallsCount = callLogs.length;
        const totalMinutesCount = callLogs.reduce(
          (acc: number, log: CallLog) =>
            acc + convertToMinutes(log.call_duration),0
        );

  
        const successfulTransfersCount = callLogs.filter(
          (log: CallLog) => log.criteria_satisfied == true
        ).length;
  
        setTotalCalls(totalCallsCount);
        // console.log("call log is ",totalMinutesCount)
        setTotalMinutes(parseFloat(totalMinutesCount.toFixed(2)));
        // console.log("call  duration minutes",parseFloat(totalMinutesCount.toFixed(2)))
        setTotalSuccessfulTransfers(successfulTransfersCount);
      } catch (error) {
        // console.error("Error fetching call logs:", error);
        setIsDataFound(false);
      }
    };
  
    fetchCallLogs();
  }, [startDate, endDate]); 


  // console.log("call logs data is this ",callLogs)
  

  const successPercentage =
    totalCalls > 0 ? (totalSuccessfulTransfers / totalCalls) * 100 : 0;



  return (
    <div className="container mx-auto p-3 sm:p-6 bg-gray-100">
      <div className="flex flex-wrap justify-between items-center">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-6">
          Report Dashboard
        </h1>
        <div className="flex gap-4 items-center mb-6">
          <button
            onClick={() => setFilterModalVisible(true)}
            className="bg-primary flex text-sm sm:text-base items-center gap-2 px-5 sm:py-2.5 text-white rounded-md hover:bg-hoverPrimary transition duration-300"
          >
            Filters <HiAdjustmentsHorizontal />
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 text-xs sm:text-base border-b border-primary text-primary hover:text-black hover:border-black sm:w-auto font-medium px-4 py-2 rounded-md transition duration-300 ease-in-out group"
          >
            Export Call Logs
            <BiExport className="text-inherit transform transition duration-100 ease group-hover:rotate-[90deg]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 pb-20">
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-sm sm:text-lg font-medium text-gray-800">
            Total Call Minutes
          </h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600">
            {isDataFound ? totalMinutes : 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg text-gray-800">
          <h3 className="text-sm sm:text-lg font-medium">Number of Calls</h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600">
            {isDataFound ? totalCalls : 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg text-gray-800">
          <h3 className="text-sm sm:text-lg font-medium">
            Total Successful Transfers
          </h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600">
            {isDataFound ? `${totalSuccessfulTransfers}/${totalCalls}` : "0/0"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg text-gray-800">
          <h3 className="text-sm sm:text-lg font-medium">Success Percentage</h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600">
            {isDataFound ? successPercentage.toFixed(2) : "0.00"}%
          </p>
        </div>
      </div>

      {filterModalVisible && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full transform transition-all duration-500 ease-in-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Filter Logs
              </h2>
              <button
                onClick={resetFilter}
                className="font-medium text-red-800 hover:text-gray-700 transition ease-in-out duration-200"
              >
                <HiArrowUturnLeft className="inline-block text-lg mr-1" /> Reset
                Filters
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Quick Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {["today", "yesterday", "last7", "last14", "last30"].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => applyQuickFilter(filter)}
                      className={`py-1.5 px-3 rounded-md border ${
                        activeFilter === filter
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-primary border-primary"
                      } transition-colors duration-300`}
                    >
                      {filter.charAt(0).toUpperCase() +
                        filter.slice(1).replace(/(\d+)/, " $1 Days")}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Custom Range
              </label>
              <DatePicker
                selected={tempStartDate}
                onChange={handleDateChange}
                startDate={tempStartDate as Date}
                endDate={tempEndDate as Date}
                selectsRange
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                placeholderText="Select Date Range"
              />
            </div>

            <div className="flex justify-between mt-6 gap-2">
              <button
                onClick={() => setFilterModalVisible(false)}
                className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={applyFilter}
                className="w-full py-2.5 bg-primary text-white rounded-lg shadow-lg hover:bg-hoverPrimary transition duration-200 ease-in-out"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

   
    </div>
  );
};

export default ReportDashboard;
