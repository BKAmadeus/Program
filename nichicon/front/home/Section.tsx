
import React  from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import {AuthUserContext} from '../Data/SharedVariable';

type Props = {
    State: any
  }

export const Section = (props:Props) => {
  const UserData = React.useContext(AuthUserContext);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.State(event.target.value);
  };
  return (
    <FormControl>
      <RadioGroup
        row
        aria-labelledby="section"
        name="radio-buttons-group"
        >
      <FormControlLabel value="1" control={<Radio onChange={handleChange}/>} label="閲覧" />
      {UserData && UserData.table_authority?<FormControlLabel value="2" control={<Radio onChange={handleChange}/>} label="修正" />:""}
      {UserData && UserData.table_authority?<FormControlLabel value="3" control={<Radio onChange={handleChange}/>} label="追加" />:""}
      {UserData && UserData.table_authority?<FormControlLabel value="4" control={<Radio onChange={handleChange}/>} label="削除" />:""}
      </RadioGroup>
    </FormControl>
  )
}
  