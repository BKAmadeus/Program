import * as React from "react";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const EquipmentOrder = [
  {table_name:"equipment_slitter",title:"スリッター機"},
  {table_name:"equipment_winding",title:"巻取機"},
  {table_name:"equipment_impregnation_tank",title:"含浸機"},
  {table_name:"equipment_shaker",title:"振切機"},
  {table_name:"equipment_assembly",title:"組立機"},
  {table_name:"equipment_tube_processing",title:"チューブ加工機"},
  {table_name:"equipment_ag",title:"エージング機"},
  {table_name:"equipment_appearance_inspection",title:"外観検査機"}
]

const { useState, memo } = React;

const data = {
  tasks: {
    task1: {
      id: "task1",
      content: "A",
      schedule:{}
    },
    task2: {
      id: "task2",
      content: "B",
      schedule:{}
    },
    task3: {
      id: "task3",
      content: "C",
      schedule:{}
    },
    task4: {
      id: "task4",
      content: "D",
      schedule:{}
    },
    task5: {
      id: "task5",
      content: "E",
      schedule:{}
    },
    task6: {
      id: "task6",
      content: "F",
      schedule:{}
    },
    task7: {
      id: "task7",
      content: "G",
      schedule:{}
    },
    task8: {
      id: "task8",
      content: "H",
      schedule:{}
    }
  },
  equipment_slitter:{
    rows: {
      col1: {
        id: "col1",
        title: "Todo",
        taskIds: []
      },
      col2: {
        id: "col2",
        title: "Progress",
        taskIds: []
      },
      col3: {
        id: "col3",
        title: "Done",
        taskIds: []
      }
    }
  },
  equipment_winding:{
    rows: {
      col1: {
        id: "col1",
        title: "Todo",
        taskIds: []
      },
      col2: {
        id: "col2",
        title: "Progress",
        taskIds: []
      },
      col3: {
        id: "col3",
        title: "Done",
        taskIds: []
      }
    }
  }
};

const TaskContainer = styled.div<{ isDragging: boolean }>`
  border: 1px solid lightgrey;
  padding: 8px;
  border-radius: 2px;
  margin-bottom: 8px;
  background-color: ${props => (props.isDragging ? "lightgreen" : "white")};
  transition: background 0.1s;
`;


const FuncTask = memo(({ task, index,table }: any) => {
  return (
    <Draggable draggableId={table+"__"+task.id} index={index}>
      {(provided, snapshot) => (
        <TaskContainer
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging}
        >
          {task.content}
        </TaskContainer>
      )}
    </Draggable>
  );
});

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 200px;
  display: flex;
  flex-direction: column;
  background-color: "white";
`;
const Title = styled.h3`
  padding: 8px;
`;
const List = styled.div<{ isDraggingOver: boolean }>`
  padding: 8px;
  transition: background 0.1s;
  background-color: ${props =>
    props.isDraggingOver ? "lightgrey" : "inherit "};
  flex-grow: 1;
`;

const ContainerRows = styled.div`
  border-radius: 1px;
  margin: 8px;
  border: 1px solid lightgrey;
  display:grid;
`;
const Rows = styled.div`
  display:flex;
`;
const Columns = styled.div`
  display: grid;
`;
const Equipment = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
`;

const FuncRow = memo(({ row, tasks, index,table }: any) => (
  <Container key={index}>
    <Title >{row.title}</Title>
    <Droppable droppableId={table+"__"+row.id} type="task">
      {(provided, snapshot) => (
        <List
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDraggingOver={snapshot.isDraggingOver}
        >
          {tasks.map((t:any, i:any) => {
            if(t){
              return <FuncTask key={t.id} task={t} index={i} table={table}/>
            }
            else{
              return ""
            }
          })}
          {provided.placeholder}
        </List>
      )}
    </Droppable>
  </Container>
));

const FuncColumn = ({ column, table, title, index, tasks }: any) => {
  return (
      <ContainerRows key={index}>
        <Title key={table}>{title}</Title>
        <Rows>
          {Object.keys(column.rows).map((id:string, i:number) => {
            const col = column.rows[id];
            const tasks2 = col.taskIds.map((taskid:string) => tasks[taskid]);
            return <FuncRow key={id} row={col} tasks={tasks2} index={i} table={table}/>
          })}
        </Rows>
      </ContainerRows>
)};

const FuncTasks = ({ column }: any) => {
  return (
    <Container key={'tasks'}>
      <Title >受注</Title>
      <Droppable droppableId={"tasks__tasks"} type="task">
        {(provided, snapshot) => (
          <List
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {Object.keys(column).map((t:any, i:number) => {
              return <FuncTask key={column[t].id} task={column[t]} table={"tasks"} index={i}/>
              })}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </Container>
)};

export function Dnd() {
  const [state, setState] = useState(data);
  return (
    <DragDropContext
      onDragEnd={(result:any) => {
        let destination = result.destination
        if (!destination) {
          return;
        }
        destination.table = destination.droppableId.split('__')[0];
        console.log(result.draggableId.split('__')[1]);
        let draggableId = result.draggableId.split('__')[1];
        destination.droppableId = destination.droppableId.split('__')[1];
        let source = result.source;
        source.table = source.droppableId.split('__')[0];
        source.droppableId = source.droppableId.split('__')[1];
        console.log("source",source,"\ndestination",destination,"\ndraggableId",draggableId);
        if (
          destination.droppableId === source.droppableId &&
          destination.index === source.index &&
          destination.table === source.table
        ) {
          return;
        }
        else if(destination.table === 'tasks' && source.table === 'tasks'){
          let TaskIds = Array.from(Object.keys(state[source.table]));
          TaskIds.splice(source.index, 1);
          TaskIds.splice(destination.index, 0, draggableId);
          var Tasks:any = {};
          TaskIds.map((val:string)=>{
            Tasks[val] = state[source.table][val]
            return "";
          })
          const newState = {
            ...state,
            tasks:Tasks
          };
          setState(newState);
          return;
        }
        else if(destination.table === 'tasks'){
          let TaskIds = Array.from(state[source.table].rows[source.droppableId].taskIds);
          TaskIds.splice(source.index, 1);
          const col = state[source.table].rows[source.droppableId];
          var schedule:any = {};
          EquipmentOrder.map((val:any)=>{
            if(val.table_name in state["tasks"][draggableId]["schedule"]){
              schedule[val.table_name] = state["tasks"][draggableId]["schedule"];
            }
            else{
              schedule[val.table_name] = {}
            }
            if(destination.table === val.table_name){
              schedule[val.table_name]["equipment"] = null;
            }
            return ""
          })
          const newData = {
            ...col,
            taskIds: TaskIds
          };
          const newState = {
            ...state,
            tasks:{
              ...state["tasks"],
              [draggableId]:{
                ...state["tasks"][draggableId],
                schedule: schedule,
              }
            },
            [source.table]:{
              ...state[source.table],
              rows: {
                ...state[source.table].rows,
                [newData.id]: newData
              }
            }
          };
          setState(newState);
          return;
        }
        else if(source.table === 'tasks'){
          let TaskIds = Array.from(state[destination.table].rows[destination.droppableId].taskIds);
          TaskIds.splice(destination.index, 0, draggableId);
          const col = state[destination.table].rows[destination.droppableId];
          schedule = {};
          EquipmentOrder.map((val:any)=>{
            if(val.table_name in state["tasks"][draggableId]["schedule"]){
              schedule[val.table_name] = state["tasks"][draggableId]["schedule"];
            }
            else{
              schedule[val.table_name] = {}
            }
            if(destination.table === val.table_name){
              schedule[val.table_name]["equipment"] = destination.droppableId;
            }
            return ""
          })
          const newData = {
            ...col,
            taskIds: TaskIds
          };
          if(state.tasks[draggableId].schedule[destination.table] && state.tasks[draggableId].schedule[destination.table].equipment){
            var chackData = state.tasks[draggableId].schedule[destination.table].equipment;
            if(chackData === newData.id){
              newData.taskIds = Array.from(state[destination.table].rows[destination.droppableId].taskIds);
            }
            else{
              const newState = {
                ...state,
                tasks:{
                  ...state["tasks"],
                  [draggableId]:{
                    ...state["tasks"][draggableId],
                    schedule: schedule,
                  }
                },
                [destination.table]:{
                  ...state[destination.table],
                  rows: {
                    ...state[destination.table].rows,
                    [newData.id]: newData,
                    [chackData]: {
                      ...state[destination.table].rows[chackData],
                      taskIds: state[destination.table].rows[chackData].taskIds.filter((val:any)=>val !== draggableId)
                    }
                  }
                }
              };
              setState(newState);
              return;
            }
          }
          const newState = {
            ...state,
            tasks:{
              ...state["tasks"],
              [draggableId]:{
                ...state["tasks"][draggableId],
                schedule: schedule,
              }
            },
            [destination.table]:{
              ...state[destination.table],
              rows: {
                ...state[destination.table].rows,
                [newData.id]: newData
              }
            }
          };
          setState(newState);
          return;
        }

        const startcol = state[source.table].rows[source.droppableId];
        const endcol = state[destination.table].rows[destination.droppableId];
        if(!startcol || !endcol){
          return;
        }
        if(startcol.id === endcol.id && source.table === destination.table){
          let TaskIds = Array.from(startcol.taskIds);
          TaskIds.splice(source.index, 1);
          TaskIds.splice(destination.index, 0, draggableId);
          const newData = {
            ...startcol,
            taskIds: TaskIds
          };
          const newState = {
            ...state,
            [source.table]:{
              ...state[source.table],
              rows: {
                ...state[source.table].rows,
                [newData.id]: newData
              }
            }
          };
          setState(newState);
          return;
        }
        const startTaskIds = Array.from(startcol.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = {
          ...startcol,
          taskIds: startTaskIds
        };
        const endTaskIds = Array.from(endcol.taskIds);
        endTaskIds.splice(destination.index, 0, draggableId);
        schedule = {};
        EquipmentOrder.map((val:any)=>{
          if(val.table_name in state["tasks"][draggableId]["schedule"]){
            schedule[val.table_name] = state["tasks"][draggableId]["schedule"];
          }
          else{
            schedule[val.table_name] = {}
          }
          if(destination.table === val.table_name){
            schedule[val.table_name]["equipment"] = destination.droppableId;
          }
          return ""
        })
        const newEnd = {
          ...endcol,
          taskIds: endTaskIds
        };

        if(destination.table === source.table){
          const newState = {
            ...state,
            tasks:{
              ...state["tasks"],
              [draggableId]:{
                ...state["tasks"][draggableId],
                schedule: schedule,
              }
            },
            [destination.table]:{
              ...state[destination.table],
              rows: {
                ...state[destination.table].rows,
                [newEnd.id]: newEnd,
                [newStart.id]: newStart
              }
            }
          };
          setState(newState);
        }
        else{
          chackData = state.tasks[draggableId].schedule[destination.table].equipment;
          if(chackData){
            if(chackData === newEnd.id){
              newEnd.taskIds = Array.from(endcol.taskIds);
            }
            else{
              const newState = {
                ...state,
                tasks:{
                  ...state["tasks"],
                  [draggableId]:{
                    ...state["tasks"][draggableId],
                    schedule: schedule,
                  }
                },
                [destination.table]:{
                  ...state[destination.table],
                  rows: {
                    ...state[destination.table].rows,
                    [newEnd.id]: newEnd,
                    [chackData]: {
                      ...state[destination.table].rows[chackData],
                      taskIds: state[destination.table].rows[chackData].taskIds.filter((val:any)=>val !== draggableId)
                    }
                  }
                }
              };
              setState(newState);
              return;
            }
          }
          const newState = {
            ...state,
            tasks:{
              ...state["tasks"],
              [draggableId]:{
                ...state["tasks"][draggableId],
                schedule: schedule,
              }
            },
            [destination.table]:{
              ...state[destination.table],
              rows: {
                ...state[destination.table].rows,
                [newEnd.id]: newEnd
              }
            }
          };
          setState(newState);
          return;
        }
        
      }}
    >
      <Equipment>
        <FuncTasks column={state["tasks"]} key={"tasks"}/>
        <Columns>
          {EquipmentOrder.map((key:any,index:number)=>{
            if(key.table_name in state){
              return <FuncColumn column={state[key.table_name]} table={key.table_name} title={key.title} tasks={state["tasks"]} key={index}/>
            }
            else{
              return ""
            }
          })}
        </Columns>
      </Equipment>
    </DragDropContext>
  );
}
