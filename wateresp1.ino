#include <Wire.h>
#include <U8g2lib.h>
#include <WiFi.h>
#include <HTTPClient.h>

// ==================================================
// WIFI CONFIGURATION
// ==================================================

const char* WIFI_SSID     = "Blah blah blah";
const char* WIFI_PASSWORD  = "********";

// Backend server IP and port
// IMPORTANT: Replace with your computer's local IP
// Run 'ipconfig' in PowerShell to find it
const char* BACKEND_HOST = "10.213.121.104";
const int   BACKEND_PORT = 8000;


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

// Max distance representing empty bin (cm)
#define BIN_EMPTY_DISTANCE 30.0


// ==================================================
// VARIABLES
// ==================================================

int waterRaw = 0;
float waterPercent = 0;

float binDistance = -1;
float binFillPercent = 0;

bool waterLow = false;
bool binFull = false;

unsigned long lastSensorRead = 0;
unsigned long lastSerialUpdate = 0;
unsigned long lastHttpPost = 0;

const unsigned long SENSOR_INTERVAL = 500;
const unsigned long SERIAL_INTERVAL = 1000;
const unsigned long HTTP_POST_INTERVAL = 5000;


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
// WIFI FUNCTIONS
// ==================================================

void connectWiFi() {

  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED && attempts < 40) {

    delay(500);
    Serial.print(".");
    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("WiFi CONNECTED!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

  } else {

    Serial.println("WiFi connection FAILED.");
    Serial.println("Will retry in loop.");
  }
}


void ensureWiFi() {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi disconnected. Reconnecting...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;

    while (WiFi.status() != WL_CONNECTED && attempts < 20) {

      delay(250);
      attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {

      Serial.println("WiFi reconnected.");

    } else {

      Serial.println("WiFi reconnect failed.");
    }
  }
}


// ==================================================
// HTTP POST FUNCTIONS
// ==================================================

void postWaterTelemetry() {

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;

  String url = "http://";
  url += BACKEND_HOST;
  url += ":";
  url += BACKEND_PORT;
  url += "/telemetry/water";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"device_code\":\"WATER-001\",\"water_level\":";
  payload += String(waterPercent, 1);
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode > 0) {

    Serial.print("[HTTP] Water POST -> ");
    Serial.println(httpCode);

  } else {

    Serial.print("[HTTP] Water POST FAILED: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}


void postBinTelemetry() {

  if (WiFi.status() != WL_CONNECTED) return;

  // Only send if ultrasonic got a valid reading
  if (binDistance < 0) return;

  HTTPClient http;

  String url = "http://";
  url += BACKEND_HOST;
  url += ":";
  url += BACKEND_PORT;
  url += "/telemetry/bin";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"device_code\":\"BIN-001\",\"fill_level\":";
  payload += String(binFillPercent, 1);
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode > 0) {

    Serial.print("[HTTP] Bin POST -> ");
    Serial.println(httpCode);

  } else {

    Serial.print("[HTTP] Bin POST FAILED: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}


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


  // ------------------------------------------------
  // WiFi
  // ------------------------------------------------

  connectWiFi();


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
  // Ensure WiFi stays connected
  // ------------------------------------------------

  ensureWiFi();


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


  // ------------------------------------------------
  // HTTP POST to Backend
  // ------------------------------------------------

  if (millis() - lastHttpPost >= HTTP_POST_INTERVAL) {

    lastHttpPost = millis();

    postWaterTelemetry();
    postBinTelemetry();
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


  // Calculate fill percentage from distance
  // Closer distance = more full

  if (binDistance > 0) {

    binFillPercent =
      (1.0 - ((binDistance - BIN_FULL_DISTANCE) /
               (BIN_EMPTY_DISTANCE - BIN_FULL_DISTANCE))) * 100.0;

    if (binFillPercent < 0) binFillPercent = 0;
    if (binFillPercent > 100) binFillPercent = 100;

  } else {

    binFillPercent = 0;
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

    Serial.print("Bin Fill Level: ");
    Serial.print(binFillPercent, 1);
    Serial.println("%");


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


  // ------------------------------------------------
  // WiFi Status
  // ------------------------------------------------

  Serial.print("WiFi: ");

  if (WiFi.status() == WL_CONNECTED) {

    Serial.print("CONNECTED (");
    Serial.print(WiFi.localIP());
    Serial.println(")");

  } else {

    Serial.println("DISCONNECTED");
  }


  Serial.println(
    "=================================="
  );
}