import React from "react";

interface WebsiteRendererProps {
  url: string;
}

const WebsiteRenderer = ({ url }: WebsiteRendererProps) => {
  return (
    <iframe
      src={url}
      className="w-full h-full"
      sandbox="allow-same-origin allow-scripts"
    />
  );
};

export default WebsiteRenderer;
