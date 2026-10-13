'use client';

import CourseLearningUI from '@/app/courses/_components/CourseLearningUI';
import NoChapter from '@/components/Courses/noChapter';
import NoCourse from '@/components/Courses/noCourse';
import CourseLearningSkeleton from '@/components/skeletons/CourseLearningSkeleton';
import { getBlurredLogoDataUrl } from '@/helpers/downloadChapter';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useScrollIntoView } from '@/hooks/useScrollIntoView';
import { getApiUrl } from '@/lib/api-url';
import { canAccessCourseAsLearner } from '@/lib/courseOwnership';
import { arrayBufferToBase64, saveNativeFile } from '@/lib/desktop-files';
import { Course } from '@/types/course';
import jsPDF from 'jspdf';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { toast } from 'sonner';

const CourseLearning = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    const initialChapterIndex = Number(searchParams.get('chapter') || 0);
    const initialContentIndex = Number(searchParams.get('lesson') || 0);

    const { user, loading: authLoading } = useAuthUser();
    const { ref: scrollRef, scroll } = useScrollIntoView<HTMLDivElement>();
    const [course, setCourse] = useState<Course | null>(null);
    const [chapterIndex] = useState(initialChapterIndex);
    const [contentIndex, setContentIndex] = useState(initialContentIndex);
    const [loading, setLoading] = useState(false);
    const [loadingCourse, setLoadingCourse] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiSize, setConfettiSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            scroll();
        }, 5000); // 5 seconds

        return () => clearTimeout(timer);
    }, [scroll]);

    useEffect(() => {
        const updateSize = () => {
            setConfettiSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            try {
                const response = await fetch(
                    getApiUrl(
                        `/courses/${courseId}/learning?chapter=${chapterIndex}`,
                    ),
                    { credentials: 'include' },
                );
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    const message =
                        data?.message ||
                        data?.error ||
                        'You are not allowed to open this chapter.';
                    setAccessDenied(true);
                    if (
                        message !==
                        'Chapter completed, subscribe to revisit this chapter.'
                    ) {
                        toast.warning(message);
                    }
                    router.replace(`/courses/my-courses/course-view/${courseId}`);
                    return;
                }

                setCourse(data.course as Course);
            } catch (error) {
                console.error('Error fetching course:', error);
                toast.error('Failed to load course.');
            } finally {
                setLoadingCourse(false);
            }
        };
        fetchCourse();
    }, [chapterIndex, courseId, router]);

    const selectedChapterKey = chapterIndex.toString();
    const isCompletedChapter = Boolean(
        course?.completedChapter?.includes(selectedChapterKey),
    );
    const isBlockedCompletedChapter = Boolean(
        course &&
            user &&
            canAccessCourseAsLearner(course, user) &&
            !user.member &&
            isCompletedChapter,
    );

    useEffect(() => {
        if (accessDenied || authLoading || loadingCourse || !course || !user || loading) {
            return;
        }
        if (!canAccessCourseAsLearner(course, user)) {
            toast.error('You are not authorized to view this course!');
            router.replace('/courses');
        }
    }, [accessDenied, authLoading, course, loadingCourse, user, router, loading]);

    useEffect(() => {
        if (authLoading || loadingCourse || !course || !user) return;
        if (!canAccessCourseAsLearner(course, user)) return;
        if (!isBlockedCompletedChapter) return;

        router.replace(`/courses/my-courses/course-view/${course.id}`);
    }, [
        authLoading,
        course,
        isBlockedCompletedChapter,
        loadingCourse,
        router,
        user,
    ]);

    useEffect(() => {
        if (!course || !user || !canAccessCourseAsLearner(course, user)) {
            return;
        }
        if (isBlockedCompletedChapter) return;

        const chapter = course.chapters[chapterIndex];
        const content = chapter?.content?.[contentIndex];
        if (!chapter || !content) return;

        const persistResume = async () => {
            try {
                const response = await fetch(
                    getApiUrl(`/courses/${course.id}/resume`),
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            chapterIndex,
                            contentIndex,
                        }),
                    },
                );

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    console.error(
                        'Failed to update smart resume:',
                        data?.message || response.statusText,
                    );
                }
            } catch (error) {
                console.error('Failed to update smart resume:', error);
            }
        };

        void persistResume();
    }, [chapterIndex, contentIndex, course, isBlockedCompletedChapter, user]);

    useEffect(() => {
        if (!course || !window.chefuDesktop?.isElectron) return;
        void window.chefuDesktop.cacheCourse(course);
    }, [course]);

    if (
        accessDenied ||
        authLoading ||
        loadingCourse ||
        isBlockedCompletedChapter
    ) {
        return <CourseLearningSkeleton />;
    }
    if (!course && !loadingCourse) return <NoCourse />;
    if (!course) return null;

    const chapter = course.chapters[chapterIndex];
    if (!chapter) return <NoChapter />;

    const totalContents = chapter.content.length;
    const progressPercent = (contentIndex + 1) / totalContents;
    const content = chapter.content[contentIndex];
    if (!content) return <NoChapter />;
    const code = content.code || '';
    const cleanCode = code
        ? code.replace(/^```[\w]*\n/, '').replace(/```$/, '')
        : '';

    const handleNext = () => {
        if (contentIndex + 1 < totalContents) {
            setContentIndex(contentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (contentIndex > 0) {
            setContentIndex(contentIndex - 1);
        }
    };

    const handleFinish = async () => {
        if (loading) return;

        if (isCompletedChapter) {
            router.replace(`/courses/my-courses/course-view/${course.id}`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                getApiUrl(`/courses/${course.id}/complete-chapter`),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ chapterIndex }),
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                    data?.message ||
                        data?.error ||
                        'Error completing chapter!',
                );
            }

            const nextCompletedChapters = Array.from(
                new Set([
                    ...(course.completedChapter || []),
                    chapterIndex.toString(),
                ]),
            );
            const completedCourse =
                nextCompletedChapters.length >= course.chapters.length;

            setCourse({
                ...course,
                completedChapter: nextCompletedChapters,
            });

            if (completedCourse) {
                setShowConfetti(true);
                toast.success('Course completed. Great work!');
                setTimeout(() => {
                    router.replace(`/courses/my-courses/course-view/${course.id}`);
                }, 2400);
                return;
            }

            toast.success('Chapter completed...');
            router.replace(`/courses/my-courses/course-view/${course.id}`);
        } catch (err) {
            console.error(err);
            toast.error(
                err instanceof Error ? err.message : 'Error completing chapter!',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadChapter = async () => {
        if (!chapter) return;

        const logoDataUrl = await getBlurredLogoDataUrl(); // get Base64 logo

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const marginX = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxWidth = pageWidth - marginX * 2;

        // ---------- COVER PAGE ----------
        let y = 60;

        // Course Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(30);
        const titleLines = doc.splitTextToSize(
            course?.courseTitle || 'Course Title',
            maxWidth,
        );
        titleLines.forEach((line: string) => {
            doc.text(line, pageWidth / 2, y, { align: 'center' });
            y += 16;
        });

        y += 15;

        // Chapter Name
        doc.setFontSize(24);
        const chapterLines = doc.splitTextToSize(chapter.chapterName, maxWidth);
        chapterLines.forEach((line: string) => {
            doc.text(line, pageWidth / 2, y, { align: 'center' });
            y += 14;
        });

        y += 20;

        // Author & Logo Placeholder
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(16);
        doc.text('Author: CheFu Academy', pageWidth / 2, y, {
            align: 'center',
        });

        // ---------- CONTENT PAGES ----------
        doc.addPage();
        y = 25;

        chapter.content.forEach((item, index) => {
            if (y > 260) {
                doc.addPage();
                y = 25;
            }

            // Lesson Header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(15);
            doc.setTextColor(40, 40, 40);
            doc.text(`Lesson ${index + 1}`, marginX, y);
            y += 8;

            // Topic
            if (item.topic) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13);
                doc.setTextColor(70, 70, 70);
                const topicLines = doc.splitTextToSize(item.topic, maxWidth);
                doc.text(topicLines, marginX, y);
                y += topicLines.length * 7 + 3;
            }

            // Explanation
            if (item.explain) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                const explainLines = doc.splitTextToSize(
                    item.explain,
                    maxWidth,
                );
                doc.text(explainLines, marginX, y);
                y += explainLines.length * 6 + 5;
            }

            // Code Block
            if (item.code) {
                const clean = item.code
                    .replace(/^```[\w]*\n/, '')
                    .replace(/```$/, '');
                doc.setFont('courier', 'normal');
                doc.setFontSize(11);

                const codeLines = doc.splitTextToSize(clean, maxWidth - 4);
                const blockHeight = codeLines.length * 5 + 6;

                doc.setFillColor(245, 245, 245); // light grey background
                doc.setDrawColor(200, 200, 200); // light border
                doc.rect(marginX - 2, y - 4, maxWidth + 4, blockHeight, 'FD'); // Fill and Draw
                doc.setTextColor(50, 50, 50);
                doc.text(codeLines, marginX, y);
                y += blockHeight + 6;
            }

            // Example
            if (item.example) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(12);
                doc.setTextColor(0, 60, 120);
                const exampleLines = doc.splitTextToSize(
                    `Example:\n${item.example}`,
                    maxWidth,
                );
                doc.text(exampleLines, marginX, y);
                y += exampleLines.length * 6 + 8;
            }

            // Lesson separator line
            y += 5;
            doc.setDrawColor(200);
            doc.setLineWidth(0.2);
            doc.line(marginX, y, pageWidth - marginX, y);
            y += 8;
        });

        // --- Add page numbers and logo ---
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' },
            );

            // Logo at bottom-right
            const logoWidth = 15; // mm
            const logoHeight = 15; // mm
            doc.addImage(
                logoDataUrl,
                'PNG',
                pageWidth - logoWidth - 10, // 10mm from right edge
                pageHeight - logoHeight - 10, // 10mm from bottom
                logoWidth,
                logoHeight,
            );
        }

        const fileName = `${chapter.chapterName.replace(/\s+/g, '_')}.pdf`;
        const nativeResult = await saveNativeFile({
            title: 'Save chapter PDF',
            defaultPath: fileName,
            data: arrayBufferToBase64(doc.output('arraybuffer')),
            encoding: 'base64',
            filters: [{ name: 'PDF', extensions: ['pdf'] }],
        });

        if (!nativeResult) {
            doc.save(fileName);
        }
    };

    return (
        <>
            {showConfetti && (
                <Confetti
                    width={confettiSize.width}
                    height={confettiSize.height}
                    numberOfPieces={420}
                    recycle={false}
                    gravity={0.18}
                    className="pointer-events-none fixed inset-0 z-50"
                />
            )}
            <CourseLearningUI
                courseTitle={course.courseTitle}
                loading={loading}
                scrollRef={scrollRef}
                progressPercent={progressPercent}
                totalContents={totalContents}
                contentIndex={contentIndex}
                chapter={chapter}
                content={content}
                cleanCode={cleanCode}
                handleFinish={handleFinish}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                handleDownloadChapter={handleDownloadChapter}
            />
        </>
    );
};

export default CourseLearning;
