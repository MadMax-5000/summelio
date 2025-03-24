import React from "react";

interface YouTubeRendererProps {
    url: string;
}

const YouTubeRenderer = ({ url }: YouTubeRendererProps) => {
    // Extract the video ID from the URL
    const videoId = url.split("v=")[1]?.split("&")[0];

    if (!videoId) {
        return <div>Invalid YouTube URL</div>;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    console.log("this is the youtube embed URL", embedUrl);

    return (
        <div className="w-full h-full">
            <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
            />
        </div>
    );
};

export default YouTubeRenderer;
