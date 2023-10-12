import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Internationalization, extend } from '@syncfusion/ej2-base';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { TimePicker, TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { EJ2Instance } from '@syncfusion/ej2-react-schedule';
import { AddEditDoctor } from '../AddEditDoctor/AddEditDoctor';
import { useData, useDataDispatch } from '../../context/DataContext';
import { updateActiveItem, loadImage } from '../../util';
import './DoctorDetails.scss';

export const DoctorDetails = () => {
    const { id } = useParams();
    let doctorId = parseInt(id, 10);
    const dataService = useData();
    const dispatch = useDataDispatch();
    const addEditDoctorObj = useRef(null);
    const breakHourObj = useRef<DialogComponent>(null);
    const deleteConfirmationDialogObj = useRef<DialogComponent>(null);
    const navigate = useNavigate();
    let doctorData: Record<string, any>[] = dataService.doctorsData;
    let activeData: Record<string, any> = doctorData.filter(item => item['Id'] === doctorId)[0];
    let intl: Internationalization = new Internationalization();
    let specializationData: Record<string, any>[] = dataService.specialistData;
    let animationSettings: Record<string, any> = { effect: 'None' };
    const [breakDays, setBreakDays] = useState(JSON.parse(JSON.stringify(activeData['WorkDays'])));

    useEffect(() => {
        updateActiveItem('doctors');
        const isDataDiffer: boolean = JSON.stringify(activeData) === JSON.stringify(dataService.activeDoctorData);
        if (!isDataDiffer) {
            dispatch({ type: 'SET_ACTIVE_DOCTOR', data: activeData });
        }
    }, []);

    const onBackIconClick = (): void => {
        navigate('/doctors');
    }

    const onDoctorDelete = (): void => {
        deleteConfirmationDialogObj.current.show();
    }

    const onDeleteClick = (): void => {
        const filteredData: Record<string, any>[] = doctorData.filter((item: Record<string, any>) =>
            item['Id'] !== parseInt(activeData['Id'] as string, 10));
        doctorData = filteredData;
        activeData = doctorData[0];
        dispatch({ type: 'SET_ACTIVE_DOCTOR', data: activeData });
        dispatch({ type: 'SET_DOCTORS_DATA', data: doctorData });
        deleteConfirmationDialogObj.current.hide();
        if (activeData) {
            navigate('/doctor-details/' + activeData['Id']);
            setBreakDays(activeData['WorkDays']);
        } else {
            navigate('/doctors');
        }
    }

    const onDeleteCancelClick = (): void => {
        deleteConfirmationDialogObj.current.hide();
    }

    const onDoctorEdit = (): void => {
        addEditDoctorObj.current.showDetails();
    }

    const onAddBreak = (): void => {
        breakHourObj.current.show();
    }

    const getDayName = (day: string): string => {
        return day.split('')[0].toUpperCase();
    }

    const getWorkDayName = (day: string): string => {
        return day.charAt(0).toUpperCase() + day.slice(1);
    }

    const onCancelClick = (): void => {
        setBreakDays(dataService.activeDoctorData['WorkDays'] as Record<string, any>[]);
        breakHourObj.current.hide();
    }

    const onSaveClick = (): void => {
        const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.break-hour-dialog .e-field'));
        const workDays: Record<string, any>[] = JSON.parse(JSON.stringify(breakDays));
        for (const curElement of formElement) {
            const dayName: string = curElement.firstElementChild.getAttribute('id').split('_')[0];
            const valueName: string = curElement.firstElementChild.getAttribute('id').split('_')[1];
            const instance: TimePicker = (curElement.firstElementChild as EJ2Instance).ej2_instances[0] as TimePicker;
            for (const workDay of workDays) {
                if (workDay['Day'] === dayName) {
                    if (valueName === 'start') {
                        workDay['BreakStartHour'] = instance.value;
                        workDay['WorkStartHour'] = new Date(workDay['WorkStartHour'] as Date);
                    } else {
                        workDay['BreakEndHour'] = instance.value;
                        workDay['WorkEndHour'] = new Date(workDay['WorkEndHour'] as Date);
                    }
                }
                workDay['Enable'] = !(workDay['State'] === 'TimeOff');
            }
        }
        const availableDays: Array<number> = [];
        workDays.forEach(workDay => {
            if (workDay['Enable']) {
                availableDays.push(workDay['Index']);
            }
        });
        activeData['AvailableDays'] = availableDays.length === 0 ? [activeData['AvailableDays'][0]] : availableDays;
        if (availableDays.length === 0) {
            workDays[activeData['AvailableDays'][0]]['Enable'] = true;
            workDays[activeData['AvailableDays'][0]]['State'] = 'AddBreak';
        }
        activeData['WorkDays'] = workDays;
        setBreakDays(workDays);
        dispatch({ type: 'SET_ACTIVE_DOCTOR', data: activeData, property: 'WorkDays', propertyValue: workDays });
        breakHourObj.current.hide();
    }

    const getStatus = (state: string): boolean => {
        return state === 'RemoveBreak' ? false : true;
    }

    const onChangeStatus = (args: Record<string, any>): void => {
        args['preventDefault']();
        const activeState: string = args['target'].getAttribute('data-state');
        const activeDay: string = args['target'].getAttribute('id').split('_')[0];
        let newState = '';
        switch (activeState) {
            case 'TimeOff':
                newState = 'RemoveBreak';
                break;
            case 'RemoveBreak':
                newState = 'AddBreak';
                break;
            case 'AddBreak':
                newState = 'TimeOff';
                break;
        }
        const days: Record<string, any>[] = extend([], breakDays, null, true) as Record<string, any>[];
        for (const breakDay of days) {
            if (breakDay['Day'] === activeDay) {
                breakDay['State'] = newState;
            }
        }
        setBreakDays(days);
    }

    const getBreakDetails = (data: Record<string, any>): string => {
        if (data['State'] === 'TimeOff') {
            return 'TIME OFF';
        } else if (data['State'] === 'RemoveBreak') {
            return '---';
        } else {
            // eslint-disable-next-line max-len
            return `${intl.formatDate(data['BreakStartHour'], { skeleton: 'hm' })} - ${intl.formatDate(data['BreakEndHour'], { skeleton: 'hm' })}`;
        }
    }

    const getAvailability = (data: Record<string, any>): string => {
        const workDays: Record<string, any>[] = data['WorkDays'] as Record<string, any>[];
        const filteredData: Record<string, any>[] = workDays.filter((item: any) => item.Enable !== false);
        const result = filteredData.map(item => item['Day'].slice(0, 3).toLocaleUpperCase()).join(',');
        // eslint-disable-next-line max-len
        return `${result} - ${intl.formatDate(new Date(filteredData[0]['WorkStartHour']), { skeleton: 'hm' })} - ${intl.formatDate(new Date(filteredData[0]['WorkEndHour']), { skeleton: 'hm' })}`;
    }

    const getSpecializationText = (text: Record<string, any>): string => {
        return specializationData.filter((item: Record<string, any>) => item['Id'] === text)[0]['Text'] as string;
    }

    const getEducation = (text: string): string => {
        return text.toUpperCase();
    }

    const refreshDetails = (): void => {
        activeData = dataService.activeDoctorData;
    }

    const breakHoursFooter = (): JSX.Element => {
        return (
            <div className="button-container">
                <ButtonComponent cssClass="e-normal" onClick={onCancelClick.bind(this)}>Cancel</ButtonComponent>
                <ButtonComponent cssClass="e-normal" isPrimary={true} onClick={onSaveClick.bind(this)}>Save</ButtonComponent>
            </div>
        );
    }

    const confirmationFooter = (): JSX.Element => {
        return (
            <div className="button-container">
                <ButtonComponent cssClass="e-normal" isPrimary={true} onClick={onDeleteClick.bind(this)}>Ok</ButtonComponent>
                <ButtonComponent cssClass="e-normal" onClick={onDeleteCancelClick.bind(this)}>Cancel</ButtonComponent>
            </div>
        );
    }

    return (
        <>
            <div className="doctor-details-container">
                <header>
                    <div className="detail-header-title">
                        <span className="back-icon icon-previous" onClick={onBackIconClick.bind(this)}></span>
                        <div className="module-title">
                            <div className='title'>DOCTOR DETAILS</div>
                            <div className='underline'></div>
                        </div>
                    </div>
                    <div className='doctor-detail'>
                        <ButtonComponent cssClass="e-small delete-details" onClick={onDoctorDelete.bind(this)}>Delete</ButtonComponent>
                        <ButtonComponent cssClass="e-small edit-details" onClick={onDoctorEdit.bind(this)}>Edit</ButtonComponent>
                    </div>
                </header>
                <div className="active-doctor">
                    <div className="active-doctor-image">
                        <img className="value" src={loadImage(activeData['Text'])} alt="doctor" />
                        <span className={"availability " + activeData['Availability']}></span>
                        <span className={"upload icon-upload_photo " + activeData['NewDoctorClass']}></span>
                    </div>
                    <div className="active-doctor-info">
                        <div className="basic-detail info-field-container">
                            <div className="name">Dr. {activeData['Name']}</div>
                            <div className="education">{getEducation(activeData['Education'])}</div>
                            <div className="designation">{activeData['Designation']}</div>
                        </div>
                        <div className="speciality-detail info-field-container">
                            <div className="label-text">Specialization</div>
                            <div className="specialization">{getSpecializationText(activeData['Specialization'])}</div>
                        </div>
                        <div className="work-experience info-field-container">
                            <div className="label-text">Experience</div>
                            <div className="experience">{activeData['Experience']}</div>
                        </div>
                        <div className="work-availability info-field-container">
                            <div className="label-text">Availability</div>
                            <div className="available-days">{getAvailability(activeData)}</div>
                        </div>
                        <div className="contact-info info-field-container">
                            <div className="label-text">Mobile</div>
                            <div className="mobile">{activeData['Mobile']}</div>
                        </div>
                    </div>
                    <div className="work-days-container">
                        <header>
                            <div className="title-text">Break Hours</div>
                            <div className="add-container" onClick={onAddBreak.bind(this)}>
                                <ButtonComponent cssClass="e-small e-round" iconCss="e-icons e-add-icon" isPrimary={true}></ButtonComponent>
                                <span className="button-label">Add</span>
                            </div>
                        </header>
                        <div className="work-days-content">
                            <>
                                {
                                    activeData && activeData['WorkDays'].map((data: Record<string, any>, index: number) => {
                                        return (
                                            <div className='work-day-item' key={index}>
                                                <div className="day-name">{getWorkDayName(data.Day)}</div>
                                                <div className={"day-break-hours " + data.State}>{getBreakDetails(data)}</div>
                                            </div>
                                        )
                                    })
                                }
                            </>
                        </div>
                    </div>
                </div>
            </div>
            <div className="break-hours-container" style={{ display: 'none' }}>
                <DialogComponent ref={breakHourObj} width='445px' cssClass='break-hour-dialog' isModal={true} visible={false}
                    animationSettings={animationSettings} header='Break Hours' showCloseIcon={true} target='#content-area'
                    footerTemplate={breakHoursFooter.bind(this)}>
                    <div>
                        <div className="break-hour-operations">
                            * Click on day to add break, double click to take time off and third click to remove break
                        </div>
                        <div className="break-hour-header">
                            <div></div>
                            <div>Start Time</div>
                            <div>End Time</div>
                        </div>
                        {
                            breakDays && breakDays.map((day: Record<string, any>, index: number) => {
                                return (
                                    <div className='break-hour-days' key={index}>
                                        <div className={"day-button " + day['State']}>
                                            <ButtonComponent id={day['Day'] + "_button"} cssClass="e-small e-round" isPrimary={true}
                                                onClick={onChangeStatus.bind(this)} data-state={day['State']}>{getDayName(day['Day'])}</ButtonComponent>
                                        </div>
                                        <div className={"start-container " + day['State']}>
                                            <TimePickerComponent cssClass="e-field" id={day['Day'] + "_start"} enabled={getStatus(day['State'])}
                                                value={day['BreakStartHour']} showClearButton={false}></TimePickerComponent>
                                        </div>
                                        <div className={"end-container " + day['State']}>
                                            <TimePickerComponent cssClass='e-field' id={day['Day'] + "_end"} enabled={getStatus(day['State'])}
                                                value={day['BreakEndHour']} showClearButton={false}></TimePickerComponent>
                                        </div>
                                        <div className={"state-container " + day['State']}>
                                            <div>Time Off</div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </DialogComponent>
            </div>
            <AddEditDoctor ref={addEditDoctorObj} refreshDoctors={refreshDetails.bind(this)} />
            <div className="delete-confirmation-container" style={{ display: 'none' }}>
                <DialogComponent ref={deleteConfirmationDialogObj} width='445px' cssClass='break-hour-dialog' isModal={true} visible={false}
                    animationSettings={animationSettings} header='Doctor Details' showCloseIcon={true} target='#content-area'
                    footerTemplate={confirmationFooter.bind(this)}>
                    <form>
                        <div>Are you sure you want to delete this doctor?</div>
                    </form>
                </DialogComponent>
            </div>
        </>
    )
}