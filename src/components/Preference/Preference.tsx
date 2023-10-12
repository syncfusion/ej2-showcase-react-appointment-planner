import * as React from 'react';
import { useEffect } from 'react';
import { ChangeEventArgs, DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { View } from '@syncfusion/ej2-react-schedule';
import { CalendarSettings } from '../../models/calendar-settings';
import {
  timeSlots as scheduleSlots, startHours as scheduleStartHours, endHours as scheduleEndHours,
  views as scheduleViews, colorCategory as scheduleColorCategory, dayOfWeekList
} from '../../datasource';
import { useData, useDataDispatch } from '../../context/DataContext';
import { updateActiveItem } from '../../util';
import { Browser } from '@syncfusion/ej2-base';
import './Preference.scss';

export const Preference = () => {
  const dataService = useData();
  const dispatch = useDataDispatch();
  let timeSlots: Record<string, any>[] = scheduleSlots;
  let startHours: Record<string, any>[] = scheduleStartHours;
  let endHours: Record<string, any>[] = scheduleEndHours;
  let views: Record<string, any>[] = scheduleViews;
  let colorCategory: Record<string, any>[] = scheduleColorCategory;
  let dayOfWeeks: Record<string, any>[] = dayOfWeekList;
  let fields: Record<string, any> = { text: 'Text', value: 'Value' };
  let calendarSettings: CalendarSettings = dataService.calendarSettings;
  let timeInterval: number = calendarSettings.interval;
  let selectedView: string = calendarSettings.currentView;
  let selectedStartHour: string = calendarSettings.calendar['start'] as string;
  let selectedEndHour: string = calendarSettings.calendar['end'] as string;
  let selectedCategory: string = calendarSettings.bookingColor;
  let selectedDayOfWeek: number = calendarSettings.firstDayOfWeek;
  let width = Browser.isDevice ? '100%' : '335px';

  useEffect(() => {
    updateActiveItem('preference');
  }, []);

  const onValueChange = (args: ChangeEventArgs) => {
    switch (args.element.getAttribute('id')) {
      case 'CurrentView':
        calendarSettings.currentView = args.value as View;
        break;
      case 'CalendarStart':
        calendarSettings.calendar['start'] = args.value;
        break;
      case 'CalendarEnd':
        calendarSettings.calendar['end'] = args.value;
        break;
      case 'Duration':
        calendarSettings.interval = args.value as number;
        break;
      case 'BookingColor':
        calendarSettings.bookingColor = args.value as string;
        break;
      case 'FirstDayOfWeek':
        calendarSettings.firstDayOfWeek = args.value as number;
        break;
    }
    dispatch({ type: 'UPDATE_CALENDAR_SETTINGS', data: calendarSettings });
  }

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
        <DropDownListComponent cssClass='preference-drop-down' id='CurrentView' width={width} dataSource={views}
          fields={fields} value={selectedView} change={onValueChange.bind(this)}></DropDownListComponent>
      </div>
      <div className="control-container">
        <div className='label-text'>Calendar Start Time</div>
        <DropDownListComponent cssClass='preference-drop-down' id='CalendarStart' width={width} dataSource={startHours}
          fields={fields} value={selectedStartHour} change={onValueChange.bind(this)}></DropDownListComponent>
      </div>
      <div className="control-container">
        <div className='label-text'>Calendar End Time</div>
        <DropDownListComponent cssClass='preference-drop-down' id='CalendarEnd' width={width} dataSource={endHours}
          fields={fields} value={selectedEndHour} change={onValueChange.bind(this)}></DropDownListComponent>
      </div>
      <div className="control-container">
        <div className='label-text'>Slot Duration</div>
        <DropDownListComponent cssClass='preference-drop-down' id='Duration' width={width} dataSource={timeSlots}
          fields={fields} value={timeInterval} change={onValueChange.bind(this)}></DropDownListComponent>
      </div>
      <div className="control-container">
        <div className='label-text'>Booking Color</div>
        <DropDownListComponent cssClass='preference-drop-down' id='BookingColor' width={width} dataSource={colorCategory}
          fields={fields} value={selectedCategory} change={onValueChange.bind(this)}></DropDownListComponent>
      </div>
      <div className="control-container">
        <div className='label-text'>First Day of the Week</div>
        <DropDownListComponent cssClass='preference-drop-down' id='FirstDayOfWeek' width={width} dataSource={dayOfWeeks}
          fields={fields} value={selectedDayOfWeek} change={onValueChange.bind(this)}></DropDownListComponent>
      </div>
    </div>
  )
}