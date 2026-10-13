// app/types/course.ts

export interface Flashcard {
    front: string;
    back: string;
}

export interface ChapterContentItem {
    topic?: string;
    explain?: string;
    code?: string;
    example?: string;
}

export interface Chapter {
    chapterName: string;
    content: ChapterContentItem[];
}

export interface QA {
    question: string;
    answer: string;
}

export interface Quiz {
    question: string;
    options: string[];
    correctAns: string;
}

export interface Course {
    id: string;
    banner_image: string;
    category: string;
    chapters: Chapter[];
    courseTitle: string;
    createdBy: string;
    createdOn?: Date | string | number;
    description: string;
    docId: string;
    enrolled: boolean;
    flashcards: Flashcard[];
    qa: QA[];
    quiz: Quiz[];
    completedChapter?: string[];
    originalCourseId?: string
    lastStudiedAt?: Date | string | number;
    lastStudiedChapterIndex?: number;
    lastStudiedContentIndex?: number;
    lastStudiedChapterName?: string;
    lastStudiedTopic?: string;
    averageRating?: number;
    reviewCount?: number;
    completedChapterEvents?: {
        chapterIndex: number;
        completedAt: string;
    }[];
}

export interface CourseProgressProps {
    courseList: Course[];
    enroll?: boolean;
}

export interface AddCourseProp {
    topics: string[];
    setTopics: React.Dispatch<React.SetStateAction<string[]>>;
    userInput: string;
    setUserInput: React.Dispatch<React.SetStateAction<string>>;
    selectedTopics: string[];
    setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
    generatingTopic: boolean;
    generatingCourse: boolean;
    courseGenerationProgress: number;
    courseGenerationStatus: string;
    courseGenerationStepIndex: number;
    onGenerateCourse: () => void | Promise<void>;
    generateTopic: () => void | Promise<void>;
    onImportLearningFile?: () => void;
    mainWrapperRef: React.RefObject<HTMLDivElement | null>
}
