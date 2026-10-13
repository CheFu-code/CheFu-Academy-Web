import type { Course } from '@/types/course';
import { getApiUrl } from '@/lib/api-url';
import {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from 'docx';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import pptxgen from 'pptxgenjs';
import QRCode from 'qrcode';
import { toast } from 'sonner';

type RGB = [number, number, number];

const COLORS = {
    ink: [17, 24, 39] as RGB,
    muted: [107, 114, 128] as RGB,
    border: [229, 231, 235] as RGB,
    panel: [249, 250, 251] as RGB,
    primary: [2, 132, 199] as RGB,
    primaryDark: [15, 23, 42] as RGB,
    cyanSoft: [236, 254, 255] as RGB,
    amberSoft: [255, 247, 237] as RGB,
    green: [22, 163, 74] as RGB,
    codeBg: [24, 24, 27] as RGB,
    codeText: [229, 231, 235] as RGB,
};

const APP_URL = 'https://academy.chefuinc.com';

const saveBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const safeFileName = (value: string) =>
    value.replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim() || 'course';

const cleanText = (value?: string) =>
    String(value || '')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const cleanCode = (value?: string) =>
    cleanText(value)
        .replace(/^```[\w-]*\n/, '')
        .replace(/```$/, '')
        .trim();

const courseStats = (course: Course) => {
    const lessons = course.chapters.reduce(
        (total, chapter) => total + (chapter.content?.length || 0),
        0,
    );
    const practice =
        (course.quiz?.length || 0) +
        (course.flashcards?.length || 0) +
        (course.qa?.length || 0);

    return {
        lessons,
        practice,
        sessions: Math.max(1, Math.ceil(lessons / 4)),
    };
};

const snippet = (value?: string, length = 220) => {
    const text = cleanText(value);
    return text.length > length ? `${text.slice(0, length - 1)}...` : text;
};

export const downloadCoursePDF_Office = async (course: Course) => {
    if (!course?.id) return downloadCoursePDF_Legacy(course);

    try {
        const response = await fetch(getApiUrl(`/courses/${course.id}/export/pdf`), {
            credentials: 'include',
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const message =
                data?.message ||
                data?.error ||
                `PDF export failed with status ${response.status}`;

            if (response.status === 429) {
                toast.error(message);
                return;
            }

            throw new Error(message);
        }

        const blob = await response.blob();
        saveBlob(blob, `${safeFileName(course.courseTitle || 'course')}.pdf`);
    } catch (error) {
        console.error('Server PDF export failed. Falling back to client PDF:', error);
        await downloadCoursePDF_Legacy(course);
    }
};

export const downloadCourseDOCX = async (course: Course) => {
    const stats = courseStats(course);
    const noBorder = {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    };

    const doc = new Document({
        creator: 'CheFu Academy',
        title: course.courseTitle,
        description: course.description,
        styles: {
            paragraphStyles: [
                {
                    id: 'Title',
                    name: 'Title',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { size: 56, bold: true, color: '0F172A', font: 'Aptos Display' },
                    paragraph: { spacing: { after: 260 } },
                },
                {
                    id: 'Heading1',
                    name: 'Heading 1',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { size: 34, bold: true, color: '0F172A', font: 'Aptos Display' },
                    paragraph: { spacing: { before: 360, after: 160 } },
                },
                {
                    id: 'Heading2',
                    name: 'Heading 2',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { size: 25, bold: true, color: '075985', font: 'Aptos Display' },
                    paragraph: { spacing: { before: 240, after: 120 } },
                },
                {
                    id: 'Heading3',
                    name: 'Heading 3',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: { size: 21, bold: true, color: '0F172A', font: 'Aptos' },
                    paragraph: { spacing: { before: 180, after: 80 } },
                },
            ],
        },
        sections: [
            {
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: 'CHEFU ACADEMY WORKBOOK',
                                bold: true,
                                color: '0284C7',
                                size: 19,
                            }),
                        ],
                    }),
                    new Paragraph({
                        text: course.courseTitle || 'Untitled Course',
                        heading: HeadingLevel.TITLE,
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: course.category || 'General',
                                bold: true,
                                color: '0284C7',
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text:
                                    cleanText(course.description) ||
                                    'A structured learning path with lessons, examples, and practice material.',
                                size: 23,
                                color: '334155',
                            }),
                        ],
                        spacing: { after: 240 },
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: noBorder,
                        rows: [
                            new TableRow({
                                children: [
                                    ['Chapters', String(course.chapters.length)],
                                    ['Lessons', String(stats.lessons)],
                                    ['Practice', String(stats.practice)],
                                    ['Sessions', String(stats.sessions)],
                                ].map(
                                    ([label, value]) =>
                                        new TableCell({
                                            shading: { fill: 'F0F9FF' },
                                            borders: noBorder,
                                            margins: {
                                                top: 170,
                                                bottom: 170,
                                                left: 170,
                                                right: 170,
                                            },
                                            children: [
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({
                                                            text: value,
                                                            bold: true,
                                                            size: 30,
                                                            color: '0F172A',
                                                        }),
                                                    ],
                                                }),
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({
                                                            text: label.toUpperCase(),
                                                            bold: true,
                                                            size: 16,
                                                            color: '0369A1',
                                                        }),
                                                    ],
                                                }),
                                            ],
                                        }),
                                ),
                            }),
                        ],
                    }),
                    new Paragraph({
                        text: 'How to use this workbook',
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph(
                        'Read each lesson, pause on examples, then test yourself with the practice pack. Use the roadmap to plan short study sessions and revisit chapters you want to strengthen.',
                    ),
                    new Paragraph({
                        text: 'Course Roadmap',
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: ['#', 'Chapter', 'Lessons'].map(
                                    text =>
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({ text, bold: true }),
                                                    ],
                                                }),
                                            ],
                                        }),
                                ),
                            }),
                            ...course.chapters.map(
                                (chapter, index) =>
                                    new TableRow({
                                        children: [
                                            String(index + 1),
                                            chapter.chapterName,
                                            String(chapter.content?.length || 0),
                                        ].map(
                                            text =>
                                                new TableCell({
                                                    children: [new Paragraph(text)],
                                                }),
                                        ),
                                    }),
                            ),
                        ],
                    }),
                    ...course.chapters.flatMap((chapter, chapterIndex) => [
                        new Paragraph({
                            text: `${chapterIndex + 1}. ${chapter.chapterName}`,
                            heading: HeadingLevel.HEADING_1,
                        }),
                        ...chapter.content.flatMap((item, itemIndex) => [
                            new Paragraph({
                                text: `Lesson ${chapterIndex + 1}.${itemIndex + 1}${item.topic ? ` - ${item.topic}` : ''}`,
                                heading: HeadingLevel.HEADING_2,
                            }),
                            new Paragraph(cleanText(item.explain)),
                            ...(item.example
                                ? [
                                      new Paragraph({
                                          text: 'Example',
                                          heading: HeadingLevel.HEADING_3,
                                      }),
                                      new Paragraph(cleanText(item.example)),
                                  ]
                                : []),
                            ...(item.code
                                ? [
                                      new Paragraph({
                                          text: 'Code',
                                          heading: HeadingLevel.HEADING_3,
                                      }),
                                      new Paragraph({
                                          children: [
                                              new TextRun({
                                                  text: cleanCode(item.code),
                                                  font: 'Consolas',
                                              }),
                                          ],
                                      }),
                                  ]
                                : []),
                        ]),
                    ]),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveBlob(blob, `${safeFileName(course.courseTitle || 'course')}.docx`);
};

export const downloadCoursePPTX = async (course: Course) => {
    const stats = courseStats(course);
    const pptx = new pptxgen();
    pptx.author = 'CheFu Academy';
    pptx.company = 'CheFu Inc';
    pptx.subject = course.category || 'Course';
    pptx.title = course.courseTitle || 'Course';
    pptx.layout = 'LAYOUT_WIDE';
    pptx.theme = {
        headFontFace: 'Aptos Display',
        bodyFontFace: 'Aptos',
    };

    const addRibbon = (slide: pptxgen.Slide, label = 'CheFu Academy') => {
        slide.addShape(pptx.ShapeType.rect, {
            x: 0,
            y: 0,
            w: 13.33,
            h: 0.16,
            fill: { color: '0EA5E9' },
            line: { color: '0EA5E9' },
        });
        slide.addText(label, {
            x: 0.55,
            y: 0.32,
            w: 3,
            h: 0.24,
            fontSize: 8.5,
            bold: true,
            color: '0284C7',
            margin: 0,
            fit: 'shrink',
        });
    };

    const addTitle = (slide: pptxgen.Slide, title: string, subtitle?: string) => {
        slide.background = { color: '0F172A' };
        slide.addShape(pptx.ShapeType.rect, {
            x: 8.8,
            y: 0,
            w: 4.6,
            h: 7.5,
            fill: { color: '075985', transparency: 8 },
            line: { color: '075985', transparency: 100 },
        });
        slide.addText('CHEFU ACADEMY', {
            x: 0.75,
            y: 0.62,
            w: 3.5,
            h: 0.25,
            fontSize: 9,
            bold: true,
            color: '7DD3FC',
            margin: 0,
        });
        slide.addText(title, {
            x: 0.7,
            y: 1.35,
            w: 8.4,
            h: 1.2,
            fontFace: 'Aptos Display',
            fontSize: 34,
            bold: true,
            color: 'FFFFFF',
            fit: 'shrink',
        });
        if (subtitle) {
            slide.addText(subtitle, {
                x: 0.75,
                y: 2.65,
                w: 7.8,
                h: 0.95,
                fontSize: 15,
                color: 'CBD5E1',
                fit: 'shrink',
            });
        }
        [
            ['Chapters', String(course.chapters.length)],
            ['Lessons', String(stats.lessons)],
            ['Practice', String(stats.practice)],
        ].forEach(([label, value], index) => {
            slide.addShape(pptx.ShapeType.roundRect, {
                x: 0.75 + index * 2.05,
                y: 5.35,
                w: 1.75,
                h: 0.82,
                rectRadius: 0.08,
                fill: { color: 'FFFFFF', transparency: 88 },
                line: { color: '38BDF8', transparency: 30 },
            });
            slide.addText(value, {
                x: 0.93 + index * 2.05,
                y: 5.48,
                w: 1.35,
                h: 0.24,
                fontSize: 17,
                bold: true,
                color: 'FFFFFF',
                margin: 0,
            });
            slide.addText(label.toUpperCase(), {
                x: 0.93 + index * 2.05,
                y: 5.82,
                w: 1.35,
                h: 0.18,
                fontSize: 6.5,
                bold: true,
                color: 'BAE6FD',
                margin: 0,
            });
        });
    };

    addTitle(
        pptx.addSlide(),
        course.courseTitle || 'Untitled Course',
        snippet(course.description, 180) || course.category,
    );

    const roadmap = pptx.addSlide();
    addRibbon(roadmap, course.category || 'Course roadmap');
    roadmap.addText('Course Roadmap', {
        x: 0.6,
        y: 0.45,
        w: 12,
        h: 0.5,
        fontSize: 26,
        bold: true,
        color: '0F172A',
    });
    roadmap.addTable(
        [
            [
                { text: '#', options: { bold: true } },
                { text: 'Chapter', options: { bold: true } },
                { text: 'Lessons', options: { bold: true } },
            ],
            ...course.chapters.map((chapter, index) => [
                { text: String(index + 1) },
                { text: chapter.chapterName },
                { text: String(chapter.content?.length || 0) },
            ]),
        ],
        {
            x: 0.65,
            y: 1.25,
            w: 12,
            border: { color: 'E5E7EB' },
            fontSize: 12,
            color: '111827',
            fill: { color: 'FFFFFF' },
        },
    );

    const studyFlow = pptx.addSlide();
    addRibbon(studyFlow, 'Study plan');
    studyFlow.addText('How to use this deck', {
        x: 0.65,
        y: 0.75,
        w: 8.6,
        h: 0.55,
        fontSize: 28,
        bold: true,
        color: '0F172A',
        margin: 0,
    });
    [
        'Read one chapter at a time.',
        'Pause on worked examples and code blocks.',
        'Use flashcards, Q&A, and quizzes for recall.',
        'Revisit weak topics after each study session.',
    ].forEach((item, index) => {
        studyFlow.addShape(pptx.ShapeType.roundRect, {
            x: 0.78,
            y: 1.65 + index * 0.92,
            w: 11.5,
            h: 0.62,
            rectRadius: 0.08,
            fill: { color: index % 2 ? 'F8FAFC' : 'F0F9FF' },
            line: { color: 'DBE3EE' },
        });
        studyFlow.addText(String(index + 1).padStart(2, '0'), {
            x: 1.05,
            y: 1.84 + index * 0.92,
            w: 0.38,
            h: 0.2,
            fontSize: 9,
            bold: true,
            color: '0284C7',
            margin: 0,
        });
        studyFlow.addText(item, {
            x: 1.65,
            y: 1.78 + index * 0.92,
            w: 9.8,
            h: 0.28,
            fontSize: 14,
            color: '334155',
            margin: 0,
        });
    });

    course.chapters.forEach((chapter, chapterIndex) => {
        const slide = pptx.addSlide();
        addRibbon(slide, `Chapter ${chapterIndex + 1}`);
        slide.addText(`${chapterIndex + 1}. ${chapter.chapterName}`, {
            x: 0.6,
            y: 0.55,
            w: 12,
            h: 0.6,
            fontSize: 24,
            bold: true,
            color: '0F172A',
            fit: 'shrink',
        });
        slide.addText(
            chapter.content
                .slice(0, 5)
                .map((item, index) => `${index + 1}. ${item.topic || item.explain?.slice(0, 70) || 'Lesson'}`)
                .join('\n'),
            {
                x: 0.8,
                y: 1.45,
                w: 11.6,
                h: 4.7,
                fontSize: 16,
                breakLine: false,
                color: '334155',
                fit: 'shrink',
                valign: 'middle',
            },
        );
    });

    await pptx.writeFile({ fileName: `${safeFileName(course.courseTitle || 'course')}.pptx` });
};

export const downloadCourseXLSX = async (course: Course) => {
    const stats = courseStats(course);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CheFu Academy';
    workbook.created = new Date();

    const summary = workbook.addWorksheet('Dashboard');
    summary.properties.defaultRowHeight = 22;
    summary.columns = [
        { key: 'label', width: 28 },
        { key: 'value', width: 46 },
    ];
    summary.mergeCells('A1:B1');
    summary.getCell('A1').value = course.courseTitle || 'Untitled Course';
    summary.getCell('A1').font = {
        bold: true,
        size: 22,
        color: { argb: 'FF0F172A' },
    };
    summary.getCell('A1').alignment = { vertical: 'middle' };
    summary.addRow(['Category', course.category || 'General']);
    summary.addRow(['Description', cleanText(course.description)]);
    summary.addRow(['Chapters', course.chapters.length]);
    summary.addRow(['Lessons', stats.lessons]);
    summary.addRow(['Practice Items', stats.practice]);
    summary.addRow(['Recommended Study Sessions', stats.sessions]);
    summary.getColumn(1).font = { bold: true, color: { argb: 'FF0369A1' } };
    summary.eachRow(row => {
        row.eachCell(cell => {
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            };
            cell.alignment = { vertical: 'top', wrapText: true };
        });
    });
    summary.getRow(1).height = 34;

    const outline = workbook.addWorksheet('Course Outline');
    outline.views = [{ state: 'frozen', ySplit: 1 }];
    outline.columns = [
        { header: 'Chapter #', key: 'chapter', width: 12 },
        { header: 'Chapter Name', key: 'chapterName', width: 36 },
        { header: 'Lesson #', key: 'lesson', width: 12 },
        { header: 'Topic', key: 'topic', width: 34 },
        { header: 'Completed', key: 'completed', width: 14 },
        { header: 'Notes', key: 'notes', width: 42 },
    ];
    outline.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    outline.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' },
    };
    outline.autoFilter = {
        from: 'A1',
        to: 'F1',
    };

    course.chapters.forEach((chapter, chapterIndex) => {
        chapter.content.forEach((item, itemIndex) => {
            outline.addRow({
                chapter: chapterIndex + 1,
                chapterName: chapter.chapterName,
                lesson: itemIndex + 1,
                topic: item.topic || '',
                completed: course.completedChapter?.includes(String(chapterIndex))
                    ? 'Yes'
                    : 'No',
                notes: '',
            });
        });
    });
    outline.eachRow((row, rowNumber) => {
        row.eachCell(cell => {
            cell.alignment = { vertical: 'top', wrapText: true };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            };
            if (rowNumber > 1 && rowNumber % 2 === 0) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8FAFC' },
                };
            }
        });
    });

    const practice = workbook.addWorksheet('Practice');
    practice.views = [{ state: 'frozen', ySplit: 1 }];
    practice.columns = [
        { header: 'Type', key: 'type', width: 18 },
        { header: 'Prompt', key: 'prompt', width: 60 },
        { header: 'Answer', key: 'answer', width: 60 },
    ];
    practice.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    practice.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF075985' },
    };
    course.quiz.forEach(item => {
        practice.addRow({
            type: 'Quiz',
            prompt: item.question,
            answer: item.correctAns,
        });
    });
    course.flashcards.forEach(item => {
        practice.addRow({
            type: 'Flashcard',
            prompt: item.front,
            answer: item.back,
        });
    });
    course.qa.forEach(item => {
        practice.addRow({
            type: 'Q&A',
            prompt: item.question,
            answer: item.answer,
        });
    });
    practice.autoFilter = {
        from: 'A1',
        to: 'C1',
    };
    practice.eachRow((row, rowNumber) => {
        row.eachCell(cell => {
            cell.alignment = { vertical: 'top', wrapText: true };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            };
            if (rowNumber > 1 && rowNumber % 2 === 0) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8FAFC' },
                };
            }
        });
    });

    const weekly = workbook.addWorksheet('Weekly Plan');
    weekly.columns = [
        { header: 'Week', key: 'week', width: 12 },
        { header: 'Focus', key: 'focus', width: 42 },
        { header: 'Goal', key: 'goal', width: 42 },
        { header: 'Done', key: 'done', width: 12 },
    ];
    weekly.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    weekly.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' },
    };
    course.chapters.forEach((chapter, index) => {
        weekly.addRow({
            week: index + 1,
            focus: chapter.chapterName,
            goal: `Complete ${chapter.content?.length || 0} lessons and write a short summary.`,
            done: '',
        });
    });
    weekly.eachRow((row, rowNumber) => {
        row.eachCell(cell => {
            cell.alignment = { vertical: 'top', wrapText: true };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            };
            if (rowNumber > 1 && rowNumber % 2 === 0) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8FAFC' },
                };
            }
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveBlob(
        new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `${safeFileName(course.courseTitle || 'course')}-study-tracker.xlsx`,
    );
};

const downloadCoursePDF_Legacy = async (course: Course) => {
    if (!course) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = { left: 18, right: 18 };
    const contentWidth = pageWidth - margin.left - margin.right;
    const topStart = 28;
    const bottomLimit = pageHeight - 24;
    const lineStep = 5.8;
    let y = topStart;

    const setFont = (
        style: 'normal' | 'bold' | 'italic' = 'normal',
        size = 11,
        color: RGB = COLORS.ink,
    ) => {
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(...color);
    };

    const cleanText = (value?: string) =>
        String(value || '')
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

    const cleanCode = (value?: string) =>
        cleanText(value)
            .replace(/^```[\w-]*\n/, '')
            .replace(/```$/, '')
            .trim();

    const safeFileName = (value: string) =>
        value.replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim();

    const formatDate = (value: unknown) => {
        try {
            const maybeTimestamp = value as { toDate?: () => Date };
            const date =
                typeof maybeTimestamp?.toDate === 'function'
                    ? maybeTimestamp.toDate()
                    : value
                      ? new Date(value as string | number | Date)
                      : new Date();

            return Number.isNaN(date.getTime())
                ? new Date().toLocaleDateString()
                : date.toLocaleDateString();
        } catch {
            return new Date().toLocaleDateString();
        }
    };

    const ensureSpace = (heightNeeded: number) => {
        if (y + heightNeeded > bottomLimit) {
            doc.addPage();
            y = topStart;
        }
    };

    const addWrappedText = (
        text: string,
        options?: {
            x?: number;
            width?: number;
            size?: number;
            style?: 'normal' | 'bold' | 'italic';
            color?: RGB;
            lineStep?: number;
            after?: number;
        },
    ) => {
        const content = cleanText(text);
        if (!content) return;

        const x = options?.x ?? margin.left;
        const width = options?.width ?? contentWidth;
        const step = options?.lineStep ?? lineStep;
        setFont(options?.style || 'normal', options?.size || 11, options?.color || COLORS.ink);

        content.split(/\n\s*\n/).forEach((paragraph, paragraphIndex) => {
            const lines = doc.splitTextToSize(paragraph, width);

            lines.forEach((line: string) => {
                ensureSpace(step);
                doc.text(line, x, y);
                y += step;
            });

            if (paragraphIndex < content.split(/\n\s*\n/).length - 1) {
                y += 2;
            }
        });

        y += options?.after ?? 3;
    };

    const sectionTitle = (title: string, eyebrow?: string) => {
        ensureSpace(25);
        y += 3;
        if (eyebrow) {
            setFont('bold', 8, COLORS.primary);
            doc.text(eyebrow.toUpperCase(), margin.left, y);
            y += 5;
        }

        setFont('bold', 18, COLORS.primaryDark);
        const lines = doc.splitTextToSize(title, contentWidth);
        doc.text(lines, margin.left, y);
        y += lines.length * 7 + 4;

        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(0.8);
        doc.line(margin.left, y, margin.left + 24, y);
        y += 7;
    };

    const statCard = (x: number, label: string, value: string, width: number) => {
        doc.setFillColor(...COLORS.panel);
        doc.setDrawColor(...COLORS.border);
        doc.roundedRect(x, y, width, 24, 3, 3, 'FD');
        setFont('bold', 15, COLORS.primaryDark);
        doc.text(value, x + 5, y + 10);
        setFont('normal', 8, COLORS.muted);
        doc.text(label.toUpperCase(), x + 5, y + 17);
    };

    const drawCallout = (
        title: string,
        body: string,
        tone: 'blue' | 'amber' = 'blue',
    ) => {
        const bodyLines = doc.splitTextToSize(cleanText(body), contentWidth - 12);
        const height = 17 + bodyLines.length * 5.2;
        const fill = tone === 'blue' ? COLORS.cyanSoft : COLORS.amberSoft;
        const border = tone === 'blue' ? [165, 243, 252] : [253, 186, 116];

        ensureSpace(height + 4);
        doc.setFillColor(...fill);
        doc.setDrawColor(...(border as RGB));
        doc.roundedRect(margin.left, y, contentWidth, height, 3, 3, 'FD');
        setFont('bold', 11, COLORS.primaryDark);
        doc.text(title, margin.left + 6, y + 8);
        setFont('normal', 9.5, COLORS.ink);
        doc.text(bodyLines, margin.left + 6, y + 15);
        y += height + 5;
    };

    const getImageDataUrl = async (src?: string) => {
        if (!src || typeof window === 'undefined') return '';
        try {
            const response = await fetch(src);
            const blob = await response.blob();

            return await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => resolve('');
                reader.readAsDataURL(blob);
            });
        } catch {
            return '';
        }
    };

    const drawCodeBlock = (value?: string) => {
        const code = cleanCode(value);
        if (!code) return;

        const sourceLines = code.split('\n');
        const chunks: string[] = [];
        for (let i = 0; i < sourceLines.length; i += 28) {
            chunks.push(sourceLines.slice(i, i + 28).join('\n'));
        }

        chunks.forEach((chunk) => {
            setFont('normal', 8.5, COLORS.codeText);
            const rawLines = chunk.split('\n');
            const wrappedLines = rawLines.flatMap((line) =>
                doc.splitTextToSize(line || ' ', contentWidth - 8),
            );
            const height = 8 + wrappedLines.length * 4.4;

            ensureSpace(height + 5);
            doc.setFillColor(...COLORS.codeBg);
            doc.setDrawColor(63, 63, 70);
            doc.roundedRect(margin.left, y, contentWidth, height, 3, 3, 'FD');

            let codeY = y + 6;
            wrappedLines.forEach((line: string) => {
                setFont('normal', 8.5, COLORS.codeText);
                doc.text(line, margin.left + 4, codeY);
                codeY += 4.4;
            });

            y += height + 5;
        });
    };

    const tableFinalY = () =>
        (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
            ?.finalY || y;

    const totalLessons = course.chapters.reduce(
        (total, chapter) => total + (chapter.content?.length || 0),
        0,
    );
    const practiceCount =
        (course.quiz?.length || 0) +
        (course.flashcards?.length || 0) +
        (course.qa?.length || 0);
    const createdOn = formatDate(course.createdOn);
    const bannerDataUrl = await getImageDataUrl(course.banner_image);

    doc.setProperties({
        title: course.courseTitle || 'Course',
        subject: course.category || 'CheFu Academy Course',
        author: 'CheFu Academy',
        keywords: ['course', course.category || '', 'learning', 'practice']
            .filter(Boolean)
            .join(', '),
        creator: 'CheFu Academy',
    });

    doc.setFillColor(...COLORS.primaryDark);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 18, 'F');

    if (bannerDataUrl) {
        try {
            doc.addImage(bannerDataUrl, 'JPEG', 0, 18, pageWidth, 76, undefined, 'FAST');
        } catch {
            doc.setFillColor(8, 47, 73);
            doc.rect(0, 18, pageWidth, 76, 'F');
        }
    } else {
        doc.setFillColor(8, 47, 73);
        doc.rect(0, 18, pageWidth, 76, 'F');
    }

    setFont('bold', 10, [186, 230, 253]);
    doc.text('CHEFU ACADEMY COURSE WORKBOOK', margin.left, 40);

    setFont('bold', 28, [255, 255, 255]);
    const titleLines = doc.splitTextToSize(course.courseTitle || 'Untitled Course', contentWidth);
    doc.text(titleLines.slice(0, 3), margin.left, 58);

    setFont('normal', 12, [226, 232, 240]);
    const descriptionLines = doc.splitTextToSize(
        cleanText(course.description) ||
            'A structured learning path with lessons, examples, and practice material.',
        contentWidth,
    );
    doc.text(descriptionLines.slice(0, 4), margin.left, 98);

    y = 145;
    const statWidth = (contentWidth - 8) / 3;
    statCard(margin.left, 'Chapters', String(course.chapters.length), statWidth);
    statCard(margin.left + statWidth + 4, 'Lessons', String(totalLessons), statWidth);
    statCard(margin.left + statWidth * 2 + 8, 'Practice items', String(practiceCount), statWidth);

    y = 188;
    setFont('normal', 10, [203, 213, 225]);
    doc.text(`Category: ${course.category || 'General'}`, margin.left, y);
    doc.text(`Generated: ${createdOn}`, margin.left, y + 7);
    doc.text('Author: CheFu Academy', margin.left, y + 14);

    try {
        const qr = await QRCode.toDataURL(APP_URL, { margin: 0, width: 160 });
        doc.addImage(qr, 'PNG', pageWidth - margin.right - 28, 190, 28, 28);
        setFont('normal', 8, [203, 213, 225]);
        doc.text('academy.chefuinc.com', pageWidth - margin.right - 28, 224);
    } catch {
        // Optional QR code.
    }

    setFont('normal', 9, [148, 163, 184]);
    doc.text('Designed for focused study, review, and offline reference.', margin.left, pageHeight - 18);

    doc.addPage();
    y = topStart;
    sectionTitle('Course Overview', 'Start here');
    addWrappedText(
        cleanText(course.description) ||
            'Use this workbook as a portable version of your course. Read each chapter, review the examples, and complete the practice material at the end.',
        { size: 11.5, lineStep: 6.2, after: 5 },
    );

    drawCallout(
        'How to use this PDF',
        'Read one chapter at a time, pause on each example, then answer the practice prompts before moving on. Revisit the checklist after each chapter to confirm that the topic is clear.',
    );

    sectionTitle('Contents', 'Roadmap');
    if (course.chapters.length) {
        autoTable(doc, {
            startY: y,
            head: [['#', 'Chapter', 'Scope']],
            body: course.chapters.map((chapter, index) => [
                String(index + 1).padStart(2, '0'),
                chapter.chapterName || `Chapter ${index + 1}`,
                `${chapter.content?.length || 0} lessons`,
            ]),
            theme: 'grid',
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 3.4,
                valign: 'middle',
                lineColor: COLORS.border,
                textColor: COLORS.ink,
            },
            headStyles: {
                fillColor: COLORS.primaryDark,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: COLORS.panel },
            columnStyles: {
                0: { halign: 'center', cellWidth: 16 },
                2: { halign: 'right', cellWidth: 30 },
            },
            margin: { left: margin.left, right: margin.right },
            tableWidth: contentWidth,
        });
        y = tableFinalY() + 10;
    }

    sectionTitle('Study Checklist', 'Before you finish');
    [
        'I can explain the main idea of each chapter in my own words.',
        'I reviewed every example and understand why it works.',
        'I answered the Q&A prompts without looking at the answer first.',
        'I used flashcards or quiz questions to test recall.',
    ].forEach((item) => {
        ensureSpace(10);
        doc.setDrawColor(...COLORS.border);
        doc.rect(margin.left, y - 3.5, 4.2, 4.2);
        addWrappedText(item, {
            x: margin.left + 8,
            width: contentWidth - 8,
            size: 10.5,
            after: 1,
        });
    });

    course.chapters.forEach((chapter, chapterIndex) => {
        doc.addPage();
        y = topStart;

        doc.setFillColor(...COLORS.primaryDark);
        doc.roundedRect(margin.left, y, contentWidth, 34, 4, 4, 'F');
        setFont('bold', 9, [186, 230, 253]);
        doc.text(`CHAPTER ${chapterIndex + 1}`, margin.left + 7, y + 10);
        setFont('bold', 17, [255, 255, 255]);
        const chapterTitle = doc.splitTextToSize(
            chapter.chapterName || `Chapter ${chapterIndex + 1}`,
            contentWidth - 14,
        );
        doc.text(chapterTitle.slice(0, 2), margin.left + 7, y + 21);
        y += 44;

        chapter.content?.forEach((item, lessonIndex) => {
            ensureSpace(24);
            doc.setFillColor(...COLORS.panel);
            doc.setDrawColor(...COLORS.border);
            doc.roundedRect(margin.left, y, contentWidth, 16, 3, 3, 'FD');
            setFont('bold', 9, COLORS.primary);
            doc.text(`LESSON ${lessonIndex + 1}`, margin.left + 5, y + 6);
            setFont('bold', 12, COLORS.ink);
            const topic = item.topic || `Part ${chapterIndex + 1}.${lessonIndex + 1}`;
            const topicLines = doc.splitTextToSize(topic, contentWidth - 44);
            doc.text(topicLines.slice(0, 1), margin.left + 32, y + 9);
            y += 22;

            if (item.explain) {
                addWrappedText(item.explain, {
                    size: 10.8,
                    lineStep: 5.9,
                    after: 4,
                });
            }

            if (item.example) {
                drawCallout('Example', item.example, 'blue');
            }

            if (item.code) {
                ensureSpace(13);
                setFont('bold', 10, COLORS.primaryDark);
                doc.text('Code reference', margin.left, y);
                y += 5;
                drawCodeBlock(item.code);
            }
        });

        drawCallout(
            'Chapter review',
            'Before moving on, summarize this chapter in three bullets and identify one idea you can apply immediately.',
            'amber',
        );
    });

    const addPracticePage = (title: string, eyebrow: string) => {
        doc.addPage();
        y = topStart;
        sectionTitle(title, eyebrow);
    };

    const sharedTableOptions = {
        theme: 'grid' as const,
        styles: {
            font: 'helvetica',
            fontSize: 9.5,
            cellPadding: 3.2,
            valign: 'top' as const,
            lineColor: COLORS.border,
            textColor: COLORS.ink,
        },
        headStyles: {
            fillColor: COLORS.primaryDark,
            textColor: [255, 255, 255] as RGB,
            fontStyle: 'bold' as const,
        },
        alternateRowStyles: { fillColor: COLORS.panel },
        margin: { left: margin.left, right: margin.right },
        tableWidth: contentWidth,
    };

    if (course.flashcards?.length) {
        addPracticePage('Flashcards', 'Practice');
        autoTable(doc, {
            startY: y,
            head: [['#', 'Front', 'Back']],
            body: course.flashcards.map((card, index) => [
                String(index + 1),
                card.front || '',
                card.back || '',
            ]) as RowInput[],
            ...sharedTableOptions,
            columnStyles: { 0: { halign: 'center', cellWidth: 12 } },
        });
    }

    if (course.qa?.length) {
        addPracticePage('Question and Answer', 'Review');
        autoTable(doc, {
            startY: y,
            head: [['#', 'Question', 'Answer']],
            body: course.qa.map((qa, index) => [
                String(index + 1),
                qa.question || '',
                qa.answer || '',
            ]) as RowInput[],
            ...sharedTableOptions,
            columnStyles: { 0: { halign: 'center', cellWidth: 12 } },
        });
    }

    if (course.quiz?.length) {
        addPracticePage('Quiz', 'Check your understanding');
        autoTable(doc, {
            startY: y,
            head: [['#', 'Question', 'Options', 'Answer']],
            body: course.quiz.map((quiz, index) => [
                String(index + 1),
                quiz.question || '',
                (quiz.options || [])
                    .map((option, optionIndex) => `${optionIndex + 1}. ${option}`)
                    .join('\n'),
                quiz.correctAns || '',
            ]) as RowInput[],
            ...sharedTableOptions,
            styles: {
                ...sharedTableOptions.styles,
                fontSize: 9.2,
                cellPadding: 3,
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                3: { cellWidth: 30 },
            },
        });
    }

    const totalPages = doc.getNumberOfPages();
    const shortTitle = () => {
        let title = course.courseTitle || 'Course';
        setFont('bold', 9, COLORS.primary);
        while (doc.getTextWidth(title) > contentWidth * 0.55 && title.length > 10) {
            title = `${title.slice(0, -5)}...`;
        }
        return title;
    };

    for (let pageNo = 1; pageNo <= totalPages; pageNo += 1) {
        doc.setPage(pageNo);

        if (pageNo > 1) {
            setFont('bold', 9, COLORS.primary);
            doc.text(shortTitle(), margin.left, 13);
            setFont('normal', 8, COLORS.muted);
            doc.text('CheFu Academy', pageWidth - margin.right, 13, {
                align: 'right',
            });
            doc.setDrawColor(...COLORS.border);
            doc.line(margin.left, 17, pageWidth - margin.right, 17);
        }

        setFont('normal', 9, COLORS.muted);
        doc.setDrawColor(...COLORS.border);
        doc.line(margin.left, pageHeight - 16, pageWidth - margin.right, pageHeight - 16);
        doc.text('Generated by CheFu Academy', margin.left, pageHeight - 10);
        doc.text(`${pageNo} / ${totalPages}`, pageWidth - margin.right, pageHeight - 10, {
            align: 'right',
        });
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const fileName = `${safeFileName(course.courseTitle || 'course')}.pdf`;
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }
};
