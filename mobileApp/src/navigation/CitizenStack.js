// src/navigation/CitizenStack.js - COMPATIBLE WITH NATIVEWIND v2
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home as HomeIcon, FileText, User, HelpCircle, MapPin } from 'lucide-react-native';

// ── Auth Screens ──────────────────────────────────────────
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

// ── Splash ────────────────────────────────────────────────
import { SplashScreen } from '../screens/SplashScreen';

// ── Citizen Screens ───────────────────────────────────────
import { HomeScreen } from '../screens/citizen/HomeScreen';
import { RecordFirScreen } from '../screens/citizen/RecordFirScreen';
import { TranscriptionScreen } from '../screens/citizen/TranscriptionScreen';
import { DraftFirScreen } from '../screens/citizen/DraftFirScreen';
import { ConfirmationScreen } from '../screens/citizen/ConfirmationScreen';
import { MyFirsScreen } from '../screens/citizen/MyFirsScreen';
import { FIRDetailsScreen } from '../screens/citizen/FIRDetailsScreen';
import { TrackFirScreen } from '../screens/citizen/TrackFirScreen';
import { ProfileScreen } from '../screens/citizen/ProfileScreen';
import { HelpScreen } from '../screens/citizen/HelpScreen';
import { SettingsScreen } from '../screens/citizen/SettingsScreen';
import { EmergencyScreen } from '../screens/citizen/EmergencyScreen';
import { NotificationsScreen } from '../screens/citizen/NotificationsScreen';
import { PrivacyScreen } from '../screens/citizen/PrivacyScreen';
import { ChangePasswordScreen } from '../screens/citizen/ChangePasswordScreen';

// ── Layout ────────────────────────────────────────────────
import { Header } from '../components/layout/Header';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─────────────────────────────────────────────────────────
// Custom Header
// ─────────────────────────────────────────────────────────
const CustomHeader = ({ navigation, route, options, back }) => {
  const title = options.title || route.name;
  const subtitle = options.subtitle;

  return (
    <Header
      title={title}
      subtitle={subtitle}
      onBack={back ? () => navigation.goBack() : undefined}
      showNotification={options.showNotification !== false}
      showSearch={options.showSearch}
      showMenu={options.showMenu}
      onNotificationPress={() => navigation.navigate('Notifications')}
    />
  );
};

// ─────────────────────────────────────────────────────────
// Home Stack
// ─────────────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RecordFIR"
        component={RecordFirScreen}
        options={{
          title: 'Record FIR',
          subtitle: 'Speak clearly in Urdu or English',
          showNotification: true,
        }}
      />
      <Stack.Screen
        name="Transcription"
        component={TranscriptionScreen}
        options={{
          title: 'Review Transcription',
          subtitle: 'Edit before proceeding',
          showNotification: true,
        }}
      />
      <Stack.Screen
        name="DraftFIR"
        component={DraftFirScreen}
        options={({ route }) => ({
          title: route.params?.mode === 'edit' ? 'Edit FIR' : 'Create FIR',
          subtitle: 'Fill all required details',
          showNotification: true,
        })}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{
          title: 'FIR Submitted',
          subtitle: 'Successfully submitted to police',
          headerLeft: null,
        }}
      />
    </Stack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────
// My FIRs Stack
// ─────────────────────────────────────────────────────────
function MyFirsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="MyFirsMain"
        component={MyFirsScreen}
        options={{
          title: 'My FIRs',
          subtitle: 'Track all your filed complaints',
          showNotification: true,
          showSearch: true,
        }}
      />
      <Stack.Screen
        name="FIRDetails"
        component={FIRDetailsScreen}
        options={({ route }) => ({
          title: 'FIR Details',
          subtitle: `FIR ID: ${route.params?.firId || ''}`,
          showNotification: true,
        })}
      />
      <Stack.Screen
        name="TrackFIR"
        component={TrackFirScreen}
        options={{
          title: 'Track FIR Status',
          subtitle: 'Real-time investigation updates',
          showNotification: true,
        }}
      />
    </Stack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────
// Profile Stack
// ─────────────────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          subtitle: 'Manage your account and settings',
          showNotification: true,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          subtitle: 'App preferences',
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
          subtitle: 'Update security',
        }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          title: 'Privacy & Security',
          subtitle: 'Your data protection',
        }}
      />
    </Stack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────
// Help Stack
// ─────────────────────────────────────────────────────────
function HelpStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="HelpMain"
        component={HelpScreen}
        options={{
          title: 'Help & Support',
          subtitle: 'Get assistance with filing FIRs',
          showNotification: true,
        }}
      />
      <Stack.Screen
        name="HelpEmergency"
        component={EmergencyScreen}
        options={{
          title: 'Emergency Contacts',
          subtitle: 'Immediate help numbers',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          subtitle: 'All your alerts and updates',
        }}
      />
    </Stack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────
// Main Bottom Tab Navigator
// ─────────────────────────────────────────────────────────
export function CitizenStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let Icon;
          const iconSize = focused ? 24 : 22;

          if (route.name === 'Home') Icon = Home;
          else if (route.name === 'MyFIRs') Icon = FileText;
          else if (route.name === 'Emergency') Icon = MapPin;
          else if (route.name === 'Help') Icon = HelpCircle;
          else if (route.name === 'Profile') Icon = User;

          return (
            <View style={focused ? { marginTop: 4 } : { marginTop: 0 }}>
              <Icon size={iconSize} color={color} />
              {focused && (
                <View className="w-1 h-1 bg-blue-600 rounded-full mt-1" />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: 'Home', tabBarTestID: 'home-tab' }}
      />
      <Tab.Screen
        name="MyFIRs"
        component={MyFirsStack}
        options={{ title: 'My FIRs', tabBarTestID: 'my-firs-tab' }}
      />
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{ title: 'Emergency', tabBarTestID: 'emergency-tab' }}
      />
      <Tab.Screen
        name="Help"
        component={HelpStack}
        options={{ title: 'Help', tabBarTestID: 'help-tab' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: 'Profile', tabBarTestID: 'profile-tab' }}
      />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────
// Auth Stack  ← NEW screens added here
// ─────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="VerifyOTP"
        component={OTPVerificationScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────
// Root Stack  ← Entry point of entire app
// ─────────────────────────────────────────────────────────
export function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Splash — shows first, decides where to go */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: 'fade' }}
      />

      {/* Auth flow */}
      <Stack.Screen
        name="Auth"
        component={AuthStack}
        options={{ animation: 'fade' }}
      />

      {/* Main app (tabs) — only after login */}
      <Stack.Screen
        name="Main"
        component={CitizenStack}
        options={{
          animation: 'slide_from_right',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}