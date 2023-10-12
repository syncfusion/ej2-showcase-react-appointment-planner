import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { closest, Internationalization } from '@syncfusion/ej2-base';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ChangeEventArgs } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent, CheckBox, CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { EJ2Instance } from '@syncfusion/ej2-react-schedule';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import { CalendarData } from '../../../models/calendar-data';
import { useData, useDataDispatch } from '../../../context/DataContext';
import { useWaitingList, useWaitingListDispatch } from '../../../context/WaitingListContext';
import { getEventTime, getDepartmentName, getTreatmentDetail } from '../../../util';

interface DialogWaitingListProps {
    getCalendarData: () => CalendarData;
    updateEventData: (data: Record<string, any>[]) => void;
}

export const DialogWaitingList = forwardRef(({ getCalendarData, updateEventData }: DialogWaitingListProps, ref) => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const waitingListService = useWaitingList();
    const waitingListDispatch = useWaitingListDispatch();
    const waitingObj = useRef<DialogComponent>(null);
    const instance: Internationalization = new Internationalization();
    const animationSettings: Record<string, any> = { effect: 'None' };
    const activeDoctorData: Record<string, any>[] = dataService.activeDoctorData;
    const doctorsData: Record<string, any>[] = dataService.doctorsData;
    const hospitalData: Record<string, any>[] = dataService.hospitalData;
    const waitingList: Record<string, any>[] = waitingListService.waitingList;
    const activeWaitingItem = waitingListService.activeWaitingList;
    const specialistCategory = dataService.specialistData;
    let selectedWaitingItem: Record<string, any>[] = [];

    useImperativeHandle(ref, () => ({
        show() {
            waitingObj.current.show();
        }
    }));

    const onWaitingListClosed = (args: Record<string, any>): void => {
        const checkboxElements: HTMLElement[] = args['element'].querySelectorAll('.e-checkbox');
        checkboxElements.forEach(element => {
            const checkbox: CheckBox = (element as EJ2Instance).ej2_instances[0] as CheckBox;
            if (checkbox.checked) {
                checkbox.checked = false;
            }
        });
        selectedWaitingItem = [];
    }

    const onBackIconClick = (args: Record<string, any>): void => {
        if (closest(args['currentTarget'].parentElement, '.waiting-list-dialog')) {
            waitingObj.current.hide();
        }
    }

    const onItemDelete = (): void => {
        if (selectedWaitingItem.length > 0) {
            refreshWaitingItems();
            waitingObj.current.hide();
        } else {
            const toastObj: ToastComponent = getCalendarData().toastObj;
            toastObj.content = 'Please select the waiting item to delete';
            toastObj.show();
        }
    }

    const onItemAdd = (): void => {
        const calendarData = getCalendarData();
        if (selectedWaitingItem.length > 0) {
            const eventData: Record<string, any>[] = Object.assign([], calendarData.scheduleObj.eventSettings.dataSource);
            selectedWaitingItem.forEach((activeItem: Record<string, any>) => {
                const eventFilter: Record<string, any>[] = hospitalData.filter((event: Record<string, any>) => event['Id'] === activeItem['Id']);
                if (eventFilter.length === 0) {
                    const doctorData: Record<string, any>[] = activeDoctorData.length > 0 ?
                        activeDoctorData.filter((data: Record<string, any>) => data['DepartmentId'] === activeItem['DepartmentId']) : [];
                    const isActiveDepartment: boolean = doctorData.length > 0;
                    if (isActiveDepartment) {
                        activeItem['DoctorId'] = doctorData[0]['Id'];
                    } else {
                        const filteredData: Record<string, any>[] = doctorsData.filter((data: Record<string, any>) =>
                            data['DepartmentId'] === activeItem['DepartmentId']);
                        activeItem['DoctorId'] = filteredData[0]['Id'];
                    }
                    eventData.push(activeItem);
                    hospitalData.push(activeItem);
                }
            });
            refreshWaitingItems();
            dispatch({ type: 'SET_HOSPITAL_DATA', data: hospitalData });
            waitingObj.current.hide();
            updateEventData(eventData);
            calendarData.scheduleObj.eventSettings.dataSource = eventData;
            calendarData.scheduleObj.refreshEvents();
        } else {
            calendarData.toastObj.content = 'Please select the waiting item to add';
            calendarData.toastObj.show();
        }
    }

    const getFilteredWaitingList = (currentWaitingList: Record<string, any>[], id: number): Record<string, any>[] => {
        return currentWaitingList.filter((item: any) => item.Id !== id)
    }

    const refreshWaitingItems = (): void => {
        let currentWaitingList: Record<string, any>[] = Object.assign([], waitingList);
        selectedWaitingItem.forEach((activeItem: Record<string, any>) => currentWaitingList = getFilteredWaitingList(currentWaitingList, activeItem['Id'] as number));
        selectedWaitingItem = [];
        waitingListDispatch({ type: 'SET_WAITING_LIST', data: currentWaitingList });
        getCalendarData().treeObj.updateActiveWaitingList(currentWaitingList);
    }

    const onItemChecked = (args: ChangeEventArgs): void => {
        const waitItemId: string = (args.event.currentTarget as HTMLElement).querySelector('input').id;
        selectedWaitingItem.push(waitingList.filter((item: Record<string, any>) => item['Id'] === parseInt(waitItemId, 10))[0]);
    }

    const waitingListDialogHeader = (): JSX.Element => {
        return (
            <div className="waitlist-header">
                <div className="text-container">
                    <span className="back-icon icon-previous" onClick={onBackIconClick.bind(this)}></span>
                    <span className="title-text">Waiting List</span>
                </div>
                <div className="button-container">
                    <span className="delete-button">
                        <ButtonComponent cssClass="e-flat e-small" onClick={onItemDelete.bind(this)}>Delete</ButtonComponent>
                    </span>
                    <span className="add-button">
                        <ButtonComponent ejs-button cssClass="e-flat e-small" onClick={onItemAdd.bind(this)}>Add</ButtonComponent>
                    </span>
                </div>
            </div >
        );
    }

    return (
        <>
            <DialogComponent ref={waitingObj} height='80%' cssClass='waiting-list-dialog' isModal={true} visible={false}
                animationSettings={animationSettings} showCloseIcon={false} target='#content-area' width='100%'
                close={onWaitingListClosed.bind(this)} header={waitingListDialogHeader.bind(this)}>
                <div>
                    {
                        activeWaitingItem && activeWaitingItem.map((data: Record<string, any>, index: number) => {
                            return (
                                <div className='external-drag-items' key={index}>
                                    <div id='waiting-item-check'>
                                        <CheckBoxComponent id={data['Id']} checked={false} change={onItemChecked.bind(this)}>
                                        </CheckBoxComponent>
                                    </div>
                                    <div id="waiting">
                                        <div id="waitdetails">
                                            <div id="waitlist">{data['Name']}</div>
                                            <div id='event-time'>{getEventTime(data, instance)}</div>
                                            <div id="waitcategory">{getDepartmentName(data['DepartmentId'], specialistCategory)} -
                                                {getTreatmentDetail(data)}</div>
                                        </div>
                                        <div id="item-icon-container">
                                            <span className="item-icon icon-reorder"></span>
                                        </div>
                                    </div>
                                </div >
                            )
                        })
                    }
                </div>
            </DialogComponent >
        </>
    )
});