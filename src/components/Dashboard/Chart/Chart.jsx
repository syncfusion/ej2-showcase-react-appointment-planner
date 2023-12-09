import * as React from 'react';
import { useState, useEffect } from 'react';
import { Category, DataLabel, DateTime, SplineSeries, DateTimeCategory, Legend, ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject } from '@syncfusion/ej2-react-charts';
import { addDays, resetTime } from '@syncfusion/ej2-react-schedule';
export const Chart = ({ currentViewEvents, firstDayOfWeek }) => {
    const [chartData, setChartData] = useState(null);
    const title = 'Consultation';
    const chartArea = { border: { width: 0 } };
    const titleStyle = { textAlignment: 'Near' };
    const primaryXAxis = {
        valueType: 'DateTime', title: 'Date', interval: 1, intervalType: 'Days',
        labelFormat: 'MM/dd', minimum: firstDayOfWeek, maximum: new Date(addDays(new Date(firstDayOfWeek.getTime()), 6)),
        majorGridLines: { width: 0 }, minorGridLines: { width: 0 }, majorTickLines: { width: 0 }, edgeLabelPlacement: 'Shift'
    };
    const primaryYAxis = { title: 'Patient', minimum: 0, maximum: 6, interval: 2 };
    const legendSettings = { visible: true, position: 'Top', padding: 20 };
    useEffect(() => {
        setChartData(getChartDataList());
    }, []);
    const getChartDataList = () => {
        const diabetologyData = currentViewEvents.filter((item) => item['DepartmentId'] === 5);
        const orthopaedicsData = currentViewEvents.filter((item) => item['DepartmentId'] === 4);
        const cardiologyData = currentViewEvents.filter((item) => item['DepartmentId'] === 6);
        let date = firstDayOfWeek;
        const chartDataList = { data: [], data1: [], data2: [] };
        for (let i = 0; i < 7; i++) {
            chartDataList.data.push(getChartData(diabetologyData, date));
            chartDataList.data1.push(getChartData(orthopaedicsData, date));
            chartDataList.data2.push(getChartData(cardiologyData, date));
            date = addDays(new Date(date.getTime()), 1);
        }
        return chartDataList;
    };
    const getChartData = (data, startDate) => {
        const filteredData = data.filter((item) => resetTime(startDate).getTime() === resetTime(new Date(item['StartTime'])).getTime());
        return { Date: startDate, EventCount: filteredData.length };
    };
    return (<>
            {chartData && <ChartComponent id="chartcontainer" height='340px' chartArea={chartArea} primaryXAxis={primaryXAxis} primaryYAxis={primaryYAxis} title={title} titleStyle={titleStyle} legendSettings={legendSettings}>
                    <SeriesCollectionDirective>
                        <SeriesDirective dataSource={chartData.data} type='Spline' width={2} xName='Date' yName='EventCount' name='Diabetology' legendShape='Circle' fill='#60F238'></SeriesDirective>
                        <SeriesDirective dataSource={chartData.data1} type='Spline' width={2} xName='Date' yName='EventCount' name='Orthopaedics' legendShape='Circle' fill='#388CF5'></SeriesDirective>
                        <SeriesDirective dataSource={chartData.data2} type='Spline' width={2} xName='Date' yName='EventCount' name='Cardiology' legendShape='Circle' fill='#F29438'></SeriesDirective>
                    </SeriesCollectionDirective>
                    <Inject services={[Category, DataLabel, DateTime, SplineSeries, DateTimeCategory, Legend]}/>
                </ChartComponent>}
        </>);
};
