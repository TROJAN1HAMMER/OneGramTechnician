import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../api/water_service.dart';
import '../models/telemetry_data.dart';
import '../theme/app_theme.dart';
import '../l10n/app_localizations.dart';

class WaterScreen extends StatefulWidget {
  const WaterScreen({super.key});

  @override
  State<WaterScreen> createState() => _WaterScreenState();
}

class _WaterScreenState extends State<WaterScreen> {
  TelemetryData? _latestData;
  List<TelemetryData> _history = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchWaterData();
  }

  Future<void> _fetchWaterData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final latest = await WaterService.fetchLatestWater();
      final history = await WaterService.fetchWaterHistory();
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
    final waterLevel = _latestData?.waterLevel ?? 0.0;

    String statusKey = 'status_normal';
    Color statusColor = AppTheme.successColor;
    if (waterLevel < 20) {
      statusKey = 'status_critical';
      statusColor = AppTheme.criticalColor;
    } else if (waterLevel <= 40) {
      statusKey = 'status_warning';
      statusColor = AppTheme.warningColor;
    }

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.cardColor,
        title: Text(
          l10n.translate('water_monitoring'),
          style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.textSecondary),
            onPressed: _fetchWaterData,
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchWaterData,
          color: AppTheme.primaryColor,
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
              : _errorMessage != null
                  ? _buildErrorView(l10n)
                  : ListView(
                      padding: const EdgeInsets.all(20.0),
                      children: [
                        // Live Card
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(20.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text(
                                      'Main Water Tank (WATER-001)',
                                      style: TextStyle(
                                        color: AppTheme.textSecondary,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: statusColor.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                                      ),
                                      child: Text(
                                        l10n.translate(statusKey),
                                        style: TextStyle(
                                          color: statusColor,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  '${waterLevel.toStringAsFixed(1)}%',
                                  style: const TextStyle(
                                    fontSize: 42,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: LinearProgressIndicator(
                                    value: (waterLevel / 100).clamp(0.0, 1.0),
                                    minHeight: 12,
                                    backgroundColor: AppTheme.inputBorderColor,
                                    color: statusColor,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Updated: ${_latestData?.timestamp != null ? DateFormat('yyyy-MM-dd HH:mm:ss').format(_latestData!.timestamp.toLocal()) : "N/A"}',
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // History Header
                        const Text(
                          'Recent History Readings',
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
                                leading: const Icon(Icons.water_drop_rounded, color: Colors.cyan),
                                title: Text(
                                  '${(item.waterLevel ?? 0).toStringAsFixed(1)}%',
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
              _errorMessage ?? 'Failed to load water telemetry',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _fetchWaterData,
              child: Text(l10n.translate('retry')),
            ),
          ],
        ),
      ),
    );
  }
}
