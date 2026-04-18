#include <Arduino.h>
#include <TM1637Display.h>

#define CLK 3
#define DIO 2
#define IR 12

int n;
bool curIR;
bool prevIR;

TM1637Display display(CLK, DIO);

bool checkIR();

void setup() {
  // put your setup code here, to run once:
  display.setBrightness(7);
  pinMode(IR, INPUT);
  n = 0;
  curIR = false;
  prevIR = false;
}

void loop() {
  checkIR();
  display.showNumberDec(n);
}

bool checkIR() {
  curIR = (digitalRead(IR) == HIGH);
  if (curIR && !prevIR) {
    n++;
    Serial.println(n);
    prevIR = curIR;
    return true;
  }
  prevIR = curIR;
  
  return false;
}