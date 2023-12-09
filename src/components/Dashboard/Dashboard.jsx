import * as React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Predicate, Query, DataManager } from '@syncfusion/ej2-data';
import { ColumnDirective, ColumnsDirective, GridComponent } from '@syncfusion/ej2-react-grids';
import { addDays, getWeekFirstDate } from '@syncfusion/ej2-react-schedule';
import { useData } from '../../context/DataContext';
import { updateActiveItem } from '../../util';
import { RecentActivity } from '../RecentActivity/RecentActivity';
import { DoctorAvailability } from '../DoctorAvailability/DoctorAvailability';
import { Chart } from './Chart/Chart';
import todayIcon from '../../assets/Icons/Today_Widget.svg';
import thisWeekIcon from '../../assets/Icons/ThisWeek_Widget.svg';
import './Dashboard.scss';
export const Dashboard = () => {
    const dataService = useData();
    const hospitalData = dataService.hospitalData;
    const doctorsData = dataService.doctorsData;
    const patientsData = dataService.patientsData;
    const firstDayOfWeek = getWeekFirstDate(dataService.selectedDate, dataService.calendarSettings.firstDayOfWeek);
    const getFilteredData = (startDate, endDate) => {
        const predicate = new Predicate('StartTime', 'greaterthanorequal', startDate)
            .and(new Predicate('EndTime', 'greaterthanorequal', startDate))
            .and(new Predicate('StartTime', 'lessthan', endDate))
            .or(new Predicate('StartTime', 'lessthanorequal', startDate)
            .and(new Predicate('EndTime', 'greaterthan', startDate)));
        const filter = new DataManager({ json: hospitalData }).executeLocal(new Query().where(predicate));
        return filter;
    };
    const currentDayEvents = getFilteredData(dataService.selectedDate, addDays(new Date(dataService.selectedDate.getTime()), 1));
    const currentViewEvents = getFilteredData(firstDayOfWeek, addDays(new Date(firstDayOfWeek.getTime()), 6));
    const getDate = (date) => {
        const d = new Date(date);
        const tempHour = (d.getHours() === 0) ? 12 : (d.getHours() < 10) ? d.getHours() : (d.getHours() > 12) ?
            Math.abs(12 - d.getHours()) : d.getHours();
        const hour = (tempHour < 10) ? '0' + tempHour : tempHour.toString();
        const minutes = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes().toString();
        const l = (d.getHours() >= 12) ? 'PM' : 'AM';
        return hour + ':' + minutes + ' ' + l;
    };
    const getGridData = () => {
        const gridDataList = [];
        for (const eventData of currentDayEvents) {
            if (eventData) {
                const filteredPatients = patientsData.filter(item => item['Id'] === eventData['PatientId']);
                const filteredDoctors = doctorsData.filter(item => item['Id'] === eventData['DoctorId']);
                if (filteredPatients.length > 0 && filteredDoctors.length > 0) {
                    const newData = {
                        Time: getDate(eventData['StartTime']),
                        Name: filteredPatients[0]['Name'],
                        DoctorName: filteredDoctors[0]['Name'],
                        Symptoms: eventData['Symptoms'],
                        DoctorId: filteredDoctors[0]['Id']
                    };
                    gridDataList.push(newData);
                }
            }
        }
        return gridDataList;
    };
    let gridData = getGridData();
    useEffect(() => {
        updateActiveItem('dashboard');
    }, []);
    const doctorColumnTemplate = (props) => {
        return (<Link to={"/doctor-details/" + props.DoctorId}>{props.DoctorName}</Link>);
    };
    return (<div id="dashboard" className="planner-dashboard">
            <div className="row content view-detail-display" style={{ margin: '0px' }}>
                <div className="col-lg-8 col-md-8 col-sm-8">
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-6 text-display">
                            <div className="e-card card day-events-container">
                                <div className="e-card-content">
                                    <span className="card-text label-text">Total Appointments - Today</span>
                                    <div className="count-container">
                                        <span className="icon-day"><img src={todayIcon} alt="Today"/></span>
                                        <span className="day-event-count">{currentDayEvents.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6 text-display">
                            <div className="e-card card week-events-container">
                                <div className="e-card-content">
                                    <span className="card-text label-text">Total Appointments - This Week</span>
                                    <div className="count-container">
                                        <span className="icon-week"><img src={thisWeekIcon} alt="ThisWeek"/></span>
                                        <span className="week-event-count">{currentViewEvents.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 dashboard-control">
                            <div className="e-card grid-container">
                                <div className="e-card-header">
                                    <div className="e-card-header-caption">
                                        <div className="e-card-header-title">
                                            <span className='label-text'> Today's Appointments</span>
                                            <span className='link-text'><Link to="/calendar">Book Appointments</Link></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="e-card-content">
                                    <GridComponent dataSource={gridData} height='160px'>
                                        <ColumnsDirective>
                                            <ColumnDirective field='Time' width='80' textAlign='Left'></ColumnDirective>
                                            <ColumnDirective field='Name' width='120' textAlign='Left'></ColumnDirective>
                                            <ColumnDirective field='DoctorName' headerText='Doctor Name' width='150' textAlign='Left' template={doctorColumnTemplate.bind(this)}>
                                            </ColumnDirective>
                                            <ColumnDirective field='Symptoms' width='150' textAlign='Left' clipMode='EllipsisWithTooltip'></ColumnDirective>
                                        </ColumnsDirective>
                                    </GridComponent>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 dashboard-control">
                            <div className="e-card chart-container">
                                <div className="e-card-content">
                                    <Chart currentViewEvents={currentViewEvents} firstDayOfWeek={firstDayOfWeek}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-4 col-sm-4 list-display" style={{ paddingRight: "0px" }}>
                    <div className="recent-activity">
                        <RecentActivity />
                    </div>
                    <div className="doctor-availability">
                        <DoctorAvailability />
                    </div>
                </div>
            </div>
        </div>);
};
