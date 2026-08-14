import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../api/bin_service.dart';
import '../models/telemetry_data.dart';
import '../theme/app_theme.dart';
import '../l10n/app_localizations.dart';

class BinScreen extends StatefulWidget {
  const BinScreen({super.key});

  @override
  State<BinScreen> createState() => _BinScreenState();
}

class _BinScreenState extends State<BinScreen> {
  TelemetryData? _latestData;
  List<TelemetryData> _history = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchBinData();
  }

  Future<void> _fetchBinData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final latest = await BinService.fetchLatestBin();
      final history = await BinService.fetchBinHistory();
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
    final fillLevel = _latestData?.fillLevel ?? 0.0;
    final isOverflowRisk = fillLevel > 85;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.cardColor,
        title: Text(
          l10n.translate('smart_bin'),
          style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.textSecondary),
            onPressed: _fetchBinData,
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchBinData,
          color: AppTheme.primaryColor,
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
              : _errorMessage != null
                  ? _buildErrorView(l10n)
                  : ListView(
                      padding: const EdgeInsets.all(20.0),
                      children: [
                        if (isOverflowRisk) ...[
                          Container(
                            padding: const EdgeInsets.all(14),
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: AppTheme.criticalColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppTheme.criticalColor.withValues(alpha: 0.4)),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.warning_amber_rounded, color: AppTheme.criticalColor),
                                SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    'OVERFLOW WARNING: Capacity exceeded 85%!',
                                    style: TextStyle(
                                      color: AppTheme.textPrimary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        // Main Card
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(20.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Market Street Bin (BIN-001)',
                                  style: TextStyle(
                                    color: AppTheme.textSecondary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  '${fillLevel.toStringAsFixed(1)}%',
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
                                    value: (fillLevel / 100).clamp(0.0, 1.0),
                                    minHeight: 12,
                                    backgroundColor: AppTheme.inputBorderColor,
                                    color: isOverflowRisk
                                        ? AppTheme.criticalColor
                                        : Colors.purpleAccent,
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

                        const Text(
                          'Recent Fill History',
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
                                leading: const Icon(Icons.delete_rounded, color: Colors.purpleAccent),
                                title: Text(
                                  '${(item.fillLevel ?? 0).toStringAsFixed(1)}%',
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
              _errorMessage ?? 'Failed to load bin telemetry',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _fetchBinData,
              child: Text(l10n.translate('retry')),
            ),
          ],
        ),
      ),
    );
  }
}
