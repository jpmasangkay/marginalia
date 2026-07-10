import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  markedDates?: { date: Date; color?: string }[];
}

export function Calendar({ markedDates = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return isSameDay(today, checkDate);
  };

  const getMarkedDate = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return markedDates.find((marked) => isSameDay(marked.date, checkDate));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-purple-200/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#4a4458]" style={{ fontWeight: 700 }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="w-8 h-8 rounded-xl bg-[#faf8fc] hover:bg-[#f3eeff] text-[#a78bfa] transition-colors flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextMonth}
            className="w-8 h-8 rounded-xl bg-[#faf8fc] hover:bg-[#f3eeff] text-[#a78bfa] transition-colors flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm text-[#9b8fad]"
            style={{ fontWeight: 600 }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const marked = getMarkedDate(day);
          const today = isToday(day);

          return (
            <div key={day} className="aspect-square relative">
              <button
                className={`w-full h-full rounded-xl text-sm transition-all duration-200 ${
                  today
                    ? "bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd] text-white shadow-md shadow-purple-300/30"
                    : marked
                    ? "bg-[#f3eeff] text-[#4a4458] hover:bg-[#e9d5ff]"
                    : "text-[#4a4458] hover:bg-[#faf8fc]"
                }`}
                style={{ fontWeight: today ? 600 : 400 }}
              >
                {day}
              </button>
              {marked && !today && (
                <div
                  className="absolute left-1/2 bottom-1 -translate-x-1/2 w-1 h-3 rounded-full"
                  style={{ backgroundColor: marked.color || "#60a5fa" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
