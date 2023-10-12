import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { addClass, closest, Internationalization } from '@syncfusion/ej2-base';
import { TreeViewComponent, DragAndDropEventArgs } from '@syncfusion/ej2-react-navigations';
import { CellClickEventArgs, getWeekFirstDate, addDays } from '@syncfusion/ej2-react-schedule';
import { useData } from '../../../context/DataContext';
import { useWaitingList, useWaitingListDispatch } from '../../../context/WaitingListContext';
import { CalendarData } from '../../../models/calendar-data';
import { getEventTime, getDepartmentName, getTreatmentDetail } from '../../../util';

interface TreeWaitingListProps {
    getCalendarData: () => CalendarData;
    setTreeItemDrop: () => void;
}

export const TreeWaitingList = forwardRef(({ getCalendarData, setTreeItemDrop }: TreeWaitingListProps, ref) => {
    const dataService = useData();
    const waitingListService = useWaitingList();
    const waitingListDispatch = useWaitingListDispatch();
    const treeObj = useRef<TreeViewComponent>(null);
    const instance: Internationalization = new Internationalization();
    const field = { dataSource: waitingListService.activeWaitingList, id: 'Id', text: 'Name' };
    const doctorsData: Record<string, any>[] = dataService.doctorsData;
    const waitingListID = useRef(waitingListService.waitingList.length + 1);
    let waitingList: Record<string, any>[] = waitingListService.waitingList;
    const specialistCategory = dataService.specialistData;
    const draggedItemId = useRef('');

    useEffect(() => {
        updateWaitingList();
    }, []);

    useImperativeHandle(ref, () => ({
        addWaitingListItem(data: Record<string, any>) {
            addWaitingListItem(data);
        },
        updateWaitingListItem() {
            updateWaitingListItem();
        },
        updateWaitingList(deptId?: number, currentWaitingList?: Record<string, any>[]) {
            updateWaitingList(deptId, currentWaitingList);
        },
        updateActiveWaitingList(currentWaitingList?: Record<string, any>[]) {
            updateActiveWaitingList(currentWaitingList);
        }
    }));

    const addWaitingListItem = (data: Record<string, any>) => {
        data.Id = waitingListID.current;
        waitingListID.current++;
        waitingList.push(data);
        waitingListDispatch({ type: 'SET_WAITING_LIST', data: waitingList });
        updateActiveWaitingList();
    };

    const updateWaitingListItem = () => {
        waitingList = waitingList.filter((item: any) => item.Id !== parseInt(draggedItemId.current, 10));
        waitingListDispatch({ type: 'SET_WAITING_LIST', data: waitingList });
        updateActiveWaitingList(waitingList);
    }

    const updateActiveWaitingList = (currentWaitingList?: Record<string, any>[]) => {
        const activeDoctorData: Record<string, any>[] = getCalendarData().activeDoctorData;
        if (activeDoctorData.length > 0) {
            updateWaitingList(activeDoctorData[0]['DepartmentId'], currentWaitingList);
        } else {
            updateWaitingList(null, currentWaitingList);
        }
    }

    const updateWaitingList = (deptId?: number, currentWaitingList?: Record<string, any>[]) => {
        const calendarData = getCalendarData();
        const weekFirstDate: Date = getWeekFirstDate(calendarData.currentDate, calendarData.scheduleObj.firstDayOfWeek as number);
        const waitingListData: Record<string, any>[] = currentWaitingList ? currentWaitingList : waitingListService.waitingList;
        let filteredData: Record<string, any>[] = calendarData.scheduleObj.eventBase.filterEvents(weekFirstDate, addDays(new Date(weekFirstDate.getTime()), 7), waitingListData);
        if (deptId) {
            filteredData = filteredData.filter((item: Record<string, any>) => item['DepartmentId'] === deptId);
        }
        waitingListDispatch({ type: 'SET_ACTIVE_WAITING_LIST', data: filteredData });
    }

    const onTreeDragStop = (event: DragAndDropEventArgs): void => {
        const calendarData = getCalendarData();
        const treeElement: Element = closest(event.target, '.e-treeview');
        const classElement: HTMLElement = calendarData.scheduleObj.element.querySelector('.e-device-hover');
        if (classElement) {
            classElement.classList.remove('e-device-hover');
        }
        const tooltipElement: HTMLElement = document.querySelector('.e-drag-item.e-treeview');
        if (tooltipElement) { tooltipElement.style.display = 'block'; }
        if (!treeElement) {
            if (tooltipElement) { tooltipElement.style.display = 'none'; }
            event.cancel = true;
            const scheduleElement: Element = closest(event.target, '.e-content-wrap');
            if (scheduleElement) {
                const treeviewData: Record<string, any>[] = treeObj.current.fields.dataSource as Record<string, any>[];
                if (event.target.classList.contains('e-work-cells')) {
                    const filteredData: Record<string, any>[] = treeviewData.filter((item: Record<string, any>) =>
                        item['Id'] === parseInt(event.draggedNodeData['id'] as string, 10));
                    const cellData: CellClickEventArgs = calendarData.scheduleObj.getCellDetails(event.target);
                    let doctorId: number;
                    const activeDoctorData: Record<string, any>[] = dataService.activeDoctorData;
                    if (activeDoctorData.length > 0) {
                        doctorId = activeDoctorData[0]['Id'];
                    } else {
                        const doctor: Record<string, any>[] = doctorsData.filter((item: Record<string, any>) =>
                            item['DepartmentId'] === filteredData[0]['DepartmentId']);
                        doctorId = doctor && doctor.length > 0 ? doctor[0]['Id'] as number : doctorsData[0]['Id'] as number;
                    }
                    const milliSeconds: number = ((filteredData[0]['EndTime'] as Date).getTime() - (filteredData[0]['StartTime'] as Date).getTime());
                    const eventData: Record<string, any> = {
                        Name: filteredData[0]['Name'],
                        StartTime: cellData.startTime,
                        EndTime: new Date(new Date(cellData.startTime).setMilliseconds(milliSeconds)),
                        IsAllDay: cellData.isAllDay,
                        Symptoms: filteredData[0]['Disease'] || filteredData[0]['Symptoms'],
                        PatientId: filteredData[0]['PatientId'],
                        DepartmentId: filteredData[0]['DepartmentId'],
                        DoctorId: doctorId
                    };
                    let eventCollection: Record<string, any>[] = calendarData.scheduleObj.eventBase.filterEvents(eventData['StartTime'], eventData['EndTime']);
                    eventCollection = eventCollection.filter((item: Record<string, any>) => item['DoctorId'] === eventData['DoctorId']);
                    if (eventCollection.length > 0) {
                        event.cancel = true;
                        calendarData.toastObj.content = 'An appointment already exists on the same time range, so please reschedule on different time slots.';
                        calendarData.toastObj.show();
                    } else {
                        calendarData.scheduleObj.openEditor(eventData, 'Add', true);
                        draggedItemId.current = event.draggedNodeData['id'] as string;
                        setTreeItemDrop();
                    }
                }
            }
        }
    }

    const onItemDrag = (event: any): void => {
        const scheduleObj = getCalendarData().scheduleObj;
        if (scheduleObj.isAdaptive) {
            const classElement: HTMLElement = scheduleObj.element.querySelector('.e-device-hover');
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
            const tooltipElement: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.e-treeview');
            let status: boolean;
            tooltipElement.forEach((node: HTMLElement) => {
                node.style.display = 'block';
                status = document.querySelector('body').offsetWidth <= node.offsetLeft + node.offsetWidth;
            });
            const targetEle: Element = closest(event.target, '.droppable');
            if (!targetEle || status) {
                tooltipElement.forEach((node: HTMLElement) => node.style.display = 'none');
                event.cancel = true;
                return;
            }
            const dragElementIcon: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag .e-icon-expandable');
            dragElementIcon.forEach((node: HTMLElement) => node.style.display = 'none');
        }
    }

    const treeTemplate = (props: Record<string, any>): JSX.Element => {
        return (
            <div id="waiting">
                <div id="waitdetails">
                    <div id="waitlist">{props.Name}</div>
                    <div id='event-time'>{getEventTime(props, instance)}</div>
                    <div id="waitcategory">{getDepartmentName(props.DepartmentId, specialistCategory)} -
                        {getTreatmentDetail(props)}</div>
                </div>
                <div id="item-icon-container">
                    <span className="item-icon icon-reorder"></span>
                </div>
            </div>
        );
    }

    return (
        <>
            <TreeViewComponent ref={treeObj} fields={field} cssClass='treeview-external-drag' allowDragAndDrop={true}
                nodeDragStop={onTreeDragStop.bind(this)} nodeDragging={onItemDrag.bind(this)} nodeTemplate={treeTemplate.bind(this)}>
            </TreeViewComponent>
        </>
    )
})