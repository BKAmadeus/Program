import * as func from "../../Components/func";
import React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
//アイコン
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import {AuthUserContext} from '../../Data/SharedVariable';
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
  const UserData = React.useContext(AuthUserContext);
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
  const handleState = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.ProcessState(event.target.value);
  };

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
      
      <FormControl>
        <RadioGroup
          row
          aria-labelledby="section"
          name="radio-buttons-group"
          >
        <FormControlLabel value={0} control={<Radio onChange={handleState}/>} label="閲覧" />
        {UserData && UserData.table_authority?<FormControlLabel value={4} control={<Radio onChange={handleState}/>} label="改訂"/>:""}
        {UserData && UserData.table_authority?<FormControlLabel value={3} control={<Radio onChange={handleState}/>} label="追加"/>:""}
        {UserData && UserData.table_authority?<FormControlLabel value={5} control={<Radio onChange={handleState}/>} label="削除"/>:""}
        </RadioGroup>
      </FormControl>
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
