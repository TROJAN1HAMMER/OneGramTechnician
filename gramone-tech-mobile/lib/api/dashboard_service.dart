import 'package:dio/dio.dart';
import '../models/dashboard_data.dart';
import 'api_client.dart';

class DashboardService {
  static Future<DashboardData> fetchDashboardSummary() async {
    try {
      final response = await ApiClient.client.get('/technician/dashboard');
      if (response.statusCode == 200) {
        return DashboardData.fromJson(response.data as Map<String, dynamic>);
      } else {
        throw Exception('Failed to fetch dashboard. Code: ${response.statusCode}');
      }
    } on DioException catch (e) {
      if (e.response != null && e.response?.data != null) {
        final data = e.response?.data;
        if (data is Map<String, dynamic> && data.containsKey('detail')) {
          throw Exception(data['detail']);
        }
      }
      throw Exception(e.message ?? 'Network error fetching dashboard data');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}
