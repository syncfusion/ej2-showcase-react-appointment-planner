import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { patientsData, doctorsData, specializationData, hospitalData, bloodGroupData } from '../datasource';
const DataContext = createContext(null);
const DataDispatchContext = createContext(null);
export const DataProvider = ({ children }) => {
    const [data, dispatch] = useReducer(dataReducer, initialData);
    return (<DataContext.Provider value={data}>
            <DataDispatchContext.Provider value={dispatch}>
                {children}
            </DataDispatchContext.Provider>
        </DataContext.Provider>);
};
export function useData() {
    return useContext(DataContext);
}
export function useDataDispatch() {
    return useContext(DataDispatchContext);
}
const dataReducer = (state, action) => {
    switch (action.type) {
        case 'SET_HOSPITAL_DATA': {
            return { ...state, hospitalData: action.data };
        }
        case 'UPDATE_CALENDAR_SETTINGS': {
            return { ...state, calendarSettings: action.data };
        }
        case 'SET_DOCTORS_DATA': {
            return { ...state, doctorsData: action.data };
        }
        case 'UPDATE_DOCTOR_DATA': {
            return {
                ...state,
                doctorsData: state.doctorsData.map((doctor) => {
                    if (doctor.Id === action.data.Id) {
                        doctor[action.property] = action.propertyValue;
                    }
                    return doctor;
                })
            };
        }
        case 'SET_ACTIVE_DOCTOR': {
            return { ...state, activeDoctorData: action.data };
        }
        case 'SET_ACTIVE_PATIENT': {
            return { ...state, activePatientData: action.data };
        }
        case 'SET_PATIENTS_DATA': {
            return { ...state, patientsData: action.data };
        }
        case 'SET_ACTIVE_PATIENT_HISTORY': {
            return { ...state, activePatientHistory: action.data };
        }
        default: {
            return state;
        }
    }
};
const calendarSettings = {
    bookingColor: 'Doctors',
    calendar: {
        start: '08:00',
        end: '21:00'
    },
    currentView: 'Week',
    interval: 60,
    firstDayOfWeek: 0
};
const initialData = {
    hospitalData: hospitalData,
    calendarSettings: calendarSettings,
    selectedDate: new Date(2023, 7, 8),
    doctorsData: doctorsData,
    doctorData: doctorsData[0],
    activeDoctorData: [],
    specialistData: specializationData,
    patientsData: patientsData,
    activePatientData: patientsData[0],
    activePatientHistory: hospitalData.filter((item) => item['PatientId'] === patientsData[0]['Id']),
    bloodGroupData: bloodGroupData
};
