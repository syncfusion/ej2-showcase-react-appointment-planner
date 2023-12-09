import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { TextBoxComponent, MaskedTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { specializationData as specializationList, experienceData as experienceList, dutyTimingsData as dutyTimingsList } from '../../datasource';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useActivityDispatch } from '../../context/ActivityContext';
import { renderFormValidator, destroyErrorElement } from '../../util';
import './AddEditDoctor.scss';
export const AddEditDoctor = forwardRef(({ refreshDoctors, calendarDropDownObj }, ref) => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const activityDispatch = useActivityDispatch();
    const newDoctorObj = useRef(null);
    let doctorsData = dataService.doctorsData;
    let activeDoctorData = dataService.activeDoctorData;
    let dialogState;
    let animationSettings = { effect: 'None' };
    let title = 'New Doctor';
    let specializationData = specializationList;
    let fields = { text: 'Text', value: 'Id' };
    let experienceData = experienceList;
    let dutyTimingsData = dutyTimingsList;
    useImperativeHandle(ref, () => ({
        showDetails() {
            showDetails();
        },
        onAddDoctor() {
            onAddDoctor();
        }
    }));
    const onAddDoctor = () => {
        dialogState = 'new';
        title = 'New Doctor';
        newDoctorObj.current.show();
    };
    const onCancelClick = () => {
        resetFormFields();
        newDoctorObj.current.hide();
    };
    const onSaveClick = () => {
        const formElementContainer = document.querySelector('.new-doctor-dialog #new-doctor-form');
        if (formElementContainer && formElementContainer.classList.contains('e-formvalidator') &&
            !formElementContainer.ej2_instances[0].validate()) {
            return;
        }
        let obj = dialogState === 'new' ? {} : activeDoctorData;
        const formElement = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
        for (const curElement of formElement) {
            const inputElement = curElement.querySelector('input');
            let columnName = inputElement.name;
            const isCustomElement = curElement.classList.contains('e-ddl');
            if (!isNullOrUndefined(columnName) || isCustomElement) {
                if (columnName === '' && isCustomElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance = inputElement.ej2_instances[0];
                    obj[columnName] = instance.value;
                    if (columnName === 'Specialization') {
                        obj['DepartmentId'] = instance.getDataByValue(instance.value)['DepartmentId'];
                    }
                }
                else if (columnName === 'Gender') {
                    obj[columnName] = inputElement.checked ? 'Male' : 'Female';
                }
                else {
                    obj[columnName] = inputElement.value;
                }
            }
        }
        if (dialogState === 'new') {
            obj['Id'] = doctorsData.length > 0 ? Math.max.apply(Math, doctorsData.map((data) => data['Id'])) + 1 : 1;
            obj['Text'] = 'default';
            obj['Availability'] = 'available';
            obj['NewDoctorClass'] = 'new-doctor';
            obj['Color'] = '#7575ff';
            const initialData = JSON.parse(JSON.stringify(dataService.doctorData));
            obj['AvailableDays'] = initialData['AvailableDays'];
            obj['WorkDays'] = initialData['WorkDays'];
            obj = updateWorkHours(obj);
            doctorsData.push(obj);
            dispatch({ type: 'SET_DOCTORS_DATA', data: doctorsData });
        }
        else {
            activeDoctorData = updateWorkHours(obj);
            dispatch({ type: 'SET_ACTIVE_DOCTOR', data: activeDoctorData });
        }
        const activityObj = {
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
    };
    const updateWorkHours = (data) => {
        const dutyString = dutyTimingsData.filter((item) => item['Id'] === data['DutyTiming'])[0]['Text'];
        let startHour;
        let endHour;
        let startValue;
        let endValue;
        if (dutyString === '10:00 AM - 7:00 PM') {
            startValue = 10;
            endValue = 19;
            startHour = '10:00';
            endHour = '19:00';
        }
        else if (dutyString === '08:00 AM - 5:00 PM') {
            startValue = 8;
            endValue = 17;
            startHour = '08:00';
            endHour = '17:00';
        }
        else {
            startValue = 12;
            endValue = 21;
            startHour = '12:00';
            endHour = '21:00';
        }
        data['WorkDays'].forEach((item) => {
            item['WorkStartHour'] = new Date(new Date(item['WorkStartHour']).setHours(startValue));
            item['WorkEndHour'] = new Date(new Date(item['WorkEndHour']).setHours(endValue));
            item['BreakStartHour'] = new Date(item['BreakStartHour']);
            item['BreakEndHour'] = new Date(item['BreakEndHour']);
        });
        data['StartHour'] = startHour;
        data['EndHour'] = endHour;
        return data;
    };
    const resetFormFields = () => {
        const formElement = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
        destroyErrorElement(document.querySelector('#new-doctor-form'), formElement);
        for (const curElement of formElement) {
            const inputElement = curElement.querySelector('input');
            let columnName = inputElement.name;
            const isCustomElement = curElement.classList.contains('e-ddl');
            if (!isNullOrUndefined(columnName) || isCustomElement) {
                if (columnName === '' && isCustomElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance = inputElement.ej2_instances[0];
                    instance.value = instance.dataSource[0];
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
        title = 'Edit Doctor';
        newDoctorObj.current.show();
        activeDoctorData = dataService.activeDoctorData;
        const obj = activeDoctorData;
        const formElement = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
        for (const curElement of formElement) {
            const inputElement = curElement.querySelector('input');
            let columnName = inputElement.name;
            const isCustomElement = curElement.classList.contains('e-ddl');
            if (!isNullOrUndefined(columnName) || isCustomElement) {
                if (columnName === '' && isCustomElement) {
                    columnName = curElement.querySelector('select').name;
                    const instance = inputElement.ej2_instances[0];
                    instance.value = obj[columnName];
                    instance.dataBind();
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
        const formElement = args.element.querySelector('#new-doctor-form');
        if (formElement && formElement['ej2_instances']) {
            return;
        }
        const customFn = (e) => {
            const argsLength = e['element'].ej2_instances[0].value.length;
            return (argsLength !== 0) ? argsLength >= 10 : false;
        };
        const rules = {};
        rules['Name'] = { required: [true, 'Enter valid name'] };
        rules['Mobile'] = { required: [customFn, 'Enter valid mobile number'] };
        rules['Email'] = { required: [true, 'Enter valid email'], email: [true, 'Email address is invalid'] };
        rules['Education'] = { required: [true, 'Enter valid education'] };
        renderFormValidator(formElement, rules, newDoctorObj.current.element);
    };
    const footerTemplate = (props) => {
        return (<div className="button-container">
                <ButtonComponent cssClass="e-normal" onClick={onCancelClick.bind(this)}>Cancel</ButtonComponent>
                <ButtonComponent cssClass="e-normal" isPrimary={true} onClick={onSaveClick.bind(this)}>Save</ButtonComponent>
            </div>);
    };
    return (<div className="new-doctor-container" style={{ display: 'none' }}>
            <DialogComponent ref={newDoctorObj} width='390px' cssClass='new-doctor-dialog' isModal={true} visible={false} animationSettings={animationSettings} header={title} showCloseIcon={true} target='#content-area' beforeOpen={onBeforeOpen.bind(this)} footerTemplate={footerTemplate.bind(this)}>
                <form id='new-doctor-form'>
                    <div className="name-container">
                        <TextBoxComponent id='Name' name='Name' cssClass='doctor-name e-field' placeholder='Doctor Name' floatLabelType='Always'></TextBoxComponent>
                    </div>
                    <div className="gender-container">
                        <div className="gender">
                            <div><label>Gender</label></div>
                            <div className='e-btn-group e-round-corner e-field'>
                                <input type="radio" id="patientCheckMale" name="Gender" value="Male" defaultChecked/>
                                <label className="e-btn" htmlFor="patientCheckMale">Male</label>
                                <input type="radio" id="patientCheckFemale" name="Gender" value="Female"/>
                                <label className="e-btn" htmlFor="patientCheckFemale">Female</label>
                            </div>
                        </div>
                        <div className="mobile">
                            <MaskedTextBoxComponent id='DoctorMobile' name='Mobile' cssClass='e-field' width='180px' placeholder='Mobile Number' mask="(999) 999-9999" floatLabelType='Always'></MaskedTextBoxComponent>
                        </div>
                    </div>
                    <div className="email-container">
                        <TextBoxComponent id='Email' name='Email' cssClass='e-field' placeholder='Email' floatLabelType='Always'>
                        </TextBoxComponent>
                    </div>
                    <div className="education-container">
                        <div className="department">
                            <DropDownListComponent id='Specialization' width='160px' cssClass='doctor-department e-field' index={0} placeholder='Department' floatLabelType='Always' dataSource={specializationData} fields={fields}>
                            </DropDownListComponent>
                        </div>
                        <div className="education">
                            <TextBoxComponent id='Education' name='Education' cssClass='e-field' width='180px' placeholder='Education' floatLabelType='Always'></TextBoxComponent>
                        </div>
                    </div>
                    <div className="experience-container">
                        <div className="experience">
                            <DropDownListComponent id='Experience' name='Experience' cssClass='e-field' width='160px' placeholder='Experience' index={0} floatLabelType='Always' dataSource={experienceData} fields={fields}>
                            </DropDownListComponent>
                        </div>
                        <div className="designation">
                            <TextBoxComponent id='Designation' name='Designation' cssClass='e-field' width='180px' placeholder='Designation' floatLabelType='Always'></TextBoxComponent>
                        </div>
                    </div>
                    <div className="duty-container">
                        <DropDownListComponent id="DutyTiming" cssClass='e-field' width='100%' placeholder='Duty Timing' index={0} floatLabelType='Always' dataSource={dutyTimingsData} fields={fields}></DropDownListComponent>
                    </div>
                </form>
            </DialogComponent>
        </div>);
});
