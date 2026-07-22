import React from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from '@xyflow/react';
import { supabase } from '@/utils/supabase/client';

const EdgeDeleteButton = ({ id, target, labelX, labelY, defaultIcon }: { id: string, target: string, labelX: number; labelY: number, defaultIcon: string }) => {
  const { setEdges, getNode } = useReactFlow();

  let icon = defaultIcon;
  const targetNode = getNode(target);
  if (targetNode && targetNode.data && (targetNode.data as any).creation) {
    const mediaType = (targetNode.data as any).creation.media_type;
    if (mediaType === 'image') icon = '📸';
    else if (mediaType === 'video') icon = '🎥';
    else if (mediaType === 'audio') icon = '🎵';
    else if (mediaType === 'text') icon = '💬';
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove from React Flow state
    setEdges((edges) => edges.filter((e) => e.id !== id));
    
    // Attempt to remove from DB if it's a saved connection
    if (!id.startsWith('edge-')) {
      await supabase.from('card_connections').delete().eq('id', id);
    }
  };

  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          pointerEvents: 'all',
        }}
        className="group relative bg-white rounded-full p-1.5 shadow-sm border border-stone-200 text-xl cursor-pointer hover:bg-red-50 transition-colors z-50"
      >
        <span className="group-hover:opacity-0 transition-opacity duration-200 block drop-shadow-sm">{icon}</span>
        <button 
          onClick={handleDelete}
          className="absolute inset-0 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
          title="מחק קשר"
        >
          ✕
        </button>
      </div>
    </EdgeLabelRenderer>
  );
};

export const JoinBlessingEdge = ({
  id,
  sourceX,
  sourceY,
  target,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, strokeWidth: 4, stroke: '#ECC94B', filter: 'drop-shadow(0 0 4px rgba(236,201,75,0.6))' }} 
      />
      <EdgeDeleteButton id={id} target={target} defaultIcon="❤️" labelX={labelX} labelY={labelY} />
    </>
  );
};

export const JokeContinuationEdge = ({
  id,
  sourceX,
  sourceY,
  target,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, strokeWidth: 3, stroke: '#ec4899', strokeDasharray: '6,6', animation: 'dash 1s linear infinite' }} 
      />
      <EdgeDeleteButton id={id} target={target} defaultIcon="😂" labelX={labelX} labelY={labelY} />
    </>
  );
};

export const SongChainEdge = ({
  id,
  sourceX,
  sourceY,
  target,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, strokeWidth: 3, stroke: '#8b5cf6' }} 
      />
      <EdgeDeleteButton id={id} target={target} defaultIcon="🎵" labelX={labelX} labelY={labelY} />
    </>
  );
};

export default { JoinBlessingEdge, JokeContinuationEdge, SongChainEdge };
