import ExcelJS from "exceljs";
import Button from '@mui/material/Button';

export function MakeExcel(ME:any) {

    const  handleExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(ME.table_name,{});
        let sheets:any[] = [];
        const struct = Object.keys(ME.struct);
        const association = Object.keys(ME.association);
        const table_keys = Object.keys(ME.table[0]);
        let sheet_row = worksheet.getRow(1);
        let StructCount = 0
        let ColumnCount:number = 0
        table_keys.map((val:any)=>{
            if(struct.includes(val)){
                sheets[StructCount] = {name:val,worksheet:workbook.addWorksheet(val,{})}
                let struct_items = sheets[StructCount].worksheet.getRow(1);
                let max = ME.table.reduce((sum:number,item:any)=>!item[val]?sum:(item[val].length>sum? item[val].length:sum),0);
                for(let i=0;i<max.max;i++){
                    ME.struct[val].map((item:any,index:any)=>{
                        struct_items.getCell(ME.struct[val].length*i+1+index).value = `${val}[${i+1}].${item}`;
                        return "";
                    })
                }
                StructCount++;
            }
            else if (association.includes(val)){
                for(var association_name of ME.association[val]){
                    sheet_row.getCell(ColumnCount+1).value = val+"."+association_name;
                    ColumnCount++;
                }
            }
            else{
                sheet_row.getCell(ColumnCount+1).value = val;
                ColumnCount++;
            }
            return "";
        });

        ME.table_index.map((index:any,Count:any)=>{
            const val = ME.table[index];
            let sheet_row = worksheet.getRow(Count+2);
            //行を取得
            StructCount = 0
            ColumnCount = 0
            table_keys.map((value:any,_:any)=>{
            if(struct.includes(value)){
                let struct_items = sheets[StructCount].worksheet.getRow(Count+2);
                if(val[value]){
                    val[value].map((_:any,i:number)=>{
                        ME.struct[value].map((item:any,index2:any)=>{
                            struct_items.getCell(ME.struct[value].length*i+1+index2).value = val[value][i][item];
                            return "";
                        })
                        return ""
                    })
                }
                StructCount++;
            }
            else if(association.includes(value)){
                for(var association_name of ME.association[value]){
                    sheet_row.getCell(ColumnCount+1).value = val[value][association_name];
                    ColumnCount++;
                }
            }
            else{
                sheet_row.getCell(ColumnCount+1).value = val[value];
                ColumnCount++;
            }
            return "";
            })
            return "";
        })
       
        //列を取得し値を設定（１行目）
        //sheet_row.getCell( 1 ).value = "ここはセルの１つ目" ;
        ////列の幅を設定（２行目）
        //sheet_row = worksheet.getRow( 2 ) ;
        //worksheet.getColumn( 2 ).width = 20 ;
        //sheet_row.getCell( 2 ).value = "ここはセルの２つ目" ;
        ////列のテキスト位置（アライメント）を設定（３行目）
        //sheet_row = worksheet.getRow( 3 ) ;
        //worksheet.getColumn( 3 ).width = 30 ;
        //sheet_row.getCell( 3 ).value = "ここはセルの３つ目" ;
        //sheet_row.getCell( 3 ).alignment = { vertical: "middle", horizontal: "center" } ;
       
        //エクセルファイルを生成する
        let uint8Array = await workbook.xlsx.writeBuffer(); //xlsxの場合
        let blob = new Blob([uint8Array], { type: "application/octet-binary" });
       
        //Excelファイルダウンロード
        let link = document.createElement( "a" );
        link.href = window.URL.createObjectURL( blob );
        link.download = "Reactで作成したエクセルファイル.xlsx" ;
        link.click();

    }
    return (
        <Button onClick={handleExcel} variant="contained">
            Excelファイル出力
        </Button>
    )
}