import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import jaLocale from '@fullcalendar/core/locales/ja';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import * as React from 'react';
import Button from '@mui/material/Button';

import {DateTime} from './DateTime'

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export const Calendar = (CA:any) => {
  const initialDate = new Date()
  const [open, setOpen] = React.useState(false);
  const [Data, setData] = React.useState({title:undefined,start:undefined,end:undefined});
  const handleClick = (data:any) => {
    var test = CA.data.filter((item:any)=>item.title === data.event.title);
    setData(test[0]);
    setOpen(true);
  }

  const handleSubmit = () =>{
    CA.setData(CA.data.map((val:any)=>{
      if(val.title === Data.title){
        return Data
      }
      return val
    }))
    setOpen(false);
  }
  const handleClose = () =>{
    setOpen(false);
  }

  const handleNew = () => {
    
  }

  return (
    <div>
      <FullCalendar
       plugins={[dayGridPlugin,timeGridPlugin,listPlugin]}
       initialView="dayGridMonth"
       locales={[jaLocale]}
       locale='ja'
       headerToolbar={{
         left: 'prevYear,prev,next,nextYear today',
         center: 'title',
         right: 'dayGridMonth,timeGridWeek,timeGridDay listWeek,listDay',
       }}
       buttonText={{ dayGridMonth: '月',timeGridWeek:'週',timeGridDay:'日', listWeek: '予定:週', listDay: '予定:日' }}
       themeSystem="Simplex"
       events={CA.data}
       eventClick={handleClick}
       select={handleNew}
      />
      <Dialog open={open} onClose={handleClose}>
        
      <DialogTitle>予定変更</DialogTitle>
          <DialogContent>
          <DialogContentText>
              {Data.title}
          </DialogContentText>
          <DialogContentText>
            日付：時間のみ変更可能
          </DialogContentText>
          {Data.start && initialDate <= Data.start?<DateTime start={Data.start} end={Data.end} setDate={setData}/>:
          <DialogContentText>計画変更不可</DialogContentText>}
          </DialogContent>
          <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          {Data.start && Data.end && initialDate <= Data.start && Data.start <= Data.end?<Button onClick={handleSubmit}>完了</Button>:<Button disabled>完了</Button>}
          </DialogActions>
      </Dialog>
    </div>
  );
}