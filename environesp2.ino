#include <DHT.h>
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

#define DHTPIN 27
#define DHTTYPE DHT11

#define LDR_PIN 34
#define GAS_AO_PIN 35
#define GAS_DO_PIN 26

DHT dht(DHTPIN, DHTTYPE);


// ==================================================
// VARIABLES
// ==================================================

float temperature = 0;
float humidity = 0;
int lightValue = 0;
int gasAnalog = 0;
int gasDigital = 0;

unsigned long lastSensorRead = 0;
unsigned long lastHttpPost = 0;

const unsigned long SENSOR_INTERVAL = 2000;
const unsigned long HTTP_POST_INTERVAL = 5000;


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

void postEnvironmentTelemetry() {

  if (WiFi.status() != WL_CONNECTED) return;

  // Don't send if DHT read failed
  if (isnan(temperature) || isnan(humidity)) return;

  HTTPClient http;

  String url = "http://";
  url += BACKEND_HOST;
  url += ":";
  url += BACKEND_PORT;
  url += "/telemetry/environment";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Build JSON payload
  String payload = "{";
  payload += "\"device_code\":\"ENV-001\",";
  payload += "\"temperature\":";
  payload += String(temperature, 1);
  payload += ",\"humidity\":";
  payload += String(humidity, 1);
  payload += "}";

  int httpCode = http.POST(payload);

  if (httpCode > 0) {

    Serial.print("[HTTP] Environment POST -> ");
    Serial.println(httpCode);

  } else {

    Serial.print("[HTTP] Environment POST FAILED: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}


// ==================================================
// SETUP
// ==================================================

void setup() {
  Serial.begin(115200);

  dht.begin();

  pinMode(GAS_DO_PIN, INPUT);
  analogReadResolution(12);

  Serial.println("================================");
  Serial.println("GramOne Environmental Monitor");
  Serial.println("================================");

  // Connect WiFi
  connectWiFi();

  Serial.println("Sensors started.");
  Serial.println("DHT11         : GPIO 27");
  Serial.println("LDR           : GPIO 34");
  Serial.println("Gas Analog    : GPIO 35");
  Serial.println("Gas Digital   : GPIO 26");
  Serial.println("--------------------------------");
}


// ==================================================
// MAIN LOOP
// ==================================================

void loop() {

  // Ensure WiFi stays connected
  ensureWiFi();


  // ------------------------------------------------
  // Read sensors
  // ------------------------------------------------

  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {

    lastSensorRead = millis();

    // DHT11
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();

    // LDR
    lightValue = analogRead(LDR_PIN);

    // Gas sensor
    gasAnalog = analogRead(GAS_AO_PIN);
    gasDigital = digitalRead(GAS_DO_PIN);

    // Print to serial
    printSensorStatus();
  }


  // ------------------------------------------------
  // HTTP POST to Backend
  // ------------------------------------------------

  if (millis() - lastHttpPost >= HTTP_POST_INTERVAL) {

    lastHttpPost = millis();

    postEnvironmentTelemetry();
  }
}


// ==================================================
// SERIAL STATUS
// ==================================================

void printSensorStatus() {

  Serial.println("--------------------------------");

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT11: READ ERROR");
  } else {
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");

    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
  }

  Serial.print("Light: ");
  Serial.println(lightValue);

  Serial.print("Gas analog: ");
  Serial.println(gasAnalog);

  Serial.print("Gas status: ");

  if (gasDigital == LOW) {
    Serial.println("GAS ANOMALY DETECTED");
  } else {
    Serial.println("NORMAL");
  }

  // WiFi status
  Serial.print("WiFi: ");

  if (WiFi.status() == WL_CONNECTED) {

    Serial.print("CONNECTED (");
    Serial.print(WiFi.localIP());
    Serial.println(")");

  } else {

    Serial.println("DISCONNECTED");
  }
}