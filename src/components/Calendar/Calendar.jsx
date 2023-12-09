import * as React from 'react';
import { useRef, useEffect, useCallback, memo, useState } from 'react';
import { closest, Browser, L10n, Internationalization, extend, isNullOrUndefined, createElement } from '@syncfusion/ej2-base';
import { Query, Predicate, DataManager } from '@syncfusion/ej2-data';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import { Button, ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { Day, Week, WorkWeek, Month, Agenda, TimelineViews, TimelineMonth, Resize, DragAndDrop, ScheduleComponent, ViewsDirective, ViewDirective, ResourcesDirective, ResourceDirective, Inject, getWeekFirstDate, addDays } from '@syncfusion/ej2-react-schedule';
import { QuickPopups } from '@syncfusion/ej2-schedule/src/schedule/popups/quick-popups';
import { FieldValidator } from '@syncfusion/ej2-schedule/src/schedule/popups/form-validator';
import { DropDownListComponent, ComboBox } from '@syncfusion/ej2-react-dropdowns';
import { AddEditDoctor } from '../AddEditDoctor/AddEditDoctor';
import { AddEditPatient } from '../AddEditPatient/AddEditPatient';
import { TreeWaitingList } from './TreeWaitingList/TreeWaitingList';
import { DialogWaitingList } from './DialogWaitingList/DialogWaitingList';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useActivityDispatch } from '../../context/ActivityContext';
import { errorPlacement, updateActiveItem, loadImage, getString } from '../../util';
import doctorsIcon from '../../assets/Icons/Doctors.svg';
import './Calendar.scss';
L10n.load({
    'en-US': {
        schedule: {
            newEvent: 'Add Appointment',
            editEvent: 'Edit Appointment'
        }
    }
});
const Calendar = () => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const activityDispatch = useActivityDispatch();
    const addEditDoctorObj = useRef(null);
    const addEditPatientObj = useRef(null);
    const scheduleObj = useRef(null);
    const specialistObj = useRef(null);
    const dropdownObj = useRef(null);
    const toastObj = useRef(null);
    const treeObj = useRef(null);
    const waitingObj = useRef(null);
    const isDevice = Browser.isDevice;
    const position = { X: 'Right', Y: 'Bottom' };
    const isTreeItemDropped = useRef(false);
    const patientValue = useRef(null);
    const group = { enableCompactView: false, resources: ['Departments', 'Doctors'] };
    const instance = new Internationalization();
    const [workDays, setWorkDays] = useState([0, 1, 2, 3, 4, 5, 6]);
    const [workHours, setWorkHours] = useState({ start: '08:00', end: '21:00' });
    const animationSettings = { effect: 'None' };
    const comboBox = useRef(null);
    const fields = { text: 'Name', value: 'Id' };
    const eventData = useRef(dataService.hospitalData);
    const hospitalData = useRef(dataService.hospitalData);
    let maxAppointmentID = hospitalData.current.length > 0 ? hospitalData.current[hospitalData.current.length - 1]['Id'] : 1028;
    const calendarSettings = dataService.calendarSettings;
    const minValidation = (args) => {
        return args.value.length >= 5;
    };
    const nameValidation = (args) => {
        return dataService.patientsData.filter((item) => item.Name === args.value).length > 0;
    };
    const eventSettings = useRef({
        dataSource: eventData.current,
        query: new Query(),
        fields: {
            subject: {
                name: 'Name',
                validation: {
                    required: [true, 'Enter valid Patient Name'],
                    range: [nameValidation, 'Entered patient name is not present, please add new patient or select from list']
                }
            },
            startTime: { title: 'From', validation: { required: true } },
            endTime: { title: 'To', validation: { required: true } },
            description: {
                name: 'Symptoms',
                title: 'Symptom',
                validation: {
                    required: [true, 'Please enter disease Symptoms'],
                    minLength: [minValidation, 'Need atleast 5 letters to be entered']
                }
            }
        },
        resourceColorField: calendarSettings.bookingColor
    });
    const patientsData = dataService.patientsData;
    const specialistCategory = dataService.specialistData;
    const activeDoctorData = useRef([]);
    const specialistData = dataService.doctorsData;
    const doctorsData = dataService.doctorsData;
    const resourceDataSource = dataService.doctorsData;
    const startHour = calendarSettings.calendar['start'];
    const endHour = calendarSettings.calendar['end'];
    const timeScale = { enable: true, interval: calendarSettings.interval };
    const currentView = calendarSettings.currentView;
    const firstDayOfWeek = calendarSettings.firstDayOfWeek;
    const [selectedDate, setSelectedDate] = useState(dataService.selectedDate);
    const currentDate = useRef(selectedDate);
    const toastWidth = isDevice ? '300px' : '580px';
    useEffect(() => {
        QuickPopups.prototype.applyFormValidation = () => { };
        FieldValidator.prototype.errorPlacement = errorPlacement;
        updateActiveItem('calendar');
        if (specialistObj.current) {
            specialistObj.current.hide();
        }
    }, []);
    const onActionBegin = (args) => {
        if (args.requestType === 'eventCreate' || args.requestType === 'eventChange') {
            const data = (args.requestType === 'eventCreate' ? args.data[0] :
                args.changedRecords[0]);
            if (patientValue.current) {
                data['PatientId'] = patientValue.current;
                data['Name'] = patientsData.filter((item) => item['Id'] === patientValue.current)[0]['Name'];
            }
            let eventCollection = scheduleObj.current.eventBase.filterEvents(data['StartTime'], data['EndTime']);
            const predicate = new Predicate('Id', 'notequal', data['Id'])
                .and(new Predicate('DepartmentId', 'equal', data['DepartmentId']))
                .and(new Predicate('DoctorId', 'equal', data['DoctorId']))
                .and(new Predicate('Id', 'notequal', data['RecurrenceID']));
            eventCollection = new DataManager({ json: eventCollection }).executeLocal(new Query().where(predicate));
            if (eventCollection.length > 0) {
                args.cancel = true;
                toastObj.current.content = 'An appointment already exists on the same time range, so please reschedule on different time slots.';
                if (args.requestType === 'eventCreate') {
                    treeObj.current.addWaitingListItem(data);
                    toastObj.current.content = 'An appointment already exists on the same time range, so it is added to the waiting list';
                }
                toastObj.current.show();
            }
            else if (isTreeItemDropped.current) {
                treeObj.current.updateWaitingListItem();
            }
            if (!args.cancel) {
                if (args.requestType === 'eventCreate' && args.addedRecords[0].Id <= maxAppointmentID) {
                    args.addedRecords.forEach((item) => { item.Id = ++maxAppointmentID; });
                }
                const activityData = {
                    Name: args.requestType === 'eventCreate' ? 'Added New Appointment' : 'Updated Appointment',
                    Message: `${data['Name']} for ${data['Symptoms']}`,
                    Time: '5 mins ago',
                    Type: 'appointment',
                    ActivityTime: new Date()
                };
                activityDispatch({ type: 'SET_ACTIVITY_DATA', data: activityData });
            }
            isTreeItemDropped.current = false;
        }
        if (args.requestType === 'toolbarItemRendering') {
            if (Browser.isDevice) {
                const doctorIcon = {
                    align: 'Center',
                    cssClass: 'app-doctor-icon',
                    overflow: 'Show',
                    prefixIcon: 'doctor-icon',
                    showAlwaysInPopup: true
                };
                args.items.unshift(doctorIcon);
                const waitingListItem = {
                    align: 'Right',
                    cssClass: 'app-waiting-list',
                    showAlwaysInPopup: true,
                    text: 'Waiting list',
                    click: onWaitingListSelect.bind(this)
                };
                args.items.push(waitingListItem);
                args.items.splice(5, 1);
            }
            else {
                args.items.splice(3, 2);
            }
        }
    };
    const onActionComplete = (args) => {
        if (args.requestType === 'toolBarItemRendered') {
            if (Browser.isDevice) {
                const doctorIconContainer = scheduleObj.current.element.querySelector('.app-doctor-icon');
                const doctorIcon = doctorIconContainer.querySelector('.doctor-icon');
                const doctorImage = createElement('img', { className: 'active-doctor', attrs: { src: doctorsIcon } });
                doctorIcon.appendChild(doctorImage);
                doctorIconContainer.style.display = 'block';
                doctorIconContainer.onclick = () => specialistObj.current.show();
            }
        }
        if (document.body.style.cursor === 'not-allowed') {
            document.body.style.cursor = '';
        }
        if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
            if (activeDoctorData.current.length > 0) {
                if (args.addedRecords.length > 0) {
                    args.addedRecords.forEach((item) => { hospitalData.current.push(item); });
                }
                if (args.deletedRecords.length > 0) {
                    args.deletedRecords.forEach((item) => {
                        hospitalData.current = hospitalData.current.filter((data) => data['Id'] !== item['Id']);
                    });
                }
            }
            dispatch({ type: 'SET_HOSPITAL_DATA', data: hospitalData.current });
        }
    };
    const onPopupOpen = (args) => {
        if (args.type === 'Editor') {
            // additional field customization
            if (!args.element.querySelector('.custom-field-row')) {
                const row = createElement('div', { className: 'custom-field-row' });
                const formElement = args.element.querySelector('.e-schedule-form');
                formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
                const container = createElement('div', { className: 'custom-field-container' });
                const comboBoxElement = createElement('input', { attrs: { id: 'PatientName' } });
                container.appendChild(comboBoxElement);
                row.appendChild(container);
                comboBox.current = new ComboBox({
                    dataSource: patientsData,
                    allowFiltering: true,
                    fields: { text: 'Name', value: 'Id' },
                    floatLabelType: 'Always',
                    placeholder: 'PATIENT NAME',
                    change: (e) => patientValue.current = e.value,
                    select: () => {
                        if (!isNullOrUndefined(document.querySelector('.custom-field-row .field-error'))) {
                            document.querySelector('.custom-field-row .field-error').style.display = 'none';
                        }
                    }
                });
                comboBox.current.appendTo(comboBoxElement);
                comboBoxElement.setAttribute('name', 'Name');
                const buttonEle = createElement('button', { attrs: { name: 'PatientButton' } });
                buttonEle.onclick = onAddPatient.bind(this);
                container.appendChild(buttonEle);
                const button = new Button({ iconCss: 'e-icons e-add-icon', cssClass: 'e-small e-round', isPrimary: true });
                button.appendTo(buttonEle);
            }
            comboBox.current.value = args.data['PatientId'] || null;
        }
        if (args.type === 'QuickInfo') {
            if (args.target.classList.contains('e-work-cells') || args.target.classList.contains('e-header-cells')) {
                scheduleObj.current.closeQuickInfoPopup();
                args.cancel = true;
            }
            else if (args.target.classList.contains('e-appointment')) {
                args.element.style.boxShadow = `1px 2px 5px 0 ${args.target.style.backgroundColor}`;
            }
        }
        if (args.type === 'EventContainer') {
            const eventElements = args.element.querySelectorAll('.e-appointment');
            eventElements.forEach((element) => { element.querySelector('.e-subject').style.color = '#fff'; });
        }
    };
    const onPopupClose = (args) => {
        if (isTreeItemDropped.current && args.type === 'Editor' && !args.data) {
            isTreeItemDropped.current = false;
        }
    };
    const onEventRendered = (args) => {
        if (args['element'].classList.contains('e-appointment')) {
            const data = args['data'];
            const eventStart = data['StartTime'];
            const eventEnd = data['EndTime'];
            let eventCollection = scheduleObj.current.blockProcessed;
            eventCollection = scheduleObj.current.eventBase.filterEvents(eventStart, eventEnd, eventCollection);
            if (eventCollection.length > 0) {
                args['cancel'] = true;
                return;
            }
            args['element'].style.color = '#fff';
        }
    };
    const onAddPatient = () => {
        addEditPatientObj.current.onAddPatient();
    };
    const getEventDetails = (data) => {
        return (instance.formatDate(new Date(data['StartTime']), { type: 'date', skeleton: 'long' }) +
            '(' + getString(new Date(data['StartTime']), 'hm', instance) + '-' + getString(new Date(data['EndTime']), 'hm', instance) + ')');
    };
    const getPatientName = (data) => {
        return patientsData.filter((item) => item['Id'] === data['PatientId'])[0]['Name'].toString();
    };
    const getDoctorName = (data) => {
        if (!isNullOrUndefined(data['DoctorId'])) {
            return 'Dr. ' + doctorsData.filter((item) => item['Id'] === data['DoctorId'])[0]['Name'].toString();
        }
        else {
            return specialistCategory.filter((item) => item['DepartmentId'] === data['DepartmentId'])[0]['Text'].toString();
        }
    };
    const onDoctorSelect = (args) => {
        if (args['value']) {
            refreshDataSource(args['itemData'].DepartmentId, args['itemData'].Id);
        }
        else {
            setDefaultData();
        }
    };
    const refreshDataSource = (deptId, doctorId) => {
        const filteredItems = doctorsData.filter(item => parseInt(doctorId, 10) === item['Id']);
        activeDoctorData.current = filteredItems;
        if (filteredItems.length > 0) {
            updateBreakHours(scheduleObj.current.selectedDate);
            eventData.current = generateEvents(activeDoctorData.current[0]);
        }
        else {
            eventData.current = hospitalData.current;
        }
        scheduleObj.current.resources[0].query = new Query().where('DepartmentId', 'equal', parseInt(deptId, 10));
        scheduleObj.current.resources[1].query = new Query().where('Id', 'equal', parseInt(doctorId, 10));
        scheduleObj.current.eventSettings.dataSource = eventData.current;
        setWorkDays(filteredItems[0]['AvailableDays']);
        setWorkHours({ start: filteredItems[0]['StartHour'], end: filteredItems[0]['EndHour'] });
        treeObj.current.updateWaitingList(parseInt(deptId, 10), null);
    };
    const onAddClick = () => {
        addEditDoctorObj.current.onAddDoctor();
    };
    const createNewEvent = (e) => {
        const args = e;
        let data;
        const isSameTime = scheduleObj.current.activeCellsData.startTime.getTime() === scheduleObj.current.activeCellsData.endTime.getTime();
        if (scheduleObj.current.activeCellsData && !isSameTime) {
            data = scheduleObj.current.activeCellsData;
        }
        else {
            const interval = scheduleObj.current.activeViewOptions.timeScale.interval;
            const slotCount = scheduleObj.current.activeViewOptions.timeScale.slotCount;
            const msInterval = (interval * 60000) / slotCount;
            const startTime = new Date(scheduleObj.current.selectedDate.getTime());
            startTime.setHours(new Date().getHours(), Math.round(startTime.getMinutes() / msInterval) * msInterval, 0);
            const endTime = new Date(new Date(startTime.getTime()).setMilliseconds(startTime.getMilliseconds() + msInterval));
            data = { startTime, endTime, isAllDay: false };
        }
        scheduleObj.current.openEditor(extend(data, { cancel: false, event: args.event }), 'Add');
    };
    const onSpecialistSelect = (args) => {
        const target = closest(args['target'], '.specialist-item');
        const deptId = target.getAttribute('data-deptid');
        const doctorId = target.getAttribute('data-doctorid');
        refreshDataSource(deptId, doctorId);
        const doctorImage = scheduleObj.current.element.querySelector('.doctor-icon .active-doctor');
        doctorImage.setAttribute('src', loadImage(activeDoctorData.current[0]['Text']));
        specialistObj.current.hide();
    };
    const onBackIconClick = () => {
        specialistObj.current.hide();
    };
    const onWaitingListSelect = () => {
        waitingObj.current.show();
    };
    const getCalendarData = () => {
        return {
            scheduleObj: scheduleObj.current, toastObj: toastObj.current, treeObj: treeObj.current,
            currentDate: currentDate.current, activeDoctorData: activeDoctorData.current
        };
    };
    const updateEventData = (data) => {
        eventData.current = data;
    };
    const setTreeItemDrop = () => {
        isTreeItemDropped.current = true;
    };
    const getDateHeaderText = (value) => instance.formatDate(value, { skeleton: 'MMMEd' }).toUpperCase();
    const getBackGroundColor = (data) => {
        let color;
        if (calendarSettings.bookingColor === 'Doctors' && !isNullOrUndefined(data['DoctorId'])) {
            color = doctorsData.filter((item) => item['Id'] === data['DoctorId'])[0]['Color'] || '#7575ff';
        }
        else {
            color = specialistCategory.filter((item) => item['DepartmentId'] === data['DepartmentId'])[0]['Color'];
        }
        return { backgroundColor: color, color: '#FFFFFF' };
    };
    const onNavigation = (args) => {
        currentDate.current = args.currentDate || selectedDate;
        if (args.action === 'dateNavigate') {
            setSelectedDate(currentDate.current);
        }
        if (activeDoctorData.current.length > 0) {
            updateBreakHours(currentDate.current);
            eventData.current = generateEvents(activeDoctorData.current[0]);
            scheduleObj.current.eventSettings.dataSource = eventData.current;
            treeObj.current.updateWaitingList(activeDoctorData.current[0]['DepartmentId'], null);
        }
        else {
            treeObj.current.updateWaitingList();
        }
    };
    const updateBreakHours = (currentDate) => {
        const currentViewDates = [];
        let startDate = getWeekFirstDate(currentDate, firstDayOfWeek);
        const endDate = addDays(new Date(startDate.getTime()), 7);
        do {
            currentViewDates.push(startDate);
            startDate = addDays(new Date(startDate.getTime()), 1);
        } while (startDate.getTime() !== endDate.getTime());
        currentViewDates.forEach((item) => {
            activeDoctorData.current[0]['WorkDays'].forEach((dayItem) => {
                if (dayItem['BreakStartHour'].getDay() === item.getDay()) {
                    dayItem['BreakStartHour'] = resetDateValue(dayItem['BreakStartHour'], item);
                    dayItem['BreakEndHour'] = resetDateValue(dayItem['BreakEndHour'], item);
                    dayItem['WorkStartHour'] = resetDateValue(dayItem['WorkStartHour'], item);
                    dayItem['WorkEndHour'] = resetDateValue(dayItem['WorkEndHour'], item);
                }
            });
        });
    };
    const resetDateValue = (date, item) => {
        return new Date(new Date(date).setFullYear(item.getFullYear(), item.getMonth(), item.getDate()));
    };
    const generateEvents = (activeData) => {
        const filteredEvents = [];
        const datas = hospitalData.current.filter((item) => item.DoctorId === activeData['Id'] || (Array.isArray(item.DoctorId) && item.DoctorId.indexOf(activeData['Id']) !== -1));
        datas.forEach((element) => filteredEvents.push(element));
        activeData['WorkDays'].forEach((element) => {
            if (element['State'] !== 'RemoveBreak') {
                const newBreakEvent = {
                    Id: Math.max.apply(Math, filteredEvents.map((data) => data['Id'])) + 1,
                    Name: 'Break Time',
                    StartTime: element['BreakStartHour'],
                    EndTime: element['BreakEndHour'],
                    IsBlock: true,
                    DoctorId: activeData['Id']
                };
                filteredEvents.push(newBreakEvent);
            }
            if (element['Enable']) {
                const shiftValue = activeData['DutyTiming'];
                const obj = [];
                if (shiftValue === 'Shift1') {
                    const shiftTiming = {
                        startTime: new Date(new Date(element['WorkStartHour']).setHours(17)),
                        endTime: new Date(new Date(element['WorkEndHour']).setHours(21))
                    };
                    obj.push(shiftTiming);
                }
                else if (shiftValue === 'Shift2') {
                    const shiftTiming1 = {
                        startTime: new Date(new Date(element['WorkStartHour']).setHours(8)),
                        endTime: new Date(new Date(element['WorkEndHour']).setHours(10))
                    };
                    const shiftTiming2 = {
                        startTime: new Date(new Date(element['WorkStartHour']).setHours(19)),
                        endTime: new Date(new Date(element['WorkEndHour']).setHours(21))
                    };
                    obj.push(shiftTiming1);
                    obj.push(shiftTiming2);
                }
                else {
                    const shiftTiming = {
                        startTime: new Date(new Date(element['WorkStartHour']).setHours(8)),
                        endTime: new Date(new Date(element['WorkEndHour']).setHours(12))
                    };
                    obj.push(shiftTiming);
                }
                obj.forEach(item => {
                    const newBreakEvent = {
                        Id: Math.max.apply(Math, filteredEvents.map((data) => data['Id'])) + 1,
                        Name: 'Off Work',
                        StartTime: item['startTime'],
                        EndTime: item['endTime'],
                        IsBlock: true,
                        DoctorId: activeData['Id']
                    };
                    filteredEvents.push(newBreakEvent);
                });
            }
        });
        return filteredEvents;
    };
    const clearSelection = () => {
        if (activeDoctorData.current && activeDoctorData.current.length > 0) {
            setDefaultData();
            const doctorImage = scheduleObj.current.element.querySelector('.doctor-icon .active-doctor');
            doctorImage.setAttribute('src', doctorsIcon);
        }
        specialistObj.current.hide();
    };
    const setDefaultData = () => {
        scheduleObj.current.resources[0].dataSource = specialistCategory;
        scheduleObj.current.resources[1].dataSource = resourceDataSource;
        scheduleObj.current.resources[0].query = new Query();
        scheduleObj.current.resources[1].query = new Query();
        eventData.current = hospitalData.current;
        scheduleObj.current.eventSettings.dataSource = eventData.current;
        scheduleObj.current.refreshEvents();
        treeObj.current.updateWaitingList();
        setWorkDays([0, 1, 2, 3, 4, 5, 6]);
        setWorkHours({ start: '08:00', end: '21:00' });
        activeDoctorData.current = [];
    };
    const dateHeaderTemplate = useCallback((props) => {
        return (<div className="date-text">{getDateHeaderText(props.date)}</div>);
    }, []);
    const header = useCallback((props) => {
        if (props.elementType === 'cell') {
            return (<></>);
        }
        return (<div>
                <div className="quick-info-header">
                    <div className="quick-info-header-content" style={getBackGroundColor(props)}>
                        <div className="quick-info-title">Appointment Details</div>
                        <div className='duration-text'>{getEventDetails(props)}</div>
                    </div>
                </div>
            </div>);
    }, []);
    const content = useCallback((props) => {
        if (props.elementType === 'cell') {
            return (<div className="e-cell-content">
                    <form className="e-schedule-form">
                        <div style={{ padding: "10px" }}>
                            <input className="subject e-field" type="text" name="Subject" placeholder="Title" style={{ width: "100%" }}/>
                        </div>
                        <div style={{ padding: "10px" }}>
                            <input className="location e-field" type="text" name="Location" placeholder="Location" style={{ width: "100%" }}/>
                        </div>
                    </form>
                </div>);
        }
        return (<div>
                <div className="event-content">
                    <div className="patient-name-wrap">
                        <label>Patient Name</label>:
                        <div><span>{getPatientName(props)}</span></div>
                    </div>
                    <div className="doctor-name-wrap">
                        <label>{props.DoctorId ? "Doctor Name" : "Department Name"}</label>:
                        <div><span>{getDoctorName(props)}</span></div>
                    </div>
                    <div className="notes-wrap">
                        <label>Notes</label>:
                        <div><span>{props.Symptoms}</span></div>
                    </div>
                </div>
            </div>);
    }, []);
    const quickInfoTemplates = { header: header, content: content };
    const itemTemplate = (props) => {
        return (<div className="specialist-item">
                <img className="value" src={loadImage(props.Text)} alt="doctor"/>
                <div className="doctor-details">
                    <div className="name">Dr.{props.Name}</div>
                    <div className="designation">{props.Designation}</div>
                </div>
            </div>);
    };
    const footerTemplate = () => {
        return (<div className="add-doctor" onClick={onAddClick.bind(this)}>
                <div className="e-icon-add e-icons"></div>
                <div className="add-doctor-text">Add New Doctor</div>
            </div>);
    };
    const speciaListDialogHeader = () => {
        return (<div className="specialist-header">
                <div>
                    <span className="back-icon icon-previous" onClick={onBackIconClick.bind(this)}></span>
                    <span className="title-text">CHOOSE SPECIALIST</span>
                </div>
                <div>
                    <ButtonComponent cssClass="e-small" onClick={clearSelection.bind(this)}>CLEAR</ButtonComponent>
                </div>
            </div>);
    };
    const speciaListDialogFooter = () => {
        return (<div className="add-doctor" onClick={onAddClick.bind(this)}>
                <div className="e-icon-add e-icons"></div>
                <div className="add-doctor-text">Add New Doctor</div>
            </div>);
    };
    return (<>
            <div className="planner-calendar">
                <div className="doctor-container" style={{ display: 'none' }}>
                    <div className="app-doctors"></div>
                    <div className="app-doctor-icon"></div>
                </div>
                <div className="drag-sample-wrapper droppable">
                    <div className="schedule-container">
                        <ScheduleComponent ref={scheduleObj} height='800px' cssClass={'doctor-appointment-planner'} showWeekend={false} startHour={startHour} endHour={endHour} selectedDate={selectedDate} eventSettings={eventSettings.current} timeScale={timeScale} workDays={workDays} workHours={workHours} firstDayOfWeek={firstDayOfWeek} currentView={currentView} actionBegin={onActionBegin} actionComplete={onActionComplete} popupOpen={onPopupOpen} popupClose={onPopupClose} eventRendered={onEventRendered} navigating={onNavigation} dateHeaderTemplate={dateHeaderTemplate} quickInfoTemplates={quickInfoTemplates}>
                            <ResourcesDirective>
                                <ResourceDirective field='DepartmentId' title='Department' name='Departments' dataSource={specialistCategory} textField='Text' idField='DepartmentId' colorField='Color'>
                                </ResourceDirective>
                                <ResourceDirective field='DoctorId' title='Consultation' name='Doctors' dataSource={resourceDataSource} textField='Name' idField='Id' groupIDField='DepartmentId' colorField='Color' workDaysField='AvailableDays' startHourField='StartHour' endHourField='EndHour'>
                                </ResourceDirective>
                            </ResourcesDirective>
                            <ViewsDirective>
                                <ViewDirective option="Day"></ViewDirective>
                                <ViewDirective option="Week"></ViewDirective>
                                <ViewDirective option="Month"></ViewDirective>
                                <ViewDirective option="TimelineDay" group={group}></ViewDirective>
                                <ViewDirective option="TimelineWeek" group={group}></ViewDirective>
                                <ViewDirective option="TimelineWorkWeek" group={group}></ViewDirective>
                                <ViewDirective option="TimelineMonth" group={group}></ViewDirective>
                            </ViewsDirective>
                            <Inject services={[Day, Week, WorkWeek, Month, Agenda, TimelineViews, TimelineMonth, Resize, DragAndDrop]}/>
                        </ScheduleComponent>
                    </div>
                    <div className="treeview-container">
                        <div className="choose-Specialist-container">
                            <DropDownListComponent ref={dropdownObj} id='specialist' cssClass={"e-specialist-doctors" + (isDevice ? " e-specialist-hide" : "")} dataSource={doctorsData} fields={fields} placeholder='Choose Specialist' popupHeight='auto' popupWidth='221px' showClearButton={true} change={onDoctorSelect.bind(this)} itemTemplate={itemTemplate.bind(this)} footerTemplate={footerTemplate.bind(this)}></DropDownListComponent>
                        </div>
                        <div className="add-event-container" style={{ display: 'none' }}>
                            <ButtonComponent onClick={createNewEvent.bind(this)} className="e-primary">Add Appointment</ButtonComponent>
                        </div>
                        <div className="title-container">
                            <h2 className="title-text">Waiting List</h2>
                        </div>
                        <ToastComponent ref={toastObj} position={position} width={toastWidth} height='70px' showCloseButton={true}>
                        </ToastComponent>
                        <TreeWaitingList ref={treeObj} getCalendarData={getCalendarData} setTreeItemDrop={setTreeItemDrop}/>
                    </div>
                </div>
            </div>
            <div className="specialist-dialog" style={{ display: 'none' }}>
                <DialogComponent ref={specialistObj} height='500px' isModal={true} visible={false} cssClass='specialist-selection' animationSettings={animationSettings} showCloseIcon={false} target='#content-area' width='100%' header={speciaListDialogHeader.bind(this)} footerTemplate={speciaListDialogFooter.bind(this)}>
                    <div>
                        {specialistData && specialistData.map((specialist, index) => {
            return (<div key={index}>
                                        <div className="specialist-item" data-deptid={specialist['DepartmentId']} data-doctorid={specialist['Id']} onClick={onSpecialistSelect.bind(this)}>
                                            <img className="value" src={loadImage(specialist['Text'])} alt="doctor"/>
                                            <div className="doctor-details">
                                                <div className="name">Dr.{specialist['Name']}</div>
                                                <div className="designation">{specialist['Designation']}</div>
                                            </div>
                                        </div>
                                    </div>);
        })}
                    </div>
                </DialogComponent>
            </div>
            <div className="waiting-list-container" style={{ display: 'none' }}>
                <DialogWaitingList ref={waitingObj} getCalendarData={getCalendarData} updateEventData={updateEventData}/>
            </div>
            <AddEditDoctor ref={addEditDoctorObj} calendarDropDownObj={dropdownObj}/>
            <AddEditPatient ref={addEditPatientObj} calendarComboBoxObj={comboBox}/>
        </>);
};
export default memo(Calendar);
