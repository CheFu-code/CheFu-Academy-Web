import { VideoCategoryValues } from "@/constants/Options";
import { z } from "zod";

type SerializedDate = Date | string | number | null;

// ------------------
// Zod schema
// ------------------
export const VideoSchema = z.object({
    id: z.string().optional(), // id often comes from Firestore
    source: z.enum(["uploaded", "youtube"]).optional(),
    videoId: z.string().optional(),
    youtubeVideoId: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    instructorCompany: z.string().min(1, "Instructor company is required"),
    instructorName: z.string().min(1, "Instructor name is required"),
    description: z.string().min(1, "Description is required"),
    videoURL: z.string().url("Must be a valid URL"),
    embedURL: z.string().url("Must be a valid URL").optional(),
    thumbnailURL: z.string().url("Must be a valid URL"),
    uploadedBy: z.string(),
    uploadedAt: z.union([z.date(), z.string(), z.number(), z.null()]),
    category: z.enum(VideoCategoryValues, { message: "Category is required" }),
    visibility: z.enum(["public", "private"]),
    level: z.string().min(1, "Level is required"),
    duration: z.number().nonnegative(),
    views: z.number().nonnegative(),
    topics: z.array(z.string().min(1, "Topic is required")),
});

// ------------------
// Inferred type from schema
// ------------------
export type Video = z.infer<typeof VideoSchema>;

// ------------------
// Extra props
// ------------------
export type VideoCardProps = {
    video: Video;
    onPress?: () => void;
};

export type UploadFormProps = {
    videoUri: string | null;
    setVideoUri: (uri: string | null) => void;
    thumbnailUri: string | null;
    setThumbnailUri: (uri: string | null) => void;
    title: string;
    setTitle: (text: string) => void;
    instructorCompany: string;
    setInstructorCompany: (text: string) => void;
    instructorName: string;
    setInstructorName: (text: string) => void;
    description: string;
    setDescription: (text: string) => void;
    category: string | null;
    setCategory: (cat: string | null) => void;
    visibility: "public" | "private" | null;
    setVisibility: React.Dispatch<
        React.SetStateAction<"public" | "private" | null>
    >;
    level: "advance" | "beginner" | null;
    setLevel: React.Dispatch<React.SetStateAction<"advance" | "beginner" | null>>;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    duration: number;
    setDuration: (d: number) => void;
    views: number;
    setViews: (views: number) => void;
    topics: string[];
    setTopics: (topics: string[]) => void;
};

export type UserReviews = {
    id: string;
    videoId: string;
    email: string;
    userId: string;
    rating: number; // 1 to 5
    comment: string;
    createdAt: SerializedDate;
    username: string;
    avatar: string;
};


export interface UploaderState {
    id: string | null,
    file: File | null,
    uploading: boolean,
    progress: number,
    key?: string,
    isDeleting: boolean,
    error: boolean,
    objectUrl?: string,
    fileType: "image" | "video"
}
