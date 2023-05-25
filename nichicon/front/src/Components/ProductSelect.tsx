
//reactのフォーム入力一斉送信用
import '../style.css';
import { col,ports,Assembly_init_BZI,init_BZI,TubeIndex,Caluculation,Constant,PaperIndexs } from "../Data/Data"
import {Hollow2} from './func';
export const Reset = (setValue:any,reset:any,resetField:any,watch:any,assembly:boolean=false) => {
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
  if(assembly){
    setValue(`Select`,Assembly_init_BZI);
  }
  else{
    setValue(`Select`,init_BZI);
    setValue(`wind_shift_range`,{plus:0.5,minus:-0.5});
    setValue(`wind_shift_range2`,{plus:0.4,minus:0});
  }
  setValue(`Picture.color`,[0,0,0]);
  setValue(`Picture.text_color`,[200,200,200]);
  setValue(`Picture.Soko_color`,[0,0,0]);
  setValue(`Picture.Soko_text_color`,[200,200,200]);
}

export const DataSetConstant = (DATA:any,SetValue:any,approval:boolean = true,work:boolean = false) => {
  for (var row of Constant.Rows){
    if(Hollow2(DATA[row])){
      SetValue(row,DATA[row]);
    }
  }
  for (row of Constant.Rows_num){
    if(Hollow2(DATA[row])){
      SetValue(row,parseFloat(DATA[row]));
    }
  }
  if(Hollow2(DATA.wind_shift_range)){
    console.log("wind_shift_range確認用",DATA.wind_shift_range);
    var shift = DATA.wind_shift_range.match(/([-0-9]+),([-0-9]+)/);
    console.log("wind_shift_range確認用",shift);
    SetValue(`wind_shift_range`,{minus:parseFloat(shift[1]),plus:parseFloat(shift[2])});
  }
  if(DATA.capacitance_tolerance_level_inside){
    var tolerance = DATA.capacitance_tolerance_level_inside.match(/([-0-9]+),([-0-9]+)/);
    if(tolerance){
      SetValue("capacitance_tolerance_level_inside.minus",parseFloat(tolerance[1]));
      SetValue("capacitance_tolerance_level_inside.plus",parseFloat(tolerance[2]));
    }
  }
  if(DATA.anomaly){
    DATA.anomaly.map((val:any,index:number)=>{
      Constant.anomaly.map((name:string)=>{
        if(val[name]){
          SetValue(`Anomaly.${index}.${name}`,val[name]);
        }
        return "";
      })
      return ""
    });
  }
  if(DATA.approval && approval){
    DATA.approval.map((val:any,index:number)=>{
      Constant.approval.map((name:string)=>{
        if(val[name]){
          SetValue(`approval.${index}.${name}`,val[name]);
        }
        return "";
      })
      return ""
    });
  }
  if(work){
    var i = 0;
    for(var parts of ports.parts){
      for(var row2 of DATA.parts){
        if(parts.label === row2.name){
          if(row2.code){
            SetValue(`parts.${i}.default_code`,row2.code);
          }
        }
      }
      i++;
    }
  }
}

export const DataSetCalculation = (data:any,SetValue:any,watch:any,pError:boolean = true,partsChange:boolean = true,assembly:boolean = false) => {
  if(data.product){
    for(var ProductRow of Caluculation.product.Rows){
      if(Hollow2(data.product[ProductRow])){
        SetValue(`Product.${ProductRow}`,data.product[ProductRow]);
      }
    }
    for(ProductRow of Caluculation.product.Rows_num){
      if(Hollow2(data.product[ProductRow])){
        SetValue(`Product.${ProductRow}`,parseFloat(data.product[ProductRow]));
      }
    }
    if(pError){
      for(var ProductError of Caluculation.product.Error){
        if(data.product[ProductError]){
          SetValue(`Product.${ProductError}`,data.product[ProductError]);
        }
        else{
          SetValue(`Product.${ProductError}`,undefined);
        }
      }
    }
    if('capacitance_tolerance_level_outside' in data.product){
      SetValue("Product.capacitance_tolerance_level_outside.minus",parseFloat(data.product.capacitance_tolerance_level_outside.minus));
      SetValue("Product.capacitance_tolerance_level_outside.plus",parseFloat(data.product.capacitance_tolerance_level_outside.plus));
      if(!watch(`capacitance_tolerance_level_inside.minus`) && !watch(`capacitance_tolerance_level_inside.plus`)){
        SetValue("capacitance_tolerance_level_inside.minus",parseFloat(data.product.capacitance_tolerance_level_outside.minus)+2);
        SetValue("capacitance_tolerance_level_inside.plus",parseFloat(data.product.capacitance_tolerance_level_outside.plus)-2);
      }
    }
  }
  if(data.assembly){
    for(var AssemblyRow of Caluculation.assembly.Rows){
      if(Hollow2(data.assembly[AssemblyRow])){
        SetValue(`Assembly.${AssemblyRow}`,data.assembly[AssemblyRow]);
      }
    }
    for(AssemblyRow of Caluculation.assembly.Rows_num){
      if(Hollow2(data.assembly[AssemblyRow])){
        SetValue(`Assembly.${AssemblyRow}`,parseFloat(data.assembly[AssemblyRow]));
      }
    }
    for(var AssemblytError of Caluculation.assembly.Error){
      if(data.assembly[AssemblytError]){
        SetValue(`Assembly.${AssemblytError}`,data.assembly[AssemblytError]);
      }
      else{
        SetValue(`Assembly.${AssemblytError}`,undefined);
      }
    }
  }
  if(data.parts){
    var i = 0;
    var j = 0;
    if(assembly && partsChange){
      SetValue(`Select`,Assembly_init_BZI);
      j=Assembly_init_BZI.length;
    }
    else if(partsChange){
      SetValue(`Select`,init_BZI);
      j=init_BZI.length;
    }
    for(var parts of ports.parts){
      for(var row of data.parts){
        if(parts.label === row.name){
          if(partsChange && ((assembly && !Assembly_init_BZI.includes(parts.label)) || (!assembly && !init_BZI.includes(parts.label)))){
            SetValue(`Select.${j}`,parts.label);
            j++;
          }
          //組立形式が正常化されたら問題なくなる
          if(row.table_name){
            SetValue(`parts.${i}.table_name`,row.table_name);
          }
          else{
            SetValue(`parts.${i}.table_name`,parts.code);
          }
          if(row.name === '陽極箔' && row.infiltration_rate){
            SetValue(`infiltration_rate`,row.infiltration_rate);
          }
          for(var partsName of Caluculation.parts.Rows){
            if(Hollow2(row[partsName])){
              SetValue(`parts.${i}.${partsName}`,row[partsName]);
            }
          }
          for(partsName of Caluculation.parts.Rows_num){
            if(Hollow2(row[partsName])){
              SetValue(`parts.${i}.${partsName}`,parseFloat(row[partsName]));
            }
          }
          for(var partsErrorName of Caluculation.parts.Error){
            
            if(row[partsErrorName]){
              SetValue(`parts.${i}.${partsErrorName}`,row[partsErrorName]);
            }
            else{
              SetValue(`parts.${i}.${partsErrorName}`,undefined);
            }
          }
          if(row.name === '外チューブ' && !row.back1 && !row.back2 && !row.back3){
            SetValue(`parts.${TubeIndex}.soko_display`,true);
          }
          if(row.name === '外チューブ'){
            for(var partsTube of Caluculation.parts.Picture){
              if(Hollow2(row[partsTube])){
                SetValue(`Picture.${partsTube}`,row[partsTube]);
              }
            }
            for(partsTube of Caluculation.parts.Picture_num){
              if(Hollow2(row[partsTube])){
                SetValue(`Picture.${partsTube}`,parseFloat(row[partsTube]));
              }
            }
          }
          if(row.name === '電解紙' && row.range){
            for(var range of PaperIndexs){
              SetValue(`parts.${range}.range`,row.range);
            }
          }
          //if(row.min_capacitance){
          //  SetValue(`parts.${i}.capacitance`,parseFloat(row.min_capacitance));
          //}
        }
      }
      i++
    }
  }
  for(var Row of Caluculation.Data){
    if(Hollow2(data[Row])){
      SetValue(`${Row}`,data[Row]);
    }
  }
  for(Row of Caluculation.Data_num){
    if(Hollow2(data[Row])){
      SetValue(`${Row}`,parseFloat(data[Row]));
    }
  }
  for(var error of Caluculation.Error){
    if(error in data){
      SetValue(error,data[error]);
    }
    else{
      SetValue(error,undefined);
    }
  }
  if(data.Picture){
    for(var PicRows of Caluculation.picture.Rows){
      if(Hollow2(data.Picture[PicRows])){
        SetValue(`Picture.${PicRows}`,data.Picture[PicRows]);
      }
    }
    for(PicRows of Caluculation.picture.Rows_num){
      if(Hollow2(data.Picture[PicRows])){
        SetValue(`Picture.${PicRows}`,parseFloat(data.Picture[PicRows]));
      }
    }
    if(data.Picture.display){
      var k = 0;
      var ki = 0;
      var PicOptions:any[] = []
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
    for(row of Caluculation.picture.Error){
      if(data.Picture[row]){
        SetValue(`Picture.${row}`,data.Picture[row]);
      }
      else{
        SetValue(`Picture.${row}`,undefined);
      }
    }
  }
  if(data.machining){
    for(var MachiningRows of Caluculation.machining.Rows){
      if(Hollow2(data.machining[MachiningRows])){
        SetValue(`Machining.${MachiningRows}`,data.machining[MachiningRows]);
      }
    }
  }
  //製作作業票データ
  if(data.winding){
    i = 0;
    for (var wind of data.winding){
      for (row of Caluculation.winding.Rows){
        if(Hollow2(wind[row])){
          SetValue(`CaulkingAndWinding.${i}.${row}`,wind[row]);
        }
      }
      if(data.winding.length === i){
        for(j = 0;j < data.winding[i].code.length;j++){

        }
      }
      if(data.winding[i].close === false || data.winding[i].close === true){
        SetValue(`winding_close`,data.winding[i].close);
      }
      i++;
    }
  }
}

export const DataSetFor = (data:any,SetValue:any,array:any = true) =>{
  for(var row in data){
    if(array === true){
      SetValue(row,data[row]);
    }
    else if(array.includes(row)){
      SetValue(row,data[row]);
    }
  }
}
