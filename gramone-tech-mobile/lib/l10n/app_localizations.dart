import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        AppLocalizations(const Locale('en'));
  }

  static const Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'app_title': 'GramOne Technician',
      'dashboard': 'Dashboard',
      'water_monitoring': 'Water Tank',
      'smart_bin': 'Smart Bin',
      'environment': 'Environment',
      'alerts': 'Alert Center',
      'online_devices': 'Online Devices',
      'offline_devices': 'Offline Devices',
      'active_alerts': 'Active Alerts',
      'last_sync': 'Last Sync',
      'acknowledge': 'Acknowledge',
      'resolve': 'Resolve',
      'sign_out': 'Sign Out',
      'refresh': 'Refresh',
      'retry': 'Try Again',
      'status_normal': 'NORMAL',
      'status_warning': 'WARNING',
      'status_critical': 'CRITICAL',
      'capacity': 'Capacity',
      'temperature': 'Temperature',
      'humidity': 'Humidity',
      'language': 'Language',
    },
    'ml': {
      'app_title': 'ഗ്രാംവൺ ടെക്നീഷ്യൻ',
      'dashboard': 'ഡാഷ്‌ബോർഡ്',
      'water_monitoring': 'വാട്ടർ ടാങ്ക്',
      'smart_bin': 'സ്മാർട്ട് ബിൻ',
      'environment': 'പരിസ്ഥിതി',
      'alerts': 'അലേർട്ട് സെന്റർ',
      'online_devices': 'ഓൺലൈൻ ഉപകരണങ്ങൾ',
      'offline_devices': 'ഓഫ്‌ലൈൻ ഉപകരണങ്ങൾ',
      'active_alerts': 'സജീവ അലേർട്ടുകൾ',
      'last_sync': 'അവസാന സമന്വയം',
      'acknowledge': 'സ്വീകരിക്കുക',
      'resolve': 'പരിഹരിക്കുക',
      'sign_out': 'സൈൻ ഔട്ട്',
      'refresh': 'പുതുക്കുക',
      'retry': 'വീണ്ടും ശ്രമിക്കുക',
      'status_normal': 'സാധാരണം',
      'status_warning': 'മുന്നറിയിപ്പ്',
      'status_critical': 'ഗുരുതരം',
      'capacity': 'ശേഷി',
      'temperature': 'താപനില',
      'humidity': 'ആർദ്രത',
      'language': 'ഭാഷ',
    },
    'hi': {
      'app_title': 'ग्रामवन तकनीशियन',
      'dashboard': 'डैशबोर्ड',
      'water_monitoring': 'जल टैंक',
      'smart_bin': 'स्मार्ट बिन',
      'environment': 'पर्यावरण',
      'alerts': 'अलर्ट सेंटर',
      'online_devices': 'ऑनलाइन उपकरण',
      'offline_devices': 'ऑफलाइन उपकरण',
      'active_alerts': 'सक्रिय अलर्ट',
      'last_sync': 'अंतिम सिंक',
      'acknowledge': 'स्वीकार करें',
      'resolve': 'हल करें',
      'sign_out': 'साइन आउट',
      'refresh': 'रिफ्रेश करें',
      'retry': 'पुनः प्रयास करें',
      'status_normal': 'सामान्य',
      'status_warning': 'चेतावनी',
      'status_critical': 'गंभीर',
      'capacity': 'क्षमता',
      'temperature': 'तापमान',
      'humidity': 'आर्द्रता',
      'language': 'भाषा',
    },
  };

  String translate(String key) {
    return _localizedValues[locale.languageCode]?[key] ??
        _localizedValues['en']?[key] ??
        key;
  }
}

class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'ml', 'hi'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(AppLocalizationsDelegate old) => false;
}
