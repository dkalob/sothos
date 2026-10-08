"use client";

import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Field } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

type DatePickerWithRangeProps = {
  value?: DateRange;
  onChange: (date: DateRange | undefined) => void;
};

export function DatePickerWithRange({
  value,
  onChange,
}: DatePickerWithRangeProps) {
  return (
    <Field className="mx-auto w-60">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="date-picker-range"
              className="justify-start px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" />

              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, "LLL dd, y")} -{" "}
                    {format(value.to, "LLL dd, y")}
                  </>
                ) : (
                  format(value.from, "LLL dd, y")
                )
              ) : (
                <span>Escolha uma data</span>
              )}
            </Button>
          }
        />

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}