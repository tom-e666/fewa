import React, {useEffect} from "react";
import {
    Background,
    BackgroundVariant,
    Controls,
    Handle,
    Position,
    ReactFlow,
    useEdgesState,
    useNodesState,
    Node,
    NodeProps, Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import solver from "./AstarSolver.tsx";

interface TitleNodeData {
    label: string;
    width: string;
    height: string;
    wrapText?: boolean;
}

interface GridNodeData {
    row: number;
    col: number;
    title: string;
    values: string[][];
    onCellChange: (row: number, col: number, value: string) => void;
}

type GeneralNode = Node<TitleNodeData | GridNodeData>;

const TitleNode: React.FC<NodeProps> = ({ data }) => {
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
            <Handle id="left-target" type="target" position={Position.Left} style={{ background: 'aqua' }} />
            <Handle id="right-target" type="target" position={Position.Right} style={{ background: 'aqua' }} />
            <Handle id="right-source" type="source" position={Position.Right} style={{ background: 'aqua' }} />
            <Handle id="left-source" type="source" position={Position.Left} style={{ background: 'aqua' }} />
        </div>
    );
};

const GridNode: React.FC<NodeProps<GridNodeData>> = ({ data }) => {
    const { row, col, title, values, onCellChange } = data;

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${col}, 1fr)`,
        gridTemplateRows: `repeat(${row}, 1fr)`,
        gap: '2px',
        width: `${col * 30}px`,
        height: `${row * 30}px`,
        backgroundColor: 'lightgray',
        border: '1px solid #FFFFFF',
    };

    return (
        <div style={{
            padding: '10px',
            backgroundColor: 'transparent',
            borderRadius: '5px',
            textAlign: 'center',
            display: 'inline-block'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px', color: 'black', backgroundColor: 'transparent' }}>{title}</div>
            <div style={gridStyle}>
                {values.map((row, rowIndex) =>
                    row.map((cellValue, colIndex) => (
                        <input
                            key={`${rowIndex}-${colIndex}`}
                            type="text"
                            value={cellValue} // Ensures the cell value is controlled by state
                            onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)} // Updates cell value on change
                            style={{
                                width: '100%',
                                height: '100%',
                                textAlign: 'center',
                                border: '1px solid #333',
                                backgroundColor: '#f0f8ff',
                                color: 'black',
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
};

function newGrid(rows: number, cols: number): string[][] {
    return Array.from({ length: rows }, () => Array(cols).fill(""));
}

const initialNodes: GeneralNode[] = [
    { id: 'title-node', type: 'titleNode', position: { x: 0, y: 0 }, data: { label: 'GridSolver', width: '200px', height: '50px' }, draggable: true },
    { id: 'input-grid', type: 'gridNode', position: { x: -150, y: 150 }, data: { row: 3, col: 3, title: 'Input Grid', values: newGrid(3, 3), onCellChange: () =>  {}}, draggable: true },
    { id: 'output-grid', type: 'gridNode', position: { x: 150, y: 150 }, data: { row: 3, col: 3, title: 'Output Grid', values: newGrid(3, 3), onCellChange: () =>  {}}, draggable: true },
];
const initialEdges: Edge[] = [
    {id:'input-output',source:'input-grid',sourceHandle:'right-source',target:'output-grid',targetHandle:'left-target'}
]

const nodeTypes = { titleNode: TitleNode, gridNode: GridNode };

function isGridNode(node: GeneralNode): node is Node<GridNodeData> {
    return (node.data as GridNodeData).values !== undefined;
}

export default function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    function handleCellChange(nodeID: string, rowIndex: number, colIndex: number, value: string) {
        setNodes(nodes =>
            nodes.map(node => {
                if (node.id === nodeID && isGridNode(node)) {
                    const updatedValues = node.data.values.map((row, rIdx) =>
                        row.map((oldValue, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : oldValue))
                    );
                    console.log('check point 1');
                    return { ...node, data: { ...node.data, values: updatedValues } };
                }
                return node;
            })
        );
    }

    function increaseGridSize(nodeID: string, addRows: number, addCols: number) {
        setNodes(nodes => nodes.map(node => {
            if (node.id === nodeID && isGridNode(node)) {
                const newCols = node.data.col + addCols;
                const newRows = node.data.row + addRows;
                const newValues = newGrid(newRows, newCols);

                for (let r = 0; r < node.data.row; r++) {
                    for (let c = 0; c < node.data.col; c++) {
                        newValues[r][c] = node.data.values[r][c];
                    }
                }

                return {
                    ...node,
                    data: {
                        ...node.data,
                        row: newRows,
                        col: newCols,
                        values: newValues,
                        onCellChange: (row: number, col: number, value: string) => handleCellChange(nodeID, row, col, value),
                    }
                };
            }
            return node;
        }));
    }
    function initHandleCellChange(){
        setNodes(nodes=>nodes.map(node=>{
            if(isGridNode(node))
            {
                node.data.onCellChange=(row: number, col: number, value: string) => handleCellChange(node.id,row,col,value);
                return node;
            }
            return node;
        }))
    }

    useEffect(() => initHandleCellChange, []);

    function handleSolveClick() {
        //get input and output string, get the solve function, switch case (string? or array of states, if that is good then create a function that draws
        const input=nodes.find(node=>node.id=='input-grid');
        const output=nodes.find(node=>node.id=='input-grid');
        const solveResult=solver(input,output);
        
    }

    return (
        <div style={{width: '100vw', height: '100vh', backgroundColor: 'white' }}>
            <button onClick={() => increaseGridSize('input-grid', 1, 0)}
                    style={{position: 'absolute', top: 75, left: 10, zIndex: 10,width:"110px"}}>
                ⇧ Height
            </button>
            <button onClick={() => increaseGridSize('input-grid', -1, 0)}
                    style={{position: 'absolute', top: 120, left: 10, zIndex: 10,width:"110px"}} disabled>
                ⇩ Height
            </button>
            <button onClick={() => increaseGridSize('input-grid', 0, 1)}
                    style={{position: 'absolute', top: 10, left: 10, zIndex: 10,width:"110px"}}>
                ⇧ Width
            </button>
            <button onClick={() => increaseGridSize('input-grid', 0, -1)}
                    style={{position: 'absolute', top: 10, left: 122, zIndex: 10,width:"110px"}} disabled>
                ⇩ Width
            </button >
            <button onClick={()=>handleSolveClick()} style={{position:"absolute",top:200,left:10 ,zIndex:10,width:"110px",backgroundColor:'blue'}}>Solve!</button>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Controls showInteractive={true}/>
                <Background color="#ffc0cb" variant={BackgroundVariant.Cross} gap={30}/>
            </ReactFlow>
        </div>
    );
}
