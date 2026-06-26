#include <Arduino.h>
#include "Adafruit_INA260.h"
#ifdef __AVR__
  #include <avr/power.h>
#endif


#define DC 5
#define IR 8
#define DELAY 100

int n;
bool curIR;
bool prevIR;
Adafruit_INA260 ina260 = Adafruit_INA260();

bool checkIR();
int checkPower();

void setup() {
  Serial.begin(9600);
  Serial.println("Test DC Current Reader");
  ina260.begin();
  pinMode(IR, INPUT_PULLUP);
  n = 0;
  curIR = false;
  prevIR = false;

  ina260.setAveragingCount(INA260_COUNT_4);
  ina260.setVoltageConversionTime(INA260_TIME_140_us);
  ina260.setCurrentConversionTime(INA260_TIME_140_us);
}

void loop() {
  checkIR();
  ina260.setMode(INA260_MODE_CONTINUOUS);
  checkPower();
  delay(500);
  
  // second trigger a reading in triggered mode
  ina260.setMode(INA260_MODE_TRIGGERED);
  // the measurements in rampPixelColors will remain the same because we haven't triggered a new reading
  checkPower();
  delay(500);
  
  // trigger a new reading, with the values staying the same again
  ina260.setMode(INA260_MODE_TRIGGERED);
  checkPower();
  delay(500);

  // finally shutdown the INA260. The measurements will stay from the last triggered measurement.
  ina260.setMode(INA260_MODE_SHUTDOWN);
  checkPower();
  delay(1000);
}


// return true and log timestamp if motion sensor detects new motion
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

// return value and log timestemp and value for voltage readings
int checkPower() {
  float busVoltage = ina260.readBusVoltage();
  float current = ina260.readCurrent();
  float power = ina260.readPower();

  Serial.print("INA260 voltage: ");
  Serial.print(busVoltage);
  Serial.println(" V");

  Serial.print("INA260 current: ");
  Serial.print(current);
  Serial.println(" mA");

  Serial.print("INA260 power: ");
  Serial.print(power);
  Serial.println(" mW");

  return static_cast<int>(power);
}