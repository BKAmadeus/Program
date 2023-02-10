//material-uiコンポーネント
//import Box from '@mui/material/Box';
//import TextField from '@mui/material/TextField';
//import Autocomplete from '@mui/material/Autocomplete';
//reactのフォーム入力一斉送信用
import type { OptionType } from "../Data/Data"
//import * as func from "../Func/func";
import '../style.css';
//import { useEffect } from 'react';
import { col,ports,init_BZI } from "../Data/Data"
export const Reset = (setValue:any,reset:any,resetField:any,watch:any) => {
  var Search_SearchNo = watch(`Search_SearchNo`);
  var Search_ProductNumber = watch(`Search_ProductNumber`);
  var Search_Dessign = watch(`Search_Dessign`);
  var Search_RatedVoltage = watch(`Search_RatedVoltage`);
  var Search_Capacitance = watch(`Search_Capacitance`);
  var Search_Diameter = watch(`Search_Diameter`);
  var Search_LSize = watch(`Search_LSize`);
  var Search_Series = watch(`Search_Series`);
  for(var key in watch()){
    resetField(key);
    if(key === "Element"){
      for(var key2 in watch(`Element`)){
        resetField(`Element.${key2}`);
        if(key2 === "display"){
          for(var key3 in watch(`Element.${key2}.display`)){
            resetField(`Element.${key2}.display.${key3}`)
          }
        }
      }
    }
  }
  reset();
  setValue(`Sabmit`,true);
  setValue(`Select`,init_BZI);
  setValue(`Element.22.color`,[0,0,0]);
  setValue(`Element.22.text_color`,[200,200,200]);
  setValue(`Element.25.color`,[0,0,0]);
  setValue(`Element.25.text_color`,[200,200,200]);
  setValue(`Search_SearchNo`,Search_SearchNo);
  setValue(`Search_ProductNumber`,Search_ProductNumber);
  setValue(`Search_Dessign`,Search_Dessign);
  setValue(`Search_RatedVoltage`,Search_RatedVoltage);
  setValue(`Search_Capacitance`,Search_Capacitance);
  setValue(`Search_Diameter`,Search_Diameter);
  setValue(`Search_LSize`,Search_LSize);
  setValue(`Search_Series`,Search_Series);
};

export const DataSetConstant = (DATA:any,SetValue:any) => {
  if(DATA.machining_guid){
    SetValue("MachiningGuidance",DATA.machining_guid);
  }
  if(DATA.classification){
    SetValue("Classification",DATA.classification);
  }
  if(DATA.dessign){
    SetValue("Dessign",DATA.dessign);
  }
  if(DATA.winding_guid){
    SetValue("WindingGuid",DATA.winding_guid);
  }
  if(DATA.inclusion_guid){
    SetValue("InclusionGuid",DATA.inclusion_guid);
  }
  if(DATA.finish_guid){
    SetValue("FinishGuid",DATA.finish_guid);
  }
  if(DATA.search_number){
    SetValue("Search",DATA.search_number);
  }
  if(DATA.destination){
    SetValue("Destination",DATA.destination);
  }
  if(DATA.remarks){
    SetValue("Remarks",DATA.remarks);
  }
  if(DATA.remarks2){
    SetValue("Remarks2",DATA.remarks2);
  }
  if(DATA.dessign){
    SetValue("Dessign",DATA.dessign);
  }
  if(DATA.inside_dcr){
    SetValue("DCRCo",DATA.inside_dcr);
  }
  if(DATA.outside_dcr){
    SetValue("DCR",DATA.outside_dcr);
  }
  if(DATA.inside_esr){
    SetValue("ESRCo",DATA.inside_esr);
  }
  if(DATA.outside_esr){
    SetValue("ESR",DATA.outside_esr);
  }
  if(DATA.target_value){
    SetValue("TargetValue",DATA.target_value);
  }
  if(DATA.outside_leakage_current){
    SetValue("LeakageCurrent",DATA.outside_leakage_current);
  }
  if(DATA.inside_leakage_current){
    SetValue("LeakageCurrentCo",DATA.inside_leakage_current);
  }
  if(DATA.aging_voltage){
    SetValue("AppliedVoltage",DATA.aging_voltage);
  }
  if(DATA.outside_leakage_current){
    SetValue("AgingTime",DATA.outside_leakage_current);
  }
  if(DATA.aging_temperature){
    SetValue("Temperature",DATA.aging_temperature);
  }
  if(DATA.capacitance_tolerance_level_inside){
    var tolerance = DATA.capacitance_tolerance_level_inside.match(/([-0-9]+),([-0-9]+)/);
    if(tolerance){
      SetValue("CapacityToleranceCo.minus",parseFloat(tolerance[1]));
      SetValue("CapacityToleranceCo.plus",parseFloat(tolerance[2]));
    }
  }
  if(DATA.infiltration_rate){
    SetValue("ContentPercentage",DATA.infiltration_rate);
  }
  if(DATA.target_value){
    SetValue("TargetValue",DATA.target_value);
  }
  if(DATA.core_diameter){
    SetValue("CoreDiameter",DATA.core_diameter);
  }
  if(DATA.type){
    SetValue("Type",DATA.type);
  }
  if(DATA.total_thickness_correction_factor){
    SetValue("TotalThicknessCorrectionFactor",DATA.total_thickness_correction_factor);
  }
  if(DATA.anomaly){
    DATA.anomaly.map((val:any,index:number)=>{
      SetValue(`Anomaly.${index}.name`,val.name);
      SetValue(`Anomaly.${index}.element`,val.element);
      SetValue(`Anomaly.${index}.value`,val.value);
      return ""
    });
  }
}

export const DataSetCalculation = (data:any,SetValue:any) => {
  if('product' in data){
    if('series' in data.product){
      SetValue("Series",data.product.series);
    }
    if('breed' in data.product){
      SetValue("CapacitorType",data.product.breed);
    }
    if('capacitance' in data.product){
      SetValue("Capacitance",data.product.capacitance);
    }
    if('tolerance' in data.product){
      SetValue("CapacityTolerance.minus",data.product.tolerance.minus);
      SetValue("CapacityTolerance.plus",data.product.tolerance.plus);
    }
    if('voltage' in data.product){
      SetValue("RatedVoltage",data.product.voltage);
    }
    if('machining' in data.product){
      SetValue("MachiningCode",data.product.machining);
    }
    if('machining_data' in data.product){
      SetValue("MachiningMethod",data.product.machining_data.machining_name);
    }
    if('error' in data.product){
      SetValue("ProductError",data.product.error);
    }
    else{
      SetValue("ProductError",undefined);
    }
    SetValue("ProductNumber",data.product.code);
  }
  if('assembly' in data){
    if('l_dimension' in data.assembly){
      SetValue("LSize",data.assembly.l_dimension);
    }
    if('diameter' in data.assembly){
      SetValue("Diameter",data.assembly.diameter);
    }
    if('error' in data.assembly){
      SetValue("AssemblyError",data.assembly.error);
    }
    else{
      SetValue("AssemblyError",undefined);
    }
    SetValue("AssembledForm",data.assembly.code);
  }
  if('total_thickness' in data){
    SetValue("TotalThickness",data.total_thickness);
  }
  if('special' in data){
    SetValue(`special`,data.special);
  }
  if('new_dessign' in data){
    SetValue(`Dessign`,data.new_dessign);
  }
  if('cotoff_factor' in data){
    SetValue("CutoffFactor",data.cotoff_factor);
  }
  if('device_diameter' in data){
    SetValue("DeviceDiameter",data.device_diameter);
  }
  if('pic_error' in data){
    SetValue("PicError",data.pic_error);
  }
  else{
    SetValue("PicError",undefined);
  }
  if('dessign_error' in data){
    SetValue("DessignError",data.dessign_error);
  }
  else{
    SetValue("DessignError",undefined);
  }
  if('parts_error' in data){
    SetValue("PartsError",data.parts_error);
  }
  else{
    SetValue("PartsError",undefined);
  }
  if('size_error' in data){
    SetValue("SizeError",data.size_error);
  }
  else{
    SetValue("SizeError",undefined);
  }
  if('search_number_error' in data){
    SetValue("SearchNumberError",data.search_number_error);
  }
  else{
    SetValue("SearchNumberError",undefined);
  }
  if('parts' in data){
    var i = 0;
    var j = 0;
    for(var parts of ports.parts){
      for(var row of data.parts){
        if(parts.label === row.name){
          SetValue(`Select.${j}`,row.name);
          j++;
          if(row.table){
            SetValue(`Element.${i}.table`,row.table);
          }
          SetValue(`Element.${i}.name`,row.name);
          SetValue(`Element.${i}.code`,row.code);
          SetValue(`Element.${i}.range`, row.range);
          SetValue(`Element.${i}.length`, row.length);
          SetValue(`Element.${i}.quantity`, row.quantity);
          SetValue(`Element.${i}.thickness`, row.thickness);
          SetValue(`Element.${i}.weight`, row.weight);
          SetValue(`Element.${i}.color`,row.color);
          if(row.angle){
            SetValue(`Transform`,row.angle);
          }
          if(row.error){
            SetValue(`Element.${i}.error`,row.error);
          }
          else{
            SetValue(`Element.${i}.error`,undefined);
          }
          if(row.cost_attention){
            SetValue(`Element.${i}.cost_attention`,row.cost_attention);
          }
          else{
            SetValue(`Element.${i}.cost_attention`,undefined);
          }
          if(row.capacitance_attention){
            SetValue(`Element.${i}.capacitance_attention`,row.capacitance_attention);
          }
          else{
            SetValue(`Element.${i}.capacitance_attention`,undefined);
          }
          if(row.image_code){
            SetValue(`image_code`,row.image_code);
          }
          if(row.text_color){
            SetValue(`Element.${i}.text_color`,row.text_color);
          }
          if(row.name === '外チューブ' && !row.back1 && !row.back2 && !row.back3){
            SetValue(`Element.26.soko_display`,true);
          }
          if(row.display){
            var k = 0;
            var ki = 0;
            var PicOptions:OptionType[]|null|undefined = []
            for(var row3 of col){
              for(var row2 of row.display){
                if(row3.label === row2.name){
                  PicOptions[ki] = row2.name
                  SetValue(`Element.${i}.display.${k}.name`,row2.name);
                  SetValue(`Element.${i}.display.${k}.vertical`,row2.vertical);
                  SetValue(`Element.${i}.display.${k}.horizon`,row2.horizon);
                  SetValue(`Element.${i}.display.${k}.after`,row2.after);
                  SetValue(`Element.${i}.display.${k}.before`,row2.before);
                  ki++
                }
              }
              k++
            }
            SetValue(`PictureSelect`,PicOptions);
          }
          SetValue(`Element.${i}.back1`,row.back1);
          SetValue(`Element.${i}.back2`,row.back2);
          SetValue(`Element.${i}.back3`,row.back3);
          SetValue(`Element.${i}.FoldDiameter`,row.fold_diameter);
          SetValue(`Element.${i}.capacitance`, row.capacitance);
          SetValue(`Element.${i}.area`, row.area);
          SetValue(`Element.${i}.cost`,row.cost);
        }
      }
      i++
    }
  }
  if('Picture' in data){
    for(var pic of data.Picture){
      SetValue(`SetPic`,pic.image_base64);
      SetValue(`ViewPic`,pic.image_base64_2);
      SetValue(`widthPic`,pic.maxwidth);
    }
  }
}

export const DataSet = (data:any,DATA:any,SetValue:any) =>{
  DataSetConstant(DATA,SetValue);
  DataSetCalculation(data,SetValue);
}

//export const ProductSelectData = (PS:any) => {
//
//    const handleClick = (data:any) => {
//      if(data){
//        var post = {flg:5,Product:data,tables:PS.tables};
//        Reset(PS.SetValue,PS.reset,PS.resetField,PS.watch);
//        func.postData(post).then((Data:any) => {
//          DataSet(Data,data);
//        })
//      }
//    }
//
//    const DataSet = (data:any,DATA:any) =>{
//      DataSetConstant(DATA,PS.SetValue);
//      DataSetCalculation(data,PS.SetValue);
//    }
//    
//    return (
//      <section>
//        <label>{PS.Label}</label>
//        <Autocomplete
//          options={PS.Table}
//          className='ac'
//          getOptionLabel={(option: any) => {
//            return option.code+":"+option.dessign+":"+option.search_number
//          }}
//          onChange={(_, data) => handleClick(data)}
//          renderOption={(prop, option)=>( <Box component="li" {...prop}> id:{option.id} {option.code} 設番:{option.dessign} 手配No.{option.search_number}</Box>)}
//          renderInput={(params) => ( <TextField {...params} variant="filled"/>)}
//        />
//      </section>
//    )
//  }
