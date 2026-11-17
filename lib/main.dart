import 'package:flutter/material.dart';
import 'theme/salus_theme.dart';
import 'models/models.dart';
import 'providers/app_state.dart';
import 'screens/landing_screen.dart';
import 'screens/patient_dashboard.dart';
import 'screens/pharmacist_dashboard.dart';
import 'screens/medication_search_screen.dart';
import 'screens/voice_assistant_sheet.dart';

void main() {
  runApp(const SalusApp());
}

class SalusApp extends StatefulWidget {
  const SalusApp({super.key});

  @override
  State<SalusApp> createState() => _SalusAppState();
}

class _SalusAppState extends State<SalusApp> {
  final AppState _appState = AppState();

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _appState,
      builder: (context, _) {
        final isAr = _appState.language == 'ar';

        return MaterialApp(
          title: 'SALUS | سالوس',
          debugShowCheckedModeBanner: false,
          theme: SalusTheme.lightTheme,
          builder: (context, child) {
            return Directionality(
              textDirection: isAr ? TextDirection.rtl : TextDirection.ltr,
              child: child!,
            );
          },
          home: SalusMainScreen(state: _appState),
        );
      },
    );
  }
}

class SalusMainScreen extends StatefulWidget {
  final AppState state;

  const SalusMainScreen({super.key, required this.state});

  @override
  State<SalusMainScreen> createState() => _SalusMainScreenState();
}

class _SalusMainScreenState extends State<SalusMainScreen> {
  int _navIndex = 0; // 0: Landing, 1: Patient, 2: Search, 3: Pharmacist

  @override
  Widget build(BuildContext context) {
    final state = widget.state;
    final isAr = state.language == 'ar';

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                'assets/images/salus_logo.png',
                width: 34,
                height: 34,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: SalusTheme.primaryTeal,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.shield_rounded, color: Colors.white, size: 20),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Row(
                  children: [
                    Text('SALUS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: SalusTheme.darkTeal)),
                    SizedBox(width: 6),
                    Text('سالوس', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: SalusTheme.primaryTeal)),
                  ],
                ),
                Text(
                  isAr ? 'افهم دواءك. خليك في أمان.' : 'Know Your Medicine. Stay Safer.',
                  style: const TextStyle(fontSize: 10, color: SalusTheme.secondaryText),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Language Switcher
          TextButton.icon(
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              foregroundColor: SalusTheme.darkTeal,
            ),
            onPressed: () => state.toggleLanguage(),
            icon: const Icon(Icons.language, size: 18, color: SalusTheme.primaryTeal),
            label: Text(
              isAr ? 'English' : 'العربية',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),

          // Quick Demo Accounts Menu
          PopupMenuButton<AppUser>(
            icon: const Icon(Icons.account_circle_outlined, color: SalusTheme.darkTeal),
            tooltip: isAr ? 'الحسابات التجريبية' : 'Demo Accounts',
            onSelected: (user) {
              state.loginAs(user);
              setState(() {
                _navIndex = user.isPharmacist ? 3 : 1;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('تم التبديل إلى: ${user.displayName}'),
                  backgroundColor: SalusTheme.primaryTeal,
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            itemBuilder: (ctx) => [
              PopupMenuItem(
                value: AppState.demoPatient,
                child: const ListTile(
                  dense: true,
                  leading: Icon(Icons.person, color: SalusTheme.primaryTeal),
                  title: Text('أحمد حسن (مريض)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  subtitle: Text('ضغط الدم والسكري + سجل أعراض', style: TextStyle(fontSize: 10)),
                ),
              ),
              PopupMenuItem(
                value: AppState.demoVerifiedPharmacist,
                child: ListTile(
                  dense: true,
                  leading: const Icon(Icons.medical_services, color: Color(0xFF10B981)),
                  title: const Text('د. مريم فاروق (صيدلي مرخص)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  subtitle: Text(isAr ? 'معتمد نقابياً - الصلاحيات مفعلة' : 'Verified Clinical Privileges', style: const TextStyle(fontSize: 10, color: Color(0xFF10B981))),
                ),
              ),
              PopupMenuItem(
                value: AppState.demoPendingPharmacist,
                child: ListTile(
                  dense: true,
                  leading: const Icon(Icons.lock_clock, color: Colors.amber),
                  title: const Text('د. كريم زكي (صيدلي قيد المراجعة)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  subtitle: Text(isAr ? 'صلاحيات سريرية معلقة' : 'Syndicate Verification Pending', style: const TextStyle(fontSize: 10, color: Colors.amber)),
                ),
              ),
            ],
          ),
        ],
      ),

      // Screen Body
      body: IndexedStack(
        index: _navIndex,
        children: [
          LandingScreen(
            state: state,
            onGetStarted: () {
              state.loginAs(AppState.demoPatient);
              setState(() => _navIndex = 1);
            },
            onPharmacistPortal: () {
              state.loginAs(AppState.demoVerifiedPharmacist);
              setState(() => _navIndex = 3);
            },
            onSearchMeds: () => setState(() => _navIndex = 2),
          ),
          PatientDashboard(state: state),
          MedicationSearchScreen(state: state),
          PharmacistDashboard(state: state),
        ],
      ),

      // Floating Egyptian Voice Assistant Button
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: SalusTheme.primaryTeal,
        foregroundColor: Colors.white,
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (_) => VoiceAssistantSheet(isAr: isAr),
          );
        },
        icon: const Icon(Icons.mic),
        label: Text(
          isAr ? 'المساعد الصوتي' : 'Voice Assistant',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        ),
      ),

      // Bottom Navigation Bar
      bottomNavigationBar: NavigationBar(
        selectedIndex: _navIndex,
        onDestinationSelected: (idx) {
          if (idx == 1 && state.currentUser == null) {
            state.loginAs(AppState.demoPatient);
          } else if (idx == 3 && state.currentUser == null) {
            state.loginAs(AppState.demoVerifiedPharmacist);
          }
          setState(() => _navIndex = idx);
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home, color: SalusTheme.primaryTeal),
            label: isAr ? 'الرئيسية' : 'Home',
          ),
          NavigationDestination(
            icon: const Icon(Icons.personal_injury_outlined),
            selectedIcon: const Icon(Icons.personal_injury, color: SalusTheme.primaryTeal),
            label: isAr ? 'المريض والأعراض' : 'Patient',
          ),
          NavigationDestination(
            icon: const Icon(Icons.search_outlined),
            selectedIcon: const Icon(Icons.search, color: SalusTheme.primaryTeal),
            label: isAr ? 'دليل الأدوية' : 'Drugs',
          ),
          NavigationDestination(
            icon: const Icon(Icons.medical_information_outlined),
            selectedIcon: const Icon(Icons.medical_information, color: SalusTheme.primaryTeal),
            label: isAr ? 'لوحة الصيدلي' : 'Pharmacist',
          ),
        ],
      ),
    );
  }
}
