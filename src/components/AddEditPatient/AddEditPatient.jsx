import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { TextBoxComponent, MaskedTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useActivityDispatch } from '../../context/ActivityContext';
import { renderFormValidator, destroyErrorElement } from '../../util';
import './AddEditPatient.scss';
export const AddEditPatient = forwardRef(({ refreshEvent, calendarComboBoxObj }, ref) => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const activityDispatch = useActivityDispatch();
    const newPatientObj = useRef(null);
    const animationSettings = { effect: 'None' };
    let title = 'New Patient';
    const dobValue = new Date(1996, 0, 31);
    let dialogState;
    const bloodGroupData = dataService.bloodGroupData;
    const fields = { text: 'Text', value: 'Value' };
    let patientsData = dataService.patientsData;
    let activePatientData = dataService.activePatientData;
    useImperativeHandle(ref, () => ({
        showDetails() {
            showDetails();
        },
        onAddPatient() {
            onAddPatient();
        }
    }));
    const onAddPatient = () => {
        dialogState = 'new';
        title = 'New Patient';
        newPatientObj.current.show();
    };
    const onCancelClick = () => {
        resetFormFields();
        newPatientObj.current.hide();
    };
    const onSaveClick = () => {
        const formElementContainer = document.querySelector('.new-patient-dialog #new-patient-form');
        if (formElementContainer && formElementContainer.classList.contains('e-formvalidator') &&
            !formElementContainer.ej2_instances[0].validate()) {
            return;
        }
        const obj = dialogState === 'new' ? {} : activePatientData;
        const formElement = [].slice.call(document.querySelectorAll('.new-patient-dialog .e-field'));
        for (const curElement of formElement) {
            const inputElement = curElement.querySelector('input');
            let columnName = inputElement.name;
            const isDropElement = curElement.classList.contains('e-ddl');
            const isDatePickElement = curElement.classList.contains('e-date-wrapper');
            if (!isNullOrUndefined(columnName) || isDropElement || isDatePickElement) {
                if (columnName === '' && isDropElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance = inputElement.ej2_instances[0];
                    obj[columnName] = instance.value;
                }
                else if (columnName === 'DOB' && isDatePickElement) {
                    const instance = inputElement.ej2_instances[0];
                    obj[columnName] = instance.value;
                }
                else if (columnName === 'Gender') {
                    obj[columnName] = inputElement.checked ? 'Male' : 'Female';
                }
                else {
                    obj[columnName] = inputElement.value;
                }
            }
        }
        patientsData = dataService.patientsData;
        if (dialogState === 'new') {
            obj['Id'] = patientsData.length > 0 ? Math.max.apply(Math, patientsData.map((data) => data['Id'])) + 1 : 1;
            obj['NewPatientClass'] = 'new-patient';
            patientsData.push(obj);
        }
        else {
            activePatientData = obj;
            patientsData.forEach((patientData) => {
                if (patientData['Id'] === obj['Id']) {
                    Object.assign(patientData, obj);
                }
            });
            dispatch({ type: 'SET_ACTIVE_PATIENT', data: activePatientData });
        }
        const activityObj = {
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
    };
    const resetFormFields = () => {
        const formElement = [].slice.call(document.querySelectorAll('.new-patient-dialog .e-field'));
        destroyErrorElement(document.querySelector('#new-patient-form'), formElement);
        for (const curElement of formElement) {
            const inputElement = curElement.querySelector('input');
            let columnName = inputElement.name;
            const isDropElement = curElement.classList.contains('e-ddl');
            const isDatePickElement = curElement.classList.contains('e-date-wrapper');
            if (!isNullOrUndefined(columnName) || isDropElement || isDatePickElement) {
                if (columnName === '' && isDropElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance = inputElement.ej2_instances[0];
                    instance.value = instance.dataSource[0];
                }
                else if (columnName === 'DOB' && isDatePickElement) {
                    const instance = inputElement.ej2_instances[0];
                    instance.value = new Date();
                }
                else if (columnName === 'Gender') {
                    inputElement.checked = true;
                }
                else if (columnName === 'Mobile') {
                    inputElement.ej2_instances[0].value = '';
                }
                else {
                    inputElement.value = '';
                }
            }
        }
    };
    const showDetails = () => {
        dialogState = 'edit';
        title = 'Edit Patient';
        newPatientObj.current.show();
        activePatientData = dataService.activePatientData;
        const obj = activePatientData;
        const formElement = [].slice.call(document.querySelectorAll('.new-patient-dialog .e-field'));
        for (const curElement of formElement) {
            const inputElement = curElement.querySelector('input');
            let columnName = inputElement.name;
            const isCustomElement = curElement.classList.contains('e-ddl');
            const isDatePickElement = curElement.classList.contains('e-date-wrapper');
            if (!isNullOrUndefined(columnName) || isCustomElement || isDatePickElement) {
                if (columnName === '' && isCustomElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance = inputElement.ej2_instances[0];
                    instance.value = obj[columnName];
                    instance.dataBind();
                }
                else if (columnName === 'DOB' && isDatePickElement) {
                    const instance = inputElement.ej2_instances[0];
                    instance.value = obj[columnName] || null;
                }
                else if (columnName === 'Gender') {
                    if (obj[columnName] === 'Male') {
                        inputElement.checked = true;
                    }
                    else {
                        curElement.querySelectorAll('input')[1].checked = true;
                    }
                }
                else if (columnName === 'Mobile') {
                    inputElement.ej2_instances[0].value =
                        obj[columnName].replace(/[ -.*+?^${}()|[\]\\]/g, '');
                }
                else {
                    inputElement.value = obj[columnName];
                }
            }
        }
    };
    const onBeforeOpen = (args) => {
        const formElement = args.element.querySelector('#new-patient-form');
        if (formElement && formElement['ej2_instances']) {
            return;
        }
        const customFn = (e) => {
            const argsLength = e['element'].ej2_instances[0].value.length;
            return (argsLength !== 0) ? argsLength >= 10 : false;
        };
        const rules = {};
        rules['Name'] = { required: [true, 'Enter valid name'] };
        rules['DOB'] = { required: true, date: [true, 'Select valid DOB'] };
        rules['Mobile'] = { required: [customFn, 'Enter valid mobile number'] };
        rules['Email'] = { required: [true, 'Enter valid email'], email: [true, 'Email address is invalid'] };
        renderFormValidator(formElement, rules, newPatientObj.current.element);
    };
    const footerTemplate = (props) => {
        return (<div className="button-container">
                <ButtonComponent cssClass="e-normal" onClick={onCancelClick.bind(this)}>Cancel</ButtonComponent>
                <ButtonComponent cssClass="e-normal" isPrimary={true} onClick={onSaveClick.bind(this)}>Save</ButtonComponent>
            </div>);
    };
    return (<div className="new-patient-container" style={{ display: 'none' }}>
            <DialogComponent ref={newPatientObj} width='390px' cssClass='new-patient-dialog' isModal={true} visible={false} animationSettings={animationSettings} header={title} showCloseIcon={true} target='#content-area' beforeOpen={onBeforeOpen.bind(this)} footerTemplate={footerTemplate.bind(this)}>
                <form id='new-patient-form'>
                    <div className="field-container name-container">
                        <TextBoxComponent id='Name' name='Name' cssClass='patient-name e-field' placeholder='Patient Name' floatLabelType='Always'></TextBoxComponent>
                    </div>
                    <div className="field-container gender-container">
                        <div className="gender">
                            <div><label>Gender</label></div>
                            <div className='e-btn-group e-round-corner e-field'>
                                <input type="radio" id="doctorCheckMale" name="Gender" value="Male" defaultChecked/>
                                <label className="e-btn" htmlFor="doctorCheckMale">Male</label>
                                <input type="radio" id="doctorCheckFemale" name="Gender" value="Female"/>
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
                            <MaskedTextBoxComponent id='PatientMobile' name='Mobile' cssClass='e-field' width='180px' placeholder='Mobile Number' mask="(999) 999-9999" floatLabelType='Always'>
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
            </DialogComponent>
        </div>);
});
