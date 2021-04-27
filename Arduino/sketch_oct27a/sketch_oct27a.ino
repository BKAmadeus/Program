int portno=5; //　デジタルポート番号

void setup() {
pinMode(portno,OUTPUT);
}

void loop() {
digitalWrite(portno,HIGH);
delay(500);
digitalWrite(portno,LOW);
delay(500);
}
