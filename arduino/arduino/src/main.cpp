// arduino/arduino/src/main.cpp
//
// Motion sensor sketch that prints motion events and voltage readings over Serial.
// DEBUG BUILD: includes checkpoint prints and an I2C bus timeout so a stuck
// INA260 read can't hang the whole sketch silently. Once you've found the
// hang point, these DEBUG lines can be stripped back out.
//
#include <Arduino.h>
#include <Wire.h>
#include <TM1637Display.h>
#include <Adafruit_INA260.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif
#define CLK 3
#define DIO 2
#define IR 8
#define POWER_INTERVAL_MS 500
#define IR_ACTIVE_LOW true
TM1637Display display(CLK, DIO);
Adafruit_INA260 ina260 = Adafruit_INA260();
int rotationCount = 0;
bool curIR = false;
bool prevIR = false;
unsigned long lastPowerRead = 0;
bool ina260Ready = false;
bool checkIR();
void checkPower();
void setup() {
  Serial.begin(9600);
  delay(1000);
  Serial.println("READY");

#ifdef __AVR__
  Wire.begin();
  Wire.setWireTimeout(25000, true); // 25ms timeout, auto-reset bus on timeout
#endif
  Serial.println("DEBUG: WIRE_INIT_DONE");

  display.setBrightness(7);
  display.showNumberDec(rotationCount);
  pinMode(IR, INPUT_PULLUP);
  Serial.println("DEBUG: DISPLAY_IR_DONE");

  Serial.println("DEBUG: I2C_SCAN_START");
  byte foundCount = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    byte err = Wire.endTransmission();
    if (err == 0) {
      Serial.print("DEBUG: I2C_DEVICE_FOUND 0x");
      Serial.println(addr, HEX);
      foundCount++;
    }
  }
  if (foundCount == 0) {
    Serial.println("DEBUG: I2C_SCAN_NO_DEVICES");
  }
  Serial.println("DEBUG: I2C_SCAN_END");

  Serial.println("DEBUG: CALLING_INA260_BEGIN");
  ina260Ready = ina260.begin();
  Serial.println("DEBUG: INA260_BEGIN_RETURNED");

  if (!ina260Ready) {
    Serial.println("INA260_INIT_FAIL");
  } else {
    ina260.setAveragingCount(INA260_COUNT_4);
    ina260.setVoltageConversionTime(INA260_TIME_140_us);
    ina260.setCurrentConversionTime(INA260_TIME_140_us);
    ina260.setMode(INA260_MODE_CONTINUOUS);
    Serial.println("DEBUG: INA260_CONFIGURED");
  }
}
void loop() {
  if (checkIR()) {
    display.showNumberDec(rotationCount);
  }
  unsigned long now = millis();
  if (ina260Ready && (now - lastPowerRead >= POWER_INTERVAL_MS)) {
    lastPowerRead = now;
    checkPower();
  }
}
bool checkIR() {
  int irReading = digitalRead(IR);
  curIR = IR_ACTIVE_LOW ? (irReading == LOW) : (irReading == HIGH);
  if (curIR && !prevIR) {
    rotationCount++;
    prevIR = curIR;
    Serial.print(millis());
    Serial.print(",ROT,");
    Serial.println(rotationCount);
    return true;
  }
  prevIR = curIR;
  return false;
}
void checkPower() {
  Serial.println("DEBUG: READING_VOLTAGE");
  float busVoltage = ina260.readBusVoltage();
  Serial.println("DEBUG: READING_CURRENT");
  float current = ina260.readCurrent();
  Serial.println("DEBUG: READING_POWER");
  float power = ina260.readPower();
  Serial.print(millis());
  Serial.print(",PWR,");
  Serial.print(busVoltage);
  Serial.print(",");
  Serial.print(current);
  Serial.print(",");
  Serial.println(power);
}