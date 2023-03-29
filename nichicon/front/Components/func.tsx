//node.jsのPostgreSQLサーバアクセス用のプログラム
const url = 'https://10.5.1.35:3001';
//組立形式のφ径、L寸読み取り用正規表現
const fai_l = /[A-Z][A-Z](\d{2})(\d{2})[A-Z][A-Z][A-Z][A-Z][A-Z]\w?|[A-Z]{3}\d(\d{2,3}?)(\d{2,3})[A-Z]\w?|[A-Z]\w{2}[A-Z0-9+-](\d{2,3}?)(\d{2,3})[A-Z]\w?/;

export const postData = async (data: any) => {
  const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  return response.json();
}

export function Round(value:number|null|undefined, base:number=0) {
  if(value){
    return Math.round(value * (10**base)) / (10**base);
  }
  return null;
}

export const AssemblySelect = (data:any,setValue:any) => {
  if(data !== "" && data !== undefined && data !== null){
    var Fai_L = data.match(fai_l);
    if(Fai_L !== null){
      if(Fai_L[1] !== undefined){
        setValue("Diameter",Fai_L[1])
        setValue("LSize",Fai_L[2])
      }
      else if(Fai_L[3] !== undefined){
        setValue("Diameter",Fai_L[3])
        setValue("LSize",Fai_L[4])
      }
      else if(Fai_L[5] !== undefined){
        setValue("Diameter",Fai_L[5])
        setValue("LSize",Fai_L[6])
      }
      setValue("AssembledForm",Fai_L[0]);
    }
  }
}

export const AssemblySetup = (data:any) => {
  var Fai_L = data.match(fai_l);
  if(Fai_L[1] !== undefined){
    return [Fai_L[1],Fai_L[2],Fai_L[0]]
  }
  else if(Fai_L[3] !== undefined){
    return [Fai_L[3],Fai_L[4],Fai_L[0]]
  }
  else if(Fai_L[5] !== undefined){
    return [Fai_L[5],Fai_L[6],Fai_L[0]]
  }
  else{
    return null
  }
}


