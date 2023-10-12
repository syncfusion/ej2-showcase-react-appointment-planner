import { ScheduleComponent } from "@syncfusion/ej2-react-schedule";
import { ToastComponent } from "@syncfusion/ej2-react-notifications";

export class CalendarData {
    scheduleObj: ScheduleComponent;
    toastObj: ToastComponent;
    treeObj: Record<string, any>;
    currentDate: Date;
    activeDoctorData: Record<string, any>[];
}