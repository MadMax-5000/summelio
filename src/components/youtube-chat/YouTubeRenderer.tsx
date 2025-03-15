import React from "react";

interface YouTubeRendererProps {
    url: string;
}

const YouTubeRenderer = ({ url }: YouTubeRendererProps) => {
    //  process the URL to extract a video ID and build the embed URL (optional if not working)
    return (
        <div className="w-full h-full">
            <iframe
                width="100%"
                height="100%"
                src={url}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
            />
        </div>
    );
};

export default YouTubeRenderer;
