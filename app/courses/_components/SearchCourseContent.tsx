'use client';

import CourseCard from '@/components/Shared/CourseCard';
import Header from '@/components/Shared/Header';
import GridCourseCardSkeleton from '@/components/skeletons/GridCourseCardSkeleton';
import { CoursesQuery } from '@/lib/firestore/courseQueries';
import { Course } from '@/types/course';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const SearchCourseContent = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';
    const { fetchSearchedCourses } = CoursesQuery();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFilteredCourses = async () => {
            setLoading(true);
            try {
                const results = await fetchSearchedCourses(query);
                setCourses(results);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredCourses();
    }, [fetchSearchedCourses, query]);
    return (
        <div className="min-h-screen bg-background">
            <div className="flex justify-between items-center">
                <Header
                    header="Search results"
                    description={`Search results for "${query}"`}
                />
                {courses && (
                    <span className="text-muted-foreground">
                        {courses.length} result{courses.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {!loading && courses.length === 0 && (
                <p className="flex justify-center items-center h-full">
                    No results found
                </p>
            )}

            {loading ? (
                <GridCourseCardSkeleton />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            bannerImage={course.banner_image}
                            title={course.courseTitle}
                            description={course.description}
                            chaptersCount={course.chapters?.length || 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchCourseContent;
