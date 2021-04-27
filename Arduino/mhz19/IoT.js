// IoTセンサーモジュールから温度、湿度データを得て表示(IoT.js)
//		Copyright(C) 2016-2020 Tamotsu Kamigaki
//
// htmlファイルから描画する領域の情報を得て、描画領域を定義
var g = document.getElementById('iotProg').getContext('2d');
// センサーモジュールのURL
var s_url = 'http://sens-a.local';
// 学生番号を表示
var sNo = 'MD20003';

////////////////////////////////////////////////////////////////////////
// メインルーチン
function main()
{
	drawNo();
	drawTemp();
}
////////////////////////////////////////////////////////////////////////
// 学生番号を表示する
function drawNo()
{
	g.fillStyle="blue";
	g.fillRect(25,25,600,150);	// 上半分全体
	g.fillStyle="lightGray";
	g.fillRect(225,50,345,100);	// 学生番号の枠
	g.font="60px 'Arial'";
	g.fillText("No.",80,130);
	g.fillStyle="blue";
	g.fillText(sNo,250,130);

}
////////////////////////////////////////////////////////////////////////
// センサ名と温度と湿度を表示する
function drawTemp()
{
	var res=getTextData(s_url).split(",");
//	センサ名はres[0]に、温度はres[1]、湿度はres[2]に格納される
	g.fillStyle="black";
	g.fillRect(25,175,600,150);	// 下半分全体
	g.fillStyle="lightGray";
	g.fillRect( 80,250,190,50);	// センサ名の枠
	g.fillRect(280,250,140,50);	// 温度の枠
	g.fillRect(430,250,140,50);	// 湿度の枠
	g.font="40px 'Arial'";
	g.fillText("センサ",80,235);
	g.fillText("温度",280,235);
	g.fillText("湿度",430,235);
	g.fillStyle="Red";
	g.fillText(res[0],90,290);
	g.fillText(res[1]+"℃",290,290);
	g.fillText(res[2]+"％",440,290);
}
////////////////////////////////////////////////////////////////////////
// センサーモジュールからデータ文字列を得る
function getTextData (url) {
	var text = "offline,-,-";
	var ajax = new XMLHttpRequest();
	with (ajax) {
		ontimeout = function () {
			text="Timeout,-,-"
		};
		onload = function () {
			if((readyState == 4)&&(status == 200))
				text = responseText;
			else
				text="Error,-,-"
		};
		open('GET', url, false);
		send(null);
	};
	return text;
}
