import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { useActivity } from '../../context/ActivityContext';
import './RecentActivity.scss';

export const RecentActivity = () => {
    const dataService = useActivity();

    const updateActivityData = (): Record<string, any>[] => {
        const activityData: Record<string, any>[] = Object.assign([], dataService.activityData);
        if (activityData && activityData.length > 0) {
            activityData.map((item: Record<string, any>) => {
                item['Time'] = timeSince(item['ActivityTime'] as Date);
            });
        }
        return activityData;
    }

    const timeSince = (activityTime: Date): string => {
        const seconds: number = Math.floor((new Date().getTime() - activityTime.getTime()) / 1000);
        let interval: number = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return interval + ' years ago';
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + ' months ago';
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + ' days ago';
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + ' hours ago';
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + ' minutes ago';
        }
        return Math.floor(seconds) + ' seconds ago';
    }

    const [dataSource, setDataSource] = useState(updateActivityData());
    const interval = useRef(null);

    useEffect(() => {
        interval.current = setInterval(() => { setDataSource(updateActivityData()); }, 60000);
        return () => {
            if (interval.current) {
                clearInterval(interval.current);
            }
        };
    }, []);

    const listTemplate = (props: Record<string, any>): JSX.Element => {
        return (
            <div className={'activity-container ' + props.Type}>
                <div className='activity-message'><span className='type-name'>{props.Name}</span> - <span>{props.Message}</span></div>
                <span className='activity-time'>{props.Time}</span>
            </div>
        );
    }

    return (
        <>
            <h3>Recent Activities</h3>
            <ListViewComponent id='listview_template' height='88%' width='100%' dataSource={dataSource} cssClass='activity-template'
                showHeader={false} template={listTemplate.bind(this)}>
            </ListViewComponent>
        </>
    )
}