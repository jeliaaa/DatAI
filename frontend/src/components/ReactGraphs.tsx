import React, { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Handle,
    Position,
    type Node,
    type Edge,
    type Connection,
    type NodeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

/* ===================== STORAGE ===================== */

const STORAGE_KEY = 'schema-designer-v1';

type PersistedSchema = {
    nodes: Node<SchemaData>[];
    edges: Edge[];
};

const loadFromStorage = (): PersistedSchema | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const saveToStorage = (data: PersistedSchema) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/* ===================== TYPES ===================== */

type SchemaField = {
    name: string;
    type: string;
};

type SchemaData = {
    label: string;
    fields: SchemaField[];
};

/* ===================== CUSTOM NODE ===================== */

const SchemaNode: React.FC<{ data: SchemaData }> = ({ data }) => {
    return (
        <div className="bg-white border rounded-md shadow-md min-w-45">
            <div className="bg-primary-color/70 rounded-t-md px-2 py-1 font-bold text-center border-b">
                {data.label}
            </div>
            <div className="p-2 text-sm">
                {data.fields.length === 0 && (
                    <div className="italic text-gray-400">no fields</div>
                )}
                {data.fields.map((f, i) => (
                    <div key={i} className="flex justify-between gap-5 font-mono">
                        <span>{f.name}</span>
                        <span className="text-gray-500">{f.type}</span>
                    </div>
                ))}
            </div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

/* ===================== CONTEXT MENU ===================== */

interface ContextMenuProps {
    id: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    getNode: (id: string) => Node<SchemaData> | undefined;
    setNodes: Dispatch<SetStateAction<Node<SchemaData>[]>>;
    setEdges: Dispatch<SetStateAction<Edge[]>>;
    addNodes: (node: Node<SchemaData>) => void;
    setMenu: Dispatch<SetStateAction<ContextMenuProps | null>>;
    persist: (n: Node<SchemaData>[], e: Edge[]) => void;
    edges: Edge[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({
    id,
    top,
    left,
    right,
    bottom,
    getNode,
    setNodes,
    setEdges,
    addNodes,
    setMenu,
    persist,
    edges
}) => {
    const node = getNode(id);
    const label = node?.data.label ?? "";

    const duplicateNode = useCallback(() => {
        if (!node) return;

        const newNode: Node<SchemaData> = {
            ...node,
            id: `${node.id}-copy-${crypto.randomUUID()}`,
            position: { x: node.position.x + 40, y: node.position.y + 40 },
            data: {
                label: node.data.label,
                fields: node.data.fields.map(f => ({ ...f }))
            }
        };
        addNodes(newNode);
        setMenu(null);
    }, [node, addNodes, setMenu]);

    const deleteNode = useCallback(() => {
        setNodes((n) => {
            const nextNodes = n.filter((x) => x.id !== id);
            const nextEdges = edges.filter((e) => e.source !== id && e.target !== id);
            setEdges(nextEdges);
            persist(nextNodes, nextEdges);
            return nextNodes;
        });
        setMenu(null);
    }, [id, edges, persist, setNodes, setEdges, setMenu]);

    return (
        <div
            style={{
                top,
                left,
                right,
                bottom,
                position: "absolute",
                zIndex: 10,
                minWidth: 120
            }}
            className="p-3 bg-gray-200 rounded-md shadow-md"
        >
            <h3 className="font-bold mb-2">{label}</h3>
            <div className="flex gap-2">
                <button
                    className="bg-primary-color text-white px-3 py-1 rounded-md"
                    onClick={duplicateNode}
                >
                    Duplicate
                </button>
                <button
                    className="bg-red-900 text-white px-3 py-1 rounded-md"
                    onClick={deleteNode}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

/* ===================== SCHEMA EDITOR ===================== */

interface SchemaEditorProps {
    node: Node<SchemaData>;
    onSave: (node: Node<SchemaData>) => void;
    onClose: () => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ node, onSave, onClose }) => {
    const [label, setLabel] = useState(node.data.label);
    const [fields, setFields] = useState(node.data.fields);

    const updateField = (index: number, key: 'name' | 'type', value: string) => {
        setFields(f => f.map((x, i) => (i === index ? { ...x, [key]: value } : x)));
    };

    const removeField = (index: number) => {
        if (fields.length === 1) {
            toast.error('Schema must contain at least one field');
            return;
        }
        setFields(f => f.filter((_, i) => i !== index));
    };

    const validateAndSave = () => {
        if (!label.trim()) { toast.error('Table name cannot be empty'); return; }
        for (let i = 0; i < fields.length; i++) {
            if (!fields[i].name.trim() || !fields[i].type.trim()) {
                toast.error(`Field #${i + 1} is incomplete`);
                return;
            }
        }
        onSave({
            ...node,
            data: { label: label.trim(), fields: fields.map(f => ({ name: f.name.trim(), type: f.type.trim() })) }
        });
        toast.success('Schema saved');
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-md w-1/2">
                <h3 className="font-bold mb-4 text-2xl">Edit Schema</h3>
                <label className="block mb-1 font-medium">Table Name</label>
                <input className="border p-2 w-full mb-4" value={label} onChange={e => setLabel(e.target.value)} />
                <label className="block mb-1 font-medium">Fields</label>
                {fields.map((f, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input className="border p-2 flex-1" value={f.name} placeholder="field" onChange={e => updateField(i, 'name', e.target.value)} />
                        <input className="border p-2 flex-1" value={f.type} placeholder="type" onChange={e => updateField(i, 'type', e.target.value)} />
                        <button className="cursor-pointer" onClick={() => removeField(i)}><X /></button>
                    </div>
                ))}
                <button className="text-sm mt-2" onClick={() => setFields([...fields, { name: '', type: '' }])}>+ Add field</button>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose}>Cancel</button>
                    <button className="bg-primary-color text-white px-4 py-2 rounded-md" onClick={validateAndSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

/* ===================== FLOW PAGE ===================== */

const FlowPage: React.FC = () => {
    const persisted = loadFromStorage();

    const [nodes, setNodes, onNodesChange] = useNodesState<Node<SchemaData>>(persisted?.nodes ?? []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(persisted?.edges ?? []);
    const [menu, setMenu] = useState<ContextMenuProps | null>(null);
    const [editingNode, setEditingNode] = useState<Node<SchemaData> | null>(null);

    const ref = useRef<HTMLDivElement>(null);

    const persist = useCallback((n: Node<SchemaData>[], e: Edge[]) => saveToStorage({ nodes: n, edges: e }), []);

    const getNode = useCallback((id: string) => nodes.find(n => n.id === id), [nodes]);

    const addNodes = useCallback((node: Node<SchemaData>) => {
        setNodes(n => { const next = [...n, node]; persist(next, edges); return next; });
    }, [edges, persist, setNodes]);

    const handleNodesChange = useCallback((changes: NodeChange<Node<SchemaData>>[]) => {
        onNodesChange(changes);
        const nextNodes = [...nodes];
        changes.forEach(change => {
            if (change.type === 'position' && change.position) {
                const idx = nextNodes.findIndex(n => n.id === change.id);
                if (idx !== -1) nextNodes[idx] = { ...nextNodes[idx], position: change.position };
            }
        });
        persist(nextNodes, edges);
    }, [nodes, edges, onNodesChange, persist]);

    const onConnect = useCallback((params: Connection) => {
        setEdges(e => { const next = addEdge(params, e); persist(nodes, next); return next; });
    }, [nodes, persist, setEdges]);

    const handleAddNode = () => {
        addNodes({
            id: crypto.randomUUID(),
            type: 'schema',
            position: { x: 150, y: 150 },
            data: { label: 'new_table', fields: [] },
        });
    };

    const exportToJSON = () => {
        const data: PersistedSchema = { nodes, edges };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schema.json';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Schema exported');
    };

    const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string) as PersistedSchema;
                if (json.nodes && json.edges) {
                    setNodes(json.nodes);
                    setEdges(json.edges);
                    saveToStorage(json);
                    toast.success('Schema imported successfully');
                } else {
                    toast.error('Invalid schema JSON');
                }
            } catch {
                toast.error('Failed to parse JSON');
            }
        };
        reader.readAsText(file);
    };

    const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node<SchemaData>) => {
        event.preventDefault();
        setMenu({
            id: node.id,
            top: event.clientY - 100,
            left: event.clientX - 100,
            getNode,
            setNodes,
            setEdges,
            addNodes,
            setMenu,
            persist,
            edges
        });
    }, [getNode, setNodes, setEdges, addNodes, persist, edges]);

    return (
        <div style={{ width: '88dvw', height: '80dvh' }} ref={ref}>
            <div className="flex gap-3" style={{ position: 'absolute', zIndex: 20, top: 110, left: 110 }}>
                <button className="bg-primary-color text-main-color px-5 py-3 rounded-md" onClick={handleAddNode}>Add Schema</button>
                <button className="bg-gray-700 text-white px-5 py-3 rounded-md" onClick={exportToJSON}>Export JSON</button>

                {/* Hidden file input for import */}
                <input type="file" accept=".json" id="import-json" className="hidden" onChange={handleImportJSON} />
                <button className="bg-main-color text-white px-5 py-3 rounded-md" onClick={() => document.getElementById('import-json')?.click()}>Import JSON</button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={{ schema: SchemaNode }}
                onNodesChange={handleNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={(_, node) => setEditingNode(node)}
                onNodeContextMenu={onNodeContextMenu}
                onPaneClick={() => setMenu(null)}
                fitView
            >
                <Background />
                <Controls />

                {menu && <ContextMenu {...menu} />}

                {editingNode && (
                    <SchemaEditor
                        node={editingNode}
                        onClose={() => setEditingNode(null)}
                        onSave={(n) => {
                            setNodes(nds => {
                                const next = nds.map(x => x.id === n.id ? n : x);
                                persist(next, edges);
                                return next;
                            });
                            setEditingNode(null);
                        }}
                    />
                )}
            </ReactFlow>
        </div>
    );
};

export default FlowPage;
