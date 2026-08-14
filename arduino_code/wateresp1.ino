#include <Wire.h>
#include <U8g2lib.h>

// ==================================================
// PIN CONFIGURATION
// ==================================================

// OLED I2C
#define OLED_SDA 21
#define OLED_SCL 22

// Water level sensor
#define WATER_SENSOR_PIN 34

// Ultrasonic sensor
#define ULTRASONIC_TRIG 25
#define ULTRASONIC_ECHO 26


// ==================================================
// OLED
// ==================================================

// Your OLED appears to be a 128x64 SH1106 I2C display.
//
// If your display is actually SSD1306, I have included
// the alternative constructor below in the comments.

U8G2_SH1106_128X64_NONAME_F_HW_I2C display(
  U8G2_R0,
  U8X8_PIN_NONE
);


// ==================================================
// WATER LEVEL CALIBRATION
// ==================================================

#define WATER_EMPTY 0
#define WATER_FULL 4095

#define WATER_LOW_PERCENT 5.0

// ==================================================
// SMART BIN
// ==================================================

#define BIN_FULL_DISTANCE 5.0


// ==================================================
// VARIABLES
// ==================================================

int waterRaw = 0;
float waterPercent = 0;

float binDistance = -1;

bool waterLow = false;
bool binFull = false;

unsigned long lastSensorRead = 0;
unsigned long lastSerialUpdate = 0;

const unsigned long SENSOR_INTERVAL = 500;
const unsigned long SERIAL_INTERVAL = 1000;


// ==================================================
// PANDA BITMAP
// ==================================================
//
// Small panda icon.
// This is displayed because normal OLED fonts
// cannot directly display the 🐼 emoji.
//

const unsigned char pandaBitmap[] PROGMEM = {

  0b00111100,
  0b01111110,
  0b11111111,
  0b11011011,
  0b11111111,
  0b01111110,
  0b00111100,
  0b00011000

};


// ==================================================
// SETUP
// ==================================================

void setup() {

  Serial.begin(115200);

  delay(500);

  Serial.println();
  Serial.println("======================================");
  Serial.println("       GRAMONE ESP32 NODE");
  Serial.println("       TEAM PANDAS HARDWARE");
  Serial.println("======================================");

  // ------------------------------------------------
  // Ultrasonic
  // ------------------------------------------------

  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);

  digitalWrite(ULTRASONIC_TRIG, LOW);


  // ------------------------------------------------
  // Water sensor
  // ------------------------------------------------

  pinMode(WATER_SENSOR_PIN, INPUT);


  // ------------------------------------------------
  // I2C
  // ------------------------------------------------

  Wire.begin(OLED_SDA, OLED_SCL);


  // ------------------------------------------------
  // OLED
  // ------------------------------------------------

  Serial.println("Starting OLED...");

  display.begin();

  Serial.println("OLED initialized.");

  delay(500);


  // ------------------------------------------------
  // Show Team Pandas branding
  // ------------------------------------------------

  showTeamPandas();

  delay(2000);


  Serial.println();
  Serial.println("Sensors started.");
  Serial.println("Water sensor      : GPIO 34");
  Serial.println("Ultrasonic TRIG   : GPIO 25");
  Serial.println("Ultrasonic ECHO   : GPIO 26");
  Serial.println("OLED SDA          : GPIO 21");
  Serial.println("OLED SCL          : GPIO 22");
  Serial.println();
}


// ==================================================
// MAIN LOOP
// ==================================================

void loop() {

  // ------------------------------------------------
  // Read sensors
  // ------------------------------------------------

  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {

    lastSensorRead = millis();

    readWaterLevel();
    readUltrasonic();
  }


  // ------------------------------------------------
  // Serial Monitor
  // ------------------------------------------------

  if (millis() - lastSerialUpdate >= SERIAL_INTERVAL) {

    lastSerialUpdate = millis();

    printSensorStatus();
  }

  // IMPORTANT:
  // OLED is NOT updated here.
  //
  // It remains showing:
  //
  // WE ARE TEAM
  // PANDAS 🐼
  // GramOne
}


// ==================================================
// TEAM PANDAS OLED
// ==================================================

void showTeamPandas() {

  display.clearBuffer();

  // ------------------------------------------------
  // Top line
  // ------------------------------------------------

  display.setFont(u8g2_font_6x12_tf);

  display.drawStr(32, 12, "GRAMONE");


  // ------------------------------------------------
  // Main text
  // ------------------------------------------------

  display.setFont(u8g2_font_9x15B_tf);

  display.drawStr(12, 32, "WE ARE TEAM");

  display.drawStr(28, 50, "PANDAS");


  // ------------------------------------------------
  // Panda icon
  // ------------------------------------------------

  display.drawXBMP(
    106,
    20,
    8,
    8,
    pandaBitmap
  );


  // ------------------------------------------------
  // Bottom branding
  // ------------------------------------------------

  display.setFont(u8g2_font_6x12_tf);

  display.drawStr(48, 63, "GramOne");


  // ------------------------------------------------
  // Send to OLED
  // ------------------------------------------------

  display.sendBuffer();
}


// ==================================================
// WATER LEVEL
// ==================================================

void readWaterLevel() {

  waterRaw = analogRead(WATER_SENSOR_PIN);

  waterPercent =
    ((float)(waterRaw - WATER_EMPTY) /
     (float)(WATER_FULL - WATER_EMPTY)) * 100.0;

  // Keep between 0 and 100

  if (waterPercent < 0)
    waterPercent = 0;

  if (waterPercent > 100)
    waterPercent = 100;


  waterLow =
    (waterPercent < WATER_LOW_PERCENT);
}


// ==================================================
// ULTRASONIC DISTANCE
// ==================================================

float readUltrasonicDistance() {

  digitalWrite(ULTRASONIC_TRIG, LOW);

  delayMicroseconds(2);

  digitalWrite(ULTRASONIC_TRIG, HIGH);

  delayMicroseconds(10);

  digitalWrite(ULTRASONIC_TRIG, LOW);


  unsigned long duration = pulseIn(
    ULTRASONIC_ECHO,
    HIGH,
    30000
  );


  // Timeout

  if (duration == 0) {

    return -1;
  }


  float distance =
    duration * 0.0343 / 2.0;


  return distance;
}


// ==================================================
// READ ULTRASONIC
// ==================================================

void readUltrasonic() {

  binDistance =
    readUltrasonicDistance();


  if (binDistance > 0 &&
      binDistance < BIN_FULL_DISTANCE) {

    binFull = true;

  } else {

    binFull = false;
  }
}


// ==================================================
// SERIAL STATUS
// ==================================================

void printSensorStatus() {

  Serial.println();
  Serial.println("========== SENSOR STATUS ==========");


  // ------------------------------------------------
  // Water
  // ------------------------------------------------

  Serial.print("Water Raw: ");
  Serial.println(waterRaw);


  Serial.print("Water Level: ");
  Serial.print(waterPercent, 1);
  Serial.println("%");


  if (waterLow) {

    Serial.println(
      "!!! ALERT: WATER LEVEL BELOW 5% !!!"
    );

  } else {

    Serial.println(
      "Water Status: NORMAL"
    );
  }


  // ------------------------------------------------
  // Smart Bin
  // ------------------------------------------------

  if (binDistance < 0) {

    Serial.println(
      "Smart Bin: Ultrasonic timeout"
    );

  } else {

    Serial.print(
      "Smart Bin Distance: "
    );

    Serial.print(
      binDistance,
      1
    );

    Serial.println(" cm");


    if (binFull) {

      Serial.println(
        "!!! ALERT: SMART BIN FULL !!!"
      );

    } else {

      Serial.println(
        "Smart Bin Status: NORMAL"
      );
    }
  }


  Serial.println(
    "=================================="
  );
}