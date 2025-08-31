import React, { useState, useEffect } from "react";
import { Range } from "react-range";

export default function SliderRangeSelector({ onChange }) {
const today = new Date();
today.setHours(0, 0, 0, 0); // normalize to midnight
// const maxTimestamp = today.getTime();
const maxTimestamp = Date.now(); // instead of midnight

const minDateObj = new Date(today);
minDateObj.setDate(minDateObj.getDate() - 90);
const minTimestamp = minDateObj.getTime();


// Load saved range or default to full range
const [values, setValues] = useState(() => {
    const saved = localStorage.getItem("sliderRange");
    return saved ? JSON.parse(saved) : [minTimestamp, maxTimestamp];
});

useEffect(() => {
  const interval = setInterval(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight
    const newMax = today.getTime();
    const newMin = new Date(today);
    newMin.setDate(newMin.getDate() - 90);

    setValues((prev) => {
      // if user kept the end at "yesterday", bump it to today
      if (prev[1] >= newMax - 24 * 60 * 60 * 1000) {
        return [newMin.getTime(), newMax];
      }
      return prev; // user chose a custom range, don't overwrite
    });
  }, 60 * 60 * 1000); // check hourly

  return () => clearInterval(interval);
}, []);


// Converts a timestamp (milliseconds) into a readable date string in the format "D Mon YYYY"
const formatDate = (ts) => {
    const d = new Date(ts);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
};

// Calculate marker positions for last 7, 14, and 30 days
const now = maxTimestamp;
const markerDays = [7, 14, 30];
const markers = markerDays.map((days) => {
    const ts = now - days * 24 * 60 * 60 * 1000;
    const percent = ((ts - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;
    return { days, ts, percent };
});

// Always show the leftmost value as start and rightmost as end
const [start, end] = values[0] < values[1] ? [values[0], values[1]] : [values[1], values[0]];

return (
<div className="flex flex-col gap-4 p-6 rounded-lg bg-green-100/80 shadow-lg backdrop-blur-sm border border-green-200">
    <label className="font-semibold mb-4">Select Date Range:</label>
    <div style={{ position: 'relative', width: '100%' }}>
        {/* Marker labels above the slider */}
        {markers.map((marker) => (
        <div
            key={marker.days + '-label-top'}
            style={{
            position: 'absolute',
            left: `calc(${marker.percent}% - 18px)`,
            top: '-25px',
            fontSize: '10px',
            color: '#1976D2',
            width: '36px',
            textAlign: 'center',
            pointerEvents: 'none',
            }}
        >
            {`-${marker.days}d`}
        </div>        
        ))}
        <div
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        ></div>
        <Range
            min={minTimestamp}
            max={maxTimestamp}
            values={values}
            onChange={setValues}
            onFinalChange={(vals) => {
                
                // Save slider position to localStorage
                localStorage.setItem("sliderRange", JSON.stringify(vals));

                const [s, e] = vals[0] < vals[1] ? [vals[0], vals[1]] : [vals[1], vals[0]];
                const formatISO = (ts) => new Date(ts).toISOString().split("T")[0];
                onChange && onChange(formatISO(s), formatISO(e));
            }}
            renderTrack={({ props, children }) => (
                <div {...props} style={{ ...props.style, height: '6px', width: '100%', background: '#ddd', borderRadius: '3px', position: 'relative' }}>
                {/* Markers for last 7, 14, 30 days */}
                {markers.map((marker) => (
                    <div
                    key={marker.days}
                    style={{
                        position: 'absolute',
                        left: `${marker.percent}%`,
                        top: '-8px',
                        width: '2px',
                        height: '22px',
                        background: '#1976D2',
                        zIndex: 0,
                    }}
                    title={`Last ${marker.days} days`}
                    />
                ))}
                {children}
                </div>
        )}
        renderThumb={({ props, index }) => {
            const cleanProps = Object.fromEntries(Object.entries(props).filter(([k]) => k !== 'key'));
            return (
                <div
                key={index}
                {...cleanProps}                
            style={{
                ...props.style,
                height: '24px',
                width: '24px',
                backgroundColor: '#388E3C',
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 2px 6px #aaa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            role="slider"
            aria-valuemin={props['aria-valuemin']}
            aria-valuemax={props['aria-valuemax']}
            aria-valuenow={props['aria-valuenow']}
            tabIndex={0}
            />
        );
    }}/>
    </div>
    {/* Moveable date labels below each thumb */}
    <div style={{ position: 'relative', width: '100%', height: '24px', marginTop: '12px' }}>
        {/* Start date label */}
        <span
        style={{
            position: 'absolute',
            left: `calc(${((start - minTimestamp) / (maxTimestamp - minTimestamp)) * 100}% - 75px)`,
            top: 0,
            fontSize: '12px',
            color: '#388E3C',
            background: 'white',
            padding: '2px 6px',
            borderRadius: '6px',
            boxShadow: '0 1px 4px #ccc',
            pointerEvents: 'none',
            minWidth: '48px',
            textAlign: 'center',
            transform: 'translateX(50%)',
        }}
        >
        {formatDate(start)}
        </span>
        {/* End date label */}
        <span
        style={{
            position: 'absolute',
            left: `calc(${((end - minTimestamp) / (maxTimestamp - minTimestamp)) * 100}% - 75px)`,
            top: 0,
            fontSize: '12px',
            color: '#388E3C',
            background: 'white',
            padding: '2px 6px',
            borderRadius: '6px',
            boxShadow: '0 1px 4px #ccc',
            pointerEvents: 'none',
            minWidth: '48px',
            textAlign: 'center',
            transform: 'translateX(50%)',
        }}
        >
        {formatDate(end)}
        </span>
    </div>
    </div>
);
}
