class AlertData {
  final int id;
  final int deviceId;
  final String? deviceCode;
  final String? locationName;
  final String alertType;
  final String severity;
  final String message;
  final String status;
  final DateTime? acknowledgedAt;
  final DateTime? resolvedAt;
  final DateTime createdAt;

  AlertData({
    required this.id,
    required this.deviceId,
    this.deviceCode,
    this.locationName,
    required this.alertType,
    required this.severity,
    required this.message,
    required this.status,
    this.acknowledgedAt,
    this.resolvedAt,
    required this.createdAt,
  });

  factory AlertData.fromJson(Map<String, dynamic> json) {
    return AlertData(
      id: json['id'] ?? 0,
      deviceId: json['device_id'] ?? 0,
      deviceCode: json['device_code'],
      locationName: json['location_name'],
      alertType: json['alert_type'] ?? 'GENERIC_ALERT',
      severity: json['severity'] ?? 'WARNING',
      message: json['message'] ?? '',
      status: json['status'] ?? 'PENDING',
      acknowledgedAt: json['acknowledged_at'] != null ? DateTime.parse(json['acknowledged_at']) : null,
      resolvedAt: json['resolved_at'] != null ? DateTime.parse(json['resolved_at']) : null,
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
