import { useEffect, useState } from "react";
import { MultipleSelect } from './component/MultipleSelect';
import { DataTable } from '../Components/Table';
import {Header} from "../Components/Header";
import * as func from "../Components/func";
import Typography from '@mui/material/Typography';
//アイコン
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';

const Home: React.FC = () => {
    const [Table,setTable] = useState([]);
    const [Process,setProcess] = useState([]);
    //const [Parts,setParts] = useState([]);
    const [Change,setChange] = useState([]);
    useEffect (() => {
      console.log("テーブル",Table);
    },[Table]);
    useEffect (() => {
      console.log("選択",Process);
    },[Process]);
    useEffect (() => {
      console.log("Change",Change);
      func.postData(Change);
    },[Change]);
    const Tables:any = [];
    for (var key in Table){
      Tables.push(
        <DataTable
        key={key}
        TableName={key}
        Tables={Table}
        TablesState={setTable}
        Process={Process}
        ChangeState={setChange}
        />
      );
    }
    
    return (
      <div>
        <Header Label={"ホーム画面"} />
        <MultipleSelect TableState={setTable} ProcessState={setProcess}/>
        <div>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}> <Typography variant="h6">テーブル一覧</Typography></AccordionSummary>
            {Tables}
          </Accordion>
        </div>
      </div>
    )
  }

  export default Home;