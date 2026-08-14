import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

typedef OnUnauthorizedCallback = void Function();

class ApiClient {
  static const String baseUrl = 'http://127.0.0.1:8000';
  static late Dio _dio;
  static OnUnauthorizedCallback? onUnauthorized;

  static void init({OnUnauthorizedCallback? unauthorizedHandler}) {
    onUnauthorized = unauthorizedHandler;
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('jwt_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            final prefs = await SharedPreferences.getInstance();
            await prefs.remove('jwt_token');
            if (onUnauthorized != null) {
              onUnauthorized!();
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  static Dio get client => _dio;
}
