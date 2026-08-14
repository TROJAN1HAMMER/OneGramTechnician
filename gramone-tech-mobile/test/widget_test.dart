import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gramone_tech_mobile/main.dart';

void main() {
  testWidgets('App initialization test', (WidgetTester tester) async {
    final navigatorKey = GlobalKey<NavigatorState>();
    await tester.pumpWidget(GramOneTechApp(
      navigatorKey: navigatorKey,
      initialLoggedIn: false,
    ));

    await tester.pump();

    expect(find.text('GramOne Operations'), findsOneWidget);
    expect(find.text('Sign In to Dashboard'), findsOneWidget);
  });
}
