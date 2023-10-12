import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { ActivityContextType } from '../models/models';
import { activityData } from '../datasource';

const ActivityContext = createContext(null);
const ActivityDispatchContext = createContext(null);

interface ActivityProviderProps {
    children: React.ReactNode
}

export const ActivityProvider = ({ children }: ActivityProviderProps) => {
    const [data, dispatch] = useReducer(activityReducer, initialData);

    return (
        <ActivityContext.Provider value={data} >
            <ActivityDispatchContext.Provider value={dispatch} >
                {children}
            </ActivityDispatchContext.Provider>
        </ActivityContext.Provider>
    );
}

export function useActivity() {
    return useContext(ActivityContext);
}

export function useActivityDispatch() {
    return useContext(ActivityDispatchContext);
}

const activityReducer = (state: ActivityContextType, action: Record<string, any>) => {
    switch (action.type) {
        case 'SET_ACTIVITY_DATA': {
            state.activityData.unshift(action.data);
            return { ...state, activityData: state.activityData };
        }
        default: {
            return state;
        }
    }
}

const initialData: ActivityContextType = {
    activityData: activityData
};