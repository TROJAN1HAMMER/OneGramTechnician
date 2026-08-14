import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../api/environment_service.dart';
import '../models/telemetry_data.dart';
import '../theme/app_theme.dart';
import '../l10n/app_localizations.dart';

class EnvironmentScreen extends StatefulWidget {
  const EnvironmentScreen({super.key});

  @override
  State<EnvironmentScreen> createState() => _EnvironmentScreenState();
}

class _EnvironmentScreenState extends State<EnvironmentScreen> {
  TelemetryData? _latestData;
  List<TelemetryData> _history = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchEnvironmentData();
  }

  Future<void> _fetchEnvironmentData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final latest = await EnvironmentService.fetchLatestEnvironment();
      final history = await EnvironmentService.fetchEnvironmentHistory();
      if (mounted) {
        setState(() {
          _latestData = latest;
          _history = history;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final temp = _latestData?.temperature ?? 0.0;
    final humidity = _latestData?.humidity ?? 0.0;

    final isHighTemp = temp > 40;
    final isHighHumidity = humidity > 85;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.cardColor,
        title: Text(
          l10n.translate('environment'),
          style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.textSecondary),
            onPressed: _fetchEnvironmentData,
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchEnvironmentData,
          color: AppTheme.primaryColor,
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
              : _errorMessage != null
                  ? _buildErrorView(l10n)
                  : ListView(
                      padding: const EdgeInsets.all(20.0),
                      children: [
                        // Dual Cards: Temperature & Humidity
                        Row(
                          children: [
                            Expanded(
                              child: Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        l10n.translate('temperature'),
                                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        '${temp.toStringAsFixed(1)}°C',
                                        style: TextStyle(
                                          fontSize: 28,
                                          fontWeight: FontWeight.bold,
                                          color: isHighTemp ? AppTheme.warningColor : AppTheme.textPrimary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        l10n.translate('humidity'),
                                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        '${humidity.toStringAsFixed(1)}%',
                                        style: TextStyle(
                                          fontSize: 28,
                                          fontWeight: FontWeight.bold,
                                          color: isHighHumidity ? AppTheme.warningColor : AppTheme.textPrimary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Comfort Banner
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(18.0),
                            child: Row(
                              children: [
                                Icon(
                                  (isHighTemp || isHighHumidity)
                                      ? Icons.warning_amber_rounded
                                      : Icons.verified_user_rounded,
                                  color: (isHighTemp || isHighHumidity)
                                      ? AppTheme.warningColor
                                      : AppTheme.successColor,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        (isHighTemp || isHighHumidity)
                                            ? 'Environmental Threshold Warning'
                                            : 'Optimal Ambient Conditions',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.textPrimary,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'School Campus Sensor (ENV-001) • Updated: ${_latestData?.timestamp != null ? DateFormat('HH:mm:ss').format(_latestData!.timestamp.toLocal()) : "N/A"}',
                                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        const Text(
                          'Telemetry History',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 12),

                        ..._history.map((item) => Card(
                              margin: const EdgeInsets.only(bottom: 10),
                              child: ListTile(
                                leading: const Icon(Icons.thermostat_rounded, color: Colors.orangeAccent),
                                title: Text(
                                  '${(item.temperature ?? 0).toStringAsFixed(1)}°C  •  ${(item.humidity ?? 0).toStringAsFixed(1)}%',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                                subtitle: Text(
                                  DateFormat('MMM dd, HH:mm:ss').format(item.timestamp.toLocal()),
                                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                                ),
                              ),
                            )),
                      ],
                    ),
        ),
      ),
    );
  }

  Widget _buildErrorView(AppLocalizations l10n) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 54, color: AppTheme.criticalColor),
            const SizedBox(height: 16),
            Text(
              _errorMessage ?? 'Failed to load environment telemetry',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _fetchEnvironmentData,
              child: Text(l10n.translate('retry')),
            ),
          ],
        ),
      ),
    );
  }
}
