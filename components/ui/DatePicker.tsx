'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  align?: 'left' | 'right';
}

function CalendarSelect({ value, options, onChange, showNavigation, onPrev, onNext, gridMode, gridCols = 4 }: {
  value: string | number;
  options: { label: string; value: number }[];
  onChange: (v: number) => void;
  showNavigation?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  gridMode?: boolean;
  gridCols?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const current = options.find(o => o.value === value);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm font-medium hover:bg-muted rounded-md px-2 py-1 flex items-center gap-1 transition-colors"
      >
        {current?.label ?? value}
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-[60] p-2 min-w-[14rem]">
            {showNavigation && (
              <div className="flex items-center justify-between px-1 pb-1.5 mb-1 border-b border-border/60">
                <button type="button" onClick={onPrev} className="p-1 hover:bg-muted rounded-lg">
                  <ChevronLeft size={14} className="text-muted-foreground" />
                </button>
                <button type="button" onClick={onNext} className="p-1 hover:bg-muted rounded-lg">
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              </div>
            )}
            {gridMode ? (
              <div className="grid gap-1 p-1" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`flex items-center justify-center h-9 text-sm rounded-lg transition-colors ${opt.value === value ? 'bg-foreground text-background font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-0.5">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-left hover:bg-muted transition-colors whitespace-nowrap"
                  >
                    <span className={opt.value === value ? 'text-foreground font-medium' : 'text-muted-foreground'}>{opt.label}</span>
                    {opt.value === value && <span className="w-1.5 h-1.5 rounded-full bg-foreground/50" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function DatePicker({ value, onChange, placeholder = 'Select date', align = 'left' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [yearRange, setYearRange] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return Math.floor(d.getFullYear() / 5) * 5;
    }
    return Math.floor(new Date().getFullYear() / 6) * 6;
  });
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const selectedDate = value ? new Date(value) : null;

  const handleSelect = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const formatted = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
    onChange(formatted);
    setOpen(false);
  };

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isSelected = selectedDate?.toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleSelect(day)}
          className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-foreground text-background font-medium'
              : isToday
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="modal-input flex items-center justify-between gap-2 text-left w-full"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{value || placeholder}</span>
        <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
      </button>

      {open && (
        <div className={`absolute mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 p-3 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 hover:bg-muted rounded-lg">
              <ChevronLeft size={18} className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-1">
              <CalendarSelect
                value={viewDate.getMonth()}
                options={MONTHS.map((m, i) => ({ label: m, value: i }))}
                onChange={(v) => setViewDate(new Date(viewDate.getFullYear(), v, 1))}
                gridMode
              />
              <CalendarSelect
                value={viewDate.getFullYear()}
                options={Array.from({ length: 6 }, (_, i) => yearRange + i).map((y) => ({ label: String(y), value: y }))}
                onChange={(v) => setViewDate(new Date(v, viewDate.getMonth(), 1))}
                showNavigation
                onPrev={() => setYearRange(r => r - 6)}
                onNext={() => setYearRange(r => r + 6)}
                gridMode
                gridCols={2}
              />
            </div>
            <button type="button" onClick={nextMonth} className="p-1 hover:bg-muted rounded-lg">
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="w-8 h-6 flex items-center justify-center text-xs text-muted-foreground font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {renderDays()}
          </div>

          {/* Today button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
                setYearRange(Math.floor(now.getFullYear() / 6) * 6);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
