import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from '@/components/ui/tabs';
import { User } from '@/types/user';
import { toJsDate } from '@/utils/toJSDate';
import {
    Brain,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Copy,
    Globe2,
    Mail,
    MapIcon,
    MonitorCog,
    RotateCcw,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    Target,
    Trash2,
    UserRoundCog
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import countryList from 'react-select-country-list';
import { toast } from 'sonner';

type SaveKey =
    | null
    | 'fullname'
    | 'bio'
    | 'country'
    | 'learning'
    | 'privacy'
    | 'export'
    | 'resetOnboarding'
    | 'clearProgress';

const ProfileTabUI = ({
    user,
    name,
    setName,
    bio,
    setBio,
    updateField,
    updateCountry,
    updateAccountSettings,
    exportAccountData,
    resetOnboarding,
    clearLearningProgress,
    saving,
    loggingOut,
    handleLogout,
}: {
    user: User;
    name: string;
    setName: (value: string) => void;
    bio: string;
    setBio: (value: string) => void;
    updateField: (field: 'fullname' | 'bio', value: string) => void;
    updateCountry: (countryCode: string) => void;
    updateAccountSettings: (
        payload: Record<string, unknown>,
        savingKey: NonNullable<SaveKey>,
        successMessage: string,
    ) => void;
    exportAccountData: () => void;
    resetOnboarding: () => void;
    clearLearningProgress: () => void;
    saving: SaveKey;
    loggingOut: boolean;
    handleLogout: () => void;
}) => {
    const countries = useMemo(() => countryList().getData(), []);
    const [countryCode, setCountryCode] = useState(user.countryCode || '');
    const [language, setLanguage] = useState(user.language || 'English');
    const [learningGoal, setLearningGoal] = useState(user.learningGoal || '');
    const [skillLevel, setSkillLevel] = useState(
        user.skillLevel || 'beginner',
    );
    const [interests, setInterests] = useState(
        user.learningInterests?.join(', ') || '',
    );
    const [weeklyLearningGoal, setWeeklyLearningGoal] = useState(
        String(user.weeklyLearningGoal || 3),
    );
    const [lessonStyle, setLessonStyle] = useState(
        user.lessonStyle || 'example-heavy',
    );
    const [defaultCourseDifficulty, setDefaultCourseDifficulty] = useState(
        user.defaultCourseDifficulty || 'beginner',
    );
    const [preferredContentFormat, setPreferredContentFormat] = useState(
        user.preferredContentFormat || 'examples',
    );
    const [aiTutorSuggestions, setAiTutorSuggestions] = useState(
        user.aiTutorSuggestions ?? true,
    );
    const [privacy, setPrivacy] = useState({
        publicProfile: user.privacy?.publicProfile ?? false,
        showCompletedCourses: user.privacy?.showCompletedCourses ?? false,
        showCountry: user.privacy?.showCountry ?? true,
        personalizedAiRecommendations:
            user.privacy?.personalizedAiRecommendations ?? true,
    });
    const [desktopAvailable, setDesktopAvailable] = useState(false);
    const [autoLaunch, setAutoLaunch] = useState(false);
    const [desktopInfo, setDesktopInfo] = useState<{
        isPackaged: boolean;
        name: string;
        platform: string;
        userDataPath: string;
        version: string;
    } | null>(null);
    const [checkingUpdates, setCheckingUpdates] = useState(false);
    const [reminderMinutes, setReminderMinutes] = useState('1440');

    useEffect(() => {
        setCountryCode(user.countryCode || '');
    }, [user.countryCode]);

    useEffect(() => {
        if (!window.chefuDesktop?.isElectron) return;
        setDesktopAvailable(true);
        void window.chefuDesktop.getAutoLaunch().then(setAutoLaunch);
        void window.chefuDesktop.getAppInfo().then(setDesktopInfo);
    }, []);

    useEffect(() => {
        setLanguage(user.language || 'English');
        setLearningGoal(user.learningGoal || '');
        setSkillLevel(user.skillLevel || 'beginner');
        setInterests(user.learningInterests?.join(', ') || '');
        setWeeklyLearningGoal(String(user.weeklyLearningGoal || 3));
        setLessonStyle(user.lessonStyle || 'example-heavy');
        setDefaultCourseDifficulty(user.defaultCourseDifficulty || 'beginner');
        setPreferredContentFormat(user.preferredContentFormat || 'examples');
        setAiTutorSuggestions(user.aiTutorSuggestions ?? true);
        setPrivacy({
            publicProfile: user.privacy?.publicProfile ?? false,
            showCompletedCourses: user.privacy?.showCompletedCourses ?? false,
            showCountry: user.privacy?.showCountry ?? true,
            personalizedAiRecommendations:
                user.privacy?.personalizedAiRecommendations ?? true,
        });
    }, [user]);

    const roles = user.roles?.length
        ? user.roles.map(role => role.charAt(0).toUpperCase() + role.slice(1))
        : ['Anonymous'];

    const createdDate = user.createdAt
        ? toJsDate(user.createdAt)?.toLocaleDateString() || 'N/A'
        : 'N/A';

    const subscription = user.subscriptionStatus
        ? user.subscriptionStatus.toUpperCase()
        : 'N/A';
    const lastLogin = user.lastLogin
        ? toJsDate(user.lastLogin)?.toLocaleString() || 'N/A'
        : 'N/A';

    const memberUntil = user.memberUntil
        ? toJsDate(user.memberUntil)?.toLocaleDateString() || 'N/A'
        : 'N/A';

    const copyToClipboard = async (label: string, value: string) => {
        if (!value || value === 'N/A') {
            toast.error(`No ${label} available to copy.`);
            return;
        }
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied.`);
        } catch {
            toast.error(`Failed to copy ${label}.`);
        }
    };

    const saveLearningPreferences = () => {
        const parsedGoal = Number(weeklyLearningGoal);
        updateAccountSettings(
            {
                language: language.trim() || 'English',
                learningGoal: learningGoal.trim(),
                skillLevel,
                learningInterests: interests
                    .split(',')
                    .map(item => item.trim())
                    .filter(Boolean),
                weeklyLearningGoal: Number.isFinite(parsedGoal)
                    ? Math.max(0, parsedGoal)
                    : 0,
                lessonStyle,
                defaultCourseDifficulty,
                preferredContentFormat,
                aiTutorSuggestions,
            },
            'learning',
            'Learning preferences saved.',
        );
    };

    const savePrivacyControls = () => {
        updateAccountSettings(
            { privacy },
            'privacy',
            'Privacy controls saved.',
        );
    };

    const toggleAutoLaunch = async (enabled: boolean) => {
        if (!window.chefuDesktop?.isElectron) return;
        const next = await window.chefuDesktop.setAutoLaunch(enabled);
        setAutoLaunch(next);
        toast.success(next ? 'Desktop autolaunch enabled.' : 'Desktop autolaunch disabled.');
    };

    const scheduleDesktopReminder = async () => {
        if (!window.chefuDesktop?.isElectron) return;
        const minutes = Number(reminderMinutes);
        const ok = await window.chefuDesktop.scheduleReminder(minutes);
        if (ok) {
            toast.success('Desktop learning reminder scheduled.');
        } else {
            toast.error('Enter a valid reminder interval.');
        }
    };

    const checkDesktopUpdates = async () => {
        if (!window.chefuDesktop?.isElectron) return;
        setCheckingUpdates(true);

        try {
            const result = await window.chefuDesktop.checkForUpdates();

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success(
                result.hasUpdate
                    ? `CheFu Academy ${result.latestVersion} is available.`
                    : 'CheFu Academy is up to date.',
            );
        } finally {
            setCheckingUpdates(false);
        }
    };

    const copyDesktopDataPath = async () => {
        if (!window.chefuDesktop?.isElectron || !desktopInfo?.userDataPath) return;
        await window.chefuDesktop.copyText(desktopInfo.userDataPath);
        toast.success('Desktop data folder path copied.');
    };

    return (
        <TabsContent value="profile" className="mt-4 sm:mt-6">
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-base sm:text-lg">Edit Profile</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Update your personal details and review account information.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border bg-muted/20 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <ShieldCheck className="h-4 w-4 text-cyan-500" />
                                Verification
                            </div>
                            <div className="mt-3">
                                {user.isVerified ? (
                                    <Badge className="bg-green-600 text-white">
                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">
                                        <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                                        Not verified
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <CalendarDays className="h-4 w-4 text-cyan-500" />
                                Member since
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {createdDate}
                            </p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Globe2 className="h-4 w-4 text-cyan-500" />
                                Subscription
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {subscription}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Basic Info
                        </h3>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Display Name</Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                    id="name"
                                    placeholder="Your display name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                                <Button
                                    className="cursor-pointer sm:w-24"
                                    size="sm"
                                    onClick={() => updateField('fullname', name)}
                                    disabled={
                                        name.trim() === user.fullname ||
                                        saving === 'fullname' ||
                                        !name.trim()
                                    }
                                >
                                    {saving === 'fullname' ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                    id="bio"
                                    placeholder="Tell us about yourself"
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                />
                                <Button
                                    className="cursor-pointer sm:w-24"
                                    size="sm"
                                    onClick={() => updateField('bio', bio)}
                                    disabled={
                                        bio.trim() === (user.bio || '') ||
                                        saving === 'bio'
                                    }
                                >
                                    {saving === 'bio' ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Country</Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Select
                                    value={countryCode}
                                    onValueChange={setCountryCode}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select your country" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72">
                                        {countries.map(c => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    className="cursor-pointer sm:w-24"
                                    size="sm"
                                    onClick={() => updateCountry(countryCode)}
                                    disabled={
                                        saving === 'country' ||
                                        !countryCode.trim() ||
                                        countryCode === (user.countryCode || '')
                                    }
                                >
                                    {saving === 'country' ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-background p-3">
                            <p className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Email:</span>
                                <span className="text-muted-foreground">{user.email}</span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Email address changes are not permitted.
                            </p>
                            <div className="mt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard('Email', user.email)}
                                >
                                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                                    Copy Email
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-cyan-500" />
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Learning Preferences
                            </h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="learning-goal">Learning Goal</Label>
                                <Input
                                    id="learning-goal"
                                    value={learningGoal}
                                    onChange={e => setLearningGoal(e.target.value)}
                                    placeholder="Example: become confident with JavaScript"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="language">Preferred Language</Label>
                                <Input
                                    id="language"
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    placeholder="English"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Skill Level</Label>
                                <Select
                                    value={skillLevel}
                                    onValueChange={value =>
                                        setSkillLevel(value as typeof skillLevel)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Default Course Difficulty</Label>
                                <Select
                                    value={defaultCourseDifficulty}
                                    onValueChange={value =>
                                        setDefaultCourseDifficulty(
                                            value as typeof defaultCourseDifficulty,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Lesson Style</Label>
                                <Select
                                    value={lessonStyle}
                                    onValueChange={value =>
                                        setLessonStyle(value as typeof lessonStyle)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="short">Short</SelectItem>
                                        <SelectItem value="detailed">Detailed</SelectItem>
                                        <SelectItem value="example-heavy">
                                            Example-heavy
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Preferred Content Format</Label>
                                <Select
                                    value={preferredContentFormat}
                                    onValueChange={value =>
                                        setPreferredContentFormat(
                                            value as typeof preferredContentFormat,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="examples">Examples</SelectItem>
                                        <SelectItem value="quizzes">Quizzes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="weekly-goal">Weekly Learning Goal</Label>
                                <Input
                                    id="weekly-goal"
                                    type="number"
                                    min={0}
                                    value={weeklyLearningGoal}
                                    onChange={e => setWeeklyLearningGoal(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="interests">Interests</Label>
                                <Input
                                    id="interests"
                                    value={interests}
                                    onChange={e => setInterests(e.target.value)}
                                    placeholder="AI, cooking, business"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
                            <div>
                                <p className="text-sm font-medium">AI tutor suggestions</p>
                                <p className="text-xs text-muted-foreground">
                                    Let the app use your preferences to guide tutor responses.
                                </p>
                            </div>
                            <Switch
                                checked={aiTutorSuggestions}
                                onCheckedChange={setAiTutorSuggestions}
                            />
                        </div>

                        <div>
                            <Button
                                onClick={saveLearningPreferences}
                                disabled={saving === 'learning'}
                            >
                                {saving === 'learning'
                                    ? 'Saving...'
                                    : 'Save Learning Preferences'}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                        <div className="flex items-center gap-2">
                            <UserRoundCog className="h-4 w-4 text-cyan-500" />
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Privacy Controls
                            </h3>
                        </div>

                        {[
                            {
                                key: 'publicProfile',
                                title: 'Public profile',
                                description: 'Allow your basic profile to be shown publicly.',
                            },
                            {
                                key: 'showCompletedCourses',
                                title: 'Show completed courses',
                                description: 'Allow completed-course activity on your profile.',
                            },
                            {
                                key: 'showCountry',
                                title: 'Show country',
                                description: 'Allow your country to appear where profiles are shown.',
                            },
                            {
                                key: 'personalizedAiRecommendations',
                                title: 'Personalized AI recommendations',
                                description: 'Use preferences and activity to personalize AI suggestions.',
                            },
                        ].map(item => (
                            <div
                                key={item.key}
                                className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3"
                            >
                                <div>
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                                <Switch
                                    checked={
                                        privacy[item.key as keyof typeof privacy]
                                    }
                                    onCheckedChange={value =>
                                        setPrivacy(prev => ({
                                            ...prev,
                                            [item.key]: value,
                                        }))
                                    }
                                />
                            </div>
                        ))}

                        <div>
                            <Button
                                onClick={savePrivacyControls}
                                disabled={saving === 'privacy'}
                            >
                                {saving === 'privacy'
                                    ? 'Saving...'
                                    : 'Save Privacy Controls'}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {desktopAvailable && (
                        <>
                            <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                                <div className="flex items-center gap-2">
                                    <MonitorCog className="h-4 w-4 text-cyan-500" />
                                    <h3 className="text-sm font-semibold text-muted-foreground">
                                        Desktop App
                                    </h3>
                                    {desktopInfo?.version && (
                                        <Badge variant="secondary">
                                            v{desktopInfo.version}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Launch when your computer starts
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Open CheFu Academy automatically on desktop sign-in.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={autoLaunch}
                                        onCheckedChange={toggleAutoLaunch}
                                    />
                                </div>

                                <div className="grid gap-3 rounded-lg border bg-background p-3 md:grid-cols-[1fr_auto]">
                                    <div className="grid gap-2">
                                        <Label htmlFor="desktop-reminder">
                                            Learning reminder interval, minutes
                                        </Label>
                                        <Input
                                            id="desktop-reminder"
                                            type="number"
                                            min={1}
                                            value={reminderMinutes}
                                            onChange={event =>
                                                setReminderMinutes(event.target.value)
                                            }
                                        />
                                    </div>
                                    <Button
                                        className="self-end"
                                        onClick={scheduleDesktopReminder}
                                    >
                                        Schedule Reminder
                                    </Button>
                                </div>

                                <div className="grid gap-3 rounded-lg border bg-background p-3 md:grid-cols-[1fr_auto]">
                                    <div>
                                        <p className="text-sm font-medium">
                                            Native app updates
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Checks GitHub Releases for the latest Windows desktop build.
                                        </p>
                                    </div>
                                    <Button
                                        className="self-center"
                                        onClick={checkDesktopUpdates}
                                        variant="outline"
                                        disabled={checkingUpdates}
                                    >
                                        {checkingUpdates
                                            ? 'Checking...'
                                            : 'Check Updates'}
                                    </Button>
                                </div>

                                {desktopInfo && (
                                    <div className="grid gap-3 rounded-lg border bg-background p-3 md:grid-cols-[1fr_auto]">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Desktop data folder
                                            </p>
                                            <p className="break-all text-xs text-muted-foreground">
                                                {desktopInfo.userDataPath}
                                            </p>
                                        </div>
                                        <Button
                                            className="self-center"
                                            onClick={copyDesktopDataPath}
                                            variant="outline"
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy Path
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Separator />
                        </>
                    )}

                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                        <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-cyan-500" />
                            <h3 className="text-sm font-semibold text-muted-foreground">
                                Account Data
                            </h3>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <Button
                                variant="outline"
                                onClick={exportAccountData}
                                disabled={saving === 'export'}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {saving === 'export' ? 'Exporting...' : 'Export My Data'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={resetOnboarding}
                                disabled={saving === 'resetOnboarding'}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {saving === 'resetOnboarding'
                                    ? 'Resetting...'
                                    : 'Reset Onboarding'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={clearLearningProgress}
                                disabled={saving === 'clearProgress'}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {saving === 'clearProgress'
                                    ? 'Clearing...'
                                    : 'Clear Learning Progress'}
                            </Button>

                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Account Overview
                        </h3>

                        <div className="grid gap-2 text-sm">
                            <p className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Created:</span>
                                <span>{createdDate}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">Roles:</span>
                                {roles.map(role => (
                                    <Badge key={role} variant="secondary">
                                        {role}
                                    </Badge>
                                ))}
                            </div>

                            <p>
                                <span className="font-medium">Subscription:</span>{' '}
                                {subscription}
                            </p>
                            {user.member && (
                                <p>
                                    <span className="font-medium">Member Until:</span>{' '}
                                    {memberUntil}
                                </p>
                            )}

                            <p className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Verified:</span>
                                {user.isVerified ? (
                                    <Badge variant="default">Yes</Badge>
                                ) : (
                                    <Badge variant="destructive">No</Badge>
                                )}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Identity & Access
                        </h3>
                        <div className="grid gap-2 text-sm">
                            <p className="break-all">
                                <span className="font-medium">UID:</span> {user.uid || 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Provider:</span>{' '}
                                {user.provider || 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Onboarding Complete:</span>{' '}
                                {user.onboardingComplete ? 'Yes' : 'No'}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard('UID', user.uid || 'N/A')}
                                >
                                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                                    Copy UID
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Activity & Locale
                        </h3>
                        <div className="grid gap-2 text-sm">
                            <p className="flex items-center gap-2">
                                <Globe2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Language:</span>{' '}
                                {user.language || 'N/A'}
                            </p>
                            <p className="flex items-center gap-2">
                                <MapIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Country:</span>{' '}
                                {user.country || 'N/A'}
                                {user.countryCode ? ` (${user.countryCode})` : ''}
                            </p>
                            <p className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Last Login:</span> {lastLogin}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Device Snapshot
                        </h3>
                        <div className="grid gap-2 text-sm">
                            <p className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Device:</span>{' '}
                                {user.deviceInfo?.deviceName ||
                                    user.deviceInfo?.deviceModel ||
                                    'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">OS:</span>{' '}
                                {user.deviceInfo?.os || 'N/A'}{' '}
                                {user.deviceInfo?.osVersion
                                    ? `(${user.deviceInfo.osVersion})`
                                    : ''}
                            </p>
                            <p>
                                <span className="font-medium">Orientation:</span>{' '}
                                {user.deviceInfo?.orientation || 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Screen:</span>{' '}
                                {user.deviceInfo?.screenWidth || 0} x{' '}
                                {user.deviceInfo?.screenHeight || 0}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <Button
                            disabled={loggingOut}
                            onClick={handleLogout}
                            variant="destructive"
                            className="cursor-pointer"
                        >
                            {loggingOut ? 'Logging Out...' : 'Log Out'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
};

export default ProfileTabUI;
