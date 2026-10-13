import { serverApiFetch } from '@/lib/server-api-client';
import { Video } from '@/types/video';

export async function fetchPublicVideosServer(): Promise<Video[]> {
    return fetchVideos('uploaded');
}

export async function fetchYouTubeVideosServer(): Promise<Video[]> {
    return fetchVideos('youtube');
}

async function fetchVideos(source: 'uploaded' | 'youtube'): Promise<Video[]> {
    const params = new URLSearchParams({ source, limit: '100' });
    const response = await serverApiFetch(
        `/api/academy/public/videos?${params.toString()}`,
    );
    const result = (await response.json()) as { videos: Video[] };
    return result.videos;
}
