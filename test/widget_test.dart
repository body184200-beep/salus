import 'package:flutter_test/flutter_test.dart';
import 'package:salus/main.dart';
import 'package:salus/data/salus_data.dart';
import 'package:salus/services/safety_service.dart';

void main() {
  testWidgets('SALUS Flutter App Smoke & UI Test', (WidgetTester tester) async {
    // Build SalusApp and trigger a frame
    await tester.pumpWidget(const SalusApp());

    // Verify SALUS Brand title
    expect(find.text('SALUS'), findsOneWidget);
    expect(find.text('سالوس'), findsOneWidget);

    // Verify Scope Data
    expect(SalusData.ingredients.length, 9);
    final paracetamol = SalusData.ingredients.firstWhere((i) => i.id == 'ing-paracetamol');
    expect(paracetamol.isNsaid, false, reason: 'Paracetamol must NOT be classified as an NSAID');

    // Verify Emergency Red-flag Safety Service
    final emergencyCheck = SafetyService.evaluateSymptom('ضيق حاد في التنفس وتورم في الحلق والوجه');
    expect(emergencyCheck.isCriticalAlert, true);
    expect(emergencyCheck.alertLevel, 'urgent_emergency');
    expect(emergencyCheck.emergencyNumber, '123');
  });
}
