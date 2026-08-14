import '../models/alert_data.dart';
import 'api_client.dart';

class AlertService {
  static Future<List<AlertData>> fetchAlerts({
    String? status,
    String? severity,
    int limit = 50,
  }) async {
    try {
      final queryParams = <String, dynamic>{'limit': limit};
      if (status != null && status.isNotEmpty) queryParams['status'] = status;
      if (severity != null && severity.isNotEmpty) queryParams['severity'] = severity;

      final response = await ApiClient.client.get(
        '/technician/alerts',
        queryParameters: queryParams,
      );
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((item) => AlertData.fromJson(item as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  static Future<AlertData> acknowledgeAlert(int id) async {
    try {
      final response = await ApiClient.client.patch('/technician/alerts/$id/acknowledge');
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        return AlertData.fromJson(data['alert'] as Map<String, dynamic>);
      }
      throw Exception('Failed to acknowledge alert');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  static Future<AlertData> resolveAlert(int id) async {
    try {
      final response = await ApiClient.client.patch('/technician/alerts/$id/resolve');
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        return AlertData.fromJson(data['alert'] as Map<String, dynamic>);
      }
      throw Exception('Failed to resolve alert');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}
