import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { WaitingListContextType } from '../models/models';
import { waitingList } from '../datasource';

const WaitingListContext = createContext(null);
const WaitingListDispatchContext = createContext(null);

interface WaitingListProviderProps {
    children: React.ReactNode
}

export const WaitingListProvider = ({ children }: WaitingListProviderProps) => {
    const [data, dispatch] = useReducer(waitingListReducer, initialData);

    return (
        <WaitingListContext.Provider value={data} >
            <WaitingListDispatchContext.Provider value={dispatch} >
                {children}
            </WaitingListDispatchContext.Provider>
        </WaitingListContext.Provider>
    );
}

export function useWaitingList() {
    return useContext(WaitingListContext);
}

export function useWaitingListDispatch() {
    return useContext(WaitingListDispatchContext);
}

const waitingListReducer = (state: WaitingListContextType, action: Record<string, any>) => {
    switch (action.type) {
        case 'SET_WAITING_LIST': {
            return { ...state, waitingList: action.data };
        }
        case 'SET_ACTIVE_WAITING_LIST': {
            return { ...state, activeWaitingList: action.data };
        }
        default: {
            return state;
        }
    }
}

const initialData: WaitingListContextType = {
    waitingList: waitingList,
    activeWaitingList: waitingList
};