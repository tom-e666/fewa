function encoder(grid: string[][]): [number[][], Map<string, number>, Map<number, string>, boolean] {
    const resGrid: number[][] = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(0));
    const encodeMap = new Map<string, number>();
    let nextID = 1;

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (encodeMap.has(grid[i][j])) {
                resGrid[i][j] = encodeMap.get(grid[i][j])!;
            } else {
                encodeMap.set(grid[i][j], nextID);
                resGrid[i][j] = nextID;
                nextID += 1;
            }
        }
    }

    const decodeMap = new Map<number, string>();
    for (const [key, value] of encodeMap) {
        decodeMap.set(value, key);
    }

    return [resGrid, encodeMap, decodeMap, encodeMap.has("")];
}

function encoderWithMap(input: string[][], encodeMap: Map<string, number>): number[][] {
    return input.map(row => row.map(item => encodeMap.get(item)!));
}

function decoder(grid: number[][], decodeMap: Map<number, string>): string[][] {
    return grid.map(row => row.map(item => decodeMap.get(item)!));
}

function mayConvertible(a: string[][], b: string[][]): boolean {
    const mapA = new Map<string, number>();
    const mapB = new Map<string, number>();

    a.flat().forEach(item => mapA.set(item, (mapA.get(item) || 0) + 1));
    b.flat().forEach(item => mapB.set(item, (mapB.get(item) || 0) + 1));

    for (const [key, value] of mapB) {
        if (!mapA.has(key) || mapA.get(key) !== value) {
            return false;
        }
    }
    return true;
}

function hCost(a: number[][], b: number[][]): number {
    let totalCost = 0;
    const mapping = new Map<number, Array<[number, number]>>();

    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a[0].length; j++) {
            if (!mapping.has(a[i][j])) mapping.set(a[i][j], []);
            mapping.get(a[i][j])!.push([i, j]);
        }
    }

    for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < b[0].length; j++) {
            const candidates = mapping.get(b[i][j])!;
            const bestMatch = candidates.reduce((best, [x, y]) => {
                const distance = Math.abs(x - i) + Math.abs(y - j);
                const bestDistance = Math.abs(best[0] - i) + Math.abs(best[1] - j);
                return distance < bestDistance ? [x, y] : best;
            }, candidates[0]);
            totalCost += Math.abs(bestMatch[0] - i) + Math.abs(bestMatch[1] - j);
        }
    }
    return totalCost;
}

function stringify(input: number[][]): string {
    return input.map(row => row.join(',')).join(';');
}

function destring(input: string): number[][] {
    return input.split(';').map(row => row.split(',').map(Number));
}

function obtainNextState(p: string, blankID: number): string[] {
    const pGrid = destring(p);
    const blankPos: [number, number][] = [];
    const m = pGrid.length;
    const n = pGrid[0].length;
    const dx = [0, -1, 0, 1];
    const dy = [1, 0, -1, 0];

    for (let i = 0; i < pGrid.length; i++) {
        for (let j = 0; j < pGrid[0].length; j++) {
            if (pGrid[i][j] === blankID) {
                blankPos.push([i, j]);
            }
        }
    }

    const listState = new Set<string>();

    blankPos.forEach(([x, y]) => {
        for (let i = 0; i < 4; i++) {
            const nx = x + dx[i];
            const ny = y + dy[i];

            if (nx >= 0 && nx < m && ny >= 0 && ny < n) {
                [pGrid[x][y], pGrid[nx][ny]] = [pGrid[nx][ny], pGrid[x][y]];
                listState.add(stringify(pGrid));
                [pGrid[x][y], pGrid[nx][ny]] = [pGrid[nx][ny], pGrid[x][y]];
            }
        }
    });

    return Array.from(listState);
}

export default function solver(input: string[][], output: string[][]): Array<string[][]> | string {
    if (!mayConvertible(input, output)) {
        return "CODE1: The input Grid and output Grid do not match";
    }

    const [startGrid, encodeMap, decodeMap, haveBlank] = encoder(input);
    if (!haveBlank) {
        return "CODE2: The current game doesn't support this yet";
    }

    const endGrid = encoderWithMap(output, encodeMap);
    const start = stringify(startGrid);
    const end = stringify(endGrid);

    const parent = new Map<string, string>();
    const open = new Set<string>([start]);
    const close = new Set<string>();
    const g = new Map<string, number>([[start, 0]]);
    const blankID = encodeMap.get("")!;

    function getF(current: string): number {
        return g.get(current)! + hCost(destring(current), endGrid);
    }

    while (open.size > 0) {
        const p = Array.from(open).reduce((best, current) => getF(current) < getF(best) ? current : best);
        if (p === end) break;

        open.delete(p);
        close.add(p);

        for (const q of obtainNextState(p, blankID)) {
            const tempG = g.get(p)! + 1;
            if (close.has(q) && tempG >= g.get(q)!) continue;

            if (!open.has(q) || tempG < g.get(q)!) {
                parent.set(q, p);
                g.set(q, tempG);
                open.add(q);
            }
        }
    }

    if (!parent.has(end)) {
        return "CODE3: The code cannot resolve the answer";
    }

    const listString: string[] = [];
    let iter = end;
    while (iter !== start) {
        listString.push(iter);
        iter = parent.get(iter)!;
    }
    listString.push(start);
    listString.reverse();

    return listString.map(st => decoder(destring(st), decodeMap));
}


