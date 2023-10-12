import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Category, DataLabel, DateTime, SplineSeries, DateTimeCategory, Legend,
    ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject
} from '@syncfusion/ej2-react-charts';
import { addDays, resetTime } from '@syncfusion/ej2-react-schedule';

interface ChartProps {
    currentViewEvents: Record<string, any>[];
    firstDayOfWeek: Date;
}

export const Chart = ({ currentViewEvents, firstDayOfWeek }: ChartProps) => {
    const [chartData, setChartData] = useState(null);
    const title: string = 'Consultation';
    const chartArea: Record<string, any> = { border: { width: 0 } };
    const titleStyle: Record<string, any> = { textAlignment: 'Near' };
    const primaryXAxis: Record<string, any> = {
        valueType: 'DateTime', title: 'Date', interval: 1, intervalType: 'Days',
        labelFormat: 'MM/dd', minimum: firstDayOfWeek, maximum: new Date(addDays(new Date(firstDayOfWeek.getTime()), 6)),
        majorGridLines: { width: 0 }, minorGridLines: { width: 0 }, majorTickLines: { width: 0 }, edgeLabelPlacement: 'Shift'
    };
    const primaryYAxis: Record<string, any> = { title: 'Patient', minimum: 0, maximum: 6, interval: 2 };
    const legendSettings: Record<string, any> = { visible: true, position: 'Top', padding: 20 };

    useEffect(() => {
        setChartData(getChartDataList());
    }, []);

    const getChartDataList = (): Record<string, any> => {
        const diabetologyData: Record<string, any>[] = currentViewEvents.filter((item: Record<string, any>) => item['DepartmentId'] === 5);
        const orthopaedicsData: Record<string, any>[] = currentViewEvents.filter((item: Record<string, any>) => item['DepartmentId'] === 4);
        const cardiologyData: Record<string, any>[] = currentViewEvents.filter((item: Record<string, any>) => item['DepartmentId'] === 6);
        let date: Date = firstDayOfWeek;
        const chartDataList: Record<string, any> = { data: [], data1: [], data2: [] };
        for (let i = 0; i < 7; i++) {
            chartDataList.data.push(getChartData(diabetologyData, date));
            chartDataList.data1.push(getChartData(orthopaedicsData, date));
            chartDataList.data2.push(getChartData(cardiologyData, date));
            date = addDays(new Date(date.getTime()), 1);
        }
        return chartDataList;
    }

    const getChartData = (data: Record<string, any>[], startDate: Date): Record<string, any> => {
        const filteredData: Record<string, any>[] = data.filter((item: { [key: string]: Date }) =>
            resetTime(startDate).getTime() === resetTime(new Date(item['StartTime'])).getTime());
        return { Date: startDate, EventCount: filteredData.length };
    }

    return (
        <>
            {
                chartData && <ChartComponent id="chartcontainer" height='340px' chartArea={chartArea} primaryXAxis={primaryXAxis}
                    primaryYAxis={primaryYAxis} title={title} titleStyle={titleStyle} legendSettings={legendSettings}>
                    <SeriesCollectionDirective>
                        <SeriesDirective dataSource={chartData.data} type='Spline' width={2} xName='Date' yName='EventCount'
                            name='Diabetology' legendShape='Circle' fill='#60F238'></SeriesDirective>
                        <SeriesDirective dataSource={chartData.data1} type='Spline' width={2} xName='Date' yName='EventCount'
                            name='Orthopaedics' legendShape='Circle' fill='#388CF5'></SeriesDirective>
                        <SeriesDirective dataSource={chartData.data2} type='Spline' width={2} xName='Date' yName='EventCount'
                            name='Cardiology' legendShape='Circle' fill='#F29438'></SeriesDirective>
                    </SeriesCollectionDirective>
                    <Inject services={[Category, DataLabel, DateTime, SplineSeries, DateTimeCategory, Legend]} />
                </ChartComponent>
            }
        </>
    )
}