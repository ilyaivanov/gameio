export const fieldSize = 100;
export const numberOfMines = 2000;

let field = new Uint16Array(fieldSize * fieldSize);

export type V2 = { x: number; y: number };
export function hasFlag(pos: V2) {
    return !!(field[pos.y * fieldSize + pos.x] & 0b10);
}
export function toggleFlag(pos: V2) {
    if (hasFlag(pos)) {
        field[pos.y * fieldSize + pos.x] &= 0b1111_1111_1111_1101;
        decreaseFlagCountAt(pos);
    } else {
        field[pos.y * fieldSize + pos.x] |= 0b10;
        increaseFlagCountAt(pos);
    }
}

export function hasMine(pos: V2) {
    if (pos.x < 0 || pos.x >= fieldSize || pos.y < 0 || pos.y >= fieldSize)
        return 0;

    return field[pos.y * fieldSize + pos.x] & 0b1;
}
export function isOpen(pos: V2) {
    return !!(field[pos.y * fieldSize + pos.x] & 0b100);
}
export function setIsOpen(pos: V2) {
    field[pos.y * fieldSize + pos.x] |= 0b100;
}
export function setMine(pos: V2) {
    field[pos.y * fieldSize + pos.x] |= 0b1;
}

function decreaseFlagCountAt(pos: V2) {
    const { x, y } = pos;
    incrementFlatCountBy(x - 1, y - 1, -1);
    incrementFlatCountBy(x - 1, y, -1);
    incrementFlatCountBy(x, y - 1, -1);
    incrementFlatCountBy(x + 1, y + 1, -1);
    incrementFlatCountBy(x + 1, y, -1);
    incrementFlatCountBy(x, y + 1, -1);
    incrementFlatCountBy(x - 1, y + 1, -1);
    incrementFlatCountBy(x + 1, y - 1, -1);
}

function increaseFlagCountAt(pos: V2) {
    const { x, y } = pos;

    incrementFlatCountBy(x - 1, y - 1, 1);
    incrementFlatCountBy(x - 1, y, 1);
    incrementFlatCountBy(x, y - 1, 1);
    incrementFlatCountBy(x + 1, y + 1, 1);
    incrementFlatCountBy(x + 1, y, 1);
    incrementFlatCountBy(x, y + 1, 1);
    incrementFlatCountBy(x - 1, y + 1, 1);
    incrementFlatCountBy(x + 1, y - 1, 1);
}

function incrementFlatCountBy(x: number, y: number, delta: number) {
    if (x < 0 || x >= fieldSize || y < 0 || y >= fieldSize) return;

    let flagsCount = getFlagCount(x, y);

    flagsCount += delta;

    field[y * fieldSize + x] &= 0b1111_1110_0011_1111;
    field[y * fieldSize + x] |= flagsCount << 6;
}

export function getFlagCount(x: number, y: number) {
    return (field[y * fieldSize + x] & 0b0000_0001_1100_0000) >> 6;
}

export function initField() {
    for (let i = 0; i < numberOfMines; i++) {
        const r = Math.floor(Math.random() * fieldSize * fieldSize);
        let pos = { x: r % fieldSize, y: Math.floor(r / fieldSize) };
        setMine(pos);
    }

    for (let i = 0; i < fieldSize * fieldSize; i++) {
        let pos = { x: i % fieldSize, y: Math.floor(i / fieldSize) };
        const numberOfMines =
            hasMine({ x: pos.x - 1, y: pos.y - 1 }) +
            hasMine({ x: pos.x - 1, y: pos.y }) +
            hasMine({ x: pos.x, y: pos.y - 1 }) +
            hasMine({ x: pos.x + 1, y: pos.y + 1 }) +
            hasMine({ x: pos.x + 1, y: pos.y }) +
            hasMine({ x: pos.x, y: pos.y + 1 }) +
            hasMine({ x: pos.x - 1, y: pos.y + 1 }) +
            hasMine({ x: pos.x + 1, y: pos.y - 1 });
        setNumberOfMines(pos.x, pos.y, numberOfMines);
    }
}

export function openCell(pos: V2) {
    if (hasMine(pos)) console.log("BOOOM!!!!");
    else if (!hasFlag(pos)) {
        const visited: V2[] = [];
        const cells = [pos];

        function pushIfNotVisited(x: number, y: number) {
            if (visited.findIndex((c) => c.x == x && c.y == y) == -1) {
                cells.push({ x, y });
                visited.push({ x, y });
            }
        }
        pushIfNotVisited(pos.x, pos.y);

        while (cells.length > 0) {
            const cell = cells.pop()!;
            setIsOpen(cell);

            const numberOfMines = getNumberOfMines(cell);

            if (numberOfMines == 0) {
                if (cell.x > 0 && cell.y > 0)
                    pushIfNotVisited(cell.x - 1, cell.y - 1);

                if (cell.x < fieldSize - 1 && cell.y > 0)
                    pushIfNotVisited(cell.x + 1, cell.y - 1);

                if (cell.x < fieldSize - 1 && cell.y < fieldSize - 1)
                    pushIfNotVisited(cell.x + 1, cell.y + 1);

                if (cell.x > 0 && cell.y < fieldSize - 1)
                    pushIfNotVisited(cell.x - 1, cell.y + 1);

                if (cell.x > 0) pushIfNotVisited(cell.x - 1, cell.y);
                if (cell.x < fieldSize - 1)
                    pushIfNotVisited(cell.x + 1, cell.y);

                if (cell.y > 0) pushIfNotVisited(cell.x, cell.y - 1);

                if (cell.y < fieldSize - 1)
                    pushIfNotVisited(cell.x, cell.y + 1);
            }
        }
    }
}

export function getNumberOfMines(pos: V2) {
    return (field[pos.y * fieldSize + pos.x] & 0b00111000) >> 3;
}

function setNumberOfMines(x: number, y: number, numberOfMines: number) {
    field[y * fieldSize + x] |= numberOfMines << 3;
}
