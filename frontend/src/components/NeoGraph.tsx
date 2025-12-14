import { useCallback, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DatabaseIcon, X } from 'lucide-react';
import toaster from 'react-hot-toast';

/* -------------------- Custom Node -------------------- */
// @ts-expect-error err
const NeoNode = ({ id, data }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(data.label);

    const save = () => {
        setEditing(false);
        data.onRename(id, value);
    };

    return (
        <div
            className="relative rounded-full shadow-md border flex items-center justify-center aspect-square px-4 py-3"
            style={{ backgroundColor: data.color || '#ffffff' }}
        >
            {editing ? (
                <input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={save}
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                    className="w-20 text-xs border rounded px-1 text-center"
                />
            ) : (
                <div
                    className="font-semibold text-sm cursor-pointer select-none"
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditing(true);
                    }}
                >
                    {data.label}
                </div>
            )}

            <button
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs"
                onClick={(e) => {
                    e.stopPropagation();
                    data.onRemove(id);
                }}
            >
                ×
            </button>

            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
};

const nodeTypes = { neo: NeoNode };

/* -------------------- Initial Graph -------------------- */
const initialNodes = [
    { id: '1', type: 'neo', color: '#ffffff', position: { x: 0, y: 80 }, data: { label: 'User' } },
    { id: '2', type: 'neo', color: '#ffffff', position: { x: 260, y: 0 }, data: { label: 'Post' } },
    { id: '3', type: 'neo', color: '#ffffff', position: { x: 260, y: 160 }, data: { label: 'Comment' } },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', label: 'To', animated: true },
    { id: 'e1-3', source: '1', target: '3', label: 'To' },
];

/* -------------------- Main Component -------------------- */
export default function Neo4jGraphMock() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [edgeLabel, setEdgeLabel] = useState('RELATED_TO');

    const generateRandomHexColor = () => {
        return '#' + Math.floor(5 * 0x1000000).toString(16).padStart(6, '0');
    };

    /* ---- Node Logic ---- */
    // @ts-expect-error err
    const removeNode = (id) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    };
    // @ts-expect-error err
    const renameNode = ({ id, label }) => {
        setNodes((nds) =>
            nds.map((n) =>
                n.id === id
                    ? { ...n, data: { ...n.data, label, color: generateRandomHexColor() } }
                    : n
            )
        );
    };

    const addNode = () => {
        const id = crypto.randomUUID();
        setNodes((nds) => [
            ...nds,
            {
                id,
                type: 'neo',
                color: generateRandomHexColor(),
                position: { x: Math.random() * 500, y: Math.random() * 300 },
                data: { label: `Node_${nds.length + 1}` },
            },
        ]);
    };

    /* ---- Edge Logic ---- */
    const onConnect = useCallback(
        // @ts-expect-error err
        (params) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        id: `${params.source}-${params.target}-${Date.now()}`,
                        label: edgeLabel.toUpperCase(),
                    },
                    eds
                )
            ),
        [edgeLabel, setEdges]
    );

    const onEdgeDoubleClick = useCallback(
        // @ts-expect-error err
        (_e, edge) => setEdges((eds) => eds.filter((e) => e.id !== edge.id)),
        [setEdges]
    );

    return (
        <div className="w-full h-[80dvh] bg-gray-50 relative">
            {/* ---- Connection Status ---- */}
            <div className="bg-white p-4 z-20 rounded-lg shadow-sm border border-gray-200 absolute top-5 right-5">
                <button
                    onClick={() => toaster.error("This Function isn't accessible right now.")}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                    <X size={16} />
                </button>
                <div className="flex items-start gap-3">
                    <DatabaseIcon className="text-primary-color mt-1" size={20} />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-main-color truncate">Neo4j</p>
                        <p className="text-sm text-main-color truncate">http://localhost:7563</p>
                        <p className="text-xs text-gray-400 truncate mt-1">@neo4j-user</p>
                    </div>
                </div>
            </div>

            {/* ---- Toolbar ---- */}
            <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white shadow rounded-xl p-3">
                <button className="px-3 py-1 rounded bg-black text-white text-xs" onClick={addNode}>
                    + Add Node
                </button>

                <input
                    value={edgeLabel}
                    onChange={(e) => setEdgeLabel(e.target.value)}
                    placeholder="RELATIONSHIP"
                    className="border rounded px-2 text-xs"
                />
            </div>

            <ReactFlow
                nodes={nodes.map((n) => ({
                    ...n,
                    data: {
                        ...n.data,
                        onRemove: removeNode,
                        onRename: renameNode,
                    },
                }))}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeDoubleClick={onEdgeDoubleClick}
                fitView
            >
                <MiniMap />
                <Controls />
                <Background gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
