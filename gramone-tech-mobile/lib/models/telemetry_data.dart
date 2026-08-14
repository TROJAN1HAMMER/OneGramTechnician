class TelemetryData {
  final int id;
  final int deviceId;
  final String? deviceCode;
  final double? waterLevel;
  final double? fillLevel;
  final double? temperature;
  final double? humidity;
  final double? batteryLevel;
  final DateTime timestamp;

  TelemetryData({
    required this.id,
    required this.deviceId,
    this.deviceCode,
    this.waterLevel,
    this.fillLevel,
    this.temperature,
    this.humidity,
    this.batteryLevel,
    required this.timestamp,
  });

  factory TelemetryData.fromJson(Map<String, dynamic> json) {
    return TelemetryData(
      id: json['id'] ?? 0,
      deviceId: json['device_id'] ?? 0,
      deviceCode: json['device_code'],
      waterLevel: json['water_level'] != null ? (json['water_level'] as num).toDouble() : null,
      fillLevel: json['fill_level'] != null ? (json['fill_level'] as num).toDouble() : null,
      temperature: json['temperature'] != null ? (json['temperature'] as num).toDouble() : null,
      humidity: json['humidity'] != null ? (json['humidity'] as num).toDouble() : null,
      batteryLevel: json['battery_level'] != null ? (json['battery_level'] as num).toDouble() : null,
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}
