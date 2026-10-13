'use client';

import NoCourseYet from '@/components/Courses/NoCourseYet';
import MyCourseUI from '@/components/Courses/UI/MyCourseUI';
import GridCourseCardSkeleton from '@/components/skeletons/GridCourseCardSkeleton';
import { useGetMyCourse } from '@/hooks/useGetMyCourses';

export default function MyCourses() {
    const { courses, loading } = useGetMyCourse();

    if (loading) return <GridCourseCardSkeleton />;
    if (courses.length === 0) return <NoCourseYet />;

    return <MyCourseUI courses={courses} />;
}
