import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { palette } from "../theme";
import { format, parse, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  minDate?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  minDate,
}) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const parseValue = (val: string) => {
    if (!val) return null;
    try {
      const parsed = parse(val, "yyyy-MM-dd'T'HH:mm", new Date());
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  };
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(parseValue(value));
  const [time, setTime] = useState(() => {
    const parsed = parseValue(value);
    return parsed ? format(parsed, "HH:mm") : "12:00";
  });

  const minDateTime = minDate ? parse(minDate, "yyyy-MM-dd'T'HH:mm", new Date()) : new Date();

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Add padding days for the calendar grid
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const paddingDays = Array(firstDayOfMonth).fill(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const [hours, minutes] = time.split(":");
    date.setHours(parseInt(hours), parseInt(minutes));
    onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (selectedDate) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(minDateTime));
  };

  const displayValue = (() => {
    const parsed = parseValue(value);
    return parsed ? format(parsed, "MMM d, yyyy 'at' h:mm a") : "Select date and time";
  })();

  return (
    <div style={{ width: "100%", marginTop: "12px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          marginBottom: "6px",
          color: palette.text.main,
        }}
      >
        {label}
      </label>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "15px",
              fontWeight: 400,
              borderRadius: "8px",
              border: "none",
              backgroundColor: palette.gray.main,
              color: value ? palette.text.main : palette.gray.darkest,
              cursor: "pointer",
              textAlign: "left",
              boxSizing: "border-box",
              outline: "none",
              transition: "background-color 0.2s ease",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8e8ec";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = palette.gray.main;
            }}
          >
            <span>{displayValue}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={palette.gray.darkest}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow:
                "0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)",
              padding: "16px",
              width: "320px",
              zIndex: 10000,
            }}
          >
            {/* Calendar Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  color: palette.text.main,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = palette.gray.main;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <span style={{ fontSize: "15px", fontWeight: 600 }}>
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  color: palette.text.main,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = palette.gray.main;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
                marginBottom: "8px",
              }}
            >
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: palette.gray.darkest,
                    padding: "4px",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
                marginBottom: "16px",
              }}
            >
              {paddingDays.map((_, i) => (
                <div key={`padding-${i}`} />
              ))}
              {days.map((day) => {
                const disabled = isDateDisabled(day);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toString()}
                    onClick={() => !disabled && handleDateSelect(day)}
                    disabled={disabled}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "none",
                      background: selected
                        ? palette.blue.main
                        : isToday
                        ? palette.gray.main
                        : "transparent",
                      color: selected
                        ? "white"
                        : disabled
                        ? palette.gray.dark
                        : palette.text.main,
                      cursor: disabled ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: selected ? 600 : 400,
                      opacity: disabled ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled && !selected) {
                        e.currentTarget.style.backgroundColor = palette.gray.main;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!disabled && !selected) {
                        e.currentTarget.style.backgroundColor = isToday
                          ? palette.gray.main
                          : "transparent";
                      }
                    }}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            {/* Time Picker */}
            <div style={{ borderTop: `1px solid ${palette.gray.dark}`, paddingTop: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: palette.text.main,
                }}
              >
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "15px",
                  borderRadius: "6px",
                  border: `1px solid ${palette.gray.dark}`,
                  backgroundColor: palette.gray.main,
                  color: palette.text.main,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: palette.blue.main,
                  color: "white",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default DateTimePicker;
