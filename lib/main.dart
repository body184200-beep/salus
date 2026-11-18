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
  int _navIndex = 0; // 0: Landing, 1: Patient, 2: Search, 3: Pharmacist/Doctor

  void _showDoctorRegisterDialog(BuildContext context) {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final specialtyController = TextEditingController();
    final hospitalController = TextEditingController();
    final isAr = widget.state.language == 'ar';

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SalusTheme.lightMint,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.person_add_alt_1_rounded, color: SalusTheme.primaryTeal),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isAr ? 'إنشاء حساب دكتور جديد' : 'Doctor Account Registration',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: SalusTheme.darkTeal),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  isAr
                      ? 'يمكن لأي طبيب التسجيل في سالوس والوصول الفوري لمتابعة الحالات ومراجعة أمان الأدوية.'
                      : 'Any doctor can register on SALUS for instant clinical case review and medication safety oversight.',
                  style: const TextStyle(fontSize: 12, color: SalusTheme.secondaryText, height: 1.4),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: isAr ? 'اسم الطبيب بالكامل' : 'Doctor Full Name',
                    hintText: isAr ? 'د. محمد مصطفى' : 'Dr. Mohamed Mostafa',
                    prefixIcon: const Icon(Icons.badge_outlined, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: isAr ? 'البريد الإلكتروني' : 'Email Address',
                    hintText: 'doctor@hospital.eg',
                    prefixIcon: const Icon(Icons.email_outlined, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: specialtyController,
                  decoration: InputDecoration(
                    labelText: isAr ? 'التخصص الطبي' : 'Medical Specialty',
                    hintText: isAr ? 'أمراض الباطنة والقلب' : 'Internal Medicine & Cardiology',
                    prefixIcon: const Icon(Icons.medical_services_outlined, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: hospitalController,
                  decoration: InputDecoration(
                    labelText: isAr ? 'المستشفى أو العيادة' : 'Hospital / Clinic',
                    hintText: isAr ? 'مستشفى قصر العيني / عيادة خاصة' : 'Kasr Al Ainy / Private Clinic',
                    prefixIcon: const Icon(Icons.local_hospital_outlined, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: Text(isAr ? 'إلغاء' : 'Cancel'),
            ),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: SalusTheme.primaryTeal,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                final name = nameController.text.trim();
                final email = emailController.text.trim();
                if (name.isEmpty || email.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(isAr ? 'يرجى كتابة الاسم والبريد الإلكتروني' : 'Please enter name and email'),
                      backgroundColor: SalusTheme.criticalRed,
                    ),
                  );
                  return;
                }

                final doc = widget.state.registerDoctor(
                  name: name,
                  email: email,
                  specialty: specialtyController.text.trim(),
                  clinicOrHospital: hospitalController.text.trim(),
                );

                Navigator.pop(dialogCtx);
                setState(() => _navIndex = 3);

                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(isAr
                        ? 'مرحباً ${doc.displayName}! تم تفعيل حسابك كطبيب بنجاح.'
                        : 'Welcome ${doc.displayName}! Doctor account activated.'),
                    backgroundColor: SalusTheme.primaryTeal,
                  ),
                );
              },
              icon: const Icon(Icons.check, size: 18),
              label: Text(isAr ? 'تسجيل ودخول البوابة' : 'Register & Enter'),
            ),
          ],
        );
      },
    );
  }

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

          // Register Doctor Quick Action
          IconButton(
            icon: const Icon(Icons.person_add_alt_1_outlined, color: SalusTheme.primaryTeal),
            tooltip: isAr ? 'تسجيل دكتور جديد' : 'Register Doctor',
            onPressed: () => _showDoctorRegisterDialog(context),
          ),

          // Quick Demo Accounts Menu
          PopupMenuButton<dynamic>(
            icon: const Icon(Icons.account_circle_outlined, color: SalusTheme.darkTeal),
            tooltip: isAr ? 'الحسابات وإدارة الدخول' : 'Accounts Menu',
            onSelected: (val) {
              if (val == 'register_doc') {
                _showDoctorRegisterDialog(context);
                return;
              }
              final user = val as AppUser;
              state.loginAs(user);
              setState(() {
                _navIndex = (user.isPharmacist || user.isDoctor || user.isNurse) ? 3 : 1;
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
                value: AppState.demoDoctor,
                child: ListTile(
                  dense: true,
                  leading: const Icon(Icons.health_and_safety_rounded, color: Colors.blueAccent),
                  title: const Text('د. محمد طارق (طبيب بشري معتمد)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  subtitle: Text(isAr ? 'حساب طبيب - صلاحيات سريرية كاملة' : 'Full Clinical Physician Privileges', style: const TextStyle(fontSize: 10, color: Colors.blueAccent)),
                ),
              ),
              PopupMenuItem(
                value: AppState.demoNurse,
                child: ListTile(
                  dense: true,
                  leading: const Icon(Icons.support_agent_rounded, color: Color(0xFF10B981)),
                  title: const Text('الممرضة: شهد السيد هاشم', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  subtitle: Text(isAr ? 'تمريض إكلينيكي ورعاية المرضى' : 'Clinical Nurse & Patient Support', style: const TextStyle(fontSize: 10, color: Color(0xFF10B981))),
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
              const PopupMenuDivider(),
              PopupMenuItem(
                value: 'register_doc',
                child: ListTile(
                  dense: true,
                  leading: const Icon(Icons.person_add, color: SalusTheme.darkTeal),
                  title: Text(isAr ? 'تسجيل دكتور جديد (أي طبيب)' : 'Register New Doctor', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: SalusTheme.darkTeal)),
                  subtitle: Text(isAr ? 'إنشاء حساب طبيب فوري' : 'Instant Doctor Account Creation', style: const TextStyle(fontSize: 10)),
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
            onDoctorRegister: () => _showDoctorRegisterDialog(context),
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

      // Floating Egyptian Voice Assistant Button: Nurse Shahd El-Sayed Hashem
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
        icon: const Icon(Icons.support_agent_rounded),
        label: Text(
          isAr ? 'الممرضة: شهد السيد هاشم' : 'Nurse Shahd Assistant',
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
            state.loginAs(AppState.demoDoctor);
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
            label: isAr ? 'لوحة الطبيب والصيدلي' : 'Doctor & Clinical',
          ),
        ],
      ),
    );
  }
}
