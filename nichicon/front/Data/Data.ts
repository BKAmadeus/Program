
//含浸組立仕上で使用する部材で形式が異なるもの
export const Tube_List = ['外チューブ','中チューブ','内チューブ','底板'];
//加締め・巻取で使用する部材
//export const Tightening_Winding_List = ['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙','素子止めテープ','+タブ','-タブ','+リード','-リード'];
export const AgingList = ["梱包1","梱包2","梱包3","梱包4","梱包5"];
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

export const WindingList ={
  all:['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙','素子止めテープ','+タブ','-タブ','+リード','-リード'],
  range:['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙','素子止めテープ','+タブ','-タブ'],
  thickness:['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙','+タブ','-タブ'],
  length:['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙','素子止めテープ','+タブ','-タブ'],
  weight:['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙'],
  area:['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙'],
  capacitance:['陽極箔','陰極箔'],
  cost:['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙','素子止めテープ','+タブ','-タブ','+リード','-リード']
}

//初期の部材データ(どの製品にも必ず入る部材なので)
export const init_BZI = ['陽極箔','陰極箔','電解紙','素子止めテープ','電解液','外チューブ','ケース','梱包1'];
export const Assembly_init_BZI = ['陽極箔','陰極箔','電解紙','素子止めテープ','外チューブ','ケース'];
//部材(含浸、組立)の中で重量で指定するもの
export const Weight_BZI = ['電解液','素子固定材'];
//組立形式の設定内に部材コードでは入らない物
export const AssemblyNotCode = ['陽極箔','陰極箔','電解紙','電解紙2','耐圧紙','素子止めテープ','+タブ','-タブ','外チューブ'];
//加工コードのテーブルの中のデータとしてチェックする必要がない物
export const MachiningRideArray = ["f","l","p","deformation_p","inflexion_point","protrusion","after_protrusion"];
export const MachiningTapingArray = ["fai_d","p","p0","p1","p2","f","h","h0","w","w0","fai_d0","t","k","delta_h","delta_h1","w1","w2","h1","liter","l"];
export const MachiningLFormingArray = ["fai_d","p","p0","p1","p2","f","h","h0","w","w0","fai_d0","t","k"];
//製品仕様書のエラーリスト
export const ErrorList = ['aging_voltage_Error','aging_time_Error','aging_temperature_Error','classification_Error','infiltration_rate_Error','total_thickness_correction_factor_Error','capacitance_Error','search_number_Error','size_Error','parts_Error','dessign_Error','pic_Error','l_dimension_Error','diameter_Error','device_diameter_Error','target_value_Error','outside_leakage_current_Error','capacitance_tolerance_level_outside_Error','gauge_number_Error','finish_guid_Error','inclusion_guid_Error','winding_guid_Error','core_diameter_Error'];
export const TubeErrorList = ['code_error',"description_error","angle_error","color_error","text_color_error","SetPic_error","ViewPic_error","width_error","height_error","display_error"];

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
  {code:`Product.capacitance`,label:"静電容量"},
  {code:`Product.voltage`,label:"定格電圧"},
  {code:`Product.series`,label:"シリーズ"},
  {code:`Product.series`,label:"シリーズ2"},
  {code:`Product.code`,label:"容量許容差"},
]

//ロット番号変換正規表現
export const re = /\d{2}(\d{2})-(\d{2})-(\d{2}).*/
export const re2 = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).*/
export const CapacitanceToleranceLevelInside = /\[([0-9.-]+),([0-9.-]+)\]/
export const re_dessign = /設番:(.*)/u
//コスト計算用のデータ(テーブルごとに固定)
export const area_List = ['ap'];
export const g_List = ['bl','lb','dg','gk'];
export const m_List = ['pq','ge'];

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

export type OptionType = {
    label?: string;
    code: string;
    available?: boolean;
    inputValue?: string;
};

export const WindingMachine = [
  {value:'バートン',label:'バートン'},
  {value:'バートンマルチ',label:'バートンマルチ'},
  {value:'カイドウ',label:'カイドウ'}
]

export type FormProps = {
  //製作作業票データ
  Progress:number;
  Base:boolean[];
  Equipment: string;
  StartTime?: Date;
  EndTime: Date;
  //組立形式用データ
  id:number;
  //検索結果
  CheckCode:string;
  CheckDessign:string;
  //巻取時必要データ群(製作作業票)
  winding_machine:string;
  CaulkingAndWinding_number:number;
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
  type: string;
  classification: string;
  destination: string;
  search_number: number;
  dessign: string;
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
    voltage:number;
    capacitance_tolerance_level_outside:{
      plus:number;
      minus:number;
    };
    tolerance_special:boolean;
    machining:string;
    error:string;
  };
  Assembly:{
    code:string;
    diameter:number;
    l_dimension:number;
    special?:string;
    error?:string;
  }
  outside_leakage_current: number;
  inside_leakage_current: number;
  MachiningCode: string;
  MachiningMethod: string;
  machining_guid: string;
  aging_voltage: number;
  aging_time: number;
  aging_temperature: number;
  aging_comment: string;
  outside_dcr:number;
  inside_dcr:number;
  outside_esr:number;
  inside_esr:number;
  infiltration_rate: number;
  target_value: number;
  CutoffFactor: number;
  core_diameter?: number;
  total_thickness_correction_factor: number;
  TotalThickness: number;
  device_diameter:number;
  parts :{
    //製作作業票テーブル
    lot_number:string;
    check:boolean;
    //製品仕様書項目
    table_name:string;
    name:string;
    code:string|null;
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
    cost?:number;
    error?:string;
    capacitance_attention?:string;
    cost_attention?:string;
    anomaly?:boolean;
    soko_display?:boolean;
    material_properties?:string;
  }[]
  Picture :{
    angle:number;
    code:string;
    color?:number[];
    text_color?:number[];
    Soko_color?:number[];
    Soko_text_color?:number[];
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
  FoilCapacitanceSpecial:boolean;
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
  //計算エラーなど
  dessign_Error?:string;
  capacitance_Error?:string;
  parts_Error?:string;
  size_Error?:string;
  //エラーstart
  //設計者が決める物で入っていないと問題なもの
  classification_Error?:string;
  target_value_Error?:string;
  outside_leakage_current_Error?:string;
  total_thickness_correction_factor_Error?:string;
  infiltration_rate_Error?:string;
  capacitance_tolerance_level_outside_Error?:string;
  gauge_number_Error?:string;
  finish_guid_Error?:string;
  inclusion_guid_Error?:string;
  winding_guid_Error?:string;
  core_diameter_Error?:string;
  aging_voltage_Error?: string;
  aging_time_Error?: string;
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
      {value:'ap', label:'箔'},
      {value:'bl', label:'電解紙'},
      {value:'db', label:'ケース'},
      {value:'pq', label:'素子止めテープ'},
      {value:'lb', label:'タブ'},
      {value:'du', label:'上打ち'},
      {value:'dg', label:'電解液'},
      {value:'gk', label:'素子固定材'},
      {value:'de', label:'封口ゴム'},
      {value:'gj', label:'端子板'},
      {value:'dj', label:'ゴムパッキング'},
      {value:'dj', label:'圧力弁'},
      {value:'ld', label:'リード'},
      {value:'dn', label:'ワッシャ'},
      {value:'mc', label:'ロックワッシャ'},
      {value:'dq', label:'バンド'},
      {value:'ma', label:'ボルト'},
      {value:'mb', label:'ナイロンナット'},
      {value:'ge',label:'外チューブ'},
      {value:'ge',label:'内チューブ'},
      {value:'gl',label:'底板'},
      {value:'pa',label:'梱包箱'}
      ],
    parts:[
      {code:'ap', label:'陽極箔',flg:0},
      {code:'ap', label:'陰極箔',flg:0},
      {code:'bl', label:'電解紙',flg:1},
      {code:'bl', label:'電解紙2',flg:1},
      {code:'bl', label:'耐圧紙',flg:1},
      {code:'pq', label:'素子止めテープ',flg:1},
      {code:'lb', label:'+タブ',flg:1},
      {code:'lb', label:'-タブ',flg:1},
      {code:'ld', label:'+リード',flg:1},
      {code:'ld', label:'-リード',flg:1},
      {code:'dg', label:'電解液',flg:4},
      {code:'db', label:'ケース',flg:4},
      {code:'du', label:'上打ち',flg:4},
      {code:'de', label:'封口ゴム',flg:4},
      {code:'gj', label:'端子板',flg:4},
      {code:'dj', label:'ゴムパッキング',flg:4},
      {code:'gk', label:'素子固定材',flg:4},
      {code:'dj', label:'圧力弁',flg:4},
      {code:'dn', label:'ワッシャ',flg:4},
      {code:'mc', label:'ロックワッシャ',flg:4},
      {code:'dq', label:'バンド',flg:4},
      {code:'ma', label:'ボルト',flg:4},
      {code:'mb', label:'ナイロンナット',flg:4},
      {code:'mc', label:'ナイロンワッシャ',flg:4},
      {code:'ge',label:'外チューブ',flg:2},
      {code:'ge',label:'中チューブ',flg:2},
      {code:'ge',label:'内チューブ',flg:2},
      {code:'gl',label:'底板',flg:3},
      {code:'pa',label:'梱包1',flg:4},
      {code:'pa',label:'梱包2',flg:4},
      {code:'pa',label:'梱包3',flg:4},
      {code:'pa',label:'梱包4',flg:4},
      {code:'pa',label:'梱包5',flg:4}
    ],
    flg:1
};

export let TubeIndex:number;
export let SokoIndex:number;
ports.parts.map((val:any,index:number)=>{
  if(val.label === '外チューブ'){
    TubeIndex = index;
  }
  else if(val.label === '底板'){
    SokoIndex = index;
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
export const HeaderProductApproval = ['組立形式承認','製品仕様承認'];
//メニュー画面
export const PageMove = [
  {name:"ホーム画面",url:"/"},
  {name:"組立形式",url:"/Simplification"},
  {name:"組立形式承認",url:"/SimplificationApproval"},
  {name:"製品仕様",url:"/CreateProduct"},
  {name:"製品仕様承認",url:"/ProductApproval"},
  {name:"生産計画",url:"/Schedule"},
  {name:"製作作業票",url:"/ProductWorkData"},
  {name:"チューブ表示作成",url:"/CreateTube"},
  {name:"チューブ表示承認",url:"/ApprovalTube"},
  {name:"再ログイン",url:"/Login"},
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