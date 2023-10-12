import { View } from "@syncfusion/ej2-react-schedule";

export class CalendarSettings {
    bookingColor: string;
    calendar: Record<string, any> = { start: '', end: '' };
    currentView: View;
    interval: number;
    firstDayOfWeek: number;
}