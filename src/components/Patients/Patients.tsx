import * as React from 'react';
import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { createElement, Internationalization, closest } from '@syncfusion/ej2-base';
import { DataManager, Query, ReturnOption } from '@syncfusion/ej2-data';
import { Dialog, DialogComponent } from '@syncfusion/ej2-react-popups';
import { Button, ButtonComponent } from '@syncfusion/ej2-react-buttons';
import {
  Edit, Page, GridComponent, DialogEditEventArgs, ColumnsDirective, ColumnDirective, Inject, BeginEditArgs
} from '@syncfusion/ej2-react-grids';
import { AddEditPatient } from '../AddEditPatient/AddEditPatient';
import { useData, useDataDispatch } from '../../context/DataContext';
import { updateActiveItem } from '../../util';
import './Patients.scss';

const Patients = () => {
  const dataService = useData();
  const dispatch = useDataDispatch();
  const gridObj = useRef<GridComponent>(null);
  const addEditPatientObj = useRef(null);
  const deleteConfirmationDialogObj = useRef<DialogComponent>(null);
  let patientsData: Record<string, any>[] = dataService.patientsData;
  const [filteredPatients, setFilteredPatients] = useState(dataService.patientsData);
  let activePatientData: Record<string, any> = dataService.activePatientData;
  let activePatientHistory: Record<string, any>[] = dataService.activePatientHistory;
  const hospitalData: Record<string, any>[] = dataService.hospitalData;
  const doctorsData: Record<string, any>[] = dataService.doctorsData;
  const intl: Internationalization = new Internationalization();
  let gridDialog: Dialog;
  const animationSettings: Record<string, any> = { effect: 'None' };
  const isPatientClick = useRef(false);

  useEffect(() => {
    updateActiveItem('patients');
  }, []);

  const onPatientClick = (args: MouseEvent): void => {
    const rowCell: Element = closest(args.currentTarget as Element, '.e-rowcell');
    const rowIndex: number = parseInt(rowCell.getAttribute('index'), 10);
    const rowData: Record<string, any> = gridObj.current.getRowInfo(rowCell).rowData;
    activePatientData = rowData;
    activePatientHistory = hospitalData.filter((item: Record<string, any>) =>
      item['PatientId'] === activePatientData['Id']);
    dispatch({ type: 'SET_ACTIVE_PATIENT', data: activePatientData });
    dispatch({ type: 'SET_ACTIVE_PATIENT_HISTORY', data: activePatientHistory });
    setTimeout(() => {
      gridObj.current.selectRow(rowIndex);
      gridObj.current.startEdit();
    });
    isPatientClick.current = true;
  }

  const onBeginEdit = (args: BeginEditArgs) => {
    if (!isPatientClick.current) {
      args.cancel = true;
      (args.row.querySelector('.patient-name') as HTMLElement).click();
    } else {
      isPatientClick.current = false;
    }
  }

  const onDataEdit = (args: DialogEditEventArgs): void => {
    if (args.requestType === 'beginEdit') {
      gridDialog = args.dialog as Dialog;
      gridDialog.header = 'Patient Details';
      const editButtonElement: HTMLElement = createElement('button', {
        className: 'edit-patient',
        id: 'edit',
        innerHTML: 'Edit',
        attrs: { type: 'button', title: 'Edit' }
      });
      editButtonElement.onclick = onEditPatient.bind(this);
      const deleteButtonElement: HTMLElement = createElement('button', {
        className: 'delete-patient',
        id: 'delete',
        innerHTML: 'Delete',
        attrs: { type: 'button', title: 'Delete', content: 'DELETE' }
      });
      deleteButtonElement.onclick = onDeletePatient.bind(this);
      gridDialog.element.querySelector('.e-footer-content').appendChild(deleteButtonElement);
      gridDialog.element.querySelector('.e-footer-content').appendChild(editButtonElement);
      const editButton: Button = new Button({ isPrimary: true });
      editButton.appendTo('#edit');
      const deleteButton: Button = new Button();
      deleteButton.appendTo('#delete');
    }
  }

  const onDeletePatient = (): void => {
    deleteConfirmationDialogObj.current.show();
  }

  const onDeleteClick = (): void => {
    patientsData = patientsData.filter((item: Record<string, any>) => item['Id'] !== activePatientData['Id']);
    setFilteredPatients(patientsData);
    dispatch({ type: 'SET_PATIENTS_DATA', data: patientsData });
    gridObj.current.closeEdit();
    deleteConfirmationDialogObj.current.hide();
    gridObj.current.dataSource = patientsData;
  }

  const onDeleteCancelClick = (): void => {
    deleteConfirmationDialogObj.current.hide();
  }

  const onAddPatient = (): void => {
    addEditPatientObj.current.onAddPatient();
  }

  const onEditPatient = (): void => {
    gridObj.current.closeEdit();
    addEditPatientObj.current.showDetails();
  }

  const getPatientDOB = (dob: Date): string => {
    return intl.formatDate(dob, { skeleton: 'yMd' });
  }

  const getPatientHistoryContent = (item: Record<string, any>): string => {
    return (intl.formatDate(item['StartTime'], { skeleton: 'MMMd' }) + " - " +
      intl.formatDate(item['StartTime'], { skeleton: 'hm' }) + " - " +
      intl.formatDate(item['EndTime'], { skeleton: 'hm' }) +
      " Appointment with Dr." + getDoctorName(item['DoctorId']));
  }

  const getDoctorName = (id: number): string => {
    const activeDoctor: Record<string, any>[] = doctorsData.filter((item: Record<string, any>) => item['Id'] === id);
    return activeDoctor.length > 0 ? activeDoctor[0]['Name'] : 'Unknown';
  }

  const patientSearch = (args: KeyboardEvent): void => {
    const searchString: string = (args.target as HTMLInputElement).value;
    if (searchString !== '') {
      new DataManager(patientsData).executeQuery(new Query().
        search(searchString, ['Id', 'Name', 'Gender', 'BloodGroup', 'Mobile'], null, true, true)).then((e: ReturnOption) => {
          if ((e.result as any).length > 0) {
            setFilteredPatients(e.result);
          } else {
            setFilteredPatients([]);
          }
        });
    } else {
      patientSearchCleared(args as any);
    }
  }

  const patientSearchCleared = (args: MouseEvent): void => {
    setFilteredPatients(patientsData);
    if ((args.target as HTMLElement).previousElementSibling) {
      ((args.target as HTMLElement).previousElementSibling as HTMLInputElement).value = '';
    }
  }

  const gridRefresh = (): void => {
    patientsData = dataService.patientsData;
    setFilteredPatients(patientsData);
    gridObj.current.refresh();
  }

  const columnTemplate = useCallback((props: Record<string, any>): JSX.Element => {
    return (
      <span className="patient-name" onClick={onPatientClick.bind(this)}>{props.Name}</span>
    );
  }, []);

  const dialogTemplate = (): JSX.Element => {
    return (
      <div className='grid-edit-dialog'>
        <div className='field-row'>
          <label> Patient Id </label><span id='Id'>{activePatientData['Id']}</span>
        </div>
        <div className='field-row'>
          <label> Patient Name </label><span id='Name'>{activePatientData['Name']}</span>
        </div>
        <div className='field-row'>
          <label> Gender </label><span id='Gender'>{activePatientData['Gender']}</span>
        </div>
        <div className='field-row'>
          <label> DOB </label><span id='DOB'>{getPatientDOB(activePatientData['DOB'])}</span>
        </div>
        <div className='field-row'>
          <label> Blood Group </label><span id='BloodGroup'>{activePatientData['BloodGroup']}</span>
        </div>
        <div className='field-row'>
          <label> Mobile Number </label><span id='Mobile'>{activePatientData['Mobile']}</span>
        </div>
        <div className='field-row'>
          <label> Email </label><span id='Email'>{activePatientData['Email']}</span>
        </div>
        <div className='field-row'>
          <label> Symptoms </label><span id='Symptoms'>{activePatientData['Symptoms']}</span>
        </div>
        <div className='field-row history-row'>
          <label>Appointment History</label>
          <div id='history-wrapper'>
            {
              activePatientHistory && activePatientHistory.length > 0 ?
                activePatientHistory.map((item: Record<string, any>, index: number) => {
                  return (
                    <div key={index} className='history-content'>{getPatientHistoryContent(item)}</div>
                  )
                }) : <div className='empty-container'>No Events!</div>
            }
          </div>
        </div>
      </div>
    );
  }

  const footerTemplate = (): JSX.Element => {
    return (
      <div className="button-container">
        <ButtonComponent cssClass="e-normal" isPrimary={true} onClick={onDeleteClick.bind(this)}>Ok</ButtonComponent>
        <ButtonComponent cssClass="e-normal" onClick={onDeleteCancelClick.bind(this)}>Cancel</ButtonComponent>
      </div>
    );
  }

  return (
    <>
      <div id='patient-wrapper' className="planner-patient-wrapper">
        <header>
          <div className="module-title">
            <div className='title'>PATIENT LIST</div>
            <div className='underline'></div>
          </div>
          <div className='add-patient' onClick={onAddPatient.bind(this)}>
            <div className="e-icon-add e-icons"></div>
            <div className="add-patient-label">Add New</div>
          </div>
        </header>
        <div className="patients-detail-wrapper">
          <div className="patient-operations">
            <div id='searchTemplate' className='search-wrapper planner-patient-search'>
              <div className="e-input-group" role="search">
                <input id="schedule_searchbar" className="e-input" name="input" type="search" placeholder="Search Patient" onKeyUp={patientSearch.bind(this)} />
                <span className="e-clear-icon" aria-label="close" role="button" onClick={patientSearchCleared.bind(this)}></span>
                <span id="schedule_searchbutton" className="e-input-group-icon search-icon e-icons" tabIndex={-1} title="Search" aria-label="search"></span>
              </div>
            </div>
            <ButtonComponent cssClass="e-normal add-details" isPrimary={true} onClick={onAddPatient.bind(this)}>Add New Patient</ButtonComponent>
          </div>
          <div className="patient-display">
            <GridComponent ref={gridObj} dataSource={filteredPatients} editSettings={{
              allowEditing: true, allowAdding: true,
              allowDeleting: true, mode: 'Dialog', template: dialogTemplate
            }} actionComplete={onDataEdit} beginEdit={onBeginEdit}>
              <ColumnsDirective>
                <ColumnDirective field='Id' width='50' headerText='ID' textAlign='Left' isPrimaryKey={true}></ColumnDirective>
                <ColumnDirective field='Name' width='100' textAlign='Left' template={columnTemplate}>
                </ColumnDirective>
                <ColumnDirective field='Gender' width='80' textAlign='Left'></ColumnDirective>
                <ColumnDirective field='BloodGroup' headerText='Blood Group' width='100' textAlign='Left'></ColumnDirective>
                <ColumnDirective field='Symptoms' width='150' textAlign='Left' clipMode='EllipsisWithTooltip'></ColumnDirective>
                <ColumnDirective field='Mobile' headerText='Mobile Number' width='100' textAlign='Left'></ColumnDirective>
                <ColumnDirective field='Email' headerText='Email' width='120' textAlign='Left'></ColumnDirective>
              </ColumnsDirective>
              <Inject services={[Page, Edit]} />
            </GridComponent>
          </div>
        </div>
      </div>
      <AddEditPatient ref={addEditPatientObj} refreshEvent={gridRefresh.bind(this)} />
      <div className="delete-confirmation-container" style={{ display: 'none' }}>
        <DialogComponent ref={deleteConfirmationDialogObj} width='445px' cssClass='break-hour-dialog' isModal={true}
          visible={false} animationSettings={animationSettings} header='Patient Details' showCloseIcon={true}
          target='#content-area' footerTemplate={footerTemplate.bind(this)}>
          <form>
            <div>Are you sure you want to delete this patient?</div>
          </form>
        </DialogComponent>
      </div>
    </>
  )
}

export default memo(Patients);