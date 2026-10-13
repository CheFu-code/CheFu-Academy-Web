'use client'

import { useMemo, useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { apiFetch } from "@/lib/api-client";
import { Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudienceTab } from "./audience-tab";
import { ComposeTab } from "./compose-tab";
import { PreviewTab } from "./preview-tab";
import { ScheduleTab } from "./schedule-tab";
import {
    DEFAULT_SCHEDULE_TIME,
    INITIAL_FORM,
    type ActiveTab,
    type AudienceUser,
    type CampaignType,
    type EmailPreferenceKey,
    type EmailFormState,
    type PreviewDevice,
} from "./types";

const isCustomer = (user: AudienceUser) => {
    if (user.member === true) return true;
    const status = (user.subscriptionStatus ?? "").trim().toLowerCase();
    return status.length > 0 && status !== "free" && status !== "none";
};

export function MainPanel() {
    const [type, setType] = useState<CampaignType>("general");
    const [activeTab, setActiveTab] = useState<ActiveTab>("compose");
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
    const [form, setForm] = useState<EmailFormState>(INITIAL_FORM);
    const [files, setFiles] = useState<File[]>([]);
    const [scheduleTime, setScheduleTime] = useState(DEFAULT_SCHEDULE_TIME);
    const [audienceUsers, setAudienceUsers] = useState<AudienceUser[]>([]);
    const [loadingAudienceUsers, setLoadingAudienceUsers] = useState(false);

    useEffect(() => {
        let mounted = true;
        const loadAudienceUsers = async () => {
            setLoadingAudienceUsers(true);
            try {
                const response = await apiFetch("/api/academy/mobile/admin/users");
                const result = (await response.json()) as {
                    users: Array<AudienceUser & { id: string }>;
                };
                if (!mounted) return;
                const users = result.users
                    .map((data) => ({
                        id: data.id,
                        email:
                            typeof data.email === "string" && data.email.includes("@")
                                ? data.email
                                : data.id,
                        member: data.member === true,
                        subscriptionStatus:
                            typeof data.subscriptionStatus === "string"
                                ? data.subscriptionStatus
                                : "",
                        emailPreferences: data.emailPreferences,
                    }))
                    .filter((u) => typeof u.email === "string" && u.email.includes("@"));
                setAudienceUsers(users);
            } catch (error) {
                console.error("Failed to load users for email audience:", error);
                toast.error("Unable to load the email audience.");
            } finally {
                if (mounted) {
                    setLoadingAudienceUsers(false);
                }
            }
        };
        loadAudienceUsers();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (type !== "marketing") {
            setForm((prev) => (prev.enableAB ? { ...prev, enableAB: false } : prev));
        }
    }, [type]);

    const recipientPreferenceKey = useMemo<EmailPreferenceKey>(() => {
        if (form.audience === "General Subscribers") return "general";
        if (form.audience === "Marketing Subscribers") return "marketing";
        if (form.audience === "Security Subscribers") return "security";
        if (form.audience === "Activity Subscribers") return "activity";
        return type;
    }, [form.audience, type]);

    const recipientEmails = useMemo(() => {
        const audienceBase =
            form.audience === "Customers (All)"
                ? audienceUsers.filter(isCustomer)
                : audienceUsers;

        const eligible = audienceBase.filter(
            (u) => u.emailPreferences?.[recipientPreferenceKey] === true
        );
        return Array.from(new Set(eligible.map((u) => u.email)));
    }, [audienceUsers, form.audience, recipientPreferenceKey]);

    const onDrop = useCallback((accepted: File[]) => {
        setFiles((prev) => [
            ...prev,
            ...accepted.filter((f) => !prev.find((p) => p.name === f.name)),
        ]);
    }, []);

    const dropzone = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "image/*": [".png", ".jpg", ".jpeg", ".gif"],
            "text/plain": [".txt"],
            "application/zip": [".zip"],
        },
    });

    const removeFile = (name: string) => {
        setFiles((prev) => prev.filter((f) => f.name !== name));
    };

    const scheduleLabel = useMemo(
        () => (form.scheduleAt ? format(form.scheduleAt, "EEE, MMM d yyyy HH:mm") : "Pick date & time"),
        [form.scheduleAt]
    );

    const combineDateAndTime = useCallback((date: Date, timeValue: string) => {
        const [hourPart, minutePart] = timeValue.split(":");
        const hours = Number.parseInt(hourPart ?? "0", 10);
        const minutes = Number.parseInt(minutePart ?? "0", 10);
        const next = new Date(date);
        next.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
        return next;
    }, []);

    const setField = <K extends keyof EmailFormState>(key: K, value: EmailFormState[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const canSend =
        (form.subjectA?.trim()?.length ?? 0) > 0 &&
        (form.contentA?.trim()?.length ?? 0) > 0 &&
        form.fromEmail.includes("@");

    async function handleSendNow() {
        if (!canSend) {
            toast.error("Please complete required fields: From, Subject, Content.");
            return;
        }
        if (loadingAudienceUsers) {
            toast.error("Still loading users from Firestore. Please wait.");
            return;
        }
        if (recipientEmails.length === 0) {
            toast.error(`No recipients match ${form.audience} with emailPreferences.${recipientPreferenceKey}=true.`);
            return;
        }
        try {
            await new Promise((r) => setTimeout(r, 800));
            toast.success(`Email sent to ${recipientEmails.length} recipient(s).`);
        } catch (e) {
            toast.error("Failed to send. Check logs and try again.");
            console.error(e);
        }
    }

    async function handleSaveDraft() {
        try {
            await new Promise((r) => setTimeout(r, 500));
            toast.success("Draft saved.");
        } catch {
            toast.error("Could not save draft.");
        }
    }

    async function handleSendTest() {
        if (!form.sendTestTo || !form.sendTestTo.includes("@")) {
            toast.error("Enter a valid test email address.");
            return;
        }
        try {
            await new Promise((r) => setTimeout(r, 600));
            toast.success(`Test email sent to ${form.sendTestTo}.`);
        } catch {
            toast.error("Failed to send test email.");
        }
    }

    return (
        <div className="space-y-6">
            <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-cyan-300" />
                                Send Emails
                            </CardTitle>
                            <CardDescription>
                                Choose type, set audience, compose content, preview and schedule.
                            </CardDescription>
                        </div>
                        <Tabs
                            value={type}
                            onValueChange={(val) => setType(val as CampaignType)}
                            className="w-fit"
                        >
                            <TabsList className="bg-slate-800/70">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => setActiveTab(val as ActiveTab)}
                        className="w-full"
                    >
                        <TabsList className="bg-slate-800/70">
                            <TabsTrigger value="audience">Audience</TabsTrigger>
                            <TabsTrigger value="compose">Compose</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        </TabsList>

                        <AudienceTab
                            type={type}
                            form={form}
                            setField={setField}
                            loadingAudienceUsers={loadingAudienceUsers}
                            recipientEmails={recipientEmails}
                            recipientPreferenceKey={recipientPreferenceKey}
                        />

                        <ComposeTab
                            type={type}
                            form={form}
                            setField={setField}
                            files={files}
                            removeFile={removeFile}
                            handleSendTest={handleSendTest}
                            dropzone={dropzone}
                        />

                        <PreviewTab
                            previewDevice={previewDevice}
                            setPreviewDevice={setPreviewDevice}
                            subject={form.subjectA}
                            preheader={form.preheader}
                            content={form.contentA}
                        />

                        <ScheduleTab
                            form={form}
                            setField={setField}
                            scheduleTime={scheduleTime}
                            setScheduleTime={setScheduleTime}
                            defaultScheduleTime={DEFAULT_SCHEDULE_TIME}
                            scheduleLabel={scheduleLabel}
                            combineDateAndTime={combineDateAndTime}
                            canSend={canSend}
                            loadingAudienceUsers={loadingAudienceUsers}
                            recipientCount={recipientEmails.length}
                            handleSaveDraft={handleSaveDraft}
                            handleSendNow={handleSendNow}
                        />
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
