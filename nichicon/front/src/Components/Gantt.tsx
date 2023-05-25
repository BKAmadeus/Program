import "../style.css";
import ReactGantt, { GanttRow } from "react-gantt";
import moment from "moment";
export function testGantt() {
  const now = moment();
  return (
    <ReactGantt
      templates={{
        myTasks: {
          title: "My Tasks",
          steps: [
            {
              name: "Task Phase One",
              color: "#0099FF"
            },
            {
              name: "Task Phase Two",
              color: "#FF9900"
            }
          ]
        }
      }}
      leftBound={now.set({ hour: 0, date: 30, month: 5, year: 2016 }).toDate()}
      rightBound={now.set({ hour: 0, date: 29, month: 8, year: 2016 }).toDate()}
    >
      <GanttRow
        title="Task 1"
        templateName="myTasks"
        steps={[
          moment()
            .set({ hour: 0, date: 1, month: 6, year: 2016 })
            .toDate(),
          moment()
            .set({ hour: 0, date: 4, month: 8, year: 2016 })
            .toDate(),
          moment()
            .set({ hour: 0, date: 17, month: 8, year: 2016 })
            .toDate()
        ]}
      />
      <GanttRow
        title="Task 1"
        templateName="myTasks"
        steps={[
          moment()
            .set({ hour: 0, date: 27, month: 2, year: 2016 })
            .toDate(),
          moment()
            .set({ hour: 0, date: 9, month: 7, year: 2016 })
            .toDate(),
          moment()
            .set({ hour: 0, date: 22, month: 7, year: 2016 })
            .toDate()
        ]}
      />
    </ReactGantt>
  );
}
