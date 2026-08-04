import { IScheduler } from "@syncfusion/react-scheduler";
import { IToast } from "@syncfusion/react-notifications";

export class CalendarData {
    scheduleObj: IScheduler;
    toastObj: IToast;
    treeObj: Record<string, any>;
    currentDate: Date;
    activeDoctorData: Record<string, any>[];
}