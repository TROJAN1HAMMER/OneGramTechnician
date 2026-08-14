#include <SPI.h>
#include <MFRC522.h>
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

#define SS_PIN 5
#define RST_PIN 22
#define EMERGENCY_BUTTON 32

MFRC522 rfid(SS_PIN, RST_PIN);


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
// HTTP POST FUNCTION
// ==================================================

void postRfidScan(String cardUid) {

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;

  String url = "http://";
  url += BACKEND_HOST;
  url += ":";
  url += BACKEND_PORT;
  url += "/telemetry/rfid-scan";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"device_code\":\"RFID-001\",\"card_uid\":\"";
  payload += cardUid;
  payload += "\"}";

  int httpCode = http.POST(payload);

  if (httpCode > 0) {

    Serial.print("[HTTP] RFID Scan POST -> ");
    Serial.println(httpCode);

    String response = http.getString();
    Serial.print("[HTTP] Response: ");
    Serial.println(response);

  } else {

    Serial.print("[HTTP] RFID Scan POST FAILED: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}

// ==================================================
// HTTP POST FUNCTION (EMERGENCY)
// ==================================================

void postEmergencyAlert() {

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;

  String url = "http://";
  url += BACKEND_HOST;
  url += ":";
  url += BACKEND_PORT;
  url += "/telemetry/emergency";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"device_code\":\"RFID-001\",\"emergency_pressed\":true}";

  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.print("[HTTP] Emergency Alert POST -> ");
    Serial.println(httpCode);
    String response = http.getString();
    Serial.print("[HTTP] Response: ");
    Serial.println(response);
  } else {
    Serial.print("[HTTP] Emergency Alert POST FAILED: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}


// ==================================================
// SETUP
// ==================================================

void setup() {
  Serial.begin(115200);

  SPI.begin(18, 19, 23, 5);  // SCK, MISO, MOSI, SS
  rfid.PCD_Init();

  Serial.println("================================");
  Serial.println("GramOne RFID Reader");
  Serial.println("================================");

  // Connect WiFi
  connectWiFi();

  pinMode(EMERGENCY_BUTTON, INPUT_PULLUP);

  Serial.println("Scan an RFID card or press emergency button...");
  Serial.println("================================");
}


// ==================================================
// MAIN LOOP
// ==================================================

void loop() {

  // Ensure WiFi stays connected
  ensureWiFi();

  // ==================================================
  // EMERGENCY BUTTON
  // ==================================================
  static bool lastButtonState = HIGH;
  bool currentButtonState = digitalRead(EMERGENCY_BUTTON);

  // Detect button press
  if (currentButtonState == LOW && lastButtonState == HIGH) {
    Serial.println();
    Serial.println("================================");
    Serial.println("!!! EMERGENCY BUTTON PRESSED !!!");
    Serial.println("Emergency alert activated.");
    Serial.println("================================");
    
    postEmergencyAlert();
    delay(500); // Simple debounce
  }

  // Detect button release
  if (currentButtonState == HIGH && lastButtonState == LOW) {
    Serial.println("Emergency button released.");
    Serial.println();
  }

  lastButtonState = currentButtonState;

  // ==================================================
  // RFID
  // ==================================================  // No new card
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // Card detected but UID cannot be read
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  Serial.println();
  Serial.println("RFID CARD DETECTED!");

  // Build UID hex string
  String cardUid = "";

  Serial.print("UID: ");

  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      Serial.print("0");
      cardUid += "0";
    }

    Serial.print(rfid.uid.uidByte[i], HEX);
    cardUid += String(rfid.uid.uidByte[i], HEX);

    if (i < rfid.uid.size - 1) {
      Serial.print(":");
    }
  }

  // Convert to uppercase for consistency
  cardUid.toUpperCase();

  Serial.println();

  Serial.print("UID Decimal: ");
  for (byte i = 0; i < rfid.uid.size; i++) {
    Serial.print(rfid.uid.uidByte[i]);

    if (i < rfid.uid.size - 1) {
      Serial.print("-");
    }
  }

  Serial.println();


  // ------------------------------------------------
  // POST to Backend
  // ------------------------------------------------

  Serial.println("Sending to backend...");
  postRfidScan(cardUid);

  Serial.println("-------------------------------");

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(1000);
}