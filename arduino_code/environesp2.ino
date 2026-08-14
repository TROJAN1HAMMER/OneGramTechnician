#include <DHT.h>

#define DHTPIN 27
#define DHTTYPE DHT11

#define LDR_PIN 34
#define GAS_AO_PIN 35
#define GAS_DO_PIN 26

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);

  dht.begin();

  pinMode(GAS_DO_PIN, INPUT);
  analogReadResolution(12);

  Serial.println("GramOne Environmental Monitor");
  Serial.println("--------------------------------");
}

void loop() {
  // DHT11
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // LDR
  int lightValue = analogRead(LDR_PIN);

  // Gas sensor
  int gasAnalog = analogRead(GAS_AO_PIN);
  int gasDigital = digitalRead(GAS_DO_PIN);

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

  delay(2000);
}