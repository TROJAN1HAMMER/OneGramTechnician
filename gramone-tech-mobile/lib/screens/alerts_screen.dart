import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../api/alert_service.dart';
import '../models/alert_data.dart';
import '../theme/app_theme.dart';
import '../l10n/app_localizations.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  List<AlertData> _alerts = [];
  bool _isLoading = true;
  String? _errorMessage;
  int? _actionIdLoading;

  @override
  void initState() {
    super.initState();
    _fetchAlerts();
  }

  Future<void> _fetchAlerts() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final alerts = await AlertService.fetchAlerts();
      if (mounted) {
        setState(() {
          _alerts = alerts;
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

  Future<void> _handleAcknowledge(int alertId) async {
    setState(() {
      _actionIdLoading = alertId;
    });
    try {
      await AlertService.acknowledgeAlert(alertId);
      await _fetchAlerts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppTheme.criticalColor,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _actionIdLoading = null;
        });
      }
    }
  }

  Future<void> _handleResolve(int alertId) async {
    setState(() {
      _actionIdLoading = alertId;
    });
    try {
      await AlertService.resolveAlert(alertId);
      await _fetchAlerts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppTheme.criticalColor,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _actionIdLoading = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.cardColor,
        title: Text(
          l10n.translate('alerts'),
          style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.textSecondary),
            onPressed: _fetchAlerts,
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchAlerts,
          color: AppTheme.primaryColor,
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
              : _errorMessage != null
                  ? _buildErrorView(l10n)
                  : _alerts.isEmpty
                      ? _buildEmptyView(l10n)
                      : ListView.builder(
                          padding: const EdgeInsets.all(16.0),
                          itemCount: _alerts.length,
                          itemBuilder: (context, index) {
                            final alert = _alerts[index];
                            final isCritical = alert.severity == 'CRITICAL';
                            final severityColor = isCritical ? AppTheme.criticalColor : AppTheme.warningColor;

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12.0),
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: severityColor.withValues(alpha: 0.15),
                                            borderRadius: BorderRadius.circular(8),
                                            border: Border.all(color: severityColor.withValues(alpha: 0.3)),
                                          ),
                                          child: Text(
                                            alert.severity,
                                            style: TextStyle(
                                              color: severityColor,
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        Text(
                                          alert.status,
                                          style: const TextStyle(
                                            color: AppTheme.textSecondary,
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      alert.message,
                                      style: const TextStyle(
                                        color: AppTheme.textPrimary,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      '${alert.deviceCode ?? "Node #${alert.deviceId}"} • ${DateFormat('yyyy-MM-dd HH:mm:ss').format(alert.createdAt.toLocal())}',
                                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                    ),
                                    const SizedBox(height: 14),

                                    // Action Buttons
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        if (alert.status == 'PENDING') ...[
                                          OutlinedButton(
                                            onPressed: _actionIdLoading == alert.id
                                                ? null
                                                : () => _handleAcknowledge(alert.id),
                                            style: OutlinedButton.styleFrom(
                                              foregroundColor: AppTheme.warningColor,
                                              side: BorderSide(color: AppTheme.warningColor.withValues(alpha: 0.5)),
                                            ),
                                            child: Text(l10n.translate('acknowledge')),
                                          ),
                                          const SizedBox(width: 8),
                                        ],
                                        if (alert.status != 'RESOLVED') ...[
                                          ElevatedButton(
                                            onPressed: _actionIdLoading == alert.id
                                                ? null
                                                : () => _handleResolve(alert.id),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: AppTheme.primaryColor,
                                              minimumSize: const Size(100, 38),
                                            ),
                                            child: Text(l10n.translate('resolve')),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
        ),
      ),
    );
  }

  Widget _buildEmptyView(AppLocalizations l10n) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.verified_user_rounded, size: 64, color: AppTheme.successColor),
            SizedBox(height: 16),
            Text(
              'No Unresolved Alerts',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
            ),
            SizedBox(height: 8),
            Text(
              'All IoT node telemetry readings are operating within normal threshold limits.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
          ],
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
              _errorMessage ?? 'Failed to load alerts',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _fetchAlerts,
              child: Text(l10n.translate('retry')),
            ),
          ],
        ),
      ),
    );
  }
}
