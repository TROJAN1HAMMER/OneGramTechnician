class DashboardData {
  final int onlineDevices;
  final int offlineDevices;
  final int activeAlerts;
  final DateTime? lastSync;

  DashboardData({
    required this.onlineDevices,
    required this.offlineDevices,
    required this.activeAlerts,
    this.lastSync,
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      onlineDevices: json['online_devices'] ?? 0,
      offlineDevices: json['offline_devices'] ?? 0,
      activeAlerts: json['active_alerts'] ?? 0,
      lastSync: json['last_sync'] != null
          ? DateTime.tryParse(json['last_sync'])
          : null,
    );
  }
}
