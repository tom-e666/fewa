import {
    Background,
    BackgroundVariant,
    Controls,
    ReactFlow,
    useNodesState,
    useEdgesState,
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';

function TitleNode({ data }) {
    const label = data.label;
    const mWidth = data.width;
    const mHeight = data.height;
    const wrapText = data.wrapText;

    return (
        <div style={{
            borderRadius: '5px',
            borderStyle: "dashed",
            borderColor: "aqua",
            fontWeight: "bold",
            fontSize: "18px",
            color: "#333",
            minWidth: mWidth,
            minHeight: mHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            whiteSpace: wrapText ? 'normal' : 'nowrap',
            overflowWrap: wrapText ? 'break-word' : 'normal',
        }}>
            {label}
            {/* Assign unique IDs to each handle for targeted connections */}
            <Handle id="left-target" type="target" position={Position.Left} style={{ background: 'aqua' }} />
            <Handle id="right-target" type="target" position={Position.Right} style={{ background: 'aqua' }} />
            <Handle id="right-source" type="source" position={Position.Right} style={{ background: 'aqua' }} />
            <Handle id="left-source" type="source" position={Position.Left} style={{ background: 'aqua' }} />
        </div>
    );
}

function GridNode({ data }) {
    const { rows, cols,title, values, onCellChange } = data;

    // Grid styling
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '2px',
        width: `${cols * 30}px`,
        height: `${rows * 30}px`,
        backgroundColor: 'lightgray',
        border: '1px solid #ddd',
    };

    return (
        <div style={{
            padding: '10px',
            backgroundColor: 'white',
            borderRadius: '5px',
            textAlign: 'center',
            display: 'inline-block'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{title}</div>
            <div style={gridStyle}>
                {values.map((row, rowIndex) =>
                    row.map((cellValue, colIndex) => (
                        <input
                            key={`${rowIndex}-${colIndex}`}
                            type="text"
                            value={cellValue}
                            onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)}
                            style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'center',
                                border: '1px solid #333',
                                backgroundColor: '#f0f8ff',
                            }}
                        />
                    ))
                )}
            </div>
            <Handle id="left-target" type="target" position={Position.Left} style={{ background: 'aqua' }} />
            <Handle id="right-target" type="target" position={Position.Right} style={{ background: 'aqua' }} />
            <Handle id="right-source" type="source" position={Position.Right} style={{ background: 'aqua' }} />
            <Handle id="left-source" type="source" position={Position.Left} style={{ background: 'aqua' }} />
        </div>
    );
}
function newGrid(rows:number,cols:number){
    return Array.from({length:rows},()=>{Array(cols).fill("")})
}
const initialNodes = [
    { id: 'title-node', type: 'titleNode', position: { x: 0, y: 0 }, data: { label: 'GridSolver', width: '200px', height: '50px' }, draggable: true },
    { id: 'title-node-author', type: 'titleNode', position: { x: 300, y: 100 }, data: { label: 'by Tempure', width: '150px', height: '30px' }, draggable: true },
    { id: 'guide1', type: 'titleNode', position: { x: -300, y: 70 }, data: { label: 'Accept any kind of string.', width: '100px', height: '30px', wrapText: true }, draggable: true },
    { id: 'guide2', type: 'titleNode', position: { x: -350, y: 110 }, data: { label: 'Blank are the only mutable!', width: '100px', height: '30px', wrapText: true }, draggable: true },
    { id: 'input-grid', type: 'GridNode', position: { x: 150, y: 150 }, data: {row:'5',col:'5', title: 'Input Grid',values:newGrid(5,5), onCellChange:()=>{} }, draggable: true },
    { id: 'output-grid', type: 'text', position: { x: 150, y: 200 }, data: { label: 'Output Grid' }, draggable: true },
];
const initialEdges = [
    // Specify connections to left handles using sourceHandle and targetHandle
    //{ id: '1', source: 'title-node', sourceHandle: 'right-source', target: 'title-node-author', targetHandle: 'left-target' },
    { id: '2', source: 'input-grid', target: 'output-grid' },
    { id: '3', source: 'guide1', sourceHandle: 'left-source', target: 'guide2', targetHandle: 'left-target' },
    //{ id: '4', source: 'title-node', sourceHandle: 'left-source', target: 'guide1', targetHandle: 'left-target' },
];
const nodeTypes = { titleNode: TitleNode };

export default function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: 'white' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Controls showInteractive={true} />
                <Background color="#ffc0cb" variant={BackgroundVariant.Cross} gap={30} />
            </ReactFlow>
        </div>
    );
}
