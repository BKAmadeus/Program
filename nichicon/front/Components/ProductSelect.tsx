
//reactのフォーム入力一斉送信用
import type { OptionType } from "../Data/Data"
import '../style.css';
import { col,ports,init_BZI,TubeIndex,ErrorList,TubeErrorList } from "../Data/Data"
export const Reset = (setValue:any,reset:any,resetField:any,watch:any) => {
  for(var key in watch()){
    resetField(key);
    if(key === "parts"){
      for(var key2 in watch(`parts`)){
        resetField(`parts.${key2}`);
        if(key2 === "display"){
          for(var key3 in watch(`parts.${key2}.display`)){
            resetField(`parts.${key2}.display.${key3}`)
          }
        }
      }
    }
  }
  reset();
  setValue(`Select`,init_BZI);
  setValue(`Picture.color`,[0,0,0]);
  setValue(`Picture.text_color`,[200,200,200]);
  setValue(`Picture.Soko_color`,[0,0,0]);
  setValue(`Picture.Soko_text_color`,[200,200,200]);
}

export const DataSetConstant = (DATA:any,SetValue:any) => {
  if(DATA.id){
    SetValue(`id`,DATA.id);
  }
  if(DATA.machining_guid){
    SetValue("machining_guid",DATA.machining_guid);
  }
  if(DATA.winding_machine){
    SetValue("winding_machine",DATA.winding_machine);
  }
  if(DATA.classification){
    SetValue("classification",DATA.classification);
  }
  if(DATA.dessign){
    SetValue("dessign",DATA.dessign);
  }
  if(DATA.winding_guid){
    SetValue("winding_guid",DATA.winding_guid);
  }
  if(DATA.inclusion_guid){
    SetValue("inclusion_guid",DATA.inclusion_guid);
  }
  if(DATA.finish_guid){
    SetValue("finish_guid",DATA.finish_guid);
  }
  if(DATA.gauge_number){
    SetValue("gauge_number",DATA.gauge_number);
  }
  if(DATA.search_number){
    SetValue("search_number",DATA.search_number);
  }
  if(DATA.destination){
    SetValue("destination",DATA.destination);
  }
  if(DATA.dessign){
    SetValue("dessign",DATA.dessign);
  }
  if(DATA.inside_dcr){
    SetValue("inside_dcr",DATA.inside_dcr);
  }
  if(DATA.outside_dcr){
    SetValue("outside_dcr",DATA.outside_dcr);
  }
  if(DATA.inside_esr){
    SetValue("inside_esr",DATA.inside_esr);
  }
  if(DATA.outside_esr){
    SetValue("outside_esr",DATA.outside_esr);
  }
  if(DATA.target_value){
    SetValue("target_value",DATA.target_value);
  }
  if(DATA.outside_leakage_current){
    SetValue("outside_leakage_current",DATA.outside_leakage_current);
  }
  if(DATA.inside_leakage_current){
    SetValue("inside_leakage_current",DATA.inside_leakage_current);
  }
  if(DATA.aging_voltage){
    SetValue("aging_voltage",DATA.aging_voltage);
  }
  if(DATA.aging_time){
    SetValue("aging_time",DATA.aging_time);
  }
  if(DATA.aging_temperature){
    SetValue("aging_temperature",DATA.aging_temperature);
  }
  if(DATA.aging_comment){
    SetValue("aging_comment",DATA.aging_comment);
  }
  if(DATA.impregnation_comment){
    SetValue("impregnation_comment",DATA.impregnation_comment);
  }
  if(DATA.capacitance_tolerance_level_inside){
    var tolerance = DATA.capacitance_tolerance_level_inside.match(/([-0-9]+),([-0-9]+)/);
    if(tolerance){
      SetValue("capacitance_tolerance_level_inside.minus",parseFloat(tolerance[1]));
      SetValue("capacitance_tolerance_level_inside.plus",parseFloat(tolerance[2]));
    }
  }
  if(DATA.infiltration_rate){
    SetValue("infiltration_rate",DATA.infiltration_rate);
  }
  if(DATA.target_value){
    SetValue("target_value",DATA.target_value);
  }
  if(DATA.core_diameter){
    SetValue("core_diameter",DATA.core_diameter);
  }
  if(DATA.type){
    SetValue("type",DATA.type);
  }
  if(DATA.total_thickness_correction_factor){
    SetValue("total_thickness_correction_factor",DATA.total_thickness_correction_factor);
  }
  if(DATA.author){
    SetValue("author",DATA.author);
  }
  if(DATA.creation_day){
    SetValue("creation_day",DATA.creation_day);
  }
  if(DATA.author_comment){
    SetValue("author_comment",DATA.author_comment);
  }
  if(DATA.verifier){
    SetValue("verifier",DATA.verifier);
  }
  if(DATA.verification_day){
    SetValue("verification_day",DATA.verification_day);
  }
  if(DATA.verifier_comment){
    SetValue("verifier_comment",DATA.verifier_comment);
  }
  if(DATA.approver){
    SetValue("approver",DATA.approver);
  }
  if(DATA.approval_day){
    SetValue("approval_day",DATA.approval_day);
  }
  if(DATA.approver_comment){
    SetValue("approver_comment",DATA.approver_comment);
  }
  if(DATA.anomaly){
    DATA.anomaly.map((val:any,index:number)=>{
      SetValue(`Anomaly.${index}.name`,val.name);
      SetValue(`Anomaly.${index}.element`,val.element);
      SetValue(`Anomaly.${index}.value`,val.value);
      return ""
    });
  }
  if(DATA.approval){
    DATA.approval.map((val:any,index:number)=>{
      SetValue(`approval.${index}.action`,val.action);
      SetValue(`approval.${index}.name`,val.name);
      SetValue(`approval.${index}.code`,val.code);
      SetValue(`approval.${index}.days`,val.days);
      SetValue(`approval.${index}.comment`,val.comment);
      return ""
    });
  }
  //製作作業票
  if(DATA.progress){
    SetValue("Progress",DATA.progress);
  }
}

export const DataSetCalculation = (data:any,SetValue:any) => {
  if('product' in data){
    if('series' in data.product){
      SetValue("Product.series",data.product.series);
    }
    if('breed' in data.product){
      SetValue("Product.breed",data.product.breed);
    }
    if('capacitance' in data.product){
      SetValue("Product.capacitance",data.product.capacitance);
    }
    if('capacitance_tolerance_level_outside' in data.product){
      SetValue("Product.capacitance_tolerance_level_outside.minus",data.product.capacitance_tolerance_level_outside.minus);
      SetValue("Product.capacitance_tolerance_level_outside.plus",data.product.capacitance_tolerance_level_outside.plus);
    }
    if('voltage' in data.product){
      SetValue("Product.voltage",data.product.voltage);
    }
    if('machining' in data.product){
      SetValue("Product.machining",data.product.machining);
    }
    if('error' in data.product){
      SetValue("Product.error",data.product.error);
    }
    else{
      SetValue("Product.error",undefined);
    }
    if('ToleranceSpecial' in data.product){
      SetValue("Product.tolerance_special",true);
    }
    else{
      SetValue("Product.tolerance_special",false);
    }
    if('type' in data.product){
      SetValue("type",data.product.type);
    }
    SetValue("Product.code",data.product.code);
  }
  if('assembly' in data){
    if('l_dimension' in data.assembly){
      SetValue("Assembly.l_dimension",data.assembly.l_dimension);
    }
    if('diameter' in data.assembly){
      SetValue("Assembly.diameter",data.assembly.diameter);
    }
    if('error' in data.assembly){
      SetValue("Assembly.error",data.assembly.error);
    }
    else{
      SetValue("Assembly.error",undefined);
    }
    if('special' in data.assembly){
      SetValue("Assembly.special",data.assembly.special);
    }
    else{
      SetValue("Assembly.special",undefined);
    }
    if('type' in data.assembly){
      SetValue("type",data.assembly.type);
    }
    SetValue("Assembly.code",data.assembly.code);
  }
  if('total_thickness' in data){
    SetValue("TotalThickness",data.total_thickness);
  }
  if('new_dessign' in data){
    SetValue(`dessign`,data.new_dessign);
  }
  if('cotoff_factor' in data){
    SetValue("CutoffFactor",data.cotoff_factor);
  }
  if('device_diameter' in data){
    SetValue("device_diameter",data.device_diameter);
  }
  if('core_diameter' in data){
    SetValue("core_diameter",data.core_diameter);
  }
  for(var error of ErrorList){
    if(error in data){
      SetValue(error,data[error]);
    }
    else{
      SetValue(error,undefined);
    }
  }
  if('parts' in data){
    var i = 0;
    var j = 0;
    for(var parts of ports.parts){
      for(var row of data.parts){
        if(parts.label === row.name){
          SetValue(`Select.${j}`,row.name);
          j++;
          if(row.table_name){
            SetValue(`parts.${i}.table_name`,row.table_name);
          }
          else{
            SetValue(`parts.${i}.table_name`,parts.code);
          }
          if(row.name){
            SetValue(`parts.${i}.name`,row.name);
          }
          if(row.code){
            SetValue(`parts.${i}.code`,row.code);
          }
          if(row.range){
            SetValue(`parts.${i}.range`, row.range);
          }
          if(row.length){
            SetValue(`parts.${i}.length`, row.length);
            
          }
          if(row.quantity){
            SetValue(`parts.${i}.quantity`, row.quantity);
            
          }
          if(row.thickness){
            SetValue(`parts.${i}.thickness`, row.thickness);
          }
          if(row.weight){
            SetValue(`parts.${i}.weight`, row.weight);
          }
          if(row.error){
            SetValue(`parts.${i}.error`,row.error);
          }
          else{
            SetValue(`parts.${i}.error`,undefined);
          }
          if(row.cost_attention){
            SetValue(`parts.${i}.cost_attention`,row.cost_attention);
          }
          else{
            SetValue(`parts.${i}.cost_attention`,undefined);
          }
          if(row.capacitance_attention){
            SetValue(`parts.${i}.capacitance_attention`,row.capacitance_attention);
          }
          else{
            SetValue(`parts.${i}.capacitance_attention`,undefined);
          }
          if(row.image_code){
            SetValue(`image_code`,row.image_code);
          }
          if(row.name === '外チューブ' && !row.back1 && !row.back2 && !row.back3){
            SetValue(`parts.${TubeIndex}.soko_display`,true);
          }
          if(row.min_capacitance){
            SetValue(`parts.${i}.capacitance`, row.min_capacitance);
          }
          if(row.material_properties){
            SetValue(`parts.${i}.material_properties`, row.material_properties);
          }
          SetValue(`parts.${i}.back1`,row.back1);
          SetValue(`parts.${i}.back2`,row.back2);
          SetValue(`parts.${i}.back3`,row.back3);
          SetValue(`parts.${i}.fold_diameter`,row.fold_diameter);
          SetValue(`parts.${i}.area`, row.area);
          SetValue(`parts.${i}.cost`,row.cost);
        }
      }
      i++
    }
  }
  if('Picture' in data){
    if(data.Picture.image_base64){
      SetValue(`Picture.SetPic`,data.Picture.image_base64);
    }
    if(data.Picture.image_base64_2){
      SetValue(`Picture.ViewPic`,data.Picture.image_base64_2);
    }
    if(data.Picture.width){
      SetValue(`Picture.width`,data.Picture.width);
    }
    if(data.Picture.height){
      SetValue(`Picture.height`,data.Picture.height);
    }
    if(data.Picture.code){
      SetValue(`Picture.code`, data.Picture.code);
    }
    if(data.Picture.color){
      SetValue(`Picture.color`, data.Picture.color);
    }
    if(data.Picture.text_color){
      SetValue(`Picture.text_color`,data.Picture.text_color);
    }
    if(data.Picture.angle){
      SetValue(`Picture.angle`,data.Picture.angle);
    }
    if(data.Picture.description){
      SetValue(`Picture.description`,data.Picture.description);
    }
    if(data.Picture.display){
      var k = 0;
      var ki = 0;
      var PicOptions:OptionType[]|null|undefined = []
      for(var row3 of col){
        for(var row2 of data.Picture.display){
          if(row3.label === row2.name){
            PicOptions[ki] = row2.name
            SetValue(`Picture.display.${k}.name`,row2.name);
            SetValue(`Picture.display.${k}.vertical`,row2.vertical);
            SetValue(`Picture.display.${k}.horizon`,row2.horizon);
            SetValue(`Picture.display.${k}.after`,row2.after);
            SetValue(`Picture.display.${k}.before`,row2.before);
            ki++
          }
        }
        k++
      }
      SetValue(`PictureSelect`,PicOptions);
    }
    for(row of TubeErrorList){
      if(data.Picture[row]){
        SetValue(`Picture.${row}`,data.Picture[row]);
      }
      else{
        SetValue(`Picture.${row}`,undefined);
      }
    }
  }
  if('machining' in data){
    if(`description` in data.machining){
      SetValue("MachiningMethod",data.machining.description);
    }
    if('code' in data.machining){
      SetValue(`MachiningCode`,data.machining.code);
    }
  }
}

export const DataSet = (data:any,DATA:any,SetValue:any) =>{
  DataSetConstant(DATA,SetValue);
  DataSetCalculation(data,SetValue);
}
