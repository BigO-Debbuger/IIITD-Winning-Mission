// wavesync_web/src/components/OpportunityGraph3D.tsx
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, Users, Briefcase, Award, Zap, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface GraphNode {
  id: string;
  label: string;
  sub: string;
  type: 'founder' | 'project' | 'builder' | 'grant';
  pos: [number, number, number];
  color: string;
  size: number;
  connections: string[];
  details: {
    tag: string;
    description: string;
    metric: string;
  };
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: 'f1',
    label: 'Dr. Tariq Vance',
    sub: 'Synthetic Bio Architect',
    type: 'founder',
    pos: [-2.4, 1.2, 0.4],
    color: '#FF4B2F', // Tactile coral
    size: 0.32,
    connections: ['p1', 'g1', 'b2'],
    details: {
      tag: 'Founder · Ex-DeepMind',
      description: 'Building ZeroBio compute protocols. Looking for Rust & Three.js leads.',
      metric: '$1.2M Pre-Seed Backed',
    },
  },
  {
    id: 'p1',
    label: 'WaveMesh Core',
    sub: 'Verifiable P2P Compute',
    type: 'project',
    pos: [0, 0.8, -0.2],
    color: '#00D7B9', // WaveSync Mint
    size: 0.42,
    connections: ['f1', 'b1', 'b3', 'g1'],
    details: {
      tag: 'Featured Project',
      description: 'Decentralized verifiable state machine powered by lightweight cryptographic proofs.',
      metric: '3 Co-Founders Joined',
    },
  },
  {
    id: 'b1',
    label: 'Elena Rostova',
    sub: 'Distributed Systems Lead',
    type: 'builder',
    pos: [2.2, 0.9, 0.5],
    color: '#C9FF4F', // Lime
    size: 0.3,
    connections: ['p1', 'p2'],
    details: {
      tag: 'Verified Builder',
      description: 'Top-ranked BTE contributor with verified Ed25519 signature proof on consensus state.',
      metric: '98% Code Accuracy Score',
    },
  },
  {
    id: 'g1',
    label: '$25,000 Ecosystem Grant',
    sub: 'WaveSync Foundation',
    type: 'grant',
    pos: [-1.2, -1.1, 0.8],
    color: '#9D7AFF', // Soft violet
    size: 0.36,
    connections: ['f1', 'p1', 'p2'],
    details: {
      tag: 'Open Grant',
      description: 'Non-dilutive funding pool earmarked for verifiable decentralized tooling.',
      metric: '3 Days Remaining to Apply',
    },
  },
  {
    id: 'p2',
    label: 'VeriCore SNARK Indexer',
    sub: 'Zero-Knowledge Ledger',
    type: 'project',
    pos: [1.4, -1.0, -0.6],
    color: '#00D7B9',
    size: 0.38,
    connections: ['b1', 'g1', 'f2'],
    details: {
      tag: 'Open Bounty Project',
      description: 'High-throughput tree proofs evaluated live by alumni technical mentors.',
      metric: '$8,500 Reward Pool',
    },
  },
  {
    id: 'f2',
    label: 'Maya Chen',
    sub: 'FinTech Protocol Founder',
    type: 'founder',
    pos: [2.8, -0.5, 0.9],
    color: '#FF4B2F',
    size: 0.3,
    connections: ['p2', 'b2'],
    details: {
      tag: 'Founder · YC Alum',
      description: 'Building micro-liquidity rails for independent contributors and creator cohorts.',
      metric: 'Series A in Progress',
    },
  },
  {
    id: 'b2',
    label: 'Marcus Vance',
    sub: 'Spatial Systems & Shaders',
    type: 'builder',
    pos: [-2.1, -0.5, -0.9],
    color: '#C9FF4F',
    size: 0.28,
    connections: ['f1', 'f2', 'b3'],
    details: {
      tag: 'Verified Collaborator',
      description: 'Specializes in high-performance WebGL / WebGPU interactive canvases.',
      metric: '4 Proofs Verified',
    },
  },
  {
    id: 'b3',
    label: 'Sarah Lin',
    sub: 'AI Evaluation Engineer',
    type: 'builder',
    pos: [0.1, -1.8, 0.3],
    color: '#C9FF4F',
    size: 0.29,
    connections: ['p1', 'b2'],
    details: {
      tag: 'Verified Builder',
      description: 'Building deterministic evaluation benchmarks for LLM orchestration pipelines.',
      metric: 'Level 4 Reviewer',
    },
  },
];

// 3D Nodes & Connection Lines
const NodeMesh: React.FC<{
  node: GraphNode;
  isSelected: boolean;
  onSelect: (node: GraphNode) => void;
  filtered: boolean;
}> = ({ node, isSelected, onSelect, filtered }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = node.pos[1] + Math.sin(t * 1.5 + node.pos[0] * 2) * 0.05;
    }
  });

  if (filtered) return null;

  return (
    <group position={node.pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[node.size * (hovered || isSelected ? 1.25 : 1), 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          roughness={0.2}
          metalness={0.1}
          emissive={node.color}
          emissiveIntensity={hovered || isSelected ? 0.45 : 0.15}
        />
      </mesh>

      {/* Floating 3D Label */}
      <Html
        position={[0, node.size + 0.2, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            background: isSelected ? 'rgba(5, 2, 11, 0.95)' : 'rgba(17, 11, 28, 0.82)',
            color: '#FFFFFF',
            border: `1.5px solid ${node.color}`,
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.15s ease',
          }}
        >
          {node.label}
        </div>
      </Html>
    </group>
  );
};

// Line Edges
const GraphEdges: React.FC<{ nodes: GraphNode[]; activeFilter: string }> = ({ nodes, activeFilter }) => {
  const lineGeometries = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3, string][] = [];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    nodes.forEach((n) => {
      n.connections.forEach((targetId) => {
        const target = nodeMap.get(targetId);
        if (target && n.id < target.id) {
          const skipN = activeFilter !== 'all' && n.type !== activeFilter;
          const skipT = activeFilter !== 'all' && target.type !== activeFilter;
          if (!skipN || !skipT) {
            lines.push([
              new THREE.Vector3(...n.pos),
              new THREE.Vector3(...target.pos),
              n.color,
            ]);
          }
        }
      });
    });
    return lines;
  }, [nodes, activeFilter]);

  return (
    <>
      {lineGeometries.map(([start, end, color], idx) => (
        <Line
          key={idx}
          points={[start, end]}
          color={color}
          lineWidth={1.5}
          transparent
          opacity={0.35}
        />
      ))}
    </>
  );
};

export const OpportunityGraph3D: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(GRAPH_NODES[1]);
  const [filter, setFilter] = useState<'all' | 'founder' | 'project' | 'builder' | 'grant'>('all');

  return (
    <div className="graph-canvas-container">
      {/* Top Filter Chips */}
      <div className="graph-overlay-controls">
        <button
          className={`graph-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Ecosystem ({GRAPH_NODES.length})
        </button>
        <button
          className={`graph-filter-btn ${filter === 'founder' ? 'active' : ''}`}
          onClick={() => setFilter('founder')}
        >
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#FF4B2F', marginRight: 6 }} />
          Founders
        </button>
        <button
          className={`graph-filter-btn ${filter === 'project' ? 'active' : ''}`}
          onClick={() => setFilter('project')}
        >
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#00D7B9', marginRight: 6 }} />
          Projects
        </button>
        <button
          className={`graph-filter-btn ${filter === 'builder' ? 'active' : ''}`}
          onClick={() => setFilter('builder')}
        >
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#C9FF4F', marginRight: 6 }} />
          Collaborators
        </button>
        <button
          className={`graph-filter-btn ${filter === 'grant' ? 'active' : ''}`}
          onClick={() => setFilter('grant')}
        >
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#9D7AFF', marginRight: 6 }} />
          Grants
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <group>
            {GRAPH_NODES.map((node) => (
              <NodeMesh
                key={node.id}
                node={node}
                isSelected={selectedNode?.id === node.id}
                onSelect={(n) => setSelectedNode(n)}
                filtered={filter !== 'all' && node.type !== filter}
              />
            ))}
            <GraphEdges nodes={GRAPH_NODES} activeFilter={filter} />
          </group>
        </Float>

        <OrbitControls
          enableZoom={true}
          maxDistance={8}
          minDistance={3.2}
          autoRotate={true}
          autoRotateSpeed={0.6}
          enablePan={false}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Selected Node Details Card Overlay */}
      {selectedNode && (
        <div className="graph-tooltip">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 850,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: selectedNode.color,
              }}
            >
              {selectedNode.details.tag}
            </span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: selectedNode.color,
                boxShadow: `0 0 10px ${selectedNode.color}`,
              }}
            />
          </div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 4, color: '#FFFFFF' }}>
            {selectedNode.label}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: 12, lineHeight: 1.4 }}>
            {selectedNode.details.description}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 10,
              borderTop: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 750, color: '#C9FF4F' }}>
              {selectedNode.details.metric}
            </span>
            <Link
              to="/opportunities"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#FFFFFF',
                textTransform: 'uppercase',
              }}
            >
              Explore <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
