import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.profile": "Profile", 
      "nav.pathways": "Learning Pathways",
      "nav.catalog": "Course Catalog",
      "nav.achievements": "Achievements",
      "nav.industry": "Industry Insights",
      "nav.settings": "Settings",
      "nav.logout": "Logout",
      
      // Dashboard
      "dashboard.welcome": "Welcome back, {{name}}!",
      "dashboard.subtitle": "Continue your journey to becoming a {{role}}",
      "dashboard.learningProgress": "Learning Progress",
      "dashboard.badgesEarned": "Badges Earned",
      "dashboard.studyTime": "Study Time",
      "dashboard.skillMatch": "Skill Match",
      "dashboard.industryAlignment": "Industry alignment",
      "dashboard.aiAnalysis": "AI Skill Gap Analysis",
      "dashboard.updateAnalysis": "Update Analysis",
      "dashboard.nextSteps": "Recommended Next Steps",
      "dashboard.currentCourses": "Current Courses",
      "dashboard.industryInsights": "Industry Insights",
      "dashboard.recentAchievements": "Recent Achievements",
      
      // Profile
      "profile.title": "Profile",
      "profile.basicInfo": "Basic Information",
      "profile.academicBackground": "Academic Background",
      "profile.currentRole": "Current Role",
      "profile.careerAspirations": "Career Aspirations",
      "profile.learningPace": "Learning Pace",
      "profile.save": "Save Profile",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "An error occurred",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.continue": "Continue",
      "common.viewAll": "View All",
      "common.beginner": "Beginner",
      "common.intermediate": "Intermediate", 
      "common.advanced": "Advanced",
    }
  },
  hi: {
    translation: {
      // Navigation
      "nav.dashboard": "डैशबोर्ड",
      "nav.profile": "प्रोफाइल",
      "nav.pathways": "शिक्षण पथ",
      "nav.catalog": "कोर्स सूची",
      "nav.achievements": "उपलब्धियां",
      "nav.industry": "उद्योग अंतर्दृष्टि",
      "nav.settings": "सेटिंग्स",
      "nav.logout": "लॉगआउट",
      
      // Dashboard
      "dashboard.welcome": "वापस स्वागत है, {{name}}!",
      "dashboard.subtitle": "{{role}} बनने की अपनी यात्रा जारी रखें",
      "dashboard.learningProgress": "सीखने की प्रगति",
      "dashboard.badgesEarned": "अर्जित बैज",
      "dashboard.studyTime": "अध्ययन समय",
      "dashboard.skillMatch": "कौशल मैच",
      "dashboard.industryAlignment": "उद्योग संरेखण",
      "dashboard.aiAnalysis": "AI कौशल अंतर विश्लेषण",
      "dashboard.updateAnalysis": "विश्लेषण अपडेट करें",
      "dashboard.nextSteps": "अनुशंसित अगले कदम",
      "dashboard.currentCourses": "वर्तमान कोर्स",
      "dashboard.industryInsights": "उद्योग अंतर्दृष्टि",
      "dashboard.recentAchievements": "हाल की उपलब्धियां",
      
      // Profile
      "profile.title": "प्रोफाइल",
      "profile.basicInfo": "बुनियादी जानकारी",
      "profile.academicBackground": "शैक्षणिक पृष्ठभूमि",
      "profile.currentRole": "वर्तमान भूमिका",
      "profile.careerAspirations": "करियर की आकांक्षाएं",
      "profile.learningPace": "सीखने की गति",
      "profile.save": "प्रोफाइल सेव करें",
      
      // Common
      "common.loading": "लोड हो रहा है...",
      "common.error": "एक त्रुटि हुई",
      "common.save": "सेव करें",
      "common.cancel": "रद्द करें",
      "common.continue": "जारी रखें",
      "common.viewAll": "सभी देखें",
      "common.beginner": "शुरुआती",
      "common.intermediate": "मध्यम",
      "common.advanced": "उन्नत",
    }
  },
  ta: {
    translation: {
      // Navigation
      "nav.dashboard": "டாஷ்போர்டு",
      "nav.profile": "சுயவிவரம்",
      "nav.pathways": "கற்றல் பாதைகள்",
      "nav.catalog": "பாடநெறி பட்டியல்",
      "nav.achievements": "சாதனைகள்",
      "nav.industry": "தொழில்துறை நுண்ணறிவு",
      "nav.settings": "அமைப்புகள்",
      "nav.logout": "வெளியேறு",
      
      // Dashboard
      "dashboard.welcome": "மீண்டும் வரவேற்கிறோம், {{name}}!",
      "dashboard.subtitle": "{{role}} ஆக மாறுவதற்கான உங்கள் பயணத்தைத் தொடருங்கள்",
      "dashboard.learningProgress": "கற்றல் முன்னேற்றம்",
      "dashboard.badgesEarned": "பெற்ற பேட்ஜ்கள்",
      "dashboard.studyTime": "பாடக்கில் நேரம்",
      "dashboard.skillMatch": "திறமை பொருத்தம்",
      "dashboard.industryAlignment": "தொழில்துறை சீரமைப்பு",
      "dashboard.aiAnalysis": "AI திறமை இடைவெளி பகுப்பாய்வு",
      "dashboard.updateAnalysis": "பகுப்பாய்வு புதுப்பிக்கவும்",
      "dashboard.nextSteps": "பரிந்துரைக்கப்பட்ட அடுத்த படிகள்",
      "dashboard.currentCourses": "தற்போதைய பாடநெறிகள்",
      "dashboard.industryInsights": "தொழில்துறை நுண்ணறிவு",
      "dashboard.recentAchievements": "சமீபத்திய சாதனைகள்",
      
      // Common
      "common.loading": "ஏற்றுகிறது...",
      "common.error": "ஒரு பிழை ஏற்பட்டது",
      "common.save": "சேமி",
      "common.cancel": "ரத்து செய்",
      "common.continue": "தொடர்",
      "common.viewAll": "அனைத்தையும் பார்",
      "common.beginner": "ஆரம்பநிலை",
      "common.intermediate": "இடைநிலை",
      "common.advanced": "மேம்பட்ட",
    }
  },
  te: {
    translation: {
      // Navigation
      "nav.dashboard": "డాష్‌బోర్డ్",
      "nav.profile": "ప్రొఫైల్",
      "nav.pathways": "నేర్చుకునే మార్గాలు",
      "nav.catalog": "కోర్సు కేటలాగ్",
      "nav.achievements": "సాధనలు",
      "nav.industry": "ఇండస్ట్రీ అంతర్దృష్టులు",
      "nav.settings": "సెట్టింగులు",
      "nav.logout": "లాగ్ అవుట్",
      
      // Dashboard
      "dashboard.welcome": "మళ్ళీ స్వాగతం, {{name}}!",
      "dashboard.subtitle": "{{role}} అవ్వడానికి మీ ప్రయాణాన్ని కొనసాగించండి",
      "dashboard.learningProgress": "నేర్చుకోవడంలో పురోగతి",
      "dashboard.badgesEarned": "సంపాదించిన బ్యాడ్జిలు",
      "dashboard.studyTime": "చదువు సమయం",
      "dashboard.skillMatch": "నైపుణ్య మ్యాచ్",
      "dashboard.industryAlignment": "ఇండస్ట్రీ అలైన్‌మెంట్",
      "dashboard.aiAnalysis": "AI నైపుణ్య గ్యాప్ విశ్లేషణ",
      "dashboard.updateAnalysis": "విశ్లేషణ నవీకరించు",
      "dashboard.nextSteps": "సిఫార్సు చేయబడిన తదుపరి దశలు",
      "dashboard.currentCourses": "ప్రస్తుత కోర్సులు",
      "dashboard.industryInsights": "ఇండస్ట్రీ అంతర్దృష్టులు",
      "dashboard.recentAchievements": "ఇటీవలి సాధనలు",
      
      // Common
      "common.loading": "లోడ్ చేస్తోంది...",
      "common.error": "లోపం సంభవించింది",
      "common.save": "సేవ్ చేయి",
      "common.cancel": "రద్దు చేయి",
      "common.continue": "కొనసాగించు",
      "common.viewAll": "అన్నీ చూడండి",
      "common.beginner": "ప్రారంభ స్థాయి",
      "common.intermediate": "మధ్య స్థాయి",
      "common.advanced": "ఉన్నత స్థాయి",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
