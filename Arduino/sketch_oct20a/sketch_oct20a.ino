#include <WiFi.h>
#include <HTTPClient.h>

const char* SSID = "IODATA-83241e-2G";
const char* PASSWORD = "8216670737271";
const char URL[] = "http://<simple-httpd.pyを動かすPCのアドレス>:8000/data";

void setup() {
  Serial.begin(115200);
  while (!Serial);

  WiFi.begin(SSID, PASSWORD);
  Serial.print("WiFi connecting");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }

  Serial.println(" connected");
}

void loop() {
  HTTPClient http;
  http.begin(URL);
  int httpCode = http.GET();

  Serial.printf("Response: %d", httpCode);
  Serial.println();
  if (httpCode == HTTP_CODE_OK) {
    String body = http.getString();
    Serial.print("Response Body: ");
    Serial.println(body);
  }

  delay(5000);
}
