
#include <WiFiClient.h>
#include <WebServer.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <time.h>
#include <MHZ19_uart.h>

const char* ssid = "IODATA-83241e-2G";          // 各自の環境に合わせて設定
const char* password = "8216670737271";
// for WEB Server
const char* Host = "sens-a"; // ホスト名
WebServer Srv(80);     // ESP32 Webサーバとして起動
char SrvMsg[256] = "hostname,temp,humi";
char SrvMsgP[256] = "hostname,pres";

const int rx_pin = 4; //Serial rx pin no
const int tx_pin = 5; //Serial tx pin no

MHZ19_uart mhz19;

void setup() {
  Serial.begin(115200);
  pinMode(12, OUTPUT);//メッセージ用LEDなので無くても問題ありません。
  mhz19.begin(rx_pin, tx_pin);
  mhz19.setAutoCalibration(false);
  Serial.print("MH-Z19 now warming up...  status:"); Serial.println(mhz19.getStatus());
  // Wi-Fiに接続
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  // ローカルIPを表示（このIPにスマホなどからアクセスします）
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  // mDNS使用でIPアドレスではなくURLにホスト名指定できるようになる
  MDNS.begin(Host);
  // Webサーバコンテンツ設定
  Srv.on("/", HTTP_GET, []() {
    Srv.sendHeader("Access-Control-Allow-Origin", "*");  // クロスオリジン問題解決のため
    Srv.send(200, "text/plain", SrvMsg);
  });
  Srv.on("/p", HTTP_GET, []() {
    Srv.sendHeader("Access-Control-Allow-Origin", "*");  // クロスオリジン問題解決のため
    Srv.send(200, "text/plain", SrvMsgP);
  });
  Srv.begin();
  MDNS.addService("http", "tcp", 80);   // mDNSにWebサーバを登録
}

void loop() {
  Srv.handleClient();   // Web Clientの処理
  int co2ppm = mhz19.getPPM();
  int temp = mhz19.getTemperature();
  sprintf(SrvMsg, "%d", temp); // 後で加工しやすいようにCSVで送る
  sprintf(SrvMsgP, "%d", co2ppm);
  //CO2濃度出力
  Serial.print("co2: "); Serial.println(co2ppm);
  //気温出力(おまけ機能ですが精度は悪いです)
  Serial.print("temp: "); Serial.println(temp);
  delay(500);
}
