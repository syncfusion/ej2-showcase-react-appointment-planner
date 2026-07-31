import * as React from 'react';
import { useRef, forwardRef, useImperativeHandle, MutableRefObject } from 'react';
import { Color, isNullOrUndefined, Variant } from '@syncfusion/react-base';
import { Button } from '@syncfusion/react-buttons';
import { Dialog } from '@syncfusion/react-popups';
import { DropDownList } from '@syncfusion/react-dropdowns';
import { EJ2Instance } from '@syncfusion/ej2-react-schedule';
import { DatePicker, DatePickerChangeEvent } from '@syncfusion/react-calendars';
import { FormValidator, MaskedTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { TextBox } from '@syncfusion/react-inputs';
import { useData, useDataDispatch } from '../../context/DataContext';
import { useActivityDispatch } from '../../context/ActivityContext';
import { renderFormValidator, destroyErrorElement } from '../../util';
import './AddEditPatient.scss';

interface AddEditPatientProps {
    refreshEvent?: () => void;
    calendarComboBoxObj?: MutableRefObject<any>;
}

type FormErrors = {
    Name?: string;
    Mobile?: string;
    Email?: string;
    DOB?: string;
    Symptoms?: string;
};

export const AddEditPatient = forwardRef(({ refreshEvent, calendarComboBoxObj }: AddEditPatientProps, ref) => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const activityDispatch = useActivityDispatch();
    const newPatientObj = useRef<any>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [dialogState, setDialogState] = React.useState<'new' | 'edit'>('new');
    const [title, setTitle] = React.useState('New Patient');
    const bloodGroupData: Record<string, any>[] = dataService.bloodGroupData;
    const fields: Record<string, any> = { text: 'Text', value: 'Value' };
    let patientsData: Record<string, any>[] = dataService.patientsData;
    let activePatientData: Record<string, any> = dataService.activePatientData;
    const dialogTarget = document.getElementById('content-area') as HTMLElement | null;
    const [dobValue, setDobValue] = React.useState<Date>(new Date());
    const [bloodGroupValue, setBloodGroupValue] = React.useState<string>('');

    // React-native validation state
    const [name, setName] = React.useState('');
    const [mobile, setMobile] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [symptoms, setSymptoms] = React.useState('');
    const [formErrors, setFormErrors] = React.useState<FormErrors>({});

    useImperativeHandle(ref, () => ({
        showDetails() {
            showDetails();
        },
        onAddPatient() {
            onAddPatient();
        }
    }));

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!name.trim()) {
            errors.Name = 'Enter valid name';
        }

        // Mobile: must be 10 digits
        const digitsOnly = mobile.replace(/\D/g, '');
        if (digitsOnly.length === 0) {
            errors.Mobile = 'Enter valid mobile number';
        } else if (digitsOnly.length < 10) {
            errors.Mobile = 'Mobile number must be 10 digits';
        }

        // Email: must match mail format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            errors.Email = 'Enter valid email';
        } else if (!emailPattern.test(email.trim())) {
            errors.Email = 'Email address is invalid';
        }

        if (!dobValue || isNaN(dobValue.getTime())) {
            errors.DOB = 'Select valid DOB';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    React.useEffect(() => {
        if (isOpen && dialogState === 'edit') {
            setTimeout(() => {
                activePatientData = dataService.activePatientData;
                const obj: Record<string, any> = activePatientData;

                // Pre-fill React state from active patient
                if (obj) {
                    setName(obj['Name'] || '');
                    setEmail(obj['Email'] || '');
                    setSymptoms(obj['Symptoms'] || '');
                    if (obj['Mobile']) {
                        setMobile(String(obj['Mobile']).replace(/[ -.*+?^${}()|[\]\\]/g, ''));
                    }
                    if (obj['DOB']) {
                        setDobValue(obj['DOB'] instanceof Date ? obj['DOB'] : new Date(obj['DOB']));
                    }
                    if (obj['BloodGroup']) {
                        setBloodGroupValue(obj['BloodGroup']);
                    }
                }

                // Keep the imperative field-filling for non-React fields (legacy paths)
                const formElement: HTMLElement[] = [].slice.call(
                    document.querySelectorAll('.new-patient-dialog .e-field')
                );

                for (const curElement of formElement) {
                    const isCustomElement: boolean = curElement.classList.contains('e-ddl');

                    if (isCustomElement) {
                        const instance: any = (curElement as EJ2Instance).ej2_instances?.[0];
                        if (instance) {
                            const columnName: string = instance.name || instance.element?.name;
                            if (columnName && obj[columnName] !== undefined && obj[columnName] !== null) {
                                instance.value = obj[columnName];
                                instance.dataBind();
                            }
                        }
                    }
                }

                setTimeout(() => {
                    const bgInstance = (document.getElementById('BloodGroup') as any)?.ej2_instances?.[0];
                    if (bgInstance && obj['BloodGroup']) {
                        bgInstance.value = obj['BloodGroup'];
                        bgInstance.dataBind();
                    }
                }, 100);
            }, 200);
        } else if (isOpen && dialogState === 'new') {
            resetFormFields();
        }
    }, [isOpen, dialogState]);

    const onAddPatient = (): void => {
        setDialogState('new');
        setTitle('New Patient');
        setIsOpen(true);
    };

    const onCancelClick = (): void => {
        setIsOpen(false);
    };

    const onSaveClick = (): void => {
        // Run React-native validation
        if (!validateForm()) {
            return;
        }

        const obj: Record<string, any> = dialogState === 'new' ? {} : { ...activePatientData };
        obj['Name'] = name.trim();
        obj['Email'] = email.trim();
        obj['Symptoms'] = symptoms.trim();
        obj['Mobile'] = mobile.replace(/\D/g, '');
        obj['DOB'] = dobValue;
        obj['BloodGroup'] = bloodGroupValue;
        obj['Gender'] = (document.querySelector('input[name="Gender"]:checked') as HTMLInputElement)?.value || 'Male';

        // Reset React state
        setName('');
        setEmail('');
        setSymptoms('');
        setMobile('');
        setDobValue(new Date());
        setFormErrors({});

        // Reset EJ2 controls
        const dobElement: any = document.getElementById('DOB');
        const dobResetInstance = dobElement?.ej2_instances?.[0];
        if (dobResetInstance) {
            dobResetInstance.value = new Date();
            dobResetInstance.dataBind();
        }

        const bgElement: any = document.getElementById('BloodGroup');
        const bgResetInstance = bgElement?.ej2_instances?.[0];
        if (bgResetInstance) {
            bgResetInstance.value = bgResetInstance.dataSource?.[0]?.Value || '';
            bgResetInstance.dataBind();
        }
        setBloodGroupValue(bloodGroupData?.[0]?.Value || '');

        patientsData = dataService.patientsData;

        if (dialogState === 'new') {
            obj['Id'] = patientsData.length > 0
                ? Math.max.apply(Math, patientsData.map((data: Record<string, any>) => data['Id'])) + 1
                : 1;
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

        setIsOpen(false);
    };

    const resetFormFields = (): void => {
        const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-patient-dialog .e-field'));
        destroyErrorElement(document.querySelector('#new-patient-form'), formElement);

        for (const curElement of formElement) {
            const inputElement: Element = curElement.querySelector('input');
            if (!inputElement) {
                continue;
            }
            const columnName: string = (inputElement as HTMLInputElement).name;
            if (columnName === 'Gender') {
                (inputElement as HTMLInputElement).checked = true;
            } else if (columnName === 'Mobile') {
                const maskedInstance: any = (inputElement as any).ej2_instances?.[0];
                if (maskedInstance) {
                    maskedInstance.value = '';
                }
            } else if (columnName) {
                (inputElement as HTMLInputElement).value = '';
            }
        }

        setName('');
        setEmail('');
        setSymptoms('');
        setMobile('');
        setDobValue(new Date());
        setBloodGroupValue(bloodGroupData?.[0]?.Value || '');
        setFormErrors({});

        setTimeout(() => {
            const bgInstance = (document.getElementById('BloodGroup') as any)?.ej2_instances?.[0];
            if (bgInstance) {
                bgInstance.value = bloodGroupData?.[0]?.Value || '';
                bgInstance.dataBind();
            }
        }, 100);
    };

    const showDetails = (): void => {
        activePatientData = dataService.activePatientData;
        setDialogState('edit');
        setTitle('Edit Patient');
        setIsOpen(true);
    };

    const footerTemplate = (): JSX.Element => {
        return (
            <div className="button-container">
                <Button className="e-normal" onClick={onCancelClick} variant={Variant.Outlined} color={Color.Secondary}>
                    Cancel
                </Button>
                <Button className="e-normal" onClick={onSaveClick}>
                    Save
                </Button>
            </div>
        );
    };

    return (
        <div className="new-patient-container" style={{ display: 'none' }}>
            <Dialog
                ref={newPatientObj}
                open={isOpen}
                style={{ width: '390px' }}
                className='new-patient-dialog'
                modal={true}
                header={title}
                closeIcon={true}
                target={dialogTarget ?? undefined}
                footer={footerTemplate()}
                onClose={() => setIsOpen(false)}
            >
                <form id='new-patient-form' noValidate>
                    <div className="field-container name-container">
                        <TextBox
                            id='Name'
                            name='Name'
                            className='patient-name e-field'
                            placeholder='Patient Name'
                            labelMode='Always'
                            variant={Variant.Outlined}
                            value={name}
                            color={formErrors.Name ? Color.Error : undefined}
                            helperText={formErrors.Name || ''}
                            onChange={(e: any) => {
                                setName(e?.value ?? '');
                                if (formErrors.Name) setFormErrors({ ...formErrors, Name: undefined });
                            }}
                        />
                    </div>
                    <div className="field-container gender-container">
                        <div className="gender">
                            <div className='genderLabel'><label>Gender</label></div>
                            <div className='e-btn-group e-round-corner e-field'>
                                <input type="radio" id="doctorCheckMale" name="Gender" value="Male" defaultChecked />
                                <label className="e-btn" htmlFor="doctorCheckMale">Male</label>
                                <input type="radio" id="doctorCheckFemale" name="Gender" value="Female" />
                                <label className="e-btn" htmlFor="doctorCheckFemale">Female</label>
                            </div>
                        </div>
                        <div className="dob e-date-wrapper">
                            <DatePicker
                                id="DOB"
                                className="e-field"
                                value={dobValue}
                                onChange={(args: DatePickerChangeEvent) => {
                                    setDobValue(args.value as Date);
                                    if (formErrors.DOB) setFormErrors({ ...formErrors, DOB: undefined });
                                }}
                                placeholder="DOB"
                                labelMode="Always"
                                clearButton={false}
                                popupSettings={{ zIndex: 1000 }}
                                variant={Variant.Outlined}
                            />
                        </div>
                    </div>
                    <div className="field-container contact-container">
                        <div className="blood-group">
                            <DropDownList
                                id="BloodGroup"
                                name="BloodGroup"
                                value={bloodGroupValue}
                                width="125px"
                                className="e-field e-ddl"
                                placeholder="Blood Group"
                                tabIndex={0}
                                labelMode="Always"
                                dataSource={bloodGroupData}
                                fields={fields}
                                onChange={(args: any) => setBloodGroupValue(args.value as string)}
                                popupSettings={{ zIndex: 1000 }}
                                variant={Variant.Outlined}
                            />
                        </div>
                        <div className="mobile">
                            <MaskedTextBoxComponent
                                id='PatientMobile'
                                name='Mobile'
                                cssClass={`e-field ${formErrors.Mobile ? 'e-error' : ''}`}
                                width='180px'
                                placeholder='Mobile Number'
                                mask="(999) 999-9999"
                                floatLabelType='Always'
                                value={mobile}
                                change={(e: any) => {
                                    const v = (e?.value || '').replace(/\D/g, '');
                                    setMobile(v);
                                    if (formErrors.Mobile) setFormErrors({ ...formErrors, Mobile: undefined });
                                }}
                            >
                            </MaskedTextBoxComponent>
                            {formErrors.Mobile && (
                                <div className="field-error-msg">{formErrors.Mobile}</div>
                            )}
                        </div>
                    </div>
                    <div className="field-container email-container">
                        <TextBox
                            className='e-field'
                            id='Email'
                            name='Email'
                            placeholder='Email'
                            labelMode='Always'
                            variant={Variant.Outlined}
                            value={email}
                            color={formErrors.Email ? Color.Error : undefined}
                            helperText={formErrors.Email || ''}
                            onChange={(e: any) => {
                                setEmail(e?.value ?? '');
                                if (formErrors.Email) setFormErrors({ ...formErrors, Email: undefined });
                            }}
                        />
                    </div>
                    <div className="field-container symptom-container">
                        <TextBox
                            className='e-field'
                            id='Symptoms'
                            name='Symptoms'
                            placeholder='Symptoms'
                            labelMode='Always'
                            variant={Variant.Outlined}
                            value={symptoms}
                            onChange={(e: any) => setSymptoms(e?.value ?? '')}
                        />
                    </div>
                </form>
            </Dialog>
        </div>
    );
});