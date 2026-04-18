#include <Arduino.h>
#include <TM1637Display.h>

#define CLK 3
#define DIO 2
#define IR 8

int n;
bool curIR;
bool prevIR;

TM1637Display display(CLK, DIO);

bool checkIR();

void setup() {
  Serial.begin(9600);
  display.setBrightness(7);
  pinMode(IR, INPUT_PULLUP);
  n = 0;
  display.showNumberDec(n);
  curIR = false;
  prevIR = false;
}

void loop() {
  if (checkIR()) display.showNumberDec(n);
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