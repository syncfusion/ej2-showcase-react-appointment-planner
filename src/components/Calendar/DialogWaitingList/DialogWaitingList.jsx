import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { closest, Internationalization } from '@syncfusion/ej2-base';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent, CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { useData, useDataDispatch } from '../../../context/DataContext';
import { useWaitingList, useWaitingListDispatch } from '../../../context/WaitingListContext';
import { getEventTime, getDepartmentName, getTreatmentDetail } from '../../../util';
export const DialogWaitingList = forwardRef(({ getCalendarData, updateEventData }, ref) => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const waitingListService = useWaitingList();
    const waitingListDispatch = useWaitingListDispatch();
    const waitingObj = useRef(null);
    const instance = new Internationalization();
    const animationSettings = { effect: 'None' };
    const activeDoctorData = dataService.activeDoctorData;
    const doctorsData = dataService.doctorsData;
    const hospitalData = dataService.hospitalData;
    const waitingList = waitingListService.waitingList;
    const activeWaitingItem = waitingListService.activeWaitingList;
    const specialistCategory = dataService.specialistData;
    let selectedWaitingItem = [];
    useImperativeHandle(ref, () => ({
        show() {
            waitingObj.current.show();
        }
    }));
    const onWaitingListClosed = (args) => {
        const checkboxElements = args['element'].querySelectorAll('.e-checkbox');
        checkboxElements.forEach(element => {
            const checkbox = element.ej2_instances[0];
            if (checkbox.checked) {
                checkbox.checked = false;
            }
        });
        selectedWaitingItem = [];
    };
    const onBackIconClick = (args) => {
        if (closest(args['currentTarget'].parentElement, '.waiting-list-dialog')) {
            waitingObj.current.hide();
        }
    };
    const onItemDelete = () => {
        if (selectedWaitingItem.length > 0) {
            refreshWaitingItems();
            waitingObj.current.hide();
        }
        else {
            const toastObj = getCalendarData().toastObj;
            toastObj.content = 'Please select the waiting item to delete';
            toastObj.show();
        }
    };
    const onItemAdd = () => {
        const calendarData = getCalendarData();
        if (selectedWaitingItem.length > 0) {
            const eventData = Object.assign([], calendarData.scheduleObj.eventSettings.dataSource);
            selectedWaitingItem.forEach((activeItem) => {
                const eventFilter = hospitalData.filter((event) => event['Id'] === activeItem['Id']);
                if (eventFilter.length === 0) {
                    const doctorData = activeDoctorData.length > 0 ?
                        activeDoctorData.filter((data) => data['DepartmentId'] === activeItem['DepartmentId']) : [];
                    const isActiveDepartment = doctorData.length > 0;
                    if (isActiveDepartment) {
                        activeItem['DoctorId'] = doctorData[0]['Id'];
                    }
                    else {
                        const filteredData = doctorsData.filter((data) => data['DepartmentId'] === activeItem['DepartmentId']);
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
        }
        else {
            calendarData.toastObj.content = 'Please select the waiting item to add';
            calendarData.toastObj.show();
        }
    };
    const getFilteredWaitingList = (currentWaitingList, id) => {
        return currentWaitingList.filter((item) => item.Id !== id);
    };
    const refreshWaitingItems = () => {
        let currentWaitingList = Object.assign([], waitingList);
        selectedWaitingItem.forEach((activeItem) => currentWaitingList = getFilteredWaitingList(currentWaitingList, activeItem['Id']));
        selectedWaitingItem = [];
        waitingListDispatch({ type: 'SET_WAITING_LIST', data: currentWaitingList });
        getCalendarData().treeObj.updateActiveWaitingList(currentWaitingList);
    };
    const onItemChecked = (args) => {
        const waitItemId = args.event.currentTarget.querySelector('input').id;
        selectedWaitingItem.push(waitingList.filter((item) => item['Id'] === parseInt(waitItemId, 10))[0]);
    };
    const waitingListDialogHeader = () => {
        return (<div className="waitlist-header">
                <div className="text-container">
                    <span className="back-icon icon-previous" onClick={onBackIconClick.bind(this)}></span>
                    <span className="title-text">Waiting List</span>
                </div>
                <div className="button-container">
                    <span className="delete-button">
                        <ButtonComponent cssClass="e-flat e-small" onClick={onItemDelete.bind(this)}>Delete</ButtonComponent>
                    </span>
                    <span className="add-button">
                        <ButtonComponent cssClass="e-flat e-small" onClick={onItemAdd.bind(this)}>Add</ButtonComponent>
                    </span>
                </div>
            </div>);
    };
    return (<>
            <DialogComponent ref={waitingObj} height='80%' cssClass='waiting-list-dialog' isModal={true} visible={false} animationSettings={animationSettings} showCloseIcon={false} target='#content-area' width='100%' close={onWaitingListClosed.bind(this)} header={waitingListDialogHeader.bind(this)}>
                <div>
                    {activeWaitingItem && activeWaitingItem.map((data, index) => {
            return (<div className='external-drag-items' key={index}>
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
                                </div>);
        })}
                </div>
            </DialogComponent>
        </>);
});
