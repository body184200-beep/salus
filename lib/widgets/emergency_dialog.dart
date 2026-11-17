import 'package:flutter/material.dart';
import '../models/models.dart';
import '../theme/salus_theme.dart';

class EmergencyDialog extends StatelessWidget {
  final SafetyCheckResult safety;

  const EmergencyDialog({super.key, required this.safety});

  @override
  Widget build(BuildContext context) {
    final isEmergency = safety.alertLevel == 'urgent_emergency';

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      backgroundColor: isEmergency ? const Color(0xFFFFF1F2) : const Color(0xFFFFFBEB),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isEmergency ? SalusTheme.criticalRed : Colors.amber.shade700,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              isEmergency ? 'تحذير طبي طارئ' : 'تنبيه سريري للمتابعة',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 18,
                color: isEmergency ? SalusTheme.criticalRed : Colors.amber.shade900,
              ),
            ),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.black12),
              ),
              child: Text(
                safety.triggerReason,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: SalusTheme.mainText),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              safety.recommendationAr,
              style: const TextStyle(fontSize: 13, height: 1.5, color: SalusTheme.mainText),
            ),
            if (isEmergency) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: SalusTheme.criticalRed,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.phone_in_talk, color: Colors.white),
                        SizedBox(width: 8),
                        Text(
                          'الإسعاف المصري:',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Text(
                      '123',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 24),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            const Text(
              'تنبيه: سالوس منصة توجيهية ومعلوماتية ولا تقدم تشخيصاً طبياً. في الحالات المهددة للحياة توجه فوراً لأقرب قسم طوارئ.',
              style: TextStyle(fontSize: 11, color: SalusTheme.secondaryText),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
      actions: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: isEmergency ? SalusTheme.criticalRed : SalusTheme.darkTeal,
            ),
            onPressed: () => Navigator.pop(context),
            child: const Text('فهمت التنبيه (إغلاق)', style: TextStyle(color: Colors.white)),
          ),
        ),
      ],
    );
  }
}
