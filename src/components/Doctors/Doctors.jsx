import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { Tooltip } from '@syncfusion/ej2-react-popups';
import { AddEditDoctor } from '../AddEditDoctor/AddEditDoctor';
import { useData, useDataDispatch } from '../../context/DataContext';
import { updateActiveItem, loadImage } from '../../util';
import './Doctors.scss';
export const Doctors = () => {
    const dataService = useData();
    const dispatch = useDataDispatch();
    const addEditDoctorObj = useRef(null);
    const specialistItemObj = useRef(null);
    const navigate = useNavigate();
    let doctorsData = dataService.doctorsData;
    const [filteredDoctors, setFilteredDoctors] = useState(dataService.doctorsData);
    let specializationData = dataService.specialistData;
    let fields = { text: 'Text', value: 'Id' };
    let selectedDepartmentId;
    let tooltipObj;
    useEffect(() => {
        updateActiveItem('doctors');
        tooltipObj = new Tooltip({
            height: '30px',
            width: '76px',
            position: 'RightTop',
            offsetX: -10,
            showTipPointer: false,
            target: '.availability',
            beforeOpen: (args) => {
                args.element.querySelector('.e-tip-content').textContent =
                    args.target.classList[1].charAt(0).toUpperCase() + args.target.classList[1].slice(1);
            }
        });
        if (specialistItemObj) {
            tooltipObj.appendTo(specialistItemObj.current);
        }
    }, []);
    const getColor = (args) => {
        return args['Color'];
    };
    const onSpecializationChange = (args) => {
        let filteredData;
        if (args && args['value']) {
            selectedDepartmentId = args ? args['itemData'].DepartmentId : selectedDepartmentId;
            filteredData = doctorsData.filter((item) => item.DepartmentId === selectedDepartmentId);
        }
        else {
            selectedDepartmentId = null;
            filteredData = doctorsData;
        }
        setFilteredDoctors(filteredData);
    };
    const onSpecialistClick = (args) => {
        if (tooltipObj) {
            tooltipObj.close();
        }
        const specialistId = args['currentTarget'].querySelector('.specialist-item').id.split('_')[1];
        const filteredData = doctorsData.filter((item) => item.Id === parseInt(specialistId, 10));
        dispatch({ type: 'SET_ACTIVE_DOCTOR', data: filteredData[0] });
        navigate('/doctor-details/' + specialistId);
    };
    const onAddDoctor = () => {
        addEditDoctorObj.current.onAddDoctor();
    };
    const updateDoctors = () => {
        doctorsData = dataService.doctorsData;
        if (selectedDepartmentId) {
            setFilteredDoctors(doctorsData.filter((item) => item.DepartmentId === selectedDepartmentId));
        }
    };
    const getEducation = (text) => {
        return text.toUpperCase();
    };
    const itemTemplate = (props) => {
        return (<div className="specialist-value">
        <span className={props.Id} style={{ background: getColor(props) }}></span>
        <span className="name">{props.Text}</span>
      </div>);
    };
    const valueTemplate = (props) => {
        return (<div className="specialist-value department-value">
        <span className={props.Id} style={{ background: getColor(props) }}></span>
        <span className="name">{props.Text}</span>
      </div>);
    };
    return (<>
      <div className="doctors-wrapper">
        <header>
          <div className="module-title">
            <div className='title'>DOCTORS LIST</div>
            <div className='underline'></div>
          </div>
          <div className='add-doctor' onClick={onAddDoctor.bind(this)}>
            <div className="e-icon-add e-icons"></div>
            <div className="add-doctor-label">Add New</div>
          </div>
        </header>
        <div className="specialization-detail-wrapper">
          <div className="specialization-types">
            <DropDownListComponent id='Specialization' cssClass='specialization-ddl' dataSource={specializationData} showClearButton={true} change={onSpecializationChange.bind(this)} fields={fields} placeholder='Select a Specialization' popupWidth='100%' popupHeight='230px' itemTemplate={itemTemplate.bind(this)} valueTemplate={valueTemplate.bind(this)}>
            </DropDownListComponent>
            <ButtonComponent cssClass="e-normal" onClick={onAddDoctor.bind(this)} isPrimary={true}>Add New Doctor</ButtonComponent>
          </div>
          <div ref={specialistItemObj} className='specialist-display'>
            <>
              {filteredDoctors && filteredDoctors.map((data, index) => {
            return (<div key={index} onClick={onSpecialistClick.bind(this)}>
                      <div className="e-cards specialist-item" id={"Specialist_" + data['Id']}>
                        <div className="e-card-content">
                          <div className="specialist-image">
                            <img className="profile" src={loadImage(data['Text'])} alt="doctor"/>
                            <span className={"availability " + data['Availability']}></span>
                            <span className={"upload icon-upload_photo " + data['NewDoctorClass']}></span>
                          </div>
                        </div>
                        <div className="specialist-detail">
                          <div className="name">Dr. {data['Name']}</div>
                          <div className="education">{getEducation(data['Education'])}</div>
                          <div className="specialist-experience">
                            <div className="specialization">
                              <span className="label-text">Designation</span>
                              <span className="specialization-text">{data['Designation']}</span>
                            </div>
                            <div className="experience">
                              <span className="label-text">Experience</span>
                              <span className="specialization-text">{data['Experience']}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>);
        })}
            </>
          </div>
        </div>
      </div>
      <AddEditDoctor ref={addEditDoctorObj} refreshDoctors={updateDoctors.bind(this)}/>
    </>);
};
