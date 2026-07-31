import * as React from 'react';
import { useEffect, useState } from 'react';
import { DropDownList, Variant } from '@syncfusion/react-dropdowns';
import { CalendarSettings } from '../../models/calendar-settings';
import {
  timeSlots as scheduleSlots, startHours as scheduleStartHours, endHours as scheduleEndHours,
  views as scheduleViews, colorCategory as scheduleColorCategory, dayOfWeekList
} from '../../datasource';
import { useData, useDataDispatch } from '../../context/DataContext';
import { updateActiveItem } from '../../util';
import { Browser } from '@syncfusion/react-base';
import './Preference.scss';

export const Preference = () => {
  const dataService = useData();
  const dispatch = useDataDispatch();

  // Data sources
  const timeSlots: Record<string, any>[] = scheduleSlots;
  const startHours: Record<string, any>[] = scheduleStartHours;
  const endHours: Record<string, any>[] = scheduleEndHours;
  const views: Record<string, any>[] = scheduleViews;
  const colorCategory: Record<string, any>[] = scheduleColorCategory;
  const dayOfWeeks: Record<string, any>[] = dayOfWeekList;
  const fields: Record<string, any> = { text: 'Text', value: 'Value' };

  // Current saved settings (the source of truth for defaults)
  const savedSettings: CalendarSettings = dataService.calendarSettings;

  // Controlled state — initialized from the saved settings so the
  // current user choice becomes the default selected value.
  const [currentView, setCurrentView] = useState<string | number>(savedSettings.currentView);
  const [calendarStart, setCalendarStart] = useState<string>(savedSettings.calendar.start);
  const [calendarEnd, setCalendarEnd] = useState<string>(savedSettings.calendar.end);
  const [interval, setInterval] = useState<number>(savedSettings.interval);
  const [bookingColor, setBookingColor] = useState<string>(savedSettings.bookingColor);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<number>(savedSettings.firstDayOfWeek);

  // Helper to push the new settings into the global context
  const applySettings = (next: Partial<CalendarSettings>) => {
    const merged: CalendarSettings = {
      bookingColor: next.bookingColor ?? bookingColor,
      calendar: next.calendar ?? { start: calendarStart, end: calendarEnd },
      currentView: (next.currentView ?? currentView) as CalendarSettings['currentView'],
      interval: next.interval ?? interval,
      firstDayOfWeek: next.firstDayOfWeek ?? firstDayOfWeek
    };
    dispatch({ type: 'UPDATE_CALENDAR_SETTINGS', data: merged });
  };

  useEffect(() => {
    updateActiveItem('preference');
  }, []);

  const width = Browser.isDevice ? '100%' : '335px';

  return (
    <div className='preference-container'>
      <header>
        <div className="module-title">
          <div className='title'>PREFERENCE</div>
          <div className='underline'></div>
        </div>
      </header>

      <div className="control-container">
        <div className='label-text'>Default View</div>
        <DropDownList
          className="preference-drop-down"
          id="CurrentView"
          width={width}
          dataSource={views}
          fields={fields}
          variant={Variant.Outlined}
          value={currentView}
          style={{ width: '335px' }}
          onChange={(e: any) => {
            const v = e.value;
            setCurrentView(v);
            applySettings({ currentView: v });
          }}
        />
      </div>

      <div className="control-container">
        <div className='label-text'>Calendar Start Time</div>
        <DropDownList
          className='preference-drop-down'
          id='CalendarStart'
          width={width}
          dataSource={startHours}
          fields={fields}
          variant={Variant.Outlined}
          value={calendarStart}
          style={{ width: '335px' }}
          onChange={(e: any) => {
            const v: string = e.value;
            setCalendarStart(v);
            applySettings({ calendar: { start: v, end: calendarEnd } });
          }}
        />
      </div>

      <div className="control-container">
        <div className='label-text'>Calendar End Time</div>
        <DropDownList
          className='preference-drop-down'
          id='CalendarEnd'
          width={width}
          dataSource={endHours}
          fields={fields}
          variant={Variant.Outlined}
          value={calendarEnd}
          style={{ width: '335px' }}
          onChange={(e: any) => {
            const v: string = e.value;
            setCalendarEnd(v);
            applySettings({ calendar: { start: calendarStart, end: v } });
          }}
        />
      </div>

      <div className="control-container">
        <div className='label-text'>Slot Duration</div>
        <DropDownList
          className='preference-drop-down'
          id='Duration'
          width={width}
          dataSource={timeSlots}
          fields={fields}
          variant={Variant.Outlined}
          value={interval}
          style={{ width: '335px' }}
          onChange={(e: any) => {
            const v: number = e.value;
            setInterval(v);
            applySettings({ interval: v });
          }}
        />
      </div>

      <div className="control-container">
        <div className='label-text'>Booking Color</div>
        <DropDownList
          className='preference-drop-down'
          id='BookingColor'
          width={width}
          dataSource={colorCategory}
          fields={fields}
          variant={Variant.Outlined}
          value={bookingColor}
          style={{ width: '335px' }}
          onChange={(e: any) => {
            const v: string = e.value;
            setBookingColor(v);
            applySettings({ bookingColor: v });
          }}
        />
      </div>

      <div className="control-container">
        <div className='label-text'>First Day of the Week</div>
        <DropDownList
          className='preference-drop-down'
          id='FirstDayOfWeek'
          width={width}
          dataSource={dayOfWeeks}
          fields={fields}
          variant={Variant.Outlined}
          value={firstDayOfWeek}
          style={{ width: '335px' }}
          onChange={(e: any) => {
            const v: number = e.value;
            setFirstDayOfWeek(v);
            applySettings({ firstDayOfWeek: v });
          }}
        />
      </div>
    </div>
  );
};