import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { waitingList } from '../datasource';
const WaitingListContext = createContext(null);
const WaitingListDispatchContext = createContext(null);
export const WaitingListProvider = ({ children }) => {
    const [data, dispatch] = useReducer(waitingListReducer, initialData);
    return (<WaitingListContext.Provider value={data}>
            <WaitingListDispatchContext.Provider value={dispatch}>
                {children}
            </WaitingListDispatchContext.Provider>
        </WaitingListContext.Provider>);
};
export function useWaitingList() {
    return useContext(WaitingListContext);
}
export function useWaitingListDispatch() {
    return useContext(WaitingListDispatchContext);
}
const waitingListReducer = (state, action) => {
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
};
const initialData = {
    waitingList: waitingList,
    activeWaitingList: waitingList
};
