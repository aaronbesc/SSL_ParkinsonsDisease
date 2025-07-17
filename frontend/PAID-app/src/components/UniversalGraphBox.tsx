import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    mpld3: any;
  }
}

interface UniversalGraphBoxProps {
  graphData: object | null;
  graphHtml?: string;
  loading?: boolean;
  error?: string | null;
  className?: string;
  title?: string;
}

export default function UniversalGraphBox({
  graphData,
  graphHtml,
  loading = false,
  error,
  className = '',
  title,
}: UniversalGraphBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerId = 'mpld3-container';

  useEffect(() => {
    if (graphData && containerRef.current && window.mpld3) {
      containerRef.current.innerHTML = '';
      window.mpld3.draw_figure(containerId, graphData);
    }
  }, [graphData]);

  if (loading) return <div className={className}>Loading...</div>;
  if (error) return <div className={className}>Error: {error}</div>;

  return (
    <div className={className}>
      {title && <h3>{title}</h3>}
      {graphHtml ? (
        <div dangerouslySetInnerHTML={{ __html: graphHtml }} />
      ) : (
        <div id={containerId} ref={containerRef} />
      )}
    </div>
  );
}