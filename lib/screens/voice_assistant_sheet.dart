import 'package:flutter/material.dart';
import '../services/voice_assistant_service.dart';
import '../theme/salus_theme.dart';
import '../widgets/emergency_dialog.dart';

class VoiceAssistantSheet extends StatefulWidget {
  final bool isAr;

  const VoiceAssistantSheet({super.key, required this.isAr});

  @override
  State<VoiceAssistantSheet> createState() => _VoiceAssistantSheetState();
}

class _VoiceAssistantSheetState extends State<VoiceAssistantSheet> {
  final TextEditingController _controller = TextEditingController();
  bool _isListening = false;
  VoiceAssistantResponse? _response;

  final List<String> _sampleQuestions = [
    'أنا باخد أملوديبين وحاسس بدوخة، ده ممكن يكون من الدوا؟',
    'هل الباراسيتامول من مسكنات الـ NSAIDs؟',
    'عندي تورم في الكاحل بعد أسبوعين من نورفاسك',
    'باخد جلوكوفاج وعندي إسهال شديد',
  ];

  void _ask(String q) {
    setState(() {
      _controller.text = q;
      _response = VoiceAssistantService.answerQuery(q);
      _isListening = false;
    });

    if (_response?.safetyAlert?.isCriticalAlert == true) {
      showDialog(
        context: context,
        builder: (_) => EmergencyDialog(safety: _response!.safetyAlert!),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: SalusTheme.lightMint, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.support_agent_rounded, color: SalusTheme.primaryTeal),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.isAr ? 'د. سمر السيد محمد هاشم' : 'Dr. Samar Alsayed Mohamed Hashem',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: SalusTheme.darkTeal),
                      ),
                      Text(
                        widget.isAr ? 'طبيبة صيدلية معتمدة من النقابة العامة لصيادلة مصر' : 'Clinical Pharmacist - Syndicate Verified',
                        style: const TextStyle(fontSize: 11, color: SalusTheme.secondaryText),
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const Divider(),

          // Chips of quick questions
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _sampleQuestions.map((q) {
                return Padding(
                  padding: const EdgeInsets.only(right: 6, bottom: 8),
                  child: ActionChip(
                    label: Text(q, style: const TextStyle(fontSize: 11)),
                    backgroundColor: SalusTheme.background,
                    onPressed: () => _ask(q),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),

          // Response Body
          Expanded(
            child: _response == null
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: SalusTheme.lightMint,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.support_agent_rounded, size: 48, color: SalusTheme.primaryTeal),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          widget.isAr
                              ? 'أهلاً بك! أنا د. سمر السيد محمد هاشم، طبيبة صيدلية معتمدة.\nتفضل بالتحدث أو كتابة استفسارك لمساعدتك فوراً.'
                              : 'Hello! I am Dr. Samar Alsayed Mohamed Hashem, Clinical Pharmacist.\nAsk your medication or symptom question to get instant evidence-backed answers.',
                          style: const TextStyle(color: SalusTheme.darkTeal, fontWeight: FontWeight.bold, fontSize: 13, height: 1.5),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          widget.isAr ? 'اضغط على الميكروفون للتحدث أو اختر سؤالاً من الأعلى' : 'Press microphone or select a sample question above',
                          style: const TextStyle(color: SalusTheme.secondaryText, fontSize: 11),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  )
                : ListView(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: SalusTheme.background,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: SalusTheme.primaryTeal.withOpacity(0.2)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.verified, size: 16, color: SalusTheme.primaryTeal),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'المصدر المعتمد: ${_response!.sourceTitle}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10.5, color: SalusTheme.darkTeal),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              widget.isAr ? _response!.answerAr : _response!.answerEn,
                              style: const TextStyle(fontSize: 13, height: 1.5, color: SalusTheme.mainText),
                            ),
                          ],
                        ),
                      ),
                      if (_response!.clarifyingQuestionsAr.isNotEmpty) ...[
                        const SizedBox(height: 14),
                        Text(
                          widget.isAr ? 'أسئلة توضيحية للمتابعة:' : 'Clarifying questions:',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.darkTeal),
                        ),
                        const SizedBox(height: 6),
                        ..._response!.clarifyingQuestionsAr.map((cq) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: SalusTheme.lightMint.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.help_outline, size: 14, color: SalusTheme.primaryTeal),
                                const SizedBox(width: 8),
                                Expanded(child: Text(cq, style: const TextStyle(fontSize: 11.5, color: SalusTheme.darkTeal))),
                              ],
                            ),
                          );
                        }),
                      ],
                    ],
                  ),
          ),

          if (_isListening)
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        widget.isAr ? 'جارٍ الاستماع بالعامية المصرية...' : 'Listening in Egyptian Arabic...',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red.shade900),
                      ),
                    ],
                  ),
                  const Icon(Icons.graphic_eq_rounded, color: Colors.red, size: 20),
                ],
              ),
            ),

          // Microphone & text input bottom bar
          Row(
            children: [
              GestureDetector(
                onTap: () {
                  setState(() => _isListening = !_isListening);
                  if (_isListening) {
                    _ask('أنا باخد أملوديبين وحاسس بدوخة، ده ممكن يكون من الدوا؟');
                  }
                },
                child: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: _isListening ? SalusTheme.criticalRed : SalusTheme.primaryTeal,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(_isListening ? Icons.mic_off : Icons.mic, color: Colors.white),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _controller,
                  onSubmitted: (val) {
                    if (val.trim().isNotEmpty) _ask(val.trim());
                  },
                  decoration: InputDecoration(
                    hintText: widget.isAr ? 'اكتب سؤالك أو اضغط الميكروفون...' : 'Type or speak your question...',
                    hintStyle: const TextStyle(fontSize: 12),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              IconButton(
                icon: const Icon(Icons.send_rounded, color: SalusTheme.darkTeal),
                onPressed: () {
                  if (_controller.text.trim().isNotEmpty) {
                    _ask(_controller.text.trim());
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
