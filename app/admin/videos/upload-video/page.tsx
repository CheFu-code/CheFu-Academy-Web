'use client';

import Uploader from '@/components/file-uploader/Uploader';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    levelOptions,
    VideoCategoryValues,
    VisibilityOptions,
} from '@/constants/Options';
import { uploadVideo } from '@/services/videoService';
import { Video } from '@/types/video';
import { Loader, PlusIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const UploadVideoPage = ({}) => {
    const router = useRouter();
    const [newTopic, setNewTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(0);

    const addTopic = (field: ControllerRenderProps<Video, 'topics'>) => {
        const topic = newTopic.trim();
        if (topic && !field.value.includes(topic)) {
            field.onChange([...(field.value || []), topic]);
            setNewTopic('');
        }
    };

    const form = useForm<Video>({
        defaultValues: {
            title: '',
            instructorCompany: '',
            instructorName: '',
            description: '',
            videoURL: '',
            thumbnailURL: '',
            uploadedBy: '',
            uploadedAt: new Date(),
            category: '',
            visibility: 'public',
            level: 'beginner',
            duration: 0,
            views: 0,
            topics: [],
        },
    });

    const handleUpload = async () => {
        const values = form.getValues();

        setLoading(true);
        if (
            !values.title ||
            !values.description ||
            !values.instructorCompany ||
            !values.instructorName ||
            values.topics.length === 0 ||
            !values.videoURL ||
            !values.thumbnailURL ||
            !values.category ||
            !values.visibility ||
            !values.level
        ) {
            toast.error('Please fill all required fields!');
            setLoading(false);
            return;
        }

        try {
            await uploadVideo(
                values.title,
                values.instructorCompany,
                values.instructorName,
                values.description,
                values.videoURL,
                values.thumbnailURL,
                values.category,
                values.visibility,
                values.level as 'beginner' | 'advance',
                duration,
                0,
                values.topics,
            );

            toast.success('Video uploaded successfully!');
            router.replace('/admin/videos');
        } catch (err) {
            console.error(err);
            toast.error('Upload failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                        Provide basic information about the video you want to
                        upload.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            className="space-y-6"
                            onSubmit={form.handleSubmit(handleUpload)}
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                rules={{ required: 'Title is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Title..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="instructorCompany"
                                rules={{
                                    required: 'Instructor company is required',
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Instructor Company
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Instructor company..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="instructorName"
                                rules={{
                                    required: 'Instructor name is required',
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructor Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Instructor name..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                rules={{ required: 'Description is required' }}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-[120px]"
                                                placeholder="Description..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="thumbnailURL"
                                rules={{ required: 'Thumbnail is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thumbnail Image</FormLabel>
                                        <FormControl>
                                            <Uploader
                                                type="image"
                                                onFileSelect={(
                                                    fileUrl: string,
                                                ) => {
                                                    field.onChange(fileUrl);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="videoURL"
                                rules={{ required: 'Video is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Video</FormLabel>
                                        <FormControl>
                                            <Uploader
                                                type="video"
                                                onFileSelect={(
                                                    fileUrl: string,
                                                    _file: File,
                                                    fileDuration?: number,
                                                ) => {
                                                    field.onChange(fileUrl);
                                                    if (fileDuration)
                                                        setDuration(
                                                            fileDuration,
                                                        );
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    rules={{ required: 'Category is required' }}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {VideoCategoryValues.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={category}
                                                                value={category}
                                                            >
                                                                {category}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="visibility"
                                    rules={{
                                        required: 'Visibility is required',
                                    }}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Visibility</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Value" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {VisibilityOptions.map(
                                                        (visibility) => (
                                                            <SelectItem
                                                                key={visibility}
                                                                value={
                                                                    visibility
                                                                }
                                                            >
                                                                {visibility}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="level"
                                    rules={{ required: 'Level is required' }}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Level</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Value" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {levelOptions.map(
                                                        (level) => (
                                                            <SelectItem
                                                                key={level}
                                                                value={level}
                                                            >
                                                                {level}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="topics"
                                rules={{
                                    validate: (value) =>
                                        value.length > 0 ||
                                        'At least one topic is required',
                                }}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Topics</FormLabel>

                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter topics..."
                                                    value={newTopic}
                                                    onChange={(e) =>
                                                        setNewTopic(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.key === 'Enter' &&
                                                        (e.preventDefault(),
                                                        addTopic(field))
                                                    }
                                                />
                                            </FormControl>
                                            {newTopic.trim() && (
                                                <Button
                                                    className="cursor-pointer"
                                                    type="button"
                                                    onClick={() =>
                                                        addTopic(field)
                                                    }
                                                >
                                                    Add
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {field.value?.map(
                                                (t: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1.5 rounded-lg bg-gray-600 text-sm flex items-center"
                                                    >
                                                        {t}
                                                        <button
                                                            type="button"
                                                            className="ml-1 bg-red-400 rounded-2xl cursor-pointer"
                                                            onClick={() =>
                                                                field.onChange(
                                                                    field.value.filter(
                                                                        (
                                                                            _: string,
                                                                            idx: number,
                                                                        ) =>
                                                                            idx !==
                                                                            i,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </span>
                                                ),
                                            )}
                                        </div>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={loading}>
                                {loading ? 'Uploading...' : 'Upload Video'}{' '}
                                {loading ? (
                                    <Loader className="animate-spin" />
                                ) : (
                                    <PlusIcon className="size-3.5" />
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );
};

export default UploadVideoPage;
