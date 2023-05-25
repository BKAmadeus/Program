import { Component } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";


const now = new Date()

const DateGenZou = (dt:Date,year=0,month=0,day=0,minute=0,second=0) =>{
  let Year = dt.getFullYear() + year;
  let Month = dt.getMonth() + month;
  let Day = dt.getDate() + day;
  let Minute = dt.getMinutes() + minute;
  let Second = dt.getSeconds() + second;
  return new Date(Year,Month,Day,Minute,Second);
}
const chartData = [
  {
    id_data: "A",
    start: now, 
    end: DateGenZou(now,0,0,1,0,0), 
    columnSettings:{
      fill :"#7EE081"
    },
    flg:1
  },
  {
    id_data: "A",
    start: DateGenZou(now,0,0,1,20,0), 
    end: DateGenZou(now,0,0,2,8,0), 
    columnSettings:{
      fill :"#A25FBF"
    }
  },
  {
    id_data: "A",
    start: DateGenZou(now,0,0,3,1,0), 
    end: DateGenZou(now,0,0,4,2,0), 
    columnSettings:{
      fill :"#A25FBF"
    }
  },
  {
    id_data: "B",
    start: DateGenZou(now,0,0,0,6,0), 
    end: DateGenZou(now,0,0,1,20,0), 
    columnSettings:{
      fill :"#7EE081"
    }
  },
  {
    id_data: "B",
    start: DateGenZou(now,0,0,3,6,0), 
    end: DateGenZou(now,0,0,4,20,0), 
    columnSettings:{
      fill :"#A25FBF"
    }
  }
];


export class GanttChart extends Component {
  root:any;
  componentDidMount() {
    const root = am5.Root.new("chartdiv");
    // ... chart code goes here ...
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout
      })
    );

    // Create Y-axis
    let yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "id_data",
        renderer:am5xy.AxisRendererY.new(root, { inversed: true }),
        tooltip: am5.Tooltip.new(root, {
          themeTags: ["axis"],
          animationDuration: 200
        })
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
    baseInterval: { timeUnit: "minute", count: 1 },
    markUnitChange: false,
    dateFormats:{
      "millisecond": "mm:ss SSS",
      "second": "HH:mm:ss",
      "minute": "HH:mm",
      "hour": "MM/dd HH:mm",
      "day": "MM/dd",
      "week": "MM/dd",
      "month": "MM",
      "year": "yyyy"},
    renderer: am5xy.AxisRendererX.new(root, {})
      })
    );

    // Create seriesvar 
    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      xAxis: xAxis,
      yAxis: yAxis,
      openValueXField: "start",
      valueXField: "end",
      categoryYField: "id_data",
      sequencedInterpolation: true
    }));
    series.columns.template.events.on("click", function(ev) {
      console.log("確認", ev.target.dataItem?.dataContext);
    });

    series.columns.template.setAll({
      templateField: "columnSettings",
      strokeWidth: 0,
      tooltipText: "{id_data}: {openValueX.formatDate('yyyy年MM月dd日 HH:mm')} - {valueX.formatDate('yyyy年MM月dd日 HH:mm')}"
    });

    series.data.processor = am5.DataProcessor.new(root, {
      dateFields: ["start", "end"],
      dateFormat: "yyyy年MM月dd日 HH:mm",
      colorFields: ["columnSettings.fill"]
    });
    var categories:any = []
    am5.array.each(chartData, function(item) {
      if (categories.indexOf(item.id_data) === -1) {
        categories.push(item.id_data);
      }
    });
    am5.array.each(categories, function(id_data, index) {
      categories[index] = {
        id_data: id_data
      }
    });
    yAxis.data.setAll(categories);
    series.data.setAll(chartData);
  
    // Add cursor
    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));
    series.appear();
    chart.appear(1000, 100);
    chart.set("cursor", am5xy.XYCursor.new(root, {}));


    this.root = root;
  }

  componentWillUnmount() {
    if (this.root) {
      this.root.dispose();
    }
  }

  render() {
    return (
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    );
  }
}