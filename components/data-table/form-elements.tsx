"use client"

import * as React from "react" 
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Clock, AlertCircle, ChevronsUpDown, RotateCcw, Search } from "lucide-react" 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, className, error, required, ...props }: FormInputProps) {
  return (
    <div className="flex flex-col space-y-1 w-full"> 
      <label className={cn(
        "text-[12px] font-semibold tracking-wider font-poppins",
        error ? "text-red-500" : "text-[#1E293B]"
      )}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="flex items-center w-full relative"> 
        <Input 
          {...props}
          required={required}
          className={cn(
            "h-10 w-full rounded-sm px-4 py-0 flex-1",
            "bg-gray-50/50 border-gray-200 border-solid",
            "font-poppins font-medium text-[12px] transition-all shadow-none outline-none",
            "focus:bg-white focus:ring-1 focus:ring-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0",
            "leading-[44px]", 
            "placeholder:text-gray-400 placeholder:font-medium placeholder:leading-[44px]",
            error && "border-red-400 bg-red-50/50 focus:ring-red-200", 
            className
          )} 
        />
        {error && <AlertCircle className="w-4 h-4 text-red-500 absolute right-3" />}
      </div>
      {error && <span className="text-[10px] text-red-500 font-bold ml-0.5">{error}</span>}
    </div>
  )
}

interface FormSelectProps {
  label?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  className?: string;
  error?: string;
  required?: boolean;
  onChange?: (value: string | string[]) => void;
  isMulti?: boolean;
  isDisabled?: boolean;
  showFooter?: boolean;
}

export function FormSelect({ 
  label, 
  name, 
  defaultValue, 
  placeholder = "Select option", 
  options, 
  className,
  error,
  required,
  onChange,
  isMulti = false,
  isDisabled: externalDisabled,
  showFooter = true
}: FormSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    defaultValue ? defaultValue.split(',').filter(Boolean) : []
  );

  const isDisabled = options.length === 0 || externalDisabled;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (value: string) => {
    if (isMulti) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      
      setSelectedValues(newValues);
      onChange?.(newValues);
    } else {
      setSelectedValues([value]);
      onChange?.(value);
      setOpen(false);
    }
  };

  const handleReset = () => {
    setSelectedValues([]);
    onChange?.([]);
  };

  const getDisplayLabel = () => {
    if (selectedValues.length === 0) return placeholder;
    if (!isMulti) return options.find(o => o.value === selectedValues[0])?.label || placeholder;
    return `${selectedValues.length} items selected`;
  };

  if (!isMulti) {
    return (
      <div className="flex flex-col space-y-1 w-full font-poppins"> 
        {label && (
          <label className="text-[12px] font-semibold tracking-wider text-[#1E293B]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <Select 
          name={name} 
          value={selectedValues[0] || ""} 
          onValueChange={handleSelect} 
          disabled={isDisabled}
        >
          <SelectTrigger className={cn("h-10 w-full bg-gray-50/50 rounded-sm border-gray-200 text-[12px] font-medium shadow-none outline-none focus:ring-1 focus:ring-slate-200", className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="w-[--radix-select-trigger-width] rounded-xl overflow-hidden border-slate-100 shadow-xl">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[12px] font-medium cursor-pointer">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1 w-full font-poppins">
      {label && (
        <label className="text-[12px] font-semibold tracking-wider text-[#1E293B]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input type="hidden" name={name} value={selectedValues.join(',')} />

      <Popover open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) setSearchQuery(""); 
      }}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            className={cn(
              "h-10 w-full justify-between bg-gray-50/50 rounded-sm border-gray-200 text-[12px] font-medium px-4 shadow-none hover:bg-white transition-all outline-none focus:ring-1 focus:ring-slate-200",
              selectedValues.length > 0 && "border-violet-200 bg-violet-50/30",
              className
            )}
          >
            <span className="truncate">{getDisplayLabel()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          align="start" 
          sideOffset={4}
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          className="p-0 min-w-0 rounded-xl border-slate-100 shadow-2xl overflow-hidden bg-white z-[50]"
        >
          <div className="p-2.5 border-b border-slate-50 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                placeholder={`Search ${label?.toLowerCase() || 'options'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-md py-2 pl-9 pr-3 text-[12px] focus:ring-1 focus:ring-violet-100 outline-none font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="max-h-[220px] overflow-y-auto p-1.5 bg-white">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <Checkbox 
                    checked={selectedValues.includes(option.value)} 
                    onCheckedChange={() => handleSelect(option.value)}
                    id={option.value} 
                    className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600" 
                  />
                  <label className="text-[12px] font-medium text-slate-600 group-hover:text-slate-900 cursor-pointer flex-1 select-none">
                    {option.label}
                  </label>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <p className="text-[11px] text-slate-400 italic">No options found</p>
              </div>
            )}
          </div>

          {showFooter && (
            <div className="p-2 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase pl-2">
                {selectedValues.length} Selected
              </span>
              <Button
                type="button"
                variant="ghost"
                disabled={selectedValues.length === 0}
                onClick={handleReset}
                className="h-8 px-2 text-[10px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-md uppercase"
              >
                <RotateCcw className="w-3 h-3 mr-1.5" />
                Reset
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && <span className="text-[10px] text-red-500 font-bold ml-0.5">{error}</span>}
    </div>
  );
}

interface FormTimePickerProps {
  label: string;
  name: string;
  defaultValue?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

export function FormTimePicker({ label, name, defaultValue = "09:00 AM", className, error, required }: FormTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [time, setTime] = React.useState(defaultValue);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const times = React.useMemo(() => {
    const arr = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h % 12 || 12;
        const ampm = h < 12 ? "AM" : "PM";
        const minute = m.toString().padStart(2, "0");
        arr.push(`${hour}:${minute} ${ampm}`);
      }
    }
    return arr;
  }, []);

  React.useEffect(() => {
    if (open) {
      const rafId = requestAnimationFrame(() => {
        const id = `time-${time.replace(/\s+/g, '-')}`;
        const activeItem = document.getElementById(id);
        if (activeItem && scrollRef.current) {
          activeItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [open, time]);

  return (
    <div className="flex flex-col space-y-1 w-full font-poppins text-left"> 
      <label className={cn(
        "text-[12px] font-semibold tracking-wider opacity-80",
        error ? "text-red-500" : "text-[#1E293B]"
      )}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input type="hidden" name={name} value={time} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            className={cn(
              "cursor-pointer h-10 w-full justify-start px-4 bg-gray-50/50 !rounded-sm border-gray-200 shadow-none font-medium text-[12px] hover:bg-white focus:ring-1 focus:ring-slate-200 transition-all border border-solid",
              error && "border-red-400 bg-red-50/50 focus:ring-red-200", 
              className
            )}
          >
            <Clock className={cn("mr-1 h-3.5 w-3.5", error ? "text-red-400" : "text-slate-400")} />
            <span className={cn("text-[12px]", error ? "text-red-900" : "text-[#1E293B]")}>{time}</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          side="bottom" 
          align="start" 
          sideOffset={4} 
          className="w-[200px] p-0 !rounded-xl shadow-2xl border-gray-200 overflow-hidden bg-white z-[9999]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
            <span className="text-[13px] font-bold text-[#1E293B]">{time}</span>
          </div>

          <div 
            ref={scrollRef} 
            className="max-h-[240px] overflow-y-auto py-1 custom-scroll select-none"
          >
            {times.map((t) => (
              <div
                key={t}
                id={`time-${t.replace(/\s+/g, '-')}`}
                onClick={() => {
                  setTime(t);
                  setOpen(false); 
                }}
                className={cn(
                  "px-4 py-2 text-[12px] cursor-pointer transition-colors flex items-center justify-between mx-1 rounded-md",
                  time === t 
                    ? "bg-slate-100 text-[#1E293B] font-bold" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {t}
                {time === t && <div className="h-1.5 w-1.5 rounded-full bg-[#1E293B]" />}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {error && <span className="text-[10px] text-red-500 font-bold ml-0.5">{error}</span>}
    </div>
  )
}