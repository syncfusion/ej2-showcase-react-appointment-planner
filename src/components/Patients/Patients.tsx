import * as React from 'react';
import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { Internationalization } from '@syncfusion/ej2-base';
import { DataManager, Query, ReturnOption } from '@syncfusion/react-data';
import { Dialog, IDialog } from '@syncfusion/react-popups';
import { Button, Color, Variant } from '@syncfusion/react-buttons';
import {
  Grid,
  Columns,
  Column,
  GridRef,
  ColumnTemplateProps,
  TextAlign,
  ClipMode
} from '@syncfusion/react-grid';
import { AddEditPatient } from '../AddEditPatient/AddEditPatient';
import { useData, useDataDispatch } from '../../context/DataContext';
import { updateActiveItem } from '../../util';
import './Patients.scss';

interface PatientData {
  Id: number;
  Name: string;
  Gender: string;
  BloodGroup: string;
  DOB: Date;
  Mobile: string;
  Email: string;
  Symptoms: string;
}

interface HospitalData {
  PatientId: number;
  DoctorId: number;
  StartTime: Date;
  EndTime: Date;
}

const Patients = () => {
  const dataService = useData();
  const dispatch = useDataDispatch();
  const gridObj = useRef<GridRef>(null);
  const addEditPatientObj = useRef<any>(null);
  const deleteConfirmationDialogObj = useRef<IDialog>(null);
  const patientDetailsDialogObj = useRef<IDialog>(null);

  let patientsData: PatientData[] = dataService.patientsData;
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>(dataService.patientsData);
  let activePatientData: PatientData = dataService.activePatientData;
  let activePatientHistory: HospitalData[] = dataService.activePatientHistory;
  const hospitalData: HospitalData[] = dataService.hospitalData;
  const doctorsData: Record<string, any>[] = dataService.doctorsData;
  const intl: Internationalization = new Internationalization();
  const isPatientClick = useRef(false);
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    updateActiveItem('patients');
  }, []);

  const onPatientClick = (event: React.MouseEvent<HTMLSpanElement>, rowData: PatientData): void => {
    event.preventDefault();
    try {
      if (rowData) {
        activePatientData = rowData;
      }

      activePatientHistory = hospitalData.filter(
        (item: HospitalData) => item['PatientId'] === activePatientData['Id']
      );
      dispatch({ type: 'SET_ACTIVE_PATIENT', data: activePatientData });
      dispatch({ type: 'SET_ACTIVE_PATIENT_HISTORY', data: activePatientHistory });

      setIsPatientDetailsOpen(true);
    } catch (error) {
      console.error('Error getting row data:', error);
    }
    isPatientClick.current = true;
  };

  const onDeletePatient = (): void => {
    setIsDeleteOpen(true);
  };

  const onDeleteClick = (): void => {
    patientsData = patientsData.filter((item: PatientData) => item['Id'] !== activePatientData['Id']);
    setFilteredPatients(patientsData);
    dispatch({ type: 'SET_PATIENTS_DATA', data: patientsData });

    setIsDeleteOpen(false);
    setIsPatientDetailsOpen(false);

    if (gridObj.current) {
      (gridObj.current as any).dataSource = patientsData;
    }
  };

  const onDeleteCancelClick = (): void => {
    setIsDeleteOpen(false);
  };

  const onAddPatient = (): void => {
    addEditPatientObj.current?.onAddPatient();
  };

  const onEditPatient = (): void => {
    setIsPatientDetailsOpen(false);
    addEditPatientObj.current?.showDetails();
  };

  const getPatientDOB = (dob: Date | string | undefined): string => {
    if (!dob) return 'N/A';
    const dateValue = dob instanceof Date ? dob : new Date(dob);
    return intl.formatDate(dateValue, { skeleton: 'yMd' });
  };

  const getPatientHistoryContent = (item: HospitalData): string => {
    return (
      intl.formatDate(item['StartTime'], { skeleton: 'MMMd' }) +
      ' - ' +
      intl.formatDate(item['StartTime'], { skeleton: 'hm' }) +
      ' - ' +
      intl.formatDate(item['EndTime'], { skeleton: 'hm' }) +
      ' Appointment with Dr.' +
      getDoctorName(item['DoctorId'])
    );
  };

  const getDoctorName = (id: number): string => {
    const activeDoctor: Record<string, any>[] = doctorsData.filter(
      (item: Record<string, any>) => item['Id'] === id
    );
    return activeDoctor.length > 0 ? activeDoctor[0]['Name'] : 'Unknown';
  };

  const patientSearch = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    const searchString: string = (event.target as HTMLInputElement).value;
    if (searchString !== '') {
      new DataManager(patientsData)
        .executeQuery(
          new Query().search(searchString, ['Id', 'Name', 'Gender', 'BloodGroup', 'Mobile'], null, true, true)
        )
        .then((e: ReturnOption) => {
          if ((e.result as PatientData[]).length > 0) {
            setFilteredPatients(e.result as PatientData[]);
          } else {
            setFilteredPatients([]);
          }
        });
    } else {
      setFilteredPatients(patientsData);
    }
  };

  const patientSearchCleared = (event: React.MouseEvent<HTMLSpanElement>): void => {
    setFilteredPatients(patientsData);
    if ((event.target as HTMLElement).previousElementSibling) {
      ((event.target as HTMLElement).previousElementSibling as HTMLInputElement).value = '';
    }
  };

  const gridRefresh = (): void => {
    patientsData = dataService.patientsData;
    setFilteredPatients(patientsData);
    gridObj.current?.refresh();
  };

  const columnTemplate = useCallback(
    (props?: ColumnTemplateProps): JSX.Element => {
      const data = props?.data as PatientData;
      return (
        <a
          className="patient-name"
          onClick={(e) => onPatientClick(e, data)}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          {data?.Name}
        </a>
      );
    },
    []
  );

  const renderPatientDetailsContent = (): JSX.Element => {
    return (
      <div className="grid-edit-dialog">
        <div className="field-row">
          <label> Patient Id </label>
          <span id="Id">{activePatientData['Id']}</span>
        </div>
        <div className="field-row">
          <label> Patient Name </label>
          <span id="Name">{activePatientData['Name']}</span>
        </div>
        <div className="field-row">
          <label> Gender </label>
          <span id="Gender">{activePatientData['Gender']}</span>
        </div>
        <div className="field-row">
          <label> DOB </label>
          <span id="DOB">{getPatientDOB(activePatientData['DOB'])}</span>
        </div>
        <div className="field-row">
          <label> Blood Group </label>
          <span id="BloodGroup">{activePatientData['BloodGroup']}</span>
        </div>
        <div className="field-row">
          <label> Mobile Number </label>
          <span id="Mobile">{activePatientData['Mobile']}</span>
        </div>
        <div className="field-row">
          <label> Email </label>
          <span id="Email">{activePatientData['Email']}</span>
        </div>
        <div className="field-row">
          <label> Symptoms </label>
          <span id="Symptoms">{activePatientData['Symptoms']}</span>
        </div>
        <div className="field-row history-row">
          <label>Appointment History</label>
          <div id="history-wrapper">
            {activePatientHistory && activePatientHistory.length > 0
              ? activePatientHistory.map((item: HospitalData, index: number) => (
                  <div key={index} className="history-content">
                    {getPatientHistoryContent(item)}
                  </div>
                ))
              : <div className="empty-container">No Events!</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderPatientDetailsFooter = (): JSX.Element => {
    return (
      <div className="button-container">
        <Button className="e-normal" variant={Variant.Outlined} color={Color.Secondary} onClick={onDeletePatient}>
          Delete
        </Button>
        <Button className="e-normal" onClick={onEditPatient}>
          Edit
        </Button>
      </div>
    );
  };

  const renderDeleteConfirmationFooter = (): JSX.Element => {
    return (
      <div className="button-container">
        <Button className="e-normal" onClick={onDeleteClick}>
          Ok
        </Button>
        <Button className="e-normal" variant={Variant.Outlined} color={Color.Secondary} onClick={onDeleteCancelClick}>
          Cancel
        </Button>
      </div>
    );
  };

  return (
    <>
      <div id="patient-wrapper" className="planner-patient-wrapper">
        <header>
          <div className="module-title">
            <div className="title">PATIENT LIST</div>
            <div className="underline"></div>
          </div>
          <div className="add-patient" onClick={onAddPatient}>
            <div className="e-icon-add e-icons"></div>
            <div className="add-patient-label">Add New</div>
          </div>
        </header>
        <div className="patients-detail-wrapper">
          <div className="patient-operations">
            <div id="searchTemplate" className="search-wrapper planner-patient-search">
              <div className="e-input-group" role="search">
                <input
                  id="schedule_searchbar"
                  className="e-input"
                  name="input"
                  type="search"
                  placeholder="Search Patient"
                  onKeyUp={(e) => patientSearch(e)}
                />
                <span
                  className="e-clear-icon"
                  aria-label="close"
                  role="button"
                  onClick={(e) => patientSearchCleared(e as any)}
                ></span>
                <span
                  id="schedule_searchbutton"
                  className="e-input-group-icon search-icon e-icons"
                  tabIndex={-1}
                  title="Search"
                  aria-label="search"
                ></span>
              </div>
            </div>
            <Button className="e-normal add-details" onClick={onAddPatient}>
              Add New Patient
            </Button>
          </div>
          <div className="patient-display">
            <Grid ref={gridObj} dataSource={filteredPatients}>
              <Columns>
                <Column
                  field="Id"
                  width="50"
                  headerText="ID"
                  textAlign={TextAlign.Left}
                  isPrimaryKey={true}
                />
                <Column
                  field="Name"
                  width="100"
                  textAlign={TextAlign.Left}
                  template={columnTemplate}
                />
                <Column field="Gender" width="80" textAlign={TextAlign.Left} />
                <Column
                  field="BloodGroup"
                  headerText="Blood Group"
                  width="100"
                  textAlign={TextAlign.Left}
                />
                <Column
                  field="Symptoms"
                  width="150"
                  textAlign={TextAlign.Left}
                  clipMode={ClipMode.EllipsisWithTooltip}
                />
                <Column
                  field="Mobile"
                  headerText="Mobile Number"
                  width="100"
                  textAlign={TextAlign.Left}
                />
                <Column field="Email" headerText="Email" width="120" textAlign={TextAlign.Left} />
              </Columns>
            </Grid>
          </div>
        </div>
      </div>

      <AddEditPatient ref={addEditPatientObj} refreshEvent={gridRefresh.bind(this)} />

      <Dialog
        ref={patientDetailsDialogObj}
        style={{ width: '400px' }}
        className="patient-details-dialog"
        modal={true}
        open={isPatientDetailsOpen}
        onClose={() => setIsPatientDetailsOpen(false)}
        header="Patient Details"
        closeIcon={true}
        target={document.getElementById('content-area') ?? undefined}
        footer={renderPatientDetailsFooter()}
      >
        {renderPatientDetailsContent()}
      </Dialog>

      <Dialog
        ref={deleteConfirmationDialogObj}
        style={{ width: '445px' }}
        className="break-hour-dialog"
        modal={true}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        header="Delete Patient"
        closeIcon={true}
        target={document.getElementById('content-area') ?? undefined}
        footer={renderDeleteConfirmationFooter()}
      >
        <form>
          <div>Are you sure you want to delete this patient?</div>
        </form>
      </Dialog>
    </>
  );
};

export default memo(Patients);