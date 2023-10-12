import * as React from 'react';
import { useRef, useEffect } from 'react';
import markIcon from '../../assets/Icons/Mark.svg';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Browser } from '@syncfusion/ej2-base';
import { SidebarComponent } from '@syncfusion/ej2-react-navigations';
import { loadImage } from '../../util';
import './Main.scss';

import { Dashboard } from '../Dashboard/Dashboard';
import Calendar from '../Calendar/Calendar';
import { Doctors } from '../Doctors/Doctors';
import { DoctorDetails } from '../DoctorDetails/DoctorDetails';
import Patients from '../Patients/Patients';
import { Preference } from '../Preference/Preference';
import { About } from '../About/About';

export const Main = () => {
    const sideBar = useRef<SidebarComponent>(null);
    const isDevice: boolean = Browser.isDevice;
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('main-page');
        if (isDevice) {
            document.querySelector('.planner-header').classList.add('device-header');
            document.querySelector('.planner-wrapper').classList.add('device-wrapper');
        }
    }, []);

    const btnClick = (): void => {
        sideBar.current.show();
    }

    const onItemClick = (args: Event): void => {
        if (isDevice) {
            sideBar.current.hide();
        }
        if (args.currentTarget) {
            navigate('/' + (args.currentTarget as HTMLElement).id);
        }
        const elements: HTMLElement[] = [].slice.call((args.currentTarget as HTMLElement).parentElement.querySelectorAll('.active-item'));
        elements.forEach(element => {
            if (element.classList.contains('active-item')) { element.classList.remove('active-item'); }
        });
        (args.currentTarget as HTMLElement).classList.add('active-item');
    }

    return (
        <div className='planner-wrapper'>
            <SidebarComponent id='plannerSideBar' ref={sideBar} enableGestures={false} showBackdrop={isDevice} closeOnDocumentClick={isDevice}>
                <div className='dock'>
                    <div className='info align-center'>
                        <div className='image'><img src={loadImage('Admin')} /></div>
                        <div className='content nameContent'>
                            <p className='name' style={{ marginTop: '16px' }}>Jane Doe</p>
                            <p className='user-type'>Admin</p>
                        </div>
                    </div>
                    <div className="sidebar-item dashboard" id="dashboard" onClick={onItemClick.bind(this)}>
                        <span className="dashboard-image"><span className="icon-dashboard item-image"></span></span>
                        <span className="text" title="dashboard">Dashboard</span>
                    </div>
                    <div className="sidebar-item calendar" id="calendar" onClick={onItemClick.bind(this)}>
                        <span className="scheduler-image"><span className="icon-schedule item-image"></span></span>
                        <span className="text" title="calendar">Schedule</span>
                    </div>
                    <div className="sidebar-item doctors" id="doctors" onClick={onItemClick.bind(this)}>
                        <span className="doctors-image"><span className="icon-doctors item-image"></span></span>
                        <span className="text" title="doctors">Doctors</span>
                    </div>
                    <div className="sidebar-item patients" id="patients" onClick={onItemClick.bind(this)}>
                        <span className="patients-image"><span className="icon-patients item-image"></span></span>
                        <span className="text" title="patients">Patients</span>
                    </div>
                    <div className="sidebar-item preference" id="preference" onClick={onItemClick.bind(this)}>
                        <span className="preference-image"><span className="icon-preference item-image"></span></span>
                        <span className="text" title="preference">Preference</span>
                    </div>
                    <div className="sidebar-item about" id="about" onClick={onItemClick.bind(this)}>
                        <span className="about-image"><span className="icon-about item-image"></span></span>
                        <span className="text" title="about">About</span>
                    </div>
                </div >
            </SidebarComponent >
            <main>
                <div className="planner-header">
                    <div className="side-bar-opener">
                        <span className="open-icon e-icons" onClick={btnClick.bind(this)}></span>
                    </div>
                    <div className="name-container">
                        <span className="clinic-image icon-logo"></span>
                        <h1 className='clinic-name'> APPOINTMENT PLANNER</h1>
                    </div>
                    <div className='logout-container'>
                        <div className="logout-icon-container"><span className="icon-logout logout-image"></span></div>
                        <span className='logout-name'>Logout</span>
                    </div>
                    <div className="sb-header-item sb-table-cell sb-download-wrapper">
                        <a href="https://github.com/syncfusion/ej2-showcase-react-appointment-planner" target="_blank">
                            <div id="github" className="sb-github-btn">
                                <div className="github-image">
                                    <img src={markIcon} />
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
                <Routes>
                    <Route path='/' Component={Dashboard} />
                    <Route path='/dashboard' Component={Dashboard} />
                    <Route path='/calendar' Component={Calendar} />
                    <Route path='/doctors' Component={Doctors} />
                    <Route path='/doctor-details/:id' Component={DoctorDetails} />
                    <Route path='/patients' Component={Patients} />
                    <Route path='/preference' Component={Preference} />
                    <Route path='/about' Component={About} />
                </Routes>
            </main>
        </div >
    )
}