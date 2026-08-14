import 'package:dio/dio.dart';
import '../models/telemetry_data.dart';
import 'api_client.dart';

class BinService {
  static Future<TelemetryData?> fetchLatestBin() async {
    try {
      final response = await ApiClient.client.get('/technician/bin/latest');
      if (response.statusCode == 200) {
        return TelemetryData.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw Exception(e.message ?? 'Failed to fetch bin telemetry');
    }
  }

  static Future<List<TelemetryData>> fetchBinHistory({int limit = 30}) async {
    try {
      final response = await ApiClient.client.get(
        '/technician/bin/history',
        queryParameters: {'limit': limit},
      );
      if (response.statusCode == 200) {
        final list = response.data as List<dynamic>;
        return list.map((item) => TelemetryData.fromJson(item as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}
