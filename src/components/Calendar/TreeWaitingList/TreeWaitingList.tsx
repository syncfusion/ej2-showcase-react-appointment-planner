import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Internationalization } from '@syncfusion/ej2-base';
import { addClass, closest } from '@syncfusion/react-base';
import { TreeViewComponent, DragAndDropEventArgs } from '@syncfusion/ej2-react-navigations';
import { EventModel, SchedulerCellDetails } from '@syncfusion/react-scheduler';
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

    const activeList: Record<string, any>[] = waitingListService.activeWaitingList || [];

    const activeDoctorData: Record<string, any>[] = getCalendarData().activeDoctorData || [];
    const activeDoctorId: string = activeDoctorData.length > 0 ? String(activeDoctorData[0]['Id']) : 'none';

    const signature: string = `${activeDoctorId}::${activeList
        .map((item: Record<string, any>) => item['Id'])
        .sort((a: any, b: any) => a - b)
        .join(',')}`;

    useEffect(() => {
        updateActiveWaitingList();
    }, []);

    useImperativeHandle(ref, () => ({
        addWaitingListItem(data: Record<string, any>) { addWaitingListItem(data); },
        updateWaitingListItem() { updateWaitingListItem(); },
        updateWaitingList(deptId?: number, doctorId?: number, currentWaitingList?: Record<string, any>[]) {
            updateWaitingList(deptId, doctorId, currentWaitingList);
        },
        updateActiveWaitingList(currentWaitingList?: Record<string, any>[]) {
            updateActiveWaitingList(currentWaitingList);
        }
    }));

    const addWaitingListItem = (data: Record<string, any>) => {
        data.Id = waitingListID.current;
        waitingListID.current++;

        const active: Record<string, any>[] = getCalendarData().activeDoctorData || [];
        if (active.length > 0 && (data['DoctorId'] === undefined || data['DoctorId'] === null)) {
            data['DoctorId'] = active[0]['Id'];
        }

        waitingList.push(data);
        waitingListDispatch({ type: 'SET_WAITING_LIST', data: waitingList });
        updateActiveWaitingList();
    };

    const updateWaitingListItem = () => {
        waitingList = waitingList.filter((item: any) => item.Id !== parseInt(draggedItemId.current, 10));
        waitingListDispatch({ type: 'SET_WAITING_LIST', data: waitingList });
        updateActiveWaitingList(waitingList);
    };

    const updateActiveWaitingList = (currentWaitingList?: Record<string, any>[]) => {
        const active: Record<string, any>[] = getCalendarData().activeDoctorData || [];
        if (active.length > 0) {
            updateWaitingList(active[0]['DepartmentId'], active[0]['Id'], currentWaitingList);
        } else {
            updateWaitingList(null, null, currentWaitingList);
        }
    };

    const updateWaitingList = (deptId?: number, doctorId?: number, currentWaitingList?: Record<string, any>[]) => {
        const source: Record<string, any>[] = currentWaitingList
            ? currentWaitingList
            : waitingListService.waitingList;

        let filtered: Record<string, any>[] = [...source];

        if (doctorId != null) {
            const doctorFiltered = filtered.filter((item: Record<string, any>) => item['DoctorId'] === doctorId);

            filtered = doctorFiltered.length > 0
                ? doctorFiltered
                : filtered.filter((item: Record<string, any>) => item['DepartmentId'] === deptId);
        } else if (deptId != null) {
            filtered = filtered.filter((item: Record<string, any>) => item['DepartmentId'] === deptId);
        }

        waitingListDispatch({ type: 'SET_ACTIVE_WAITING_LIST', data: filtered });
    };

    const onTreeDragStop = (event: DragAndDropEventArgs): void => {
        const calendarData = getCalendarData();
        const treeElement: Element = closest(event.target, '.e-treeview');
        const classElement: HTMLElement = calendarData.scheduleObj.element?.querySelector('.e-device-hover');
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
                    const cellData: SchedulerCellDetails | null = calendarData.scheduleObj.getCellDetails(event.target as HTMLElement);
                    if (!cellData) { return; }
                    let doctorId: number;
                    const activeDocData: Record<string, any>[] = calendarData.activeDoctorData;
                    if (activeDocData.length > 0) {
                        doctorId = activeDocData[0]['Id'] as number;
                    } else {
                        const doctor: Record<string, any>[] = doctorsData.filter((item: Record<string, any>) =>
                            item['DepartmentId'] === filteredData[0]['DepartmentId']);
                        doctorId = doctor && doctor.length > 0 ? doctor[0]['Id'] as number : doctorsData[0]['Id'] as number;
                    }
                    const milliSeconds: number = ((filteredData[0]['EndTime'] as Date).getTime() - (filteredData[0]['StartTime'] as Date).getTime());
                    const eventData: EventModel = {
                        subject: filteredData[0]['Name'],
                        startTime: cellData.startTime,
                        endTime: new Date(new Date(cellData.startTime).setMilliseconds(milliSeconds)),
                        isAllDay: cellData.isAllDay,
                        description: filteredData[0]['Disease'] || filteredData[0]['Symptoms'],
                        // custom fields
                        Name: filteredData[0]['Name'],
                        Symptoms: filteredData[0]['Disease'] || filteredData[0]['Symptoms'],
                        PatientId: filteredData[0]['PatientId'],
                        DepartmentId: filteredData[0]['DepartmentId'],
                        DoctorId: doctorId
                    };
                    // Replace legacy eventBase.filterEvents with a manual filter on the data source
                    const eventCollection: Record<string, any>[] = (calendarData.scheduleObj.eventSettings.dataSource as Record<string, any>[])
                        .filter((item: Record<string, any>) => {
                            const start: Date = new Date(item['StartTime']);
                            const end: Date = new Date(item['EndTime']);
                            return start < eventData.endTime! && end > eventData.startTime!;
                        })
                        .filter((item: Record<string, any>) => item['DoctorId'] === eventData.DoctorId);
                    if (eventCollection.length > 0) {
                        event.cancel = true;
                        calendarData.toastObj.show('An appointment already exists on the same time range, so please reschedule on different time slots.');
                    } else {
                        calendarData.scheduleObj.openEditor('Add', eventData);
                        draggedItemId.current = event.draggedNodeData['id'] as string;
                        setTreeItemDrop();
                    }
                }
            }
        }
    };

    const onItemDrag = (event: any): void => {
        const scheduleObj = getCalendarData().scheduleObj;
        // isAdaptive is no longer on IScheduler — rely on CSS class for adaptive detection
        const isAdaptive: boolean = !!scheduleObj.element?.classList.contains('e-device');
        if (isAdaptive) {
            const classElement: HTMLElement = scheduleObj.element?.querySelector('.e-device-hover');
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
    };

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
    };

    return (
        <>
            <TreeViewComponent key={signature} ref={treeObj} fields={field} cssClass='treeview-external-drag' allowDragAndDrop={true}
                nodeDragStop={onTreeDragStop.bind(this)} nodeDragging={onItemDrag.bind(this)} nodeTemplate={treeTemplate.bind(this)}>
            </TreeViewComponent>
        </>
    );
});
