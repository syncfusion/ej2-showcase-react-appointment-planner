import * as React from 'react';
import { useEffect } from 'react';
import { updateActiveItem } from '../../util';
import './About.scss';

export const About = () => {
  useEffect(() => {
    updateActiveItem('about');
  }, []);

  return (
    <div className='about-container'>
      <header>
        <div className="module-title">
          <div className='title'>ABOUT</div>
          <div className='underline'></div>
        </div>
      </header>
      <p>
        The Example Clinic demo application showcases using several Essential JS 2 React UI components together in a
        real-world application scenario. You can further explore the <a className='control-name'
          href="https://github.com/syncfusion/ej2-showcase-react-appointment-planner" target="_blank">source
          code</a> of this application and use it as a
        reference for integrating Essential JS 2 React UI components into your applications.
      </p>
      <div className='list-heading'>List of EJ2 React UI components used in this sample</div>
      <div className='about-component'>
        <div className='control-item'>
          <span className="ejimage-checkbox e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/check-box/getting-started"
            target="_blank">CheckBox</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-dialog e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/dialog/getting-started.html"
            target="_blank">Dialog</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-textboxes e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/textbox/getting-started.html"
            target="_blank">TextBox</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-dropdownlist e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/drop-down-list/getting-started.html"
            target="_blank">DropDownList</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-datepicker e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/datepicker/getting-started.html"
            target="_blank">DatePicker</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-button e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/button/getting-started.html"
            target="_blank">Button</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-schedule e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/schedule/getting-started.html"
            target="_blank">Schedule</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-treeview e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/treeview/getting-started"
            target="_blank">TreeView</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-toast e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/toast/getting-started.html"
            target="_blank">Toast</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-grid e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/grid/getting-started.html"
            target="_blank">Grid</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-chart e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/chart/getting-started.html"
            target="_blank">Chart</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-timepicker e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/timepicker/getting-started.html"
            target="_blank">TimePicker</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-sidebar e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/sidebar/getting-started.html"
            target="_blank">Sidebar</a>
        </div>
        <div className='control-item'>
          <span className="ejimage-listview e-sb-icon control-icon"></span>
          <a className='control-name' href="https://ej2.syncfusion.com/react/documentation/listview/getting-started.html"
            target="_blank">ListView</a>
        </div>
      </div>
    </div>
  )
}