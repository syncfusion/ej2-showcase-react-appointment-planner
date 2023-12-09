import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { Tooltip } from '@syncfusion/ej2-react-popups';
import { useData } from '../../context/DataContext';
import { loadImage } from '../../util';
import './DoctorAvailability.scss';
export const DoctorAvailability = () => {
    const dataService = useData();
    const availabilityObj = useRef(null);
    let dataSource = dataService.doctorsData;
    let specializationData = dataService.specialistData;
    let tooltipObj;
    useEffect(() => {
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
        if (availabilityObj) {
            tooltipObj.appendTo(availabilityObj.current.element);
        }
    }, []);
    const getSpecializationText = (text) => {
        return specializationData.filter((item) => item['Id'] === text)[0]['Text'].toUpperCase();
    };
    const listTemplate = (props) => {
        return (<div className="availabilty-container">
                <div className='image-container'>
                    <span className='doctor-image'>
                        <img src={loadImage(props.Text)}/>
                        <span className={'availability ' + props.Availability}></span>
                    </span>
                </div>
                <div className="detail-container">
                    <span className="doctor-name">Dr.{props.Name}</span>
                    <span className="doctor-speciality">{getSpecializationText(props.Specialization)}</span>
                </div>
            </div>);
    };
    return (<>
            <div className='availability-title'>
                <span className='header-text'>Doctor's Availability</span>
                <span className='all-text'><Link to='/doctors'>View All</Link></span>
            </div>
            <ListViewComponent ref={availabilityObj} id='listview_template' height='88%' width='100%' cssClass='e-list-template' dataSource={dataSource} showHeader={false} template={listTemplate.bind(this)}>
            </ListViewComponent>
        </>);
};
