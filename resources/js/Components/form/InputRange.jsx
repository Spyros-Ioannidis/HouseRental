import { useEffect, useState } from "react";

export default function InputRange({
  props = {},
  value = {},
  minBound,
  maxBound,
  onChange,
}) {
  const prefix = props.prefix || "";
  const step = props.step || 1;
  const minLimit = toNumber(minBound, 0);
  const maxLimit = toNumber(maxBound, minLimit);
  const disabled = maxLimit <= minLimit;
  const sliderMax = disabled ? minLimit + step : maxLimit;
  const minValue = clamp(toNumber(value.min, minLimit), minLimit, sliderMax);
  const maxValue = clamp(toNumber(value.max, maxLimit), minLimit, sliderMax);
  const selectedMin = Math.min(minValue, maxValue);
  const selectedMax = Math.max(minValue, maxValue);
  const spread = sliderMax - minLimit || 1;
  const leftPercent = ((selectedMin - minLimit) / spread) * 100;
  const rightPercent = ((selectedMax - minLimit) / spread) * 100;
  const [minText, setMinText] = useState(() => formatInputValue(selectedMin));
  const [maxText, setMaxText] = useState(() =>
    formatInputValue(disabled ? maxLimit : selectedMax),
  );

  useEffect(() => {
    setMinText(formatInputValue(selectedMin));
    setMaxText(formatInputValue(disabled ? maxLimit : selectedMax));
  }, [disabled, maxLimit, selectedMax, selectedMin]);

  const handleMinChange = (event) => {
    const nextMin = Math.min(
      toNumber(event.target.value, minLimit),
      selectedMax,
    );
    onChange?.({ ...value, min: nextMin, max: selectedMax });
  };

  const handleMaxChange = (event) => {
    const nextMax = Math.max(
      toNumber(event.target.value, maxLimit),
      selectedMin,
    );
    onChange?.({ ...value, min: selectedMin, max: nextMax });
  };

  const handleMinInputChange = (event) => {
    setMinText(event.target.value);
  };

  const handleMaxInputChange = (event) => {
    setMaxText(event.target.value);
  };

  const commitMinInput = () => {
    const nextMin = clamp(
      toNumber(minText, selectedMin),
      minLimit,
      selectedMax,
    );
    setMinText(formatInputValue(nextMin));
    onChange?.({ ...value, min: nextMin, max: selectedMax });
  };

  const commitMaxInput = () => {
    const nextMax = clamp(
      toNumber(maxText, selectedMax),
      selectedMin,
      sliderMax,
    );
    setMaxText(formatInputValue(disabled ? maxLimit : nextMax));
    onChange?.({ ...value, min: selectedMin, max: nextMax });
  };

  const handleMinInputKeyDown = (event) => {
    if (event.key === "Enter") {
      commitMinInput();
    }
  };

  const handleMaxInputKeyDown = (event) => {
    if (event.key === "Enter") {
      commitMaxInput();
    }
  };

  const rangeSliderInputClassName = `
    absolute inset-x-0 top-1/2 h-7 w-full -translate-y-1/2
    appearance-none bg-transparent pointer-events-none

    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:size-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:border-2
    [&::-webkit-slider-thumb]:border-white
    [&::-webkit-slider-thumb]:bg-indigo-900
    [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.25)]
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:pointer-events-auto

    [&::-moz-range-thumb]:size-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:border-2
    [&::-moz-range-thumb]:border-white
    [&::-moz-range-thumb]:bg-indigo-900
    [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.25)]
    [&::-moz-range-thumb]:cursor-pointer
    [&::-moz-range-thumb]:pointer-events-auto

    [&::-webkit-slider-runnable-track]:bg-transparent
    [&::-moz-range-track]:bg-transparent
  `;

  return (
    <div className="space-y-2">

      {props.label ? (
        <label className="mb-2 block font-medium text-color-primary text-sm">
          {props.label}
        </label>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="sr-only">Minimum value</span>
          <div className="relative">
            {prefix ? (
              <span className="pointer-events-none absolute left-2 top-1/2 text-color-primary text-xs -translate-y-1/2">
                {prefix}
              </span>
            ) : null}
            <input
              type="number"
              className={`w-full pr-2 py-1 border border-indigo-500 outline-none rounded-md bg-color-primary text-color-primary text-xs focus:ring focus:ring-indigo-700 ${prefix ? "pl-6" : "pl-2"}`}
              disabled={disabled}
              max={selectedMax}
              min={minLimit}
              onBlur={commitMinInput}
              onChange={handleMinInputChange}
              onKeyDown={handleMinInputKeyDown}
              step={step}
              value={minText}
            />
          </div>
        </label>
        <label className="block">
          <span className="sr-only">Maximum value</span>
          <div className="relative">
            {prefix ? (
              <span className="pointer-events-none absolute left-2 top-1/2 text-color-primary text-xs -translate-y-1/2">
                {prefix}
              </span>
            ) : null}
            <input
              type="number"
              className={`w-full pr-2 py-1 border border-indigo-500 outline-none rounded-md bg-color-primary text-color-primary text-xs focus:ring focus:ring-indigo-700 ${prefix ? "pl-6" : "pl-2"}`}
              disabled={disabled}
              max={sliderMax}
              min={selectedMin}
              onBlur={commitMaxInput}
              onChange={handleMaxInputChange}
              onKeyDown={handleMaxInputKeyDown}
              step={step}
              value={maxText}
            />
          </div>
        </label>
      </div>

      <div className="relative h-7">
        <div className="absolute top-1/2 h-1.5 w-full rounded-full bg-gray-200 -translate-y-1/2" />
        <div
          className="absolute top-1/2 h-1.5 rounded-full bg-indigo-800 -translate-y-1/2"
          style={{
            left: `${leftPercent}%`,
            right: `${100 - rightPercent}%`,
          }}
        />

        <input
          type="range"
          aria-label="Minimum value"
          className={`absolute inset-x-0 top-1/2 h-7 w-full -translate-y-1/2 range-slider-input ${rangeSliderInputClassName}`}
          disabled={disabled}
          max={sliderMax}
          min={minLimit}
          onChange={handleMinChange}
          step={step}
          style={{ zIndex: selectedMin > sliderMax - spread * 0.08 ? 5 : 3 }}
          value={selectedMin}
        />
        <input
          type="range"
          aria-label="Maximum value"
          className={`absolute inset-x-0 top-1/2 h-7 w-full -translate-y-1/2 range-slider-input ${rangeSliderInputClassName}`}
          disabled={disabled}
          max={sliderMax}
          min={minLimit}
          onChange={handleMaxChange}
          step={step}
          style={{ zIndex: 4 }}
          value={disabled ? minLimit : selectedMax}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>{formatValue(minLimit, prefix)}</span>
        <span>{formatValue(maxLimit, prefix)}</span>
      </div>
    </div>
  );
}

function toNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatValue(value, prefix) {
  const roundedValue = Number.isInteger(value) ? value : value.toFixed(2);

  return `${prefix}${roundedValue}`;
}

function formatInputValue(value) {
  return String(Number.isInteger(value) ? value : Number(value.toFixed(2)));
}
