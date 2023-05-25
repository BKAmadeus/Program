//加締・巻取時に使用する部材とその入力欄一覧
export const WindingList ={
  all:['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','電解紙4','保護紙','保護箔','素子止めテープ','+リードタブ','-リードタブ','+リード棒','-リード棒'],
  range:['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','電解紙4','保護紙','保護箔','素子止めテープ','+リードタブ','-リードタブ'],
  range_input:['陽極箔','陰極箔','電解紙','+リードタブ','保護紙','-リードタブ','素子止めテープ'],
  thickness:['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','電解紙4','保護紙','保護箔','+リードタブ','-リードタブ'],
  length:['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','電解紙4','保護紙','保護箔','素子止めテープ','+リードタブ','-リードタブ'],
  weight:['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','電解紙4','保護箔'],
  area:['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','電解紙4','保護箔'],
  capacitance:['陽極箔','陰極箔'],
  cost:['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','電解紙4','保護紙','保護箔','素子止めテープ','+リードタブ','-リードタブ','+リード棒','-リード棒']
}

export const CodeRangeSearch = ['電解紙','電解紙2','電解紙3','電解紙4','+リードタブ','-リードタブ','素子止めテープ'];
//部材(含浸、組立)の中で重量で指定するもの
export const Weight_BZI = ['電解液','素子固定材'];
//含浸、組立の部材の中で扱いが異なるもの
export const TubeList = {
  all:['外チューブ','中チューブ','内チューブ','底板'],
  fold_diameter:['外チューブ'],
  thickness:['外チューブ'],
  length:['外チューブ'],
  color:['外チューブ','中チューブ','内チューブ'],
  text_color:['外チューブ'],
  material_properties:['外チューブ'],
  cost:['外チューブ','中チューブ','内チューブ','底板']
}
//エージングでの使用部材
export const AgingList = ["梱包箱"];
//初期の部材データ(どの製品にも必ず入る部材)
export const init_BZI = ['陽極箔','陰極箔','電解紙','電解紙2','素子止めテープ','電解液','外チューブ','ケース','梱包箱'];
export const Assembly_init_BZI = ['陽極箔','陰極箔','電解紙','素子止めテープ','外チューブ','ケース'];

//組立形式の設定内に部材コードでは入らない物
export const AssemblyNotCode = ['陽極箔','陰極箔','電解紙','電解紙2','電解紙3','電解紙4','素子止めテープ','+リードタブ','-リードタブ','外チューブ'];
//加工コードのテーブルの中のデータとしてチェックする必要がない物
export const MachiningRideArray = ["f","l","p","deformation_p","inflexion_point","protrusion","after_protrusion"];
export const MachiningTapingArray = ["fai_d","p","p0","p1","p2","f","h","h0","w","w0","fai_d0","t","k","delta_h","delta_h1","w1","w2","h1","liter","l"];
export const MachiningLFormingArray = ["fai_d","p","p0","p1","p2","f","h","h0","w","w0","fai_d0","t","k"];

//データチェック例外以外の一覧(例外例:許容差capacitance_tolerance_level_outside、チューブ表示画面display、部材名:parts.${i}.name等)
export const Caluculation = {
  Data:["new_dessign","dessign","outside_leakage_current","LeakCurrentCheck","InfiltrationRateCheck"],
  Data_num:["total_thickness","cotoff_factor","device_diameter","device_length","core_diameter","inside_leakage_current","pre_wind_length","infiltration_rate"],
  Error:['aging_voltage_Error','aging_time_Error','aging_current_Error','aging_temperature_Error','classification_Error','capacitance_tolerance_level_inside_Error',
  'infiltration_rate_Error','pre_wind_length_Error','total_thickness_correction_factor_Error','capacitance_Error','search_number_Error','size_Error','parts_Error','destination_Error',
  'dessign_Error','pic_Error','l_dimension_Error','diameter_Error','device_diameter_Error',"device_length_Error",'target_value_Error',
  'leakage_current_Error','gauge_number_Error','finish_guid_Error',
  'inclusion_guid_Error','winding_guid_Error','core_diameter_Error'],
  parts:{
    Rows:["name","code","image_code","display_code","CapacitanceSpecial","material_properties","back1","back2","back3","area","color","text_color","alternative_codes"],
    Rows_num:["range","length","quantity","thickness","weight","capacitance","fold_diameter","cost"],
    Error:["error","cost_attention","capacitance_attention"],
    Picture:["type","series","tolerance"],
    Picture_num:["capacitance","voltage"]
  },
  product:{
    Rows:["code","series","breed","capacitanceSpecial","machining","type","tolerance_special"],
    Rows_num:["capacitance","voltage"],
    Error:["error"]
  },
  assembly:{
    Rows:["code","type","special"],
    Rows_num:["l_dimension","diameter"],
    Error:["error"]
  },
  picture:{
    Rows:["code","SetPic","ViewPic","description"],
    Rows_num:["width","height","angle"],
    Error:['code_error',"description_error","angle_error","color_error","text_color_error","SetPic_error","ViewPic_error","width_error","height_error","display_error"]
  },
  machining:{
    Rows:["description","code","guid"]
  },
  winding:{
    Rows:["full_length_plus","full_length_minus","los_plus","los_minus","thickness_plus","thickness_minus","petal_shape_plus","petal_shape_minus","contact_resistance_plus","contact_resistance_minus","swage_plus","swage_minus","g","p","diameter"],
    parts:["name","code","lot","length","thickness","quantity","range"]
  }
}

export const Constant = {
  Rows:["deadline","machining_guid","winding_machine","classification","dessign","winding_guid","inclusion_guid","finish_guid","gauge_number",
  "search_number","destination","dessign","aging_comment","impregnation_comment","type","progress"],
  Rows_num:["id","inside_dcr","outside_dcr","inside_esr","outside_esr","target_value","device_length","outside_leakage_current","inside_leakage_current",
  "aging_voltage","aging_time","aging_current","aging_temperature","infiltration_rate","core_diameter","total_thickness_correction_factor","wind_shift_top","wind_shift_under"],
  approval:["action","name","code","days","comment"],
  anomaly:["name","element","value"]
}

//組立形式用幅リスト
export const AssemblyFixation ={
  '陽極箔':[7,7.5,9,10,11,12,12.5,13,14,15,15.6,16,17,18,20,21,21.6,22,23,24,25,26,28,29,30,31,32,33,34.25,35,36,37,38,39,40,41,42,43,44,45,46,48,49,51,53,56,60,68.5,72,76,80,84,88,90,96,102,105,110,116,120,126,130,140,148,150,160,170,180,190,200,210,220,230,240],
  '陰極箔':[7,7.5,9,10,11,12,12.5,13,14,15,15.6,16,17,18,20,21,21.6,22,23,24,25,26,28,29,30,31,32,33,34.25,35,36,37,38,39,40,41,42,43,44,45,46,48,49,50,51,52,53,56,57,60,63,64,68.5,72,76,78,80,84,88,90,92,93,96,100,101,102,110,115,116,120,124,125,126,130,135,137,140,145,148,155,160,165,170,174,175,180,185,190,195,200,204,210,220,225,240,245],
  '素子止めテープ':[5,10,20,25],
  core_diameter:[5,6,8,8.5,9,9.5,10,12,13,16,18,27.4,30,32,33]
}

export const col = [
  {code:`text`,label:"文字1"},
  {code:`text`,label:"文字2"},
  {code:`text`,label:"文字3"},
  {code:`text`,label:"文字4"},
  {code:`text`,label:"文字5"},
  {code:`text`,label:"文字6"},
  {code:`Picture.capacitance`,label:"静電容量"},
  {code:`Picture.voltage`,label:"定格電圧"},
  {code:`Picture.series`,label:"シリーズ"},
  {code:`Picture.series`,label:"シリーズ2"},
  {code:`Picture.tolerance`,label:"容量許容差"},
]

//ロット番号変換正規表現
//export const re = /\d{2}(\d{2})-(\d{2})-(\d{2}).*/
//export const re2 = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).*/
export const CapacitanceToleranceLevelInside = /\[([0-9.-]+),([0-9.-]+)\]/
export const re_dessign = /設番:(.*)/u

//仕様区分
export const ClassificationList = ["量産","サンプル","試作","見積"];
//同一課内照査可能役職
export const VerificationList = ["係長"];
//同一課内照査可能役職
export const ApprovalList = ["課長"];
//課外承認可能役職
export const ApprovalList2 = ["副センター長"];
//all可能役職
export const AllAuthorityList = ["システム管理者"];

export const WindingMachine = [
  {value:'バートン',label:'バートン'},
  {value:'バートンマルチ',label:'バートンマルチ'},
  {value:'カイドウ',label:'カイドウ'}
]

export type FormProps = {
  //製作作業票データ
  progress:number;
  Base:boolean[];
  Equipment: string;
  StartTime?: Date;
  EndTime: Date;
  deadline:Date;
  //組立形式用データ
  id:number;
  //検索結果
  CheckCode:string;
  CheckDessign:string;
  //巻取時必要データ群(製作作業票)
  winding_machine:string;
  winding_close:boolean;
  CaulkingAndWinding:{
    //加締
    full_length_plus:number;
    full_length_minus:number;
    los_plus:number;
    los_minus:number;
    thickness_plus:number;
    thickness_minus:number;
    petal_shape_plus:string;
    petal_shape_minus:string;
    contact_resistance_plus:number;
    contact_resistance_minus:number;
    swage_plus:number|null;
    swage_minus:number|null;
    //巻取
    g:number;
    p:number;
    diameter:number;
    short_check:boolean;
    internal_state:boolean;
    appearance:boolean;
  }[];
  WindingError:{
    windingquantity:string;
    rubberquantity:string;
    number:number;
  }[];
  WindingQuantity:number;
  //ここから製品仕様書設定領域
  classification: string;
  destination: string;
  search_number: number;
  dessign: string;
  dessign_: string|null;
  DessignOld: string;
  winding_guid: string;
  inclusion_guid: string;
  finish_guid: string;
  gauge_number: number;
  capacitance_tolerance_level_inside:{
    plus:number;
    minus:number;
  };
  Product:{
    code:string;
    series:string|null;
    breed:string;
    capacitance:number;
    capacitanceSpecial:boolean;
    voltage:number;
    type: string;
    capacitance_tolerance_level_outside:{
      plus:number;
      minus:number;
    };
    tolerance_special?:boolean;
    machining:string;
    error:string;
  };
  Machining:{
    description:string;
    code:string;
    guid:string;
  }
  Assembly:{
    code:string;
    diameter:number;
    l_dimension:number;
    type: string;
    special?:string;
    error?:string;
  }
  LeakCurrentCheck:boolean;
  outside_leakage_current: number;
  inside_leakage_current: number;
  aging_voltage: number;
  aging_time: number;
  aging_current: number;
  aging_temperature: number;
  aging_comment: string;
  outside_dcr:number;
  inside_dcr:number;
  outside_esr:number;
  inside_esr:number;
  InfiltrationRateCheck:boolean;
  infiltration_rate: number;
  target_value: number;
  cotoff_factor: number;
  core_diameter?: number;
  total_thickness_correction_factor: number;
  total_thickness: number;
  device_diameter:number;
  //巻きズラシと先巻長さ等
  device_length:number;
  pre_wind_length:number;
  wind_shift_check:boolean;
  wind_shift:number;
  wind_shift_top:number;
  wind_shift_under:number;
  wind_shift_check2:boolean;
  wind_shift_range:{
    plus:number;
    minus:number;
  };
  wind_shift_range2:{
    plus:number;
    minus:number;
  };
  parts :{
    //製作作業票テーブル
    lot_number?:string;
    check?:boolean;
    default_code?:string;
    //製品仕様書項目
    table_name:string;
    name:string;
    code?:string;
    range?:number;
    length?:number;
    quantity?:number;
    thickness?:number;
    weight?:number;
    area?:number;
    fold_diameter?:number;
    back1?:string;
    back2?:string;
    back3?:string;
    capacitance?:number;
    CapacitanceSpecial:boolean;
    cost?:number;
    error?:string;
    capacitance_attention?:string;
    cost_attention?:string;
    anomaly?:boolean;
    soko_display?:boolean;
    material_properties?:string;
    color?:number[];
    text_color?:number[];
    display_code?:string;
    //製作作業票
    alternative_codes:string[];
  }[]
  Picture :{
    angle:number;
    code:string;
    description:string;
    display?:{
      name?: string;
      vertical: number;
      horizon: number;
      after?: string;
      before?: string;
    }[];
    image_code: string;
    SetPic: any;
    ViewPic: any;
    width: number;
    height: number;
    soko_display?:boolean;
    capacitance:number;
    capacitance_set:number;
    capacitance_cul:number;
    voltage:number;
    series:string;
    temperature:number;
    tolerance:string;
    type:string;
    //エラー表示用
    code_error?:string;
    description_error?:string;
    angle_error?:number;
    color_error?:string;
    text_color_error?:string;
    SetPic_error?:string;
    ViewPic_error?:string;
    width_error?:string;
    height_error?:string;
    display_error?:string;
  }
  Anomaly :{
    name: string;
    element:string;
    value:string;
  }[]
  approval:{
    action:string;
    name:string;
    code:string;
    days:string;
    comment:string;
    post:string;
    affiliations:string;
  }[]
  PictureSelect?:string[]|null;
  widthPic: number;
  Select?:string[]|null;
  WorkSelect?:string[]|null;
  //計算エラーなど
  dessign_Error?:string;
  capacitance_Error?:string;
  parts_Error?:string;
  size_Error?:string;
  //エラーstart
  //設計者が決める物で入っていないと問題なもの
  device_length_Error?:number;
  capacitance_tolerance_level_inside_Error?:string;
  classification_Error?:string;
  destination_Error?:string;
  target_value_Error?:string;
  leakage_current_Error?:string;
  total_thickness_correction_factor_Error?:string;
  pre_wind_length_Error?:string;
  infiltration_rate_Error?:string;
  gauge_number_Error?:string;
  finish_guid_Error?:string;
  inclusion_guid_Error?:string;
  winding_guid_Error?:string;
  core_diameter_Error?:string;
  aging_voltage_Error?: string;
  aging_time_Error?: string;
  aging_current_Error?:string;
  aging_temperature_Error?: string;
  //組立形式用エラー
  device_diameter_Error?:string;
  pic_Error?:string;
  search_number_Error?:string;
  l_dimension_Error?:string;
  diameter_Error?:string;
  //エラーend
  impregnation_comment:string;
  autor_comment:string;
};

export const ports = {
    select:[
      {value:'product', label:'製品リスト'},
      {value:'assembly', label:'組立形式'},
      {value:'display', label:'チューブ表示'},
      {value:'ae', label:'EDLC電極箔'},
      {value:'ap', label:'陽極箔'},
      {value:'an', label:'陰極箔・保護箔'},
      {value:'bl', label:'電解紙'},
      {value:'pj', label:'保護紙'},
      {value:'db', label:'ケース'},
      {value:'pq', label:'素子止めテープ'},
      {value:'lb', label:'リードタブ・棒'},
      {value:'ld', label:'リード棒'},
      {value:'du', label:'端子板'},
      {value:'dg', label:'電解液'},
      {value:'gk', label:'素子固定材'},
      {value:'gj', label:'モールド端子板'},
      {value:'de', label:'ゴムパッキング'},
      {value:'dj', label:'圧力弁・ロックワッシャ'},
      {value:'dn', label:'ワッシャ'},
      {value:'dq', label:'バンド・ナイロンワッシャ・ナイロンナット'},
      {value:'ma', label:'ボルト'},
      {value:'ge', label:'チューブ'},
      {value:'gl', label:'底板'},
      {value:'pa', label:'梱包箱'},
      {value:'tube_fold_diameter', label:'チューブ折径データ'}
      ],
    parts:[
      {code:'ap', label:'陽極箔',flg:0, code2:'ae'},
      {code:'an', label:'陰極箔',flg:0, code2:'ae'},
      {code:'bl', label:'電解紙',flg:1},
      {code:'bl', label:'電解紙2',flg:1},
      {code:'bl', label:'電解紙3',flg:1},
      {code:'bl', label:'電解紙4',flg:1},
      {code:'pj', label:'保護紙',flg:1},
      {code:'an', label:'保護箔',flg:1},
      {code:'pq', label:'素子止めテープ',flg:1},
      {code:'lb', label:'+リードタブ',flg:1},
      {code:'lb', label:'-リードタブ',flg:1},
      {code:'ld', label:'+リード棒',flg:1},
      {code:'ld', label:'-リード棒',flg:1},
      {code:'dg', label:'電解液',flg:4},
      {code:'db', label:'ケース',flg:4},
      {code:'du', label:'端子板',flg:4},
      {code:'gj', label:'モールド端子板',flg:4},
      {code:'de', label:'ゴムパッキング',flg:4},
      {code:'gk', label:'素子固定材',flg:4},
      {code:'dj', label:'圧力弁',flg:4},
      {code:'dn', label:'ワッシャ',flg:4},
      {code:'dj', label:'ロックワッシャ',flg:4},
      {code:'dq', label:'バンド',flg:4},
      {code:'ma', label:'ボルト',flg:4},
      {code:'dq', label:'ナイロンナット',flg:4},
      {code:'dq', label:'ナイロンワッシャ',flg:4},
      {code:'ge',label:'外チューブ',flg:2},
      {code:'ge',label:'中チューブ',flg:2},
      {code:'ge',label:'内チューブ',flg:2},
      {code:'gl',label:'底板',flg:3},
      {code:'pa',label:'梱包箱',flg:4}
    ],
    flg:1
};

export let TubeIndex:number;
export let SokoIndex:number;
export let PaperIndexs:number[] =[];
export let minusFoilIndexs:number[] =[];
ports.parts.map((val:any,index:number)=>{
  if(val.label === '外チューブ'){
    TubeIndex = index;
  }
  else if(val.label === '底板'){
    SokoIndex = index;
  }
  else if(val.label.indexOf('電解紙') !== -1){
    PaperIndexs.push(index);
  }
  else if(['陰極箔','保護箔'].includes(val.label)){
    minusFoilIndexs.push(index);
  }
  return ""
})

export const colorList = [
  {label:"黒色",value:[0,0,0]},
  {label:"グレー",value:[200,200,200]},
  {label:"シアン",value:[95,215,228]},
  {label:"水色",value:[0,120,180]},
  {label:"金色",value:[212,175,55]},
  {label:"緑色",value:[0,100,0]}
]

export const orientation = [
  {label:"上",value:0},
  {label:"右",value:90},
  {label:"下",value:180},
  {label:"左",value:270}
]

//権限がいるページ
export const HeaderProductApproval = ['組立形式承認','製品仕様書承認','チューブ表示承認'];
//メニュー画面
export const PageMove = [
  {name:"ホーム画面",url:"/"},
  {name:"組立形式",url:"/Simplification"},
  {name:"組立形式承認",url:"/SimplificationApproval"},
  {name:"製品仕様書",url:"/CreateProduct"},
  {name:"製品仕様書承認",url:"/ProductApproval"},
  {name:"生産計画",url:"/Schedule"},
  {name:"製作作業票",url:"/ProductWorkData"},
  {name:"チューブ表示作成",url:"/CreateTube"},
  {name:"チューブ表示承認",url:"/ApprovalTube"},
  {name:"カーリング測定",url:'/Curling'},
  {name:"検査",url:'/Examination'},
  {name:"マイページ",url:'/Mypage'},
]

//テーブルデータ
export type TableType = {
  page:number,
  data_quantity:number,
  open?:boolean[],
  check?:boolean[],
  table_index?:number[],
  all_check:boolean,
  reEffect:boolean,
  update?:boolean[],
  delete?:boolean[],
  add?:boolean[],
  sort:{
    key:string,
    esc:boolean
  },
  refinement?:{
    key:string,
    value:string|number
  }[]
}

export const defaultValues:TableType = {
  data_quantity:100,
  page:1,
  reEffect:false,
  all_check:false,
  sort: {
    key:"id",
    esc:false
  },
  refinement:[]
}

export const SeriesList = ["JJC","JUC","JEC","JJD","JJL","JUM","JUW","JUK","JUA","JUH","LAB","LAD","LAK","LAQ","LAR","LAS","LDA","LDK","LDL","LDM","LDP","LDQ","LDX","LDZ","LEV","LGC","LGE","LGF","LGG","LGH","LGJ","LGK","LGL","LGM","LGN","LGP","LGQ","LGR","LGS","LGT","LGU","LGW","LGX","LGY","LGZ","LHB","LHG","LHS","LHT","LHX","LIN","LJP","LKD","LKG","LKS","LKX","LLG","LLK","LLL","LLN","LLQ","LLR","LLS","LLU","LLW","LMK","LMS","LNC","LNJ","LNK","LNQ","LNR","LNS","LNT","LNU","LNW","LNX","LNY","LNZ","LPK","LPL","LPN","LPP","LQA","LQB","LQE","LQR","LQS","LSB","LSG","LSS","LVY","LWA"]
export const DessignList = ["J","AY","AM","AK","AD","AB","AG","AT","AL","AZ","AS","AH","AE","AC","AA","AW","AN","BY","BM","BK","BD","BB","BG","BT","BL","BZ","BS","BH","BE","BC","BA","BW","BN","HY","HM","HK","HD","HB","HG","HT","HL","HZ","HS","HH","HE","HC","HA","HW","HN"];


/*

export const Classification = [
  {value:'シングル',label:'シングル'},
  {value:'マルチ',label:'マルチ・分割'}
]

export const ProtectionExplosion = [
  {value:'ケース',label:'ケース'},
  {value:'ゴム',label:'ゴム'}
]

//export const PlusFoilRangeList = [7,7.5,9,10,11,12,12.5,13,14,15,15.6,16,17,18,20,21,21.6,22,23,24,25,26,28,29,30,31,32,33,34.25,35,36,37,38,39,40,41,42,43,44,45,46,48,49,51,53,56,60,68.5,72,76,80,84,88,90,96,102,105,110,116,120,126,130,140,148,150,160,170,180,190,200,210,220,230,240];
//export const MinusFoilRangeList = [7,7.5,9,10,11,12,12.5,13,14,15,15.6,16,17,18,20,21,21.6,22,23,24,25,26,28,29,30,31,32,33,34.25,35,36,37,38,39,40,41,42,43,44,45,46,48,49,50,51,52,53,56,57,60,63,64,68.5,72,76,78,80,84,88,90,92,93,96,100,101,102,110,115,116,120,124,125,126,130,135,137,140,145,148,155,160,165,170,174,175,180,185,190,195,200,204,210,220,225,240,245];
//export const DeviceStopRangeList = [5,10,20,25];
//export const CoreDiameterList = [5,6,8,8.5,9,9.5,10,12,13,16,18,27.4,30,32,33];
*/