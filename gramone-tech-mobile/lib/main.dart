import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'api/api_client.dart';
import 'api/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/main_tab_wrapper.dart';
import 'theme/app_theme.dart';
import 'l10n/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  ApiClient.init(
    unauthorizedHandler: () {
      navigatorKey.currentState?.pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (route) => false,
      );
    },
  );

  final loggedIn = await AuthService.isLoggedIn();

  runApp(GramOneTechApp(
    navigatorKey: navigatorKey,
    initialLoggedIn: loggedIn,
  ));
}

class GramOneTechApp extends StatefulWidget {
  final GlobalKey<NavigatorState> navigatorKey;
  final bool initialLoggedIn;

  const GramOneTechApp({
    super.key,
    required this.navigatorKey,
    required this.initialLoggedIn,
  });

  @override
  State<GramOneTechApp> createState() => _GramOneTechAppState();
}

class _GramOneTechAppState extends State<GramOneTechApp> {
  Locale _locale = const Locale('en');

  void _changeLanguage(Locale newLocale) {
    setState(() {
      _locale = newLocale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GramOne Technician',
      debugShowCheckedModeBanner: false,
      navigatorKey: widget.navigatorKey,
      theme: AppTheme.darkTheme,
      locale: _locale,
      localizationsDelegates: [
        const AppLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', ''),
        Locale('ml', ''),
        Locale('hi', ''),
      ],
      home: widget.initialLoggedIn
          ? MainTabWrapper(
              onLanguageChanged: _changeLanguage,
              currentLocale: _locale,
            )
          : const LoginScreen(),
    );
  }
}
