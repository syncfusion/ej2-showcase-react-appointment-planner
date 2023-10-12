import { CalendarSettings } from './calendar-settings';

export class DataContextType {
    hospitalData: Record<string, any>[];
    calendarSettings: CalendarSettings;
    selectedDate: Date;
    doctorsData: Record<string, any>[];
    doctorData: Record<string, any>;
    activeDoctorData: Record<string, any>;
    specialistData: Record<string, any>[];
    patientsData: Record<string, any>[];
    activePatientData: Record<string, any>;
    activePatientHistory: Record<string, any>[];
    bloodGroupData: Record<string, any>[];
};