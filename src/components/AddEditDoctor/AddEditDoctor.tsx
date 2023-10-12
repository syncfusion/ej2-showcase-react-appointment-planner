import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle, MutableRefObject } from 'react';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { FormValidator, TextBoxComponent, MaskedTextBoxComponent, MaskedTextBox } from '@syncfusion/ej2-react-inputs';
import { EJ2Instance } from '@syncfusion/ej2-react-schedule';
import { DialogComponent, BeforeOpenEventArgs } from '@syncfusion/ej2-react-popups';
import { DropDownList, DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { specializationData as specializationList, experienceData as experienceList, dutyTimingsData as dutyTimingsList } from '../../datasource';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useActivityDispatch } from '../../context/ActivityContext';
import { renderFormValidator, destroyErrorElement } from '../../util';
import './AddEditDoctor.scss';

interface AddEditDoctorProps {
    refreshDoctors?: () => void;
    calendarDropDownObj?: MutableRefObject<DropDownListComponent>;
}

export const AddEditDoctor = forwardRef(({ refreshDoctors, calendarDropDownObj }: AddEditDoctorProps, ref) => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const activityDispatch = useActivityDispatch();
    const newDoctorObj = useRef<DialogComponent>(null);

    let doctorsData: Record<string, any>[] = dataService.doctorsData;
    let activeDoctorData: Record<string, any> = dataService.activeDoctorData;
    let dialogState: string;
    let animationSettings: Record<string, any> = { effect: 'None' };
    let title = 'New Doctor';
    let specializationData: Record<string, any>[] = specializationList;
    let fields: Record<string, any> = { text: 'Text', value: 'Id' };
    let experienceData: Record<string, any>[] = experienceList;
    let dutyTimingsData: Record<string, any>[] = dutyTimingsList;

    useImperativeHandle(ref, () => ({
        showDetails() {
            showDetails();
        },
        onAddDoctor() {
            onAddDoctor();
        }
    }));

    const onAddDoctor = (): void => {
        dialogState = 'new';
        title = 'New Doctor';
        newDoctorObj.current.show();
    }

    const onCancelClick = (): void => {
        resetFormFields();
        newDoctorObj.current.hide();
    }

    const onSaveClick = (): void => {
        const formElementContainer: HTMLElement = document.querySelector('.new-doctor-dialog #new-doctor-form');
        if (formElementContainer && formElementContainer.classList.contains('e-formvalidator') &&
            !((formElementContainer as EJ2Instance).ej2_instances[0] as FormValidator).validate()) {
            return;
        }
        let obj: Record<string, any> = dialogState === 'new' ? {} : activeDoctorData;
        const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
        for (const curElement of formElement) {
            const inputElement: HTMLInputElement = curElement.querySelector('input');
            let columnName: string = inputElement.name;
            const isCustomElement: boolean = curElement.classList.contains('e-ddl');
            if (!isNullOrUndefined(columnName) || isCustomElement) {
                if (columnName === '' && isCustomElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance: DropDownList = ((inputElement as Element) as EJ2Instance).ej2_instances[0] as DropDownList;
                    obj[columnName] = instance.value;
                    if (columnName === 'Specialization') {
                        obj['DepartmentId'] = (instance.getDataByValue(instance.value) as Record<string, any>)['DepartmentId'];
                    }
                } else if (columnName === 'Gender') {
                    obj[columnName] = inputElement.checked ? 'Male' : 'Female';
                } else {
                    obj[columnName] = inputElement.value;
                }
            }
        }
        if (dialogState === 'new') {
            obj['Id'] = doctorsData.length > 0 ? Math.max.apply(Math, doctorsData.map((data: Record<string, any>) => data['Id'])) + 1 : 1;
            obj['Text'] = 'default';
            obj['Availability'] = 'available';
            obj['NewDoctorClass'] = 'new-doctor';
            obj['Color'] = '#7575ff';
            const initialData: Record<string, any> = JSON.parse(JSON.stringify(dataService.doctorData));
            obj['AvailableDays'] = initialData['AvailableDays'];
            obj['WorkDays'] = initialData['WorkDays'];
            obj = updateWorkHours(obj);
            doctorsData.push(obj);
            dispatch({ type: 'SET_DOCTORS_DATA', data: doctorsData });
        } else {
            activeDoctorData = updateWorkHours(obj);
            dispatch({ type: 'SET_ACTIVE_DOCTOR', data: activeDoctorData });
        }
        const activityObj: Record<string, any> = {
            Name: dialogState === 'new' ? 'Added New Doctor' : 'Updated Doctor',
            Message: `Dr.${obj['Name']}, ${obj['Specialization'].charAt(0).toUpperCase() + obj['Specialization'].slice(1)}`,
            Time: '10 mins ago',
            Type: 'doctor',
            ActivityTime: new Date()
        };
        activityDispatch({ type: 'SET_ACTIVITY_DATA', data: activityObj });
        if (refreshDoctors) {
            refreshDoctors();
        }
        if (!isNullOrUndefined(calendarDropDownObj) && !isNullOrUndefined(calendarDropDownObj.current)) {
            calendarDropDownObj.current.dataSource = [];
            calendarDropDownObj.current.dataSource = doctorsData;
        }
        resetFormFields();
        newDoctorObj.current.hide();
    }

    const updateWorkHours = (data: Record<string, any>): Record<string, any> => {
        const dutyString: string = dutyTimingsData.filter((item: Record<string, any>) => item['Id'] === data['DutyTiming'])[0]['Text'];
        let startHour: string;
        let endHour: string;
        let startValue: number;
        let endValue: number;
        if (dutyString === '10:00 AM - 7:00 PM') {
            startValue = 10;
            endValue = 19;
            startHour = '10:00';
            endHour = '19:00';
        } else if (dutyString === '08:00 AM - 5:00 PM') {
            startValue = 8;
            endValue = 17;
            startHour = '08:00';
            endHour = '17:00';
        } else {
            startValue = 12;
            endValue = 21;
            startHour = '12:00';
            endHour = '21:00';
        }
        data['WorkDays'].forEach((item: Record<string, any>) => {
            item['WorkStartHour'] = new Date(new Date(item['WorkStartHour']).setHours(startValue));
            item['WorkEndHour'] = new Date(new Date(item['WorkEndHour']).setHours(endValue));
            item['BreakStartHour'] = new Date(item['BreakStartHour']);
            item['BreakEndHour'] = new Date(item['BreakEndHour']);
        });
        data['StartHour'] = startHour;
        data['EndHour'] = endHour;
        return data;
    }

    const resetFormFields = (): void => {
        const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
        destroyErrorElement(document.querySelector('#new-doctor-form'), formElement);
        for (const curElement of formElement) {
            const inputElement: HTMLInputElement = curElement.querySelector('input');
            let columnName: string = inputElement.name;
            const isCustomElement: boolean = curElement.classList.contains('e-ddl');
            if (!isNullOrUndefined(columnName) || isCustomElement) {
                if (columnName === '' && isCustomElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance: DropDownList = ((inputElement as Element) as EJ2Instance).ej2_instances[0] as DropDownList;
                    instance.value = (instance as any).dataSource[0];
                } else if (columnName === 'Gender') {
                    inputElement.checked = true;
                } else if (columnName === 'Mobile') {
                    (((inputElement as Element) as EJ2Instance).ej2_instances[0] as MaskedTextBox).value = '';
                } else {
                    inputElement.value = '';
                }
            }
        }
    }

    const showDetails = (): void => {
        dialogState = 'edit';
        title = 'Edit Doctor';
        newDoctorObj.current.show();
        activeDoctorData = dataService.activeDoctorData;
        const obj: Record<string, any> = activeDoctorData;
        const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
        for (const curElement of formElement) {
            const inputElement: HTMLInputElement = curElement.querySelector('input');
            let columnName: string = inputElement.name;
            const isCustomElement: boolean = curElement.classList.contains('e-ddl');
            if (!isNullOrUndefined(columnName) || isCustomElement) {
                if (columnName === '' && isCustomElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance: DropDownList = ((inputElement as Element) as EJ2Instance).ej2_instances[0] as DropDownList;
                    instance.value = obj[columnName] as string;
                    instance.dataBind();
                } else if (columnName === 'Gender') {
                    if (obj[columnName] === 'Male') {
                        inputElement.checked = true;
                    } else {
                        curElement.querySelectorAll('input')[1].checked = true;
                    }
                } else if (columnName === 'Mobile') {
                    (((inputElement as Element) as EJ2Instance).ej2_instances[0] as MaskedTextBox).value =
                        obj[columnName].replace(/[ -.*+?^${}()|[\]\\]/g, '');
                } else {
                    inputElement.value = obj[columnName] as string;
                }
            }
        }
    }

    const onBeforeOpen = (args: BeforeOpenEventArgs): void => {
        const formElement: HTMLFormElement = args.element.querySelector('#new-doctor-form');
        if (formElement && formElement['ej2_instances']) {
            return;
        }
        const customFn: (args: { [key: string]: HTMLElement }) => boolean = (e: { [key: string]: HTMLElement }) => {
            const argsLength = ((e['element'] as EJ2Instance).ej2_instances[0] as MaskedTextBoxComponent).value.length;
            return (argsLength !== 0) ? argsLength >= 10 : false;
        };
        const rules: Record<string, any> = {};
        rules['Name'] = { required: [true, 'Enter valid name'] };
        rules['Mobile'] = { required: [customFn, 'Enter valid mobile number'] };
        rules['Email'] = { required: [true, 'Enter valid email'], email: [true, 'Email address is invalid'] };
        rules['Education'] = { required: [true, 'Enter valid education'] };
        renderFormValidator(formElement, rules, newDoctorObj.current.element);
    }

    const footerTemplate = (props: Record<string, any>): JSX.Element => {
        return (
            <div className="button-container">
                <ButtonComponent cssClass="e-normal" onClick={onCancelClick.bind(this)}>Cancel</ButtonComponent>
                <ButtonComponent cssClass="e-normal" isPrimary={true} onClick={onSaveClick.bind(this)}>Save</ButtonComponent>
            </div>
        );
    }

    return (
        <div className="new-doctor-container" style={{ display: 'none' }}>
            <DialogComponent ref={newDoctorObj} width='390px' cssClass='new-doctor-dialog' isModal={true} visible={false}
                animationSettings={animationSettings} header={title} showCloseIcon={true} target='#content-area'
                beforeOpen={onBeforeOpen.bind(this)} footerTemplate={footerTemplate.bind(this)}>
                <form id='new-doctor-form'>
                    <div className="name-container">
                        <TextBoxComponent id='Name' name='Name' cssClass='doctor-name e-field' placeholder='Doctor Name'
                            floatLabelType='Always'></TextBoxComponent>
                    </div>
                    <div className="gender-container">
                        <div className="gender">
                            <div><label>Gender</label></div>
                            <div className='e-btn-group e-round-corner e-field'>
                                <input type="radio" id="patientCheckMale" name="Gender" value="Male" defaultChecked />
                                <label className="e-btn" htmlFor="patientCheckMale">Male</label>
                                <input type="radio" id="patientCheckFemale" name="Gender" value="Female" />
                                <label className="e-btn" htmlFor="patientCheckFemale">Female</label>
                            </div>
                        </div>
                        <div className="mobile">
                            <MaskedTextBoxComponent id='DoctorMobile' name='Mobile' cssClass='e-field' width='180px' placeholder='Mobile Number'
                                mask="(999) 999-9999" floatLabelType='Always'></MaskedTextBoxComponent>
                        </div>
                    </div>
                    <div className="email-container">
                        <TextBoxComponent id='Email' name='Email' cssClass='e-field' placeholder='Email' floatLabelType='Always'>
                        </TextBoxComponent>
                    </div>
                    <div className="education-container">
                        <div className="department">
                            <DropDownListComponent id='Specialization' width='160px' cssClass='doctor-department e-field' index={0}
                                placeholder='Department' floatLabelType='Always' dataSource={specializationData} fields={fields}>
                            </DropDownListComponent>
                        </div>
                        <div className="education">
                            <TextBoxComponent id='Education' name='Education' cssClass='e-field' width='180px' placeholder='Education'
                                floatLabelType='Always'></TextBoxComponent>
                        </div>
                    </div>
                    <div className="experience-container">
                        <div className="experience">
                            <DropDownListComponent id='Experience' name='Experience' cssClass='e-field' width='160px'
                                placeholder='Experience' index={0} floatLabelType='Always' dataSource={experienceData} fields={fields}>
                            </DropDownListComponent>
                        </div>
                        <div className="designation">
                            <TextBoxComponent id='Designation' name='Designation' cssClass='e-field' width='180px' placeholder='Designation'
                                floatLabelType='Always'></TextBoxComponent>
                        </div>
                    </div>
                    <div className="duty-container">
                        <DropDownListComponent id="DutyTiming" cssClass='e-field' width='100%' placeholder='Duty Timing' index={0}
                            floatLabelType='Always' dataSource={dutyTimingsData} fields={fields}></DropDownListComponent>
                    </div>
                </form>
            </DialogComponent>
        </div>
    )
})