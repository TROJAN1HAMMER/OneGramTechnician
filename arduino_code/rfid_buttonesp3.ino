#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);

  SPI.begin(18, 19, 23, 5);  // SCK, MISO, MOSI, SS
  rfid.PCD_Init();

  Serial.println("================================");
  Serial.println("GramOne RFID Reader");
  Serial.println("Scan an RFID card...");
  Serial.println("================================");
}

void loop() {

  // No new card
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }

  // Card detected but UID cannot be read
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }

  Serial.println();
  Serial.println("RFID CARD DETECTED!");

  Serial.print("UID: ");

  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      Serial.print("0");
    }

    Serial.print(rfid.uid.uidByte[i], HEX);

    if (i < rfid.uid.size - 1) {
      Serial.print(":");
    }
  }

  Serial.println();

  Serial.print("UID Decimal: ");
  for (byte i = 0; i < rfid.uid.size; i++) {
    Serial.print(rfid.uid.uidByte[i]);

    if (i < rfid.uid.size - 1) {
      Serial.print("-");
    }
  }

  Serial.println();
  Serial.println("-------------------------------");

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(1000);
}