import * as func from "../Func/func";
import React from 'react';
import Typography from '@mui/material/Typography';
import { Section } from './Section';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
//アイコン
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
type OptionType = {
  label: string
  value: string
}

type Props = {
  TableState: any
  ProcessState: any
}

export const MultipleSelect = (props:Props) => {
  const [TableName,setTableName] = React.useState([]);
  React.useEffect (() => {
    func.postData({flg: 0})
    .then((data:any) => {
      var TableNames = data.map((item:any) => ({
        value: item['name'],
        label: item['description']
      }));
      setTableName(TableNames)
    })
    .catch((err:any) => {
      console.log(err);
    });
  },[]);

  const handleChange = (_:any, value:any) => {
    var test = {select:value,flg:1}
    func.postData(test)
    .then((data:any) => {
      props.TableState(data);
    })
  };

  return (
    <>
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
      <Typography variant="h6">使用テーブル選択</Typography>
      </AccordionSummary>
    <section>
      
      <Section
        State={props.ProcessState}
      />
      <Autocomplete
        multiple
        sx={{ width: 1800 }}
        autoHighlight
        options={TableName}
        getOptionLabel={(option: OptionType) => option.value+"("+option.label+")"}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
          />
        )}
      />
    </section>
    </Accordion>
    </>
  );
};
