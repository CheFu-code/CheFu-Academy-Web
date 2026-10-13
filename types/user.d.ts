import { NotificationPreferences } from "@/lib/notificationPreferences";

type SerializedDate = Date | string | number;

export interface User {
    id: string;
    email: string;
    fullname: string;
    profilePicture?: string;
    bio?: string;
    country: string;
    countryCode?: string;
    createdAt: SerializedDate;
    updatedAt: SerializedDate;
    fcmToken?: string;
    isVerified: boolean;
    language: string;
    learningGoal?: string;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
    learningInterests?: string[];
    weeklyLearningGoal?: number;
    lessonStyle?: 'short' | 'detailed' | 'example-heavy';
    defaultCourseDifficulty?: 'beginner' | 'intermediate' | 'advanced';
    preferredContentFormat?: 'text' | 'examples' | 'quizzes';
    aiTutorSuggestions?: boolean;
    privacy?: {
        publicProfile?: boolean;
        showCompletedCourses?: boolean;
        showCountry?: boolean;
        personalizedAiRecommendations?: boolean;
    };
    lastLogin: SerializedDate;
    lastSeen: SerializedDate;
    member: boolean;
    favoriteCourseIds?: string[];
    favoriteCoursesUpdatedAt?: SerializedDate;
    onboardingComplete: boolean;
    appGuideComplete?: boolean;
    provider: string;
    roles: string[];
    subscriptionStatus: string;
    uid: string;
    memberUntil?: SerializedDate;
    emailPreferences: NotificationPreferences;
    deviceInfo: {
        deviceBrand: string;
        deviceModel: string;
        deviceName: string;
        isRTL: boolean;
        isTablet: boolean;
        manufacturer: string;
        orientation: string;
        os: string;
        osVersion: number;
        screenHeight: number;
        screenWidth: number;
        totalMemory: number;
    };

}


export interface UserDropdownProps {
    user: User | null;
}
