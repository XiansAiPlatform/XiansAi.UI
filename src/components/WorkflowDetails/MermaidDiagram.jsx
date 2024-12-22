import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidDiagram = ({ diagram }) => {
  const diagramRef = useRef(null);

  useEffect(() => {
    if (diagramRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.contentLoaded();
    }
  }, [diagram]);

  return <div ref={diagramRef} className="mermaid">{diagram}</div>;
};

export default MermaidDiagram; 