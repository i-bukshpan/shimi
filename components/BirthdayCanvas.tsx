"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  NodeChange,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { supabase } from '@/utils/supabase/client';
import CardNode from './CardNode';
import CustomEdges from './CustomEdges';
import PresentationModal from './PresentationModal';
import ShimiNode from './ShimiNode';

const nodeTypes = {
  cardNode: CardNode,
  shimiNode: ShimiNode,
};

const edgeTypes = {
  join_blessing: CustomEdges.JoinBlessingEdge,
  joke_continuation: CustomEdges.JokeContinuationEdge,
  song_chain: CustomEdges.SongChainEdge,
};

export default function BirthdayCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  useEffect(() => {
    fetchData();

    // Subscribe to new creations
    const creationsChannel = supabase
      .channel('public:ai_creations')
      .on('postgres_changes', { event: 'INSERT', schema: 'shimi_birthday', table: 'ai_creations' }, (payload) => {
        const newCreation = payload.new;
        const newNode: Node = {
          id: newCreation.id,
          type: 'cardNode',
          position: { x: newCreation.position_x || Math.random() * 500, y: newCreation.position_y || Math.random() * 500 },
          data: { creation: newCreation },
        };
        setNodes((nds) => [...nds, newNode]);
      })
      .subscribe();

    // Subscribe to connections
    const edgesChannel = supabase
      .channel('public:card_connections')
      .on('postgres_changes', { event: 'INSERT', schema: 'shimi_birthday', table: 'card_connections' }, (payload) => {
        const conn = payload.new;
        const newEdge: Edge = {
          id: conn.id,
          source: conn.source_id,
          target: conn.target_id,
          type: conn.edge_type,
          animated: true,
        };
        setEdges((eds) => {
          if (eds.some(e => e.id === conn.id)) return eds;
          return [...eds, newEdge];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'shimi_birthday', table: 'card_connections' }, (payload) => {
        setEdges((eds) => eds.filter(e => e.id !== payload.old.id));
      })
      .subscribe();

    // Subscribe to likes
    const likesChannel = supabase
      .channel('public:card_likes')
      .on('postgres_changes', { event: 'INSERT', schema: 'shimi_birthday', table: 'card_likes' }, (payload) => {
        setNodes((nds) => nds.map(n => {
          if (n.id === payload.new.card_id) {
            return { ...n, data: { ...n.data, likes: [...(n.data.likes as any[] || []), payload.new] } };
          }
          return n;
        }));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'shimi_birthday', table: 'card_likes' }, (payload) => {
        setNodes((nds) => nds.map(n => {
          if (n.id === payload.old.card_id || n.type === 'cardNode') { // have to check all or if we know card_id
             return { ...n, data: { ...n.data, likes: (n.data.likes as any[] || []).filter(l => l.id !== payload.old.id) } };
          }
          return n;
        }));
      })
      .subscribe();

    // Subscribe to comments
    const commentsChannel = supabase
      .channel('public:card_comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'shimi_birthday', table: 'card_comments' }, (payload) => {
        setNodes((nds) => nds.map(n => {
          if (n.id === payload.new.card_id) {
            return { ...n, data: { ...n.data, comments: [...(n.data.comments as any[] || []), payload.new] } };
          }
          return n;
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(creationsChannel);
      supabase.removeChannel(edgesChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, []);

  const fetchData = async () => {
    // Fetch nodes
    const { data: creationsData } = await supabase
      .from('ai_creations')
      .select('*')
      .order('created_at', { ascending: true });

    // Fetch likes
    const { data: likesData } = await supabase.from('card_likes').select('*');
    // Fetch comments
    const { data: commentsData } = await supabase.from('card_comments').select('*').order('created_at', { ascending: true });

    let initialNodes: Node[] = [
      {
        id: 'shimi-main-node',
        type: 'shimiNode',
        position: { x: window.innerWidth / 2 - 160, y: 150 },
        data: {},
        draggable: false,
        zIndex: 1000,
      }
    ];

    if (creationsData) {
      initialNodes = [
        ...initialNodes,
        ...creationsData.map((c) => ({
          id: c.id,
          type: 'cardNode',
          position: { x: c.position_x || Math.random() * 800, y: c.position_y || Math.random() * 800 },
          data: { 
            creation: c,
            likes: likesData ? likesData.filter(l => l.card_id === c.id) : [],
            comments: commentsData ? commentsData.filter(cm => cm.card_id === c.id) : []
          },
        }))
      ];
    }
    setNodes(initialNodes);

    // Fetch custom connection edges
    const { data: connectionsData } = await supabase
      .from('card_connections')
      .select('*');

    if (connectionsData) {
      const initialEdges: Edge[] = connectionsData.map((conn) => ({
        id: conn.id,
        source: conn.source_id,
        target: conn.target_id,
        type: conn.edge_type,
        animated: true,
      }));
      setEdges(initialEdges);
    } else {
      setEdges([]);
    }
  };

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      
      // Handle drag ends to save new positions to DB
      changes.forEach((change) => {
        if (change.type === 'position' && !change.dragging && change.position) {
          supabase
            .from('ai_creations')
            .update({ position_x: change.position.x, position_y: change.position.y })
            .eq('id', change.id)
            .then(); // fire and forget
        }
      });
    },
    [setNodes]
  );

  const onConnect = useCallback(
    async (params: Connection) => {
      if (params.source === params.target) return; // Prevent self-connections
      
      // Create new edge locally
      const edgeType = 'join_blessing'; // default, could be selected by user
      const newEdge: Edge = { ...params, id: crypto.randomUUID(), type: edgeType, animated: true };
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Save to Supabase
      if (params.source && params.target) {
        await supabase.from('card_connections').insert({
          id: newEdge.id,
          source_id: params.source,
          target_id: params.target,
          edge_type: edgeType
        });
      }
    },
    [setEdges]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        if (!edge.id.startsWith('edge-')) {
          supabase.from('card_connections').delete().eq('id', edge.id).then();
        }
      });
    },
    []
  );

  useEffect(() => {
    const playHandler = () => setIsPresentationMode(true);
    window.addEventListener('play-presentation', playHandler);
    return () => {
      window.removeEventListener('play-presentation', playHandler);
    };
  }, [nodes]);

  return (
    <div className={`w-full h-full relative transition-colors duration-1000 ${isPresentationMode ? 'fixed inset-0 z-[100] bg-[#FAF6F0]/95 backdrop-blur-sm' : ''}`}>
      <ReactFlowProvider>
        {isPresentationMode && (
          <PresentationModal nodes={nodes} edges={edges} onExit={() => setIsPresentationMode(false)} />
        )}
        
        <div className="w-full h-full block">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={onEdgesDelete}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineType={'smoothstep' as any}
            connectionLineStyle={{ stroke: '#ECC94B', strokeWidth: 4, filter: 'drop-shadow(0 0 4px rgba(236,201,75,0.6))' }}
            fitView
            className="bg-transparent"
            minZoom={0.2}
            maxZoom={2}
          >
            <Background color="#ECC94B" gap={24} size={2} style={{ opacity: 0.4 }} />
            <Controls 
              className="bg-white/90 backdrop-blur-md shadow-2xl border border-stone-200/50 rounded-2xl overflow-hidden !bottom-8 !left-8 flex flex-col gap-1 p-1"
              showInteractive={false}
            />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
