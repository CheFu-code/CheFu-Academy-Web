'use client';

import { generateCourse, generateTopics } from '@/config/AIModel';
import Prompt from '@/constants/Prompt';
import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { setDesktopProgress } from '@/lib/desktop-notify';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useGenerateTopic = (
    userInput: string,
    setUserInput: React.Dispatch<React.SetStateAction<string>>,
) => {
    const router = useRouter();
    const [topics, setTopics] = useState<string[]>([]);
    const [generatingTopic, setGeneratingTopic] = useState(false);
    const [generatingCourse, setGeneratingCourse] = useState(false);
    const [courseGenerationProgress, setCourseGenerationProgress] = useState(0);
    const [courseGenerationStatus, setCourseGenerationStatus] = useState('');
    const [courseGenerationStepIndex, setCourseGenerationStepIndex] = useState(0);

    const updateGenerationProgress = (
        progress: number,
        status: string,
        stepIndex: number,
    ) => {
        const nextProgress = Math.min(Math.max(progress, 0), 100);

        setCourseGenerationProgress(nextProgress);
        setCourseGenerationStatus(status);
        setCourseGenerationStepIndex(stepIndex);
        void setDesktopProgress(nextProgress / 100, 'normal');
    };

    useEffect(() => {
        if (!generatingCourse) return;

        const timer = window.setInterval(() => {
            setCourseGenerationProgress((previousProgress) => {
                if (previousProgress >= 92) return previousProgress;

                const nextProgress = Math.min(
                    92,
                    previousProgress +
                        Math.max(0.6, (92 - previousProgress) * 0.08),
                );

                void setDesktopProgress(nextProgress / 100, 'normal');
                return Number(nextProgress.toFixed(1));
            });
        }, 900);

        return () => window.clearInterval(timer);
    }, [generatingCourse]);

    const generateTopic = async () => {
        if (generatingTopic) return;
        if (!userInput.trim()) {
            toast.error('Please enter a course idea first.');
            return;
        }

        setGeneratingTopic(true);

        let topicIdea = [];
        try {
            const promptText = userInput + Prompt.IDEA;
            const contents = [
                {
                    role: 'user',
                    parts: [{ text: promptText }],
                },
            ];
            const aiResponse = await generateTopics(contents);
            const cleanedResponse =
                aiResponse && typeof aiResponse === 'string'
                    ? aiResponse.replace(/^```json[\r\n]+|```$/gi, '').trim()
                    : aiResponse;

            if (!cleanedResponse || cleanedResponse.trim() === '') {
                toast.error("The AI didn't return any topic ideas.");
                topicIdea = [];
                return;
            }

            function safeJsonParse(json: string) {
                try {
                    return JSON.parse(json);
                } catch {
                    return null;
                }
            }

            topicIdea = safeJsonParse(cleanedResponse) || [];
            setUserInput('');
            console.log('Generated Topics:', topicIdea);
        } catch (error) {
            console.error('Error generating topic:', error);
            toast.error(`Failed to generate topic. Please try again. ${error}`);
            topicIdea = [];
        } finally {
            setTopics(Array.isArray(topicIdea) ? topicIdea : []);
            setGeneratingTopic(false);
        }
    };

    const onGenerateCourse = async (selectedTopics: string[]) => {
        if (generatingCourse) return;
        if (!selectedTopics.length) {
            toast.error('Please select at least one topic.');
            return;
        }

        setGeneratingCourse(true);
        updateGenerationProgress(
            6,
            'Preparing your selected topics...',
            0,
        );

        const promptText = selectedTopics.join(', ') + Prompt.COURSE;
        const contents = [
            {
                role: 'user',
                parts: [{ text: promptText }],
            },
        ];

        try {
            updateGenerationProgress(
                18,
                'AI is designing the course structure...',
                0,
            );
            const aiResp = await generateCourse(contents);
            updateGenerationProgress(
                72,
                'Organising generated chapters and lessons...',
                1,
            );

            if (!aiResp || aiResp.trim() === '') {
                toast.error("The AI didn't return any course content.");
                return;
            }

            let coursesObj;
            try {
                coursesObj = JSON.parse(aiResp);
            } catch (e) {
                console.log('Error parsing JSON:', e);
                toast.error('The course response was not valid. Please try again.');
                return;
            }

            updateGenerationProgress(
                84,
                'Checking practice materials and course data...',
                2,
            );

            const coursesArray = Array.isArray(coursesObj)
                ? coursesObj
                : coursesObj.courses;

            if (!Array.isArray(coursesArray) || coursesArray.length === 0) {
                toast.error("The AI didn't return any course content.");
                return;
            }

            updateGenerationProgress(
                94,
                'Saving your course to your library...',
                3,
            );
            const createdCourses = await Promise.all(
                coursesArray.map(async course => {
                    const response = await apiFetch('/api/academy/mobile/courses', {
                        method: 'POST',
                        body: JSON.stringify(course),
                    });
                    return (await response.json()) as {
                        course: { id: string };
                    };
                }),
            );

            updateGenerationProgress(100, 'Course ready. Opening it now...', 4);
            router.replace(
                `/courses/my-courses/course-view/${createdCourses[0].course.id}`,
            );
            toast.success('Course created successfully!');
        } catch (e: unknown) {
            console.log('failed course', (e as Error).message);
            toast.error(
                `Failed to generate course. Please try again. ${(e as Error).message}`,
            );
        } finally {
            setGeneratingCourse(false);
            void setDesktopProgress(-1, 'none');
        }
    };

    return {
        generateTopic,
        generatingTopic,
        topics,
        setTopics,
        onGenerateCourse,
        generatingCourse,
        courseGenerationProgress,
        courseGenerationStatus,
        courseGenerationStepIndex,
    };
};
