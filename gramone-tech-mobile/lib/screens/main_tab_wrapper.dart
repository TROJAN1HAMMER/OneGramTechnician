import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../l10n/app_localizations.dart';
import 'dashboard_screen.dart';
import 'water_screen.dart';
import 'bin_screen.dart';
import 'environment_screen.dart';
import 'alerts_screen.dart';

class MainTabWrapper extends StatefulWidget {
  final Function(Locale) onLanguageChanged;
  final Locale currentLocale;

  const MainTabWrapper({
    super.key,
    required this.onLanguageChanged,
    required this.currentLocale,
  });

  @override
  State<MainTabWrapper> createState() => _MainTabWrapperState();
}

class _MainTabWrapperState extends State<MainTabWrapper> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    WaterScreen(),
    BinScreen(),
    EnvironmentScreen(),
    AlertsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: Column(
        children: [
          // Top Bar for Language Switcher
          Container(
            color: AppTheme.cardColor,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.sensors_rounded, color: AppTheme.primaryColor, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      l10n.translate('app_title'),
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),

                // Language Switcher Dropdown
                DropdownButton<String>(
                  value: widget.currentLocale.languageCode,
                  dropdownColor: AppTheme.cardColor,
                  style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                  underline: const SizedBox(),
                  icon: const Icon(Icons.language_rounded, color: AppTheme.primaryColor, size: 18),
                  items: const [
                    DropdownMenuItem(value: 'en', child: Text('English')),
                    DropdownMenuItem(value: 'ml', child: Text('മലയാളം')),
                    DropdownMenuItem(value: 'hi', child: Text('हिंदी')),
                  ],
                  onChanged: (langCode) {
                    if (langCode != null) {
                      widget.onLanguageChanged(Locale(langCode));
                    }
                  },
                ),
              ],
            ),
          ),

          // Active Tab Screen
          Expanded(child: _screens[_currentIndex]),
        ],
      ),

      // Bottom Navigation Bar
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: AppTheme.cardColor,
        selectedItemColor: AppTheme.primaryColor,
        unselectedItemColor: AppTheme.textMuted,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.dashboard_rounded),
            label: l10n.translate('dashboard'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.water_drop_rounded),
            label: l10n.translate('water_monitoring'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.delete_rounded),
            label: l10n.translate('smart_bin'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.thermostat_rounded),
            label: l10n.translate('environment'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.warning_amber_rounded),
            label: l10n.translate('alerts'),
          ),
        ],
      ),
    );
  }
}
