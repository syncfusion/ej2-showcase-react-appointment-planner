import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Internationalization, extend } from '@syncfusion/ej2-base';
import { Button, Color, Size, Variant } from '@syncfusion/react-buttons';
import { Dialog, IDialog } from '@syncfusion/react-popups';
import { TimePicker } from '@syncfusion/react-calendars';
import { AddEditDoctor } from '../AddEditDoctor/AddEditDoctor';
import { useData, useDataDispatch } from '../../context/DataContext';
import { updateActiveItem, loadImage } from '../../util';
import { PlusIcon } from "@syncfusion/react-icons";
import './DoctorDetails.scss';

const normalizeDay = (day: Record<string, any>) => ({
    ...day,
    WorkStartHour: day.WorkStartHour ? new Date(day.WorkStartHour) : null,
    WorkEndHour: day.WorkEndHour ? new Date(day.WorkEndHour) : null,
    BreakStartHour: day.BreakStartHour ? new Date(day.BreakStartHour) : null,
    BreakEndHour: day.BreakEndHour ? new Date(day.BreakEndHour) : null
});

export const DoctorDetails = () => {
    const { id } = useParams();
    const doctorId = parseInt(id ?? '', 10);

    const dataService = useData();
    const dispatch = useDataDispatch();
    const addEditDoctorObj = useRef<any>(null);
    const breakHourObj = useRef<IDialog>(null);
    const deleteConfirmationDialogObj = useRef<IDialog>(null);
    const navigate = useNavigate();

    if (!dataService || !dispatch) {
        return null;
    }

    const doctorData: Record<string, any>[] = dataService.doctorsData ?? [];
    const activeData = doctorData.find(item => item['Id'] === doctorId);

    const intl: Internationalization = new Internationalization();
    const specializationData: Record<string, any>[] = dataService.specialistData ?? [];
    const dialogTarget = document.getElementById('content-area') as HTMLElement | null;

    const [breakDays, setBreakDays] = useState<Record<string, any>[]>(
        activeData?.WorkDays ? activeData.WorkDays.map(normalizeDay) : []
    );
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBreakOpen, setIsBreakOpen] = useState(false);

    useEffect(() => {
        if (!activeData) {
            navigate('/doctors');
            return;
        }

        updateActiveItem('doctors');

        const isDataDiffer =
            JSON.stringify(activeData) === JSON.stringify(dataService.activeDoctorData);

        if (!isDataDiffer) {
            dispatch({ type: 'SET_ACTIVE_DOCTOR', data: activeData });
        }
    }, [activeData, dataService.activeDoctorData, dispatch, navigate]);

    useEffect(() => {
        if (activeData?.WorkDays) {
            setBreakDays(activeData.WorkDays.map(normalizeDay));
        }
    }, [activeData]);

    if (!activeData) {
        return null;
    }

    const onBackIconClick = (): void => {
        navigate('/doctors');
    };

    const onDoctorDelete = (): void => {
        setIsDeleteOpen(true);
    };

    const onDeleteClick = (): void => {
        const filteredData: Record<string, any>[] = doctorData.filter(
            (item: Record<string, any>) => item['Id'] !== activeData['Id']
        );

        dispatch({ type: 'SET_DOCTORS_DATA', data: filteredData });
        setIsDeleteOpen(false);

        if (filteredData.length > 0) {
            const nextDoctor = filteredData[0];
            dispatch({ type: 'SET_ACTIVE_DOCTOR', data: nextDoctor });
            navigate('/doctor-details/' + nextDoctor['Id']);
            setBreakDays(nextDoctor['WorkDays'] ? nextDoctor['WorkDays'].map(normalizeDay) : []);
        } else {
            navigate('/doctors');
        }
    };

    const onDeleteCancelClick = (): void => {
        setIsDeleteOpen(false);
    };

    const onDoctorEdit = (): void => {
        addEditDoctorObj.current?.showDetails();
    };

    const onAddBreak = (): void => {
        setBreakDays(activeData.WorkDays ? activeData.WorkDays.map(normalizeDay) : []);
        setIsBreakOpen(true);
    };

    const getDayName = (day: string): string => {
        return day.split('')[0].toUpperCase();
    };

    const getWorkDayName = (day: string): string => {
        return day.charAt(0).toUpperCase() + day.slice(1);
    };

    const onCancelClick = (): void => {
        setBreakDays(activeData.WorkDays ? activeData.WorkDays.map(normalizeDay) : []);
        setIsBreakOpen(false);
    };

    const onBreakStartChange = (dayName: string, value: Date | null): void => {
        const days = extend([], breakDays, undefined, true) as Record<string, any>[];
        for (const day of days) {
            if (day['Day'] === dayName) {
                day['BreakStartHour'] = value;
                break;
            }
        }
        setBreakDays(days);
    };

    const onBreakEndChange = (dayName: string, value: Date | null): void => {
        const days = extend([], breakDays, undefined, true) as Record<string, any>[];
        for (const day of days) {
            if (day['Day'] === dayName) {
                day['BreakEndHour'] = value;
                break;
            }
        }
        setBreakDays(days);
    };

    const onSaveClick = (): void => {
        const workDays: Record<string, any>[] = breakDays.map(normalizeDay);

        const availableDays: Array<number> = [];
        workDays.forEach(workDay => {
            workDay['Enable'] = !(workDay['State'] === 'TimeOff');
            if (workDay['Enable']) {
                availableDays.push(workDay['Index']);
            }
        });

        const updatedAvailableDays =
            availableDays.length === 0 ? [activeData['AvailableDays'][0]] : availableDays;

        if (availableDays.length === 0) {
            const firstIndex = activeData['AvailableDays'][0];
            if (workDays[firstIndex]) {
                workDays[firstIndex]['Enable'] = true;
                workDays[firstIndex]['State'] = 'AddBreak';
            }
        }

        const updatedDoctor = {
            ...activeData,
            AvailableDays: updatedAvailableDays,
            WorkDays: workDays
        };

        dispatch({
            type: 'SET_ACTIVE_DOCTOR',
            data: updatedDoctor
        });

        dispatch({
            type: 'UPDATE_DOCTOR_DATA',
            data: updatedDoctor,
            property: 'WorkDays',
            propertyValue: workDays
        });

        setBreakDays(workDays);
        setIsBreakOpen(false);
    };

    const getStatus = (state: string): boolean => {
        return state !== 'RemoveBreak';
    };

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

        const days: Record<string, any>[] = extend([], breakDays, undefined, true) as Record<string, any>[];
        for (const breakDay of days) {
            if (breakDay['Day'] === activeDay) {
                breakDay['State'] = newState;
            }
        }
        setBreakDays(days);
    };

    const getBreakDetails = (data: Record<string, any>): string => {
        if (data['State'] === 'TimeOff') {
            return 'TIME OFF';
        } else if (data['State'] === 'RemoveBreak') {
            return '---';
        } else {
            const start = data['BreakStartHour'] ? new Date(data['BreakStartHour']) : null;
            const end = data['BreakEndHour'] ? new Date(data['BreakEndHour']) : null;

            if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
                return '---';
            }

            return `${intl.formatDate(start, { skeleton: 'hm' })} - ${intl.formatDate(end, { skeleton: 'hm' })}`;
        }
    };

    const getAvailability = (data: Record<string, any>): string => {
        const workDays: Record<string, any>[] = data['WorkDays'] as Record<string, any>[];
        const normalizedWorkDays = workDays.map(normalizeDay);
        const filteredData: Record<string, any>[] = normalizedWorkDays.filter((item: any) => item.Enable !== false);

        if (filteredData.length === 0) {
            return '';
        }

        const result = filteredData.map(item => item['Day'].slice(0, 3).toLocaleUpperCase()).join(',');
        return `${result} - ${intl.formatDate(filteredData[0]['WorkStartHour'], { skeleton: 'hm' })} - ${intl.formatDate(filteredData[0]['WorkEndHour'], { skeleton: 'hm' })}`;
    };

    const getSpecializationText = (text: Record<string, any>): string => {
        const match = specializationData.find((item: Record<string, any>) => item['Id'] === text);
        return match ? (match['Text'] as string) : '';
    };

    const getEducation = (text: string): string => {
        return text.toUpperCase();
    };

    const refreshDetails = (): void => {
    };

    const breakHoursFooter = (): JSX.Element => {
        return (
            <div className="button-container">
                <Button className="e-normal" onClick={onCancelClick}>Cancel</Button>
                <Button className="e-normal" onClick={onSaveClick}>Save</Button>
            </div>
        );
    };

    const confirmationFooter = (): JSX.Element => {
        return (
            <div className="button-container">
                <Button className="e-normal" onClick={onDeleteClick}>Ok</Button>
                <Button className="e-normal" onClick={onDeleteCancelClick}>Cancel</Button>
            </div>
        );
    };

    return (
        <>
            <div className="doctor-details-container">
                <header>
                    <div className="detail-header-title">
                        <span className="back-icon icon-previous" onClick={onBackIconClick}></span>
                        <div className="module-title">
                            <div className='title'>DOCTOR DETAILS</div>
                            <div className='underline'></div>
                        </div>
                    </div>
                    <div className='doctor-detail'>
                        <Button className=" delete-details" size={Size.Small} color={Color.Error} onClick={onDoctorDelete}>Delete</Button>
                        <Button className=" edit-details" size={Size.Small} color={Color.Primary} onClick={onDoctorEdit}>Edit</Button>
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
                            <div className="add-container" onClick={onAddBreak}>
                                <Button icon={<PlusIcon />} size={Size.Small}></Button>
                                <span className="button-label">Add</span>
                            </div>
                        </header>
                        <div className="work-days-content">
                            {breakDays.map((day: Record<string, any>, index: number) => (
                                <div className='work-day-item' key={index}>
                                    <div className="day-name">{getWorkDayName(day.Day)}</div>
                                    <div className={"day-break-hours " + day.State}>{getBreakDetails(day)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="break-hours-container" style={{ display: 'none' }}>
                <Dialog
                    ref={breakHourObj}
                    open={isBreakOpen}
                    style={{ width: '445px' }}
                    className='break-hour-dialog'
                    modal={true}
                    header='Break Hours'
                    closeIcon={true}
                    onClose={() => setIsBreakOpen(false)}
                    footer={breakHoursFooter()}
                    target={dialogTarget ?? undefined}
                >
                    <div>
                        <div className="break-hour-operations">
                            * Click on day to add break, double click to take time off and third click to remove break
                        </div>
                        <div className="break-hour-header">
                            <div></div>
                            <div>Start Time</div>
                            <div>End Time</div>
                        </div>
                        {breakDays.map((day: Record<string, any>, index: number) => (
                            <div className='break-hour-days' key={index}>
                                <div className={"day-button " + day['State']}>
                                    <Button
                                        id={day['Day'] + "_button"}
                                        className=" e-round"
                                        onClick={onChangeStatus}
                                        data-state={day['State']}
                                        size={Size.Small}
                                    >
                                        {getDayName(day['Day'])}
                                    </Button>
                                </div>
                                <div className={"start-container " + day['State']}>
                                    <TimePicker
                                        className="e-field"
                                        id={day['Day'] + "_start"}
                                        disabled={!getStatus(day['State'])}
                                        value={day['BreakStartHour']}
                                        clearButton={false}
                                        onChange={(e: any) => onBreakStartChange(day['Day'], e.value)}
                                        variant={Variant.Outlined}
                                    />
                                </div>
                                <div className={"end-container " + day['State']}>
                                    <TimePicker
                                        className='e-field'
                                        id={day['Day'] + "_end"}
                                        disabled={!getStatus(day['State'])}
                                        value={day['BreakEndHour']}
                                        clearButton={false}
                                        onChange={(e: any) => onBreakEndChange(day['Day'], e.value)}
                                        variant={Variant.Outlined}
                                    />
                                </div>
                                <div className={"state-container " + day['State']}>
                                    <div>Time Off</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Dialog>
            </div>

            <AddEditDoctor ref={addEditDoctorObj} refreshDoctors={refreshDetails} />

            <div className="delete-confirmation-container" style={{ display: 'none' }}>
                <Dialog
                    ref={deleteConfirmationDialogObj}
                    open={isDeleteOpen}
                    style={{ width: '445px' }}
                    className='break-hour-dialog'
                    modal={true}
                    header='Doctor Details'
                    closeIcon={true}
                    onClose={() => setIsDeleteOpen(false)}
                    target={dialogTarget ?? undefined}
                    footer={confirmationFooter()}
                >
                    <form>
                        <div>Are you sure you want to delete this doctor?</div>
                    </form>
                </Dialog>
            </div>
        </>
    );
};