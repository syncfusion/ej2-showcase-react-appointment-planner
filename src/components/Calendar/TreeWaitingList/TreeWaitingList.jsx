import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { addClass, closest, Internationalization } from '@syncfusion/ej2-base';
import { TreeViewComponent } from '@syncfusion/ej2-react-navigations';
import { getWeekFirstDate, addDays } from '@syncfusion/ej2-react-schedule';
import { useData } from '../../../context/DataContext';
import { useWaitingList, useWaitingListDispatch } from '../../../context/WaitingListContext';
import { getEventTime, getDepartmentName, getTreatmentDetail } from '../../../util';
export const TreeWaitingList = forwardRef(({ getCalendarData, setTreeItemDrop }, ref) => {
    const dataService = useData();
    const waitingListService = useWaitingList();
    const waitingListDispatch = useWaitingListDispatch();
    const treeObj = useRef(null);
    const instance = new Internationalization();
    const field = { dataSource: waitingListService.activeWaitingList, id: 'Id', text: 'Name' };
    const doctorsData = dataService.doctorsData;
    const waitingListID = useRef(waitingListService.waitingList.length + 1);
    let waitingList = waitingListService.waitingList;
    const specialistCategory = dataService.specialistData;
    const draggedItemId = useRef('');
    useEffect(() => {
        updateWaitingList();
    }, []);
    useImperativeHandle(ref, () => ({
        addWaitingListItem(data) {
            addWaitingListItem(data);
        },
        updateWaitingListItem() {
            updateWaitingListItem();
        },
        updateWaitingList(deptId, currentWaitingList) {
            updateWaitingList(deptId, currentWaitingList);
        },
        updateActiveWaitingList(currentWaitingList) {
            updateActiveWaitingList(currentWaitingList);
        }
    }));
    const addWaitingListItem = (data) => {
        data.Id = waitingListID.current;
        waitingListID.current++;
        waitingList.push(data);
        waitingListDispatch({ type: 'SET_WAITING_LIST', data: waitingList });
        updateActiveWaitingList();
    };
    const updateWaitingListItem = () => {
        waitingList = waitingList.filter((item) => item.Id !== parseInt(draggedItemId.current, 10));
        waitingListDispatch({ type: 'SET_WAITING_LIST', data: waitingList });
        updateActiveWaitingList(waitingList);
    };
    const updateActiveWaitingList = (currentWaitingList) => {
        const activeDoctorData = getCalendarData().activeDoctorData;
        if (activeDoctorData.length > 0) {
            updateWaitingList(activeDoctorData[0]['DepartmentId'], currentWaitingList);
        }
        else {
            updateWaitingList(null, currentWaitingList);
        }
    };
    const updateWaitingList = (deptId, currentWaitingList) => {
        const calendarData = getCalendarData();
        const weekFirstDate = getWeekFirstDate(calendarData.currentDate, calendarData.scheduleObj.firstDayOfWeek);
        const waitingListData = currentWaitingList ? currentWaitingList : waitingListService.waitingList;
        let filteredData = calendarData.scheduleObj.eventBase.filterEvents(weekFirstDate, addDays(new Date(weekFirstDate.getTime()), 7), waitingListData);
        if (deptId) {
            filteredData = filteredData.filter((item) => item['DepartmentId'] === deptId);
        }
        waitingListDispatch({ type: 'SET_ACTIVE_WAITING_LIST', data: filteredData });
    };
    const onTreeDragStop = (event) => {
        const calendarData = getCalendarData();
        const treeElement = closest(event.target, '.e-treeview');
        const classElement = calendarData.scheduleObj.element.querySelector('.e-device-hover');
        if (classElement) {
            classElement.classList.remove('e-device-hover');
        }
        const tooltipElement = document.querySelector('.e-drag-item.e-treeview');
        if (tooltipElement) {
            tooltipElement.style.display = 'block';
        }
        if (!treeElement) {
            if (tooltipElement) {
                tooltipElement.style.display = 'none';
            }
            event.cancel = true;
            const scheduleElement = closest(event.target, '.e-content-wrap');
            if (scheduleElement) {
                const treeviewData = treeObj.current.fields.dataSource;
                if (event.target.classList.contains('e-work-cells')) {
                    const filteredData = treeviewData.filter((item) => item['Id'] === parseInt(event.draggedNodeData['id'], 10));
                    const cellData = calendarData.scheduleObj.getCellDetails(event.target);
                    let doctorId;
                    const activeDoctorData = dataService.activeDoctorData;
                    if (activeDoctorData.length > 0) {
                        doctorId = activeDoctorData[0]['Id'];
                    }
                    else {
                        const doctor = doctorsData.filter((item) => item['DepartmentId'] === filteredData[0]['DepartmentId']);
                        doctorId = doctor && doctor.length > 0 ? doctor[0]['Id'] : doctorsData[0]['Id'];
                    }
                    const milliSeconds = (filteredData[0]['EndTime'].getTime() - filteredData[0]['StartTime'].getTime());
                    const eventData = {
                        Name: filteredData[0]['Name'],
                        StartTime: cellData.startTime,
                        EndTime: new Date(new Date(cellData.startTime).setMilliseconds(milliSeconds)),
                        IsAllDay: cellData.isAllDay,
                        Symptoms: filteredData[0]['Disease'] || filteredData[0]['Symptoms'],
                        PatientId: filteredData[0]['PatientId'],
                        DepartmentId: filteredData[0]['DepartmentId'],
                        DoctorId: doctorId
                    };
                    let eventCollection = calendarData.scheduleObj.eventBase.filterEvents(eventData['StartTime'], eventData['EndTime']);
                    eventCollection = eventCollection.filter((item) => item['DoctorId'] === eventData['DoctorId']);
                    if (eventCollection.length > 0) {
                        event.cancel = true;
                        calendarData.toastObj.content = 'An appointment already exists on the same time range, so please reschedule on different time slots.';
                        calendarData.toastObj.show();
                    }
                    else {
                        calendarData.scheduleObj.openEditor(eventData, 'Add', true);
                        draggedItemId.current = event.draggedNodeData['id'];
                        setTreeItemDrop();
                    }
                }
            }
        }
    };
    const onItemDrag = (event) => {
        const scheduleObj = getCalendarData().scheduleObj;
        if (scheduleObj.isAdaptive) {
            const classElement = scheduleObj.element.querySelector('.e-device-hover');
            if (classElement) {
                classElement.classList.remove('e-device-hover');
            }
            if (event.target.classList.contains('e-work-cells')) {
                addClass([event.target], 'e-device-hover');
            }
        }
        if (document.body.style.cursor === 'not-allowed') {
            document.body.style.cursor = '';
        }
        if (event.name === 'nodeDragging') {
            const tooltipElement = document.querySelectorAll('.e-drag-item.e-treeview');
            let status;
            tooltipElement.forEach((node) => {
                node.style.display = 'block';
                status = document.querySelector('body').offsetWidth <= node.offsetLeft + node.offsetWidth;
            });
            const targetEle = closest(event.target, '.droppable');
            if (!targetEle || status) {
                tooltipElement.forEach((node) => node.style.display = 'none');
                event.cancel = true;
                return;
            }
            const dragElementIcon = document.querySelectorAll('.e-drag-item.treeview-external-drag .e-icon-expandable');
            dragElementIcon.forEach((node) => node.style.display = 'none');
        }
    };
    const treeTemplate = (props) => {
        return (<div id="waiting">
                <div id="waitdetails">
                    <div id="waitlist">{props.Name}</div>
                    <div id='event-time'>{getEventTime(props, instance)}</div>
                    <div id="waitcategory">{getDepartmentName(props.DepartmentId, specialistCategory)} -
                        {getTreatmentDetail(props)}</div>
                </div>
                <div id="item-icon-container">
                    <span className="item-icon icon-reorder"></span>
                </div>
            </div>);
    };
    return (<>
            <TreeViewComponent ref={treeObj} fields={field} cssClass='treeview-external-drag' allowDragAndDrop={true} nodeDragStop={onTreeDragStop.bind(this)} nodeDragging={onItemDrag.bind(this)} nodeTemplate={treeTemplate.bind(this)}>
            </TreeViewComponent>
        </>);
});
