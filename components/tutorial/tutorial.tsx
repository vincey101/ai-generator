'use client';

import { Grid } from "@mui/material";
import VideoContainer from "../videoContainer/VideoContainer";
import VidContainer from "../videoContainer/VidContainer";

// Consolidate all videos into a single array with a type property
const allVideos = [
    {
        title: 'Video #1 - Human AI Demo',
        url: '496hw7ux53',
        type: 'vimeo'
    },
    {
        title: 'Video #2 -  Full Walkthrough Video',
        url: 'vNkuaZoHfNk',
        type: 'youtube'
    },
    { 
        title: 'Video #3 - How To Manage Your Human AI Projects',
        url: 'WG8bpX2mYv4',
        type: 'youtube'
    },
    { 
        title: 'Video #4 - Human AI DFY',
        url: 'GvIZZytrwC0',
        type: 'youtube'
    },
    { 
        title: 'Video #5 - Human AI Agency Plan',
        url: '4d-Cdw9Ae54',
        type: 'youtube'
    },
    // Case Studies
    {
        title: 'Case Study - Consulting with a Veterinarian',
        url: '7ji8s2ufqi',
        type: 'vimeo'
    },
    {
        title: 'Case Study - Interaction with Customer Support',
        url: 'h6oacysj3l',
        type: 'vimeo'
    },
    {
        title: 'Case Study - Meeting With a Lawyer',
        url: '6w2ptabwje',
        type: 'vimeo'
    },
    {
        title: 'Case Study - Interview Session With HR',
        url: '4bqokrepvj',
        type: 'vimeo'
    },
    {
        title: 'Case Study - Consulting with a Therapist',
        url: 'pkomocpqho',
        type: 'vimeo'
    },
    {
        title: 'Case Study - Consulting a Weight Loss Coach',
        url: 'lrpyhu5d1u',
        type: 'vimeo'
    }
];

export default function Tutorial() {
    const renderVideo = (video: { title: string; url: string; type: string }) => (
        <div key={video.url} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
                {video.title}
            </h2>
            <div className="aspect-video">
                {video.type === 'vimeo' ? (
                    <VidContainer url={video.url} />
                ) : video.type === 'youtube' ? (
                    <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${video.url}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <VideoContainer url={video.url} />
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[1400px] mx-auto font-sans">
            <div className="container mx-auto px-4">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Tutorials</h1>
                        </div>
                    </Grid>

                    <Grid item xs={12} md={2} className="hidden md:block" />
                    <Grid item xs={12} md={8}>
                        <div className="space-y-8">
                            <p className="text-red-600 font-semibold text-lg">
                                IMPORTANT: Pls Take Action - Human AI Bonuses For All Members
                            </p>

                            <div className="space-y-4">
                                <a
                                    href="https://warriorplus.com/o2/a/jv6yfqh/0/humanaitutorial"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:inline-flex items-center px-4 py-2 bg-[#194f43] hover:bg-[#194f43] text-white rounded-md transition-colors"
                                >
                                    &gt;&gt; Click Here To Get Lifetime Access To 100+ Premium AI Models
                                </a>
                                <a
                                    href="https://bit.ly/seyi-adeleke-channel"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-3 bg-[#194f43] hover:bg-[#194f43] text-white rounded-md transition-colors text-base"
                                >
                                    &gt;&gt; Subscribe To Our Youtube Channel
                                </a>
                            </div>

                            <div className="space-y-12">
                                {allVideos.map(video => renderVideo(video))}
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}