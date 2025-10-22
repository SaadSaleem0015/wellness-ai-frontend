import React, { useState, useEffect } from "react";
import { backendRequest } from "../Helpers/backendRequest";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PageNumbers } from "../Components/PageNumbers";
import { FormateTime } from "../Helpers/formateTime";

interface Payment {
  amount_paid: number;
  created_at: string;
}

interface BillingReportData {
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
}
interface SpentMoney {
  id: string;
  created_at: string;
  description: string;
  spent_money: number;
}

const ITEMS_PER_PAGE = 10;
const BillingReport: React.FC = () => {
  const [billingData, setBillingData] = useState<BillingReportData[]>([]);
  const [credit, setCredit] = useState<number>(0);
  const [debit, setDebit] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setStartDate(dates[0]);
    setEndDate(dates[1]);
  };

  const applyQuickFilter = (filterType: string) => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (filterType) {
      case "today": {
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      }
      case "thisWeek": {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "thismonth": {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      }

      default: {
        startDate = null;
        endDate = null;
        break;
      }
    }

    setStartDate(startDate);
    setEndDate(endDate);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const paymentsResponse = await backendRequest<Payment[]>(
        "GET",
        "/payments"
      );
      const spentMoneyResponse = await backendRequest("GET", `/spent-money`);

      const payments: Payment[] = paymentsResponse?.payments || [];
      const spent_money: SpentMoney[] = spentMoneyResponse || [];

      if (!Array.isArray(payments) || !Array.isArray(spent_money)) {
        throw new Error("Unexpected response format");
      }

      const filteredPayments =
        startDate && endDate
          ? payments.filter((payment) => {
              const paymentDate = new Date(payment.created_at);
              return paymentDate >= startDate && paymentDate <= endDate;
            })
          : payments;

      const filteredSpentPayment =
        startDate && endDate
          ? spent_money.filter((spent) => {
              const spentDate = new Date(spent.created_at);
              return spentDate >= startDate && spentDate <= endDate;
            })
          : spent_money;

      let runningBalance = 0;

      const billingEntries: BillingReportData[] = [
        ...filteredPayments.map((payment) => ({
          date: new Date(payment.created_at).toISOString(),
          description: "Make a Payment",
          credit: payment.amount_paid,
          debit: 0,
          balance: 0,
        })),
        ...filteredSpentPayment.map((spent) => ({
          date: new Date(spent.created_at).toISOString(),
          description: spent.description,
          credit: 0,
          debit: spent.spent_money,
          balance: 0,
        })),
      ];

      billingEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (let i = billingEntries.length - 1; i >= 0; i--) {
        runningBalance += billingEntries[i].credit - billingEntries[i].debit;
        billingEntries[i].balance = runningBalance;
      }

      const formattedEntries = billingEntries.map((entry) => ({
        ...entry,
        date: new Date(entry.date).toLocaleString(),
      }));

      setBillingData(formattedEntries);

      const totalCredit = filteredPayments.reduce(
        (sum, payment) => sum + payment.amount_paid,
        0
      );
      const totalDebit = filteredSpentPayment.reduce(
        (sum, log) => sum + log.spent_money,
        0
      );

      setCredit(totalCredit);
      setDebit(totalDebit);
      setBalance(runningBalance);
    } catch {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = billingData.slice(indexOfFirstItem, indexOfLastItem);
  const pagesCount = Math.ceil(billingData.length / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: pagesCount }, (_, i) => i + 1);
  return (
    <div className="container mx-auto sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
        Billing Report
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-medium text-gray-800">
                Credit
              </h3>
              <p className="text-xl sm:text-3xl font-semibold">
                ${credit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-medium text-gray-800">
                Debit
              </h3>
              <p className="text-xl sm:text-3xl font-semibold">
                ${debit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-medium text-gray-800">
                Balance
              </h3>
              <p
                className={`font-semibold text-xl sm:text-2xl ${
                  balance >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                ${balance.toFixed(2)}
                {balance < 10 && (
                  <span className="text-sm sm:text-base text-red-700 ml-2">
                    (Balance is low)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-4 sm:mb-0">
              <button
                onClick={() => applyQuickFilter("today")}
                className="bg-primary text-white px-4 py-1.5 text-sm lg:text-base rounded-md shadow hover:bg-hoveredPrimary w-full sm:w-auto"
              >
                Today
              </button>
              <button
                onClick={() => applyQuickFilter("thisWeek")}
                className="bg-primary text-white px-4 py-1.5 text-sm lg:text-base rounded-md shadow hover:bg-hoveredPrimary w-full sm:w-auto"
              >
                This Week
              </button>
              <button
                onClick={() => applyQuickFilter("thisMonth")}
                className="bg-primary text-white px-4 py-1.5 text-sm lg:text-base rounded-md shadow hover:bg-hoveredPrimary w-full sm:w-auto"
              >
                This Month
              </button>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate as Date}
                endDate={endDate as Date}
                selectsRange
                className="sm:w-24 lg:w-full py-1.5 px-4 border text-sm lg:text-base border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholderText="Select Date Range"
              />
            </div>
            <button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 text-sm lg:text-base rounded-md shadow hover:bg-gray-400 w-full sm:w-auto"
            >
              Clear Filters
            </button>
          </div>

          <div className="overflow-x-auto bg-white p-6 rounded-lg mt-6">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2 text-left border-b">
                    Date
                  </th>
                  <th className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2 text-left border-b">
                    Description
                  </th>
                  <th className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2 text-left border-b">
                    Credit
                  </th>
                  <th className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2 text-left border-b">
                    Debit
                  </th>
                  <th className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2 text-left border-b">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2">
                        {FormateTime(entry.date)}
                      </td>
                      <td className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2">
                        {entry.description}
                      </td>
                      <td className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2">
                        ${entry.credit.toFixed(2)}
                      </td>
                      <td className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2">
                        ${entry.debit.toFixed(2)}
                      </td>
                      <td className="px-2 text-sm sm:text-base sm:px-4 py-1 sm:py-2">
                        ${entry.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <p>No record found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PageNumbers
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageNumbers={pageNumbers}
            pagesCount={pagesCount}
            className="mt-4"
          />
        </>
      )}
    </div>
  );
};

export default BillingReport;
