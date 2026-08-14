import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../api/dashboard_service.dart';
import '../api/auth_service.dart';
import '../models/dashboard_data.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<DashboardData> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  void _loadDashboardData() {
    setState(() {
      _dashboardFuture = DashboardService.fetchDashboardSummary();
    });
  }

  Future<void> _handleLogout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  String _formatTimestamp(DateTime? timestamp) {
    if (timestamp == null) return 'Never / Pending';
    return DateFormat('yyyy-MM-dd HH:mm:ss').format(timestamp.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.cardColor,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.dashboard_rounded,
                color: AppTheme.primaryColor,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Technician Operations',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.textSecondary),
            tooltip: 'Refresh Data',
            onPressed: _loadDashboardData,
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppTheme.criticalColor),
            tooltip: 'Sign Out',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppTheme.primaryColor,
          backgroundColor: AppTheme.cardColor,
          onRefresh: () async {
            _loadDashboardData();
            await _dashboardFuture.catchError((_) => DashboardData(
                  onlineDevices: 0,
                  offlineDevices: 0,
                  activeAlerts: 0,
                ));
          },
          child: FutureBuilder<DashboardData>(
            future: _dashboardFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return _buildSkeletonLoader();
              }

              if (snapshot.hasError) {
                return _buildErrorState(snapshot.error.toString());
              }

              if (!snapshot.hasData) {
                return _buildErrorState('No data available');
              }

              final data = snapshot.data!;
              return _buildDashboardView(data);
            },
          ),
        ),
      ),
    );
  }

  Widget _buildSkeletonLoader() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const SizedBox(height: 10),
        Container(
          height: 24,
          width: 180,
          decoration: BoxDecoration(
            color: AppTheme.cardColor,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: 20),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.25,
          children: List.generate(
            4,
            (index) => Container(
              decoration: BoxDecoration(
                color: AppTheme.cardColor,
                borderRadius: BorderRadius.circular(AppTheme.cardRadius),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorState(String errorMsg) {
    final cleanMsg = errorMsg.replaceAll('Exception: ', '');
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_off_rounded,
              size: 64,
              color: AppTheme.criticalColor,
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to Load Dashboard',
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              cleanMsg,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: AppTheme.minTouchTarget,
              width: 180,
              child: ElevatedButton.icon(
                onPressed: _loadDashboardData,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Try Again'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardView(DashboardData data) {
    final isTablet = MediaQuery.of(context).size.width > 600;

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(20.0),
      children: [
        // Status Banner Header
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.cell_tower_rounded,
                    color: AppTheme.primaryColor,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'IoT Network Summary',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Live telemetry stream active',
                        style: TextStyle(
                          color: AppTheme.successColor,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Metrics Grid
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: isTablet ? 4 : 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.15,
          children: [
            // 1. Online Devices Card
            _MetricCard(
              title: 'Online Devices',
              value: data.onlineDevices.toString(),
              icon: Icons.wifi_rounded,
              accentColor: AppTheme.successColor,
              semanticLabel: '${data.onlineDevices} Online Devices',
            ),

            // 2. Offline Devices Card
            _MetricCard(
              title: 'Offline Devices',
              value: data.offlineDevices.toString(),
              icon: Icons.wifi_off_rounded,
              accentColor: AppTheme.textMuted,
              semanticLabel: '${data.offlineDevices} Offline Devices',
            ),

            // 3. Active Alerts Card
            _MetricCard(
              title: 'Active Alerts',
              value: data.activeAlerts.toString(),
              icon: Icons.warning_amber_rounded,
              accentColor: data.activeAlerts > 0
                  ? AppTheme.criticalColor
                  : AppTheme.primaryColor,
              semanticLabel: '${data.activeAlerts} Active Alerts',
            ),

            // 4. Last Sync Time Card
            _MetricCard(
              title: 'Last Sync Time',
              value: _formatTimestamp(data.lastSync),
              icon: Icons.sync_rounded,
              accentColor: AppTheme.primaryColor,
              isTimestamp: true,
              semanticLabel: 'Last sync time ${_formatTimestamp(data.lastSync)}',
            ),
          ],
        ),

        const SizedBox(height: 28),

        // Quick Telemetry Status Info Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(
                      Icons.info_outline_rounded,
                      color: AppTheme.textSecondary,
                      size: 20,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'System Operations Scope',
                      style: TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'GramOne Technician IoT Operations Module is strictly scoped to real-time water tank levels, smart bin capacities, and environmental sensors.',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color accentColor;
  final bool isTimestamp;
  final String semanticLabel;

  const _MetricCard({
    Key? key,
    required this.title,
    required this.value,
    required this.icon,
    required this.accentColor,
    this.isTimestamp = false,
    required this.semanticLabel,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: semanticLabel,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(18.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: accentColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      icon,
                      color: accentColor,
                      size: 20,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                value,
                maxLines: isTimestamp ? 2 : 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: isTimestamp ? 14 : 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
