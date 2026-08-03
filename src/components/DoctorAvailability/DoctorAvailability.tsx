import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ListView } from '@syncfusion/react-lists';
import { Tooltip, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { useData } from '../../context/DataContext';
import { loadImage } from '../../util';
import './DoctorAvailability.scss';

export const DoctorAvailability = () => {
    const dataService = useData();
    const availabilityObj = useRef<any>(null);
    let dataSource: Record<string, any>[] = dataService.doctorsData;
    let specializationData: Record<string, any>[] = dataService.specialistData;
    let tooltipObj: Tooltip;

    useEffect(() => {
        tooltipObj = new Tooltip({
            height: '30px',
            width: '76px',
            position: 'RightTop',
            offsetX: -10,
            showTipPointer: false,
            target: '.availability',
            beforeOpen: (args: TooltipEventArgs) => {
                args.element.querySelector('.e-tip-content').textContent =
                    args.target.classList[1].charAt(0).toUpperCase() + args.target.classList[1].slice(1);
            }
        });
        if (availabilityObj) {
            tooltipObj.appendTo(availabilityObj.current.element);
        }
    }, []);

    const getSpecializationText = (text: string): string => {
        return specializationData.filter((item: Record<string, any>) => item['Id'] === text)[0]['Text'].toUpperCase();
    }

    const listTemplate = (props: Record<string, any>): JSX.Element => {
        return (
            <div className="availabilty-container">
                <div className='image-container'>
                    <span className='doctor-image'>
                        <img className="doctor-avatar" src={loadImage(props.Text)} />
                        <span className={'availability ' + props.Availability}></span>
                    </span>
                </div>
                <div className="detail-container">
                    <span className="doctor-name">Dr.{props.Name}</span>
                    <span className="doctor-speciality">{getSpecializationText(props.Specialization)}</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='availability-title'>
                <span className='header-text'>Doctor's Availability</span>
                <span className='all-text'><Link to='/doctors'>View All</Link></span>
            </div>
            <ListView
                ref={availabilityObj}
                id='listview_template'
                style={{height:'88%', width:'100%'}}
                dataSource={dataSource}
                itemTemplate={listTemplate.bind(this)}
                fields={{ id: 'Id', text: 'Name' }}
            >
            </ListView>
        </>
    )
}