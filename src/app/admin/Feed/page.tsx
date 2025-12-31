'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DataTable from '../DataTable';
import { TableColumn } from 'react-data-table-component';
import { toast } from 'sonner';
import {
    Image as ImageIcon,
    VideoLibrary as VideoIcon,
    Description as TextIcon,
    Poll as PollIcon,
    ViewCarousel as CarouselIcon,
    Quiz as QuizIcon,
    Speed as ReelIcon,
} from '@mui/icons-material';
import { useParams } from 'next/navigation';
import { Switch } from '@mui/material';

/* ================= TYPES ================= */

interface Post {
    postId: string;
    user: {
        _id: string;
        username: string;
        name: string;
        email: string;
        profileImage: any[];
    };
    type: 'image' | 'video' | 'text' | 'carousel' | 'poll' | 'quiz' | 'reel';
    media: any[];
    text: string;
    caption: string;
    location: string;
    hashtags: string[];
    taggedUsers: any[];
    isDeleted: boolean;
    commentCount: number;
    likeCount: number;
    createdAt: string;
    updatedAt: string;
    status: number; // Added status field
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/* ================= COMPONENT ================= */

export default function AdminFeedPage() {
    const { id } = useParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [appliedFilters, setAppliedFilters] = useState<any>(null);

    /* ===== MODAL STATE ===== */
    const [openMediaModal, setOpenMediaModal] = useState(false);
    const [activeMedia, setActiveMedia] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const openMediaViewer = (media: any[], index = 0) => {
        setActiveMedia(media);
        setActiveIndex(index);
        setOpenMediaModal(true);
    };

    /* ===== ICONS ===== */

    const postTypeIcons: Record<string, any> = {
        image: <ImageIcon sx={{ fontSize: 16 }} />,
        video: <VideoIcon sx={{ fontSize: 16 }} />,
        text: <TextIcon sx={{ fontSize: 16 }} />,
        carousel: <CarouselIcon sx={{ fontSize: 16 }} />,
        poll: <PollIcon sx={{ fontSize: 16 }} />,
        quiz: <QuizIcon sx={{ fontSize: 16 }} />,
        reel: <ReelIcon sx={{ fontSize: 16 }} />,
    };

    /* ===== FETCH API ===== */

    const fetchFeed = useCallback(
        (search = '', currentPage = 1) => {
            setLoading(true);

            const payload = {
                userId: id,
                page: currentPage,
                limit: perPage,
                ...(search && { search }),
                includeDeleted: true, // Include both active and inactive feeds
            };

            fetch(`/api/admin/feed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setPosts(data.data);
                        setPagination(data.pagination);
                        // Store all filter information from response
                        if (data.filters) {
                            setAppliedFilters(data.filters);
                        }
                    } else {
                        toast.error('Failed to load feed');
                    }
                })
                .catch(() => toast.error('Failed to load feed'))
                .finally(() => setLoading(false));
        },
        [perPage]
    );

    useEffect(() => {
        fetchFeed(searchTerm, page);
    }, [page, searchTerm, fetchFeed]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1);
        fetchFeed(value, 1);
    };

    const toggleFeedStatus = async (feedId: string, currentStatus: number) => {
        try {
            const response = await fetch('/api/admin/feed/status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feedId, status: currentStatus === 1 ? 0 : 1 }), // Convert status to 0/1
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Feed status updated successfully');
                fetchFeed(searchTerm, page); // Refresh the feed list
            } else {
                toast.error(data.message || 'Failed to update feed status');
            }
        } catch (error) {
            console.error('Error updating feed status:', error);
            toast.error('Failed to update feed status');
        }
    };

    /* ================= TABLE COLUMNS ================= */

    const columns: TableColumn<Post>[] = [
        {
            name: 'Post ID',
            selector: (row) => row.postId,
            cell: (row) => <Link href="#">{row.postId}</Link>,
            width: '140px',
        },
        {
            name: 'Posted By',
            selector: (row) => row.user?.name || '-',
        },
        {
            name: 'Type',
            selector: (row) => row.type,
            cell: (row) => (
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {postTypeIcons[row.type]}
                    {row.type}
                </span>
            ),
        },
        {
            name: 'Caption',
            selector: (row) => row.caption || row.text,
            width: '250px',
            cell: (row) => (
                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {row.caption || row.text || '-'}
                </span>
            ),
        },
        {
            name: 'Media',
            width: '120px',
            sortable: false,
            cell: (row) => {
                if (!row.media?.length) return '-';

                // Display the first image (index 0)
                const firstMedia = row.media[0];
                const imageUrl = firstMedia?.imageUrl;

                if (!imageUrl) return '-';

                return (
                    <img
                        src={imageUrl}
                        alt="post thumbnail"
                        width={60}
                        height={60}
                        style={{
                            objectFit: 'cover',
                            borderRadius: 6,
                            cursor: 'pointer',
                            border: '1px solid #e5e7eb',
                            transition: 'opacity 0.2s ease',
                        }}
                        onClick={() => openMediaViewer(row.media, 0)}
                        title="Click to view all images in slider"
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    />
                );
            },
        },
        {
            name: 'Likes',
            selector: (row) => row.likeCount,
        },
        {
            name: 'Comments',
            selector: (row) => row.commentCount,
        },
        {
            name: 'Created',
            selector: (row) => row.createdAt,
            cell: (row) =>
                new Date(row.createdAt).toLocaleDateString('en-IN'),
        },
        {
            name: 'Status',
            selector: (row) => (row.status === 1 ? 'Active' : 'Inactive'),
            cell: (row) => (
                <Switch
                    checked={row.status === 1}
                    onChange={() => toggleFeedStatus(row.postId, row.status)} // Ensure status is passed as 0/1
                    // color="primary"
                    inputProps={{ 'aria-label': 'Toggle feed status' }}
                />
            ),
            sortable: true,
        },
    ];

    /* ================= RENDER ================= */

    return (
        <>
            <DataTable
                title="Feed"
                columns={columns}
                data={posts}
                loading={loading}
                pagination
                paginationServerMode
                paginationTotalRows={pagination.total}
                paginationDefaultPage={page}
                onPageChange={(p: number) => setPage(p)}
                onSearch={handleSearch}
                striped
                highlightOnHover
            />

            {/* ================= MODAL SLIDER ================= */}
            {openMediaModal && activeMedia.length > 0 && (
                <div
                    onClick={() => setOpenMediaModal(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            //   background: '#000',
                            padding: 10,
                            borderRadius: 8,
                            position: 'relative',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src={activeMedia[activeIndex]?.imageUrl || activeMedia[activeIndex]?.thumbUrl}
                            alt={`Media ${activeIndex + 1}`}
                            style={{
                                maxHeight: '80vh',
                                maxWidth: '80vw',
                                objectFit: 'contain',
                                borderRadius: 4,
                            }}
                        />

                        {/* Navigation Buttons */}
                        {activeIndex > 0 && (
                            <button
                                onClick={() => setActiveIndex(activeIndex - 1)}
                                style={navBtn('left')}
                            >
                                ‹
                            </button>
                        )}

                        {activeIndex < activeMedia.length - 1 && (
                            <button
                                onClick={() => setActiveIndex(activeIndex + 1)}
                                style={navBtn('right')}
                            >
                                ›
                            </button>
                        )}

                        {/* Image Counter */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 10,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                padding: '6px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            {activeIndex + 1} / {activeMedia.length}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setOpenMediaModal(false)}
                            style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                fontSize: 24,
                                border: 'none',
                                cursor: 'pointer',
                                width: 32,
                                height: 32,
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

/* ================= STYLES ================= */

const navBtn = (side: 'left' | 'right') => ({
    position: 'absolute' as const,
    top: '50%',
    [side]: 10,
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    fontSize: 32,
    cursor: 'pointer',
    padding: '0 12px',
});
