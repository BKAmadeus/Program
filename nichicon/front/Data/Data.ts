
//含浸組立仕上で使用する部材で形式が異なるもの
export const Tube_List = ['外チューブ','中チューブ','内チューブ','底板'];
//加締め・巻取で使用する部材
export const Tightening_Winding_List = ['陽極箔','陰極箔','電解紙','耐圧紙','素子止めテープ','+タブ','-タブ','+リード','-リード'];
//初期の部材データ(どの製品にも必ず入る部材なので)
export const init_BZI = ['陽極箔','陰極箔','電解紙','耐圧紙','素子止めテープ','電解液','外チューブ','ケース'];
//部材(含浸、組立)の中で重量で指定するもの
export const Weight_BZI = ['電解液','素子固定材'];

//チューブに入れるデータリスト
export const col = [
  {code:`text`,label:"文字1"},
  {code:`text`,label:"文字2"},
  {code:`text`,label:"文字3"},
  {code:`text`,label:"文字4"},
  {code:`text`,label:"文字5"},
  {code:`text`,label:"文字6"},
  {code:`Capacitance`,label:"静電容量"},
  {code:`RatedVoltage`,label:"定格電圧"},
  {code:`Series`,label:"シリーズ"},
  {code:`ProductNumber`,label:"容量許容差"},
]
//ロット番号変換正規表現
export const re = /\d{2}(\d{2})-(\d{2})-(\d{2}).*/
//コスト計算用のデータ(テーブルごとに固定)
export const area_List = ['ap'];
export const g_List = ['bl','lb','dg','gk'];
export const m_List = ['pq','ge'];

//仕様区分
export const ClassificationList = ["量産","試作","サンプル","見積"];
//同一課内照査可能役職
export const VerificationList = ["係長","課長"];
//同一課内照査可能役職
export const ApprovalList = ["課長"];
//all可能役職
export const AllAuthorityList = ["システム管理者","副センター長"];

export type OptionType = {
    label?: string;
    code: string;
    available?: boolean;
    inputValue?: string;
};

export type FormProps = {
  Search_button:boolean;
  Search_button2:boolean;
  Search_SearchNo:string;
  Search_ProductNumber:string;
  Search_Dessign:string;
  Search_RatedVoltage:string;
  Search_Capacitance:string;
  Search_Diameter:string;
  Search_LSize:string;
  Search_Series:string;
  Type: string;
  CapacitorType: string;
  Classification: string;
  Destination: string;
  Remarks: string;
  Remarks2: string;
  Search: number;
  ProductNumber: string;
  Capacitance: number;
  RatedVoltage: number;
  Dessign: string;
  DessignOld: string;
  WindingGuid: string;
  InclusionGuid: string;
  FinishGuid: string;
  Series: string;
  CapacityTolerance: {
    plus:number;
    minus:number
  };
  CapacityToleranceCo: {
    plus:number;
    minus:number
  };
  LeakageCurrent: number;
  LeakageCurrentCo: number;
  MachiningCode: string;
  MachiningMethod: string;
  MachiningGuidance: string;
  AppliedVoltage: number;
  AgingTime: number;
  AgingText: string;
  Temperature: number;
  AssembledForm: string;
  Diameter: number;
  LSize: number;
  DCR:number;
  DCRCo:number;
  ESR:number;
  ESRCo:number;
  PlusFoilCapacity: number;
  MinusFoilCapacity: number;
  ContentPercentage: number;
  TargetValue: number;
  CutoffFactor: number;
  CoreDiameter: number;
  TotalThicknessCorrectionFactor: number;
  TotalThickness: number;
  DeviceDiameter:number;
  Transform: number;
  Element :{
      table:string;
      name:string;
      code:string|null;
      color?:number[];
      text_color?:number[];
      range?:number;
      length?:number;
      quantity?:number;
      thickness?:number;
      weight?:number;
      area?:number;
      weightANDquantity?:number;
      FoldDiameter?:number;
      back1?:string;
      back2?:string;
      back3?:string;
      capacitance?:number;
      cost?:number;
      error?:string;
      capacitance_attention?:string;
      cost_attention?:string;
      display?:{
        name?: string;
        vertical: number;
        horizon: number;
        after?: string;
        before?: string;
      }[];
      soko_display?:boolean;
  }[]
  Picture :{
    name?: string;
    vertical: number;
    horizon: number;
    after?: string;
    before?: string;
  }[]
  Anomaly :{
    name: string,
    element:string,
    value:string
  }[]
  PictureSelect?:string[]|null;
  PicSave: boolean;
  special?: boolean;
  image_code: string;
  SetPic: any;
  ViewPic: any;
  widthPic: number;
  Select?:string[]|null;
  Sabmit:boolean;
  DessignError?:string;
  ProductError?:string;
  AssemblyError?:string;
  PartsError?:string;
  SizeError?:string;
  SearchNumberError?:string;
  PicError?:string;
  Special:boolean;
  ImpregnationText:string;
};

export const ports = {
    select:[
      {value:'product', label:'EDLC製品リスト'},
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
      {value:'gl',label:'底板'}
      ],
    parts:[
      {code:'ap', label:'陽極箔',flg:0},
      {code:'ap', label:'陰極箔',flg:0},
      {code:'bl', label:'電解紙',flg:1},
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
      {code:'ge',label:'外チューブ',flg:2},
      {code:'ge',label:'中チューブ',flg:2},
      {code:'ge',label:'内チューブ',flg:2},
      {code:'gl',label:'底板',flg:3}
    ],
    flg:1
  };
//現在何をしているかを表示するための言葉配列
export const steps = ['品番・組立形式の設定', '部材決定', '加締・巻取の項目','仕上、画像添付・コメントなど'];

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

//メニュー画面
export const PageMove = [
  {name:"ホーム画面",url:"/"},
  {name:"製品仕様設定",url:"/CreateProduct"},
  {name:"生産計画",url:"/Schedule"},
  {name:"製作作業票",url:"/ProductWorkData"},
  {name:"再ログイン",url:"/Login"},
  {name:"マイページ",url:'/Mypage'}
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
