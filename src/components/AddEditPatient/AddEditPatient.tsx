import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle, MutableRefObject } from 'react';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent, BeforeOpenEventArgs } from '@syncfusion/ej2-react-popups';
import { DropDownList, DropDownListComponent, ComboBox } from '@syncfusion/ej2-react-dropdowns';
import { EJ2Instance } from '@syncfusion/ej2-react-schedule';
import { DatePicker, DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { FormValidator, TextBoxComponent, MaskedTextBoxComponent, MaskedTextBox } from '@syncfusion/ej2-react-inputs';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useActivityDispatch } from '../../context/ActivityContext';
import { renderFormValidator, destroyErrorElement } from '../../util';
import './AddEditPatient.scss';

interface AddEditPatientProps {
    refreshEvent?: () => void;
    calendarComboBoxObj?: MutableRefObject<ComboBox>;
}

export const AddEditPatient = forwardRef(({ refreshEvent, calendarComboBoxObj }: AddEditPatientProps, ref) => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const activityDispatch = useActivityDispatch();
    const newPatientObj = useRef<DialogComponent>(null);
    const animationSettings: Record<string, any> = { effect: 'None' };
    let title = 'New Patient';
    const dobValue: Date = new Date(1996, 0, 31);
    let dialogState: string;
    const bloodGroupData: Record<string, any>[] = dataService.bloodGroupData;
    const fields: Record<string, any> = { text: 'Text', value: 'Value' };
    let patientsData: Record<string, any>[] = dataService.patientsData;
    let activePatientData: Record<string, any> = dataService.activePatientData;

    useImperativeHandle(ref, () => ({
        showDetails() {
            showDetails();
        },
        onAddPatient() {
            onAddPatient();
        }
    }));

    const onAddPatient = (): void => {
        dialogState = 'new';
        title = 'New Patient';
        newPatientObj.current.show();
    }

    const onCancelClick = (): void => {
        resetFormFields();
        newPatientObj.current.hide();
    }

    const onSaveClick = (): void => {
        const formElementContainer: HTMLElement = document.querySelector('.new-patient-dialog #new-patient-form');
        if (formElementContainer && formElementContainer.classList.contains('e-formvalidator') &&
            !((formElementContainer as EJ2Instance).ej2_instances[0] as FormValidator).validate()) {
            return;
        }
        const obj: Record<string, any> = dialogState === 'new' ? {} : activePatientData;
        const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-patient-dialog .e-field'));
        for (const curElement of formElement) {
            const inputElement: HTMLInputElement = curElement.querySelector('input');
            let columnName: string = inputElement.name;
            const isDropElement: boolean = curElement.classList.contains('e-ddl');
            const isDatePickElement: boolean = curElement.classList.contains('e-date-wrapper');
            if (!isNullOrUndefined(columnName) || isDropElement || isDatePickElement) {
                if (columnName === '' && isDropElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance: DropDownList = ((inputElement as Element) as EJ2Instance).ej2_instances[0] as DropDownList;
                    obj[columnName] = instance.value;
                } else if (columnName === 'DOB' && isDatePickElement) {
                    const instance: DatePicker = ((inputElement as Element) as EJ2Instance).ej2_instances[0] as DatePicker;
                    obj[columnName] = instance.value;
                } else if (columnName === 'Gender') {
                    obj[columnName] = inputElement.checked ? 'Male' : 'Female';
                } else {
                    obj[columnName] = inputElement.value;
                }
            }
        }
        patientsData = dataService.patientsData;
        if (dialogState === 'new') {
            obj['Id'] = patientsData.length > 0 ? Math.max.apply(Math, patientsData.map((data: Record<string, any>) => data['Id'])) + 1 : 1;
            obj['NewPatientClass'] = 'new-patient';
            patientsData.push(obj);
        } else {
            activePatientData = obj;
            patientsData.forEach((patientData: Record<string, any>) => {
                if (patientData['Id'] === obj['Id']) {
                    Object.assign(patientData, obj);
                }
            });
            dispatch({ type: 'SET_ACTIVE_PATIENT', data: activePatientData });
        }
        const activityObj: Record<string, any> = {
            Name: dialogState === 'new' ? 'Added New Patient' : 'Updated Patient',
            Message: `${obj['Name']} for ${obj['Symptoms']}`,
            Time: '10 mins ago',
            Type: 'patient',
            ActivityTime: new Date()
        };
        activityDispatch({ type: 'SET_ACTIVITY_DATA', data: activityObj });
        dispatch({ type: 'SET_PATIENTS_DATA', data: patientsData });
        if (refreshEvent) {
            refreshEvent();
        }
        if (!isNullOrUndefined(calendarComboBoxObj) && !isNullOrUndefined(calendarComboBoxObj.current)) {
            calendarComboBoxObj.current.dataSource = [];
            calendarComboBoxObj.current.dataSource = patientsData;
        }
        resetFormFields();
        newPatientObj.current.hide();
    }

    const resetFormFields = (): void => {
        const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-patient-dialog .e-field'));
        destroyErrorElement(document.querySelector('#new-patient-form'), formElement);
        for (const curElement of formElement) {
            const inputElement: Element = curElement.querySelector('input');
            let columnName: string = (inputElement as HTMLInputElement).name;
            const isDropElement: boolean = curElement.classList.contains('e-ddl');
            const isDatePickElement: boolean = curElement.classList.contains('e-date-wrapper');
            if (!isNullOrUndefined(columnName) || isDropElement || isDatePickElement) {
                if (columnName === '' && isDropElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance: DropDownList = (inputElement as EJ2Instance).ej2_instances[0] as DropDownList;
                    instance.value = (instance as any).dataSource[0];
                } else if (columnName === 'DOB' && isDatePickElement) {
                    const instance: DatePicker = (inputElement as EJ2Instance).ej2_instances[0] as DatePicker;
                    instance.value = new Date();
                } else if (columnName === 'Gender') {
                    (inputElement as HTMLInputElement).checked = true;
                } else if (columnName === 'Mobile') {
                    ((inputElement as EJ2Instance).ej2_instances[0] as MaskedTextBox).value = '';
                } else {
                    (inputElement as HTMLInputElement).value = '';
                }
            }
        }
    }

    const showDetails = (): void => {
        dialogState = 'edit';
        title = 'Edit Patient';
        newPatientObj.current.show();
        activePatientData = dataService.activePatientData;
        const obj: Record<string, any> = activePatientData;
        const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-patient-dialog .e-field'));
        for (const curElement of formElement) {
            const inputElement: Element = curElement.querySelector('input');
            let columnName: string = (inputElement as HTMLInputElement).name;
            const isCustomElement: boolean = curElement.classList.contains('e-ddl');
            const isDatePickElement: boolean = curElement.classList.contains('e-date-wrapper');
            if (!isNullOrUndefined(columnName) || isCustomElement || isDatePickElement) {
                if (columnName === '' && isCustomElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance: DropDownList = (inputElement as EJ2Instance).ej2_instances[0] as DropDownList;
                    instance.value = obj[columnName] as string;
                    instance.dataBind();
                } else if (columnName === 'DOB' && isDatePickElement) {
                    const instance: DatePicker = (inputElement as EJ2Instance).ej2_instances[0] as DatePicker;
                    instance.value = obj[columnName] as Date || null;
                } else if (columnName === 'Gender') {
                    if (obj[columnName] === 'Male') {
                        (inputElement as HTMLInputElement).checked = true;
                    } else {
                        curElement.querySelectorAll('input')[1].checked = true;
                    }
                } else if (columnName === 'Mobile') {
                    ((inputElement as EJ2Instance).ej2_instances[0] as MaskedTextBox).value =
                        obj[columnName].replace(/[ -.*+?^${}()|[\]\\]/g, '');
                } else {
                    (inputElement as HTMLInputElement).value = obj[columnName] as string;
                }
            }
        }
    }

    const onBeforeOpen = (args: BeforeOpenEventArgs): void => {
        const formElement: HTMLFormElement = args.element.querySelector('#new-patient-form');
        if (formElement && formElement['ej2_instances']) {
            return;
        }
        const customFn: (args: { [key: string]: HTMLElement }) => boolean = (e: { [key: string]: HTMLElement }) => {
            const argsLength = ((e['element'] as EJ2Instance).ej2_instances[0] as MaskedTextBoxComponent).value.length;
            return (argsLength !== 0) ? argsLength >= 10 : false;
        };
        const rules: Record<string, any> = {};
        rules['Name'] = { required: [true, 'Enter valid name'] };
        rules['DOB'] = { required: true, date: [true, 'Select valid DOB'] };
        rules['Mobile'] = { required: [customFn, 'Enter valid mobile number'] };
        rules['Email'] = { required: [true, 'Enter valid email'], email: [true, 'Email address is invalid'] };
        renderFormValidator(formElement, rules, newPatientObj.current.element);
    }

    const footerTemplate = (props: Record<string, any>): JSX.Element => {
        return (
            <div className="button-container">
                <ButtonComponent cssClass="e-normal" onClick={onCancelClick.bind(this)}>Cancel</ButtonComponent>
                <ButtonComponent cssClass="e-normal" isPrimary={true} onClick={onSaveClick.bind(this)}>Save</ButtonComponent>
            </div >
        );
    }

    return (
        <div className="new-patient-container" style={{ display: 'none' }}>
            <DialogComponent ref={newPatientObj} width='390px' cssClass='new-patient-dialog' isModal={true} visible={false}
                animationSettings={animationSettings} header={title} showCloseIcon={true} target='#content-area'
                beforeOpen={onBeforeOpen.bind(this)} footerTemplate={footerTemplate.bind(this)}>
                <form id='new-patient-form'>
                    <div className="field-container name-container">
                        <TextBoxComponent id='Name' name='Name' cssClass='patient-name e-field' placeholder='Patient Name' floatLabelType='Always'></TextBoxComponent>
                    </div>
                    <div className="field-container gender-container">
                        <div className="gender">
                            <div><label>Gender</label></div>
                            <div className='e-btn-group e-round-corner e-field'>
                                <input type="radio" id="doctorCheckMale" name="Gender" value="Male" defaultChecked />
                                <label className="e-btn" htmlFor="doctorCheckMale">Male</label>
                                <input type="radio" id="doctorCheckFemale" name="Gender" value="Female" />
                                <label className="e-btn" htmlFor="doctorCheckFemale">Female</label>
                            </div>
                        </div>
                        <div className="dob">
                            <DatePickerComponent id='DOB' cssClass='e-field' placeholder='DOB' value={dobValue} floatLabelType='Always' showClearButton={false}></DatePickerComponent>
                        </div>
                    </div>
                    <div className="field-container contact-container">
                        <div className="blood-group">
                            <DropDownListComponent id='BloodGroup' width='125px' cssClass='e-field' placeholder='Blood Group' index={0} floatLabelType='Always' dataSource={bloodGroupData} fields={fields}>
                            </DropDownListComponent>
                        </div>
                        <div className="mobile">
                            <MaskedTextBoxComponent id='PatientMobile' name='Mobile' cssClass='e-field' width='180px' placeholder='Mobile Number'
                                mask="(999) 999-9999" floatLabelType='Always'>
                            </MaskedTextBoxComponent>
                        </div>
                    </div>
                    <div className="field-container email-container">
                        <TextBoxComponent cssClass='e-field' id='Email' name='Email' placeholder='Email' floatLabelType='Always'>
                        </TextBoxComponent>
                    </div>
                    <div className="field-container symptom-container">
                        <TextBoxComponent cssClass='e-field' id='Symptoms' name='Symptoms' placeholder='Symptoms' floatLabelType='Always'>
                        </TextBoxComponent>
                    </div>
                </form>
            </DialogComponent >
        </div>
    )
})