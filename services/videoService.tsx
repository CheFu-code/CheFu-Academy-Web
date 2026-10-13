import { apiFetch } from '@/lib/api-client';
import { getApiUrl } from '@/lib/api-url';
import { Video } from '@/types/video';

type VideoListResponse = {
    videos: Video[];
};

const listVideos = async (source?: 'uploaded' | 'youtube') => {
    const params = new URLSearchParams({ limit: '100' });
    if (source) params.set('source', source);

    const response = await fetch(
        getApiUrl(`/api/academy/public/videos?${params.toString()}`),
    );
    if (!response.ok) {
        throw new Error(`Failed to load videos (${response.status}).`);
    }
    return (await response.json()) as VideoListResponse;
};

export const uploadVideo = async (
    title: string,
    instructorCompany: string,
    instructorName: string,
    description: string,
    videoUri: string,
    thumbnailUri: string,
    category: string,
    visibility: 'public' | 'private',
    level: 'beginner' | 'advance',
    duration: number,
    views: number = 0,
    topics: string[],
) => {
    const [videoBlob, thumbnailBlob] = await Promise.all([
        fetch(videoUri).then((response) => {
            if (!response.ok) throw new Error('Unable to read the selected video.');
            return response.blob();
        }),
        fetch(thumbnailUri).then((response) => {
            if (!response.ok) throw new Error('Unable to read the selected thumbnail.');
            return response.blob();
        }),
    ]);

    const uploadResponse = await apiFetch(
        '/api/academy/mobile/videos/upload-urls',
        {
            method: 'POST',
            body: JSON.stringify({
                videoContentType: videoBlob.type,
                thumbnailContentType: thumbnailBlob.type,
            }),
        },
    );
    const upload = (await uploadResponse.json()) as {
        uploadId: string;
        videoUploadUrl: string;
        thumbnailUploadUrl: string;
    };

    const [videoUpload, thumbnailUpload] = await Promise.all([
        fetch(upload.videoUploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': videoBlob.type },
            body: videoBlob,
        }),
        fetch(upload.thumbnailUploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': thumbnailBlob.type },
            body: thumbnailBlob,
        }),
    ]);
    if (!videoUpload.ok || !thumbnailUpload.ok) {
        throw new Error('Video storage upload failed.');
    }

    await apiFetch(
        `/api/academy/mobile/videos/upload-urls/${encodeURIComponent(upload.uploadId)}/complete`,
        {
            method: 'POST',
            body: JSON.stringify({
                title,
                instructorCompany,
                instructorName,
                description,
                category,
                visibility,
                level,
                duration,
                views,
                topics,
            }),
        },
    );

    return true;
};

export const fetchUploadedVideos = async (): Promise<Video[]> => {
    const result = await listVideos('uploaded');
    return result.videos;
};

export const fetchYTVideos = async (): Promise<Video[]> => {
    const result = await listVideos('youtube');
    return result.videos;
};

export const fetchAllPublicVideos = async (): Promise<Video[]> => {
    const result = await listVideos();
    return result.videos;
};

export const fetchVideoById = async (
    videoId: string,
): Promise<Video | null> => {
    const response = await fetch(
        getApiUrl(
            `/api/academy/public/videos/${encodeURIComponent(videoId)}`,
        ),
    );
    if (response.status === 404) return null;
    if (!response.ok) {
        throw new Error(`Failed to fetch video (${response.status}).`);
    }
    return (await response.json()) as Video;
};
