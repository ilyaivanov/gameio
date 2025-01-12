import {
    fieldSize,
    getFlagCount,
    getNumberOfMines,
    hasFlag,
    hasMine,
    initField,
    isOpen,
    openCell,
    toggleFlag,
    V2,
} from "./board";

const colors = {
    font: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif`,
    bg: "rgb(0,0,0)",
    text: "#aaeeaa",
    line: "rgb(10, 30, 10)",
    cursorInsert: "#eeaaaa",
    lineInsert: "rgb(30, 10, 10)",
};

const view = { x: 0, y: 0 };
const canvas = document.createElement("canvas");
const mouse = { x: 0, y: 0 };
const mouseOverSquare = { x: 0, y: 0 };
document.body.appendChild(canvas);

let scale = 1;
const ctx = canvas.getContext("2d")!;
const squareSize = 40;
const iconPadding = squareSize * 0.2;
const canvasWidth = squareSize * fieldSize;
const canvasHeight = squareSize * fieldSize;

initField();

let offsets = { x: 0, y: 0 };
const layout = {
    field: { x: 0, y: 0, width: 0, height: 0 } as Rect,
    minimap: { x: 0, y: 0, width: 0, height: 0 } as Rect,
};

function onResize() {
    scale = window.devicePixelRatio || 1;
    ctx.imageSmoothingEnabled = false;

    view.x = window.innerWidth;
    view.y = window.innerHeight;

    canvas.style.width = view.x + "px";
    canvas.style.height = view.y + "px";

    canvas.width = view.x * scale;
    canvas.height = view.y * scale;

    ctx.scale(scale, scale);

    const gutter = 15;
    const rightPanelWidth = 300;

    layout.field.x = gutter;
    layout.field.y = gutter;
    layout.field.width = view.x - gutter * 2 - rightPanelWidth;
    layout.field.height = view.y - gutter * 2;

    layout.minimap.width = rightPanelWidth - gutter;
    layout.minimap.x = view.x - layout.minimap.width - gutter;
    layout.minimap.y = gutter;
    layout.minimap.height = layout.minimap.width;

    if (layout.field.width > canvasWidth)
        offsets.x = (canvasWidth - layout.field.width) / 2;
    if (layout.field.width > canvasHeight)
        offsets.y = (canvasHeight - layout.field.width) / 2;
}

onResize();

window.addEventListener("resize", (e) => {
    onResize();
    clampOffset();
    render();
});

function updateMouseOver() {
    mouseOverSquare.x = Math.floor(
        (offsets.x + mouse.x - layout.field.x) / squareSize
    );
    mouseOverSquare.y = Math.floor(
        (offsets.y + mouse.y - layout.field.y) / squareSize
    );
}
document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    updateMouseOver();
    render();
});

document.addEventListener("click", (e) => {
    openCell(mouseOverSquare);
    render();
});

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (!isOpen(mouseOverSquare)) {
        toggleFlag(mouseOverSquare);
        render();
    }
});

const showMines = false;

document.addEventListener(
    "wheel",
    (e) => {
        offsets.x += e.deltaX;
        offsets.y += e.deltaY;
        clampOffset();

        updateMouseOver();
        render();
        e.preventDefault();
    },
    { passive: false }
);

function clampOffset() {
    if (layout.field.width < canvasWidth)
        offsets.x = clamp(offsets.x, 0, canvasWidth - layout.field.width);
    else offsets.x = 0;

    if (layout.field.height < canvasHeight)
        offsets.y = clamp(offsets.y, 0, canvasHeight - layout.field.height);
    else offsets.y = 0;
}

type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
function render() {
    ctx.fillStyle = "#31293E";
    ctx.fillRect(0, 0, view.x, view.y);

    ctx.save();

    clipRect(layout.field);

    ctx.translate(-offsets.x + layout.field.x, -offsets.y + layout.field.x);
    for (let x = 0; x < fieldSize; x++)
        for (let y = 0; y < fieldSize; y++) {
            const isCellOpen = isOpen({ x, y });
            const isMouseOver =
                mouseOverSquare.x == x && mouseOverSquare.y == y;

            const cellHasMine = hasMine({ x, y });

            const isCellDarker =
                (x % 2 == 0 && y % 2 != 0) || (x % 2 != 0 && y % 2 == 0);

            if (cellHasMine && showMines) ctx.fillStyle = "#220000";
            else if (isMouseOver && !isCellOpen) {
                ctx.fillStyle = "#1E2242";
            } else if (isCellDarker) {
                if (isCellOpen) ctx.fillStyle = "#393B50";
                else ctx.fillStyle = "#191B2D";
            } else {
                if (isCellOpen) ctx.fillStyle = "#35374B";
                else ctx.fillStyle = "#171928";
            }

            ctx.fillRect(
                x * squareSize,
                y * squareSize,
                squareSize,
                squareSize
            );

            if (isCellOpen && !cellHasMine) {
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.font = `600 ${squareSize * 0.5}px ${colors.font}`;
                const numberOfMines = getNumberOfMines({ x, y });
                const flagCount = getFlagCount(x, y);

                if (numberOfMines == flagCount)
                    ctx.fillStyle = "rgb(120,120, 120)";
                else if (numberOfMines < flagCount) ctx.fillStyle = "#EC1C24";
                else ctx.fillStyle = "rgb(40, 200, 40)";
                if (numberOfMines > 0)
                    ctx.fillText(
                        numberOfMines + "",
                        x * squareSize + squareSize / 2,
                        y * squareSize + squareSize / 2
                    );
            }

            if (hasFlag({ x, y })) {
                ctx.save();
                ctx.translate(
                    iconPadding + x * squareSize,
                    iconPadding + y * squareSize
                );
                ctx.scale(
                    (squareSize - iconPadding * 2) / width,
                    (squareSize - iconPadding * 2) / height
                );
                ctx.fillStyle = "rgb(40, 200, 40)";
                ctx.fill(path);
                ctx.restore();
            }
        }

    ctx.restore();

    ctx.fillStyle = "black";
    const minimapSize = layout.minimap.width;
    ctx.fillRect(layout.minimap.x, layout.minimap.y, minimapSize, minimapSize);
    const minimapScaleX = minimapSize / canvasWidth;
    const minimapScaleY = minimapSize / canvasHeight;
    const minimapSquareSize = minimapScaleX * squareSize;

    for (let x = 0; x < fieldSize; x++)
        for (let y = 0; y < fieldSize; y++) {
            if (isOpen({ x, y })) {
                const flagCount = getFlagCount(x, y);
                const numberOfMines = getNumberOfMines({ x, y });
                if (numberOfMines < flagCount)
                    ctx.fillStyle = "rgb(255, 20, 20)";
                else ctx.fillStyle = "rgb(40, 40, 40)";
                ctx.fillRect(
                    Math.ceil(layout.minimap.x + x * minimapSquareSize),
                    Math.ceil(layout.minimap.y + y * minimapSquareSize),
                    Math.ceil(minimapSquareSize),
                    Math.ceil(minimapSquareSize)
                );
            } else if (hasFlag({ x, y })) {
                ctx.fillStyle = "rgb(40, 200, 40)";
                ctx.fillRect(
                    Math.ceil(layout.minimap.x + x * minimapSquareSize),
                    Math.ceil(layout.minimap.y + y * minimapSquareSize),
                    Math.ceil(minimapSquareSize),
                    Math.ceil(minimapSquareSize)
                );
            }
        }

    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "rgb(100, 0, 0)";
    ctx.fillRect(
        layout.minimap.x + offsets.x * minimapScaleX,
        layout.minimap.y + offsets.y * minimapScaleY,
        layout.field.width * minimapScaleX + 1,
        layout.field.height * minimapScaleY + 1
    );
    ctx.globalAlpha = 1;
}

const width = 169;
const height = 201.5;
const path = new Path2D(
    "M1.71661e-05 0L-1.71661e-05 201.5H18V104.577C45.0897 102.047 64.4403 89.001 89 89.001C116.195 89.001 137 105.001 169 105.001V25C137 25 121 9 89 9C60.1464 9 44.2967 22.005 18 24.563V0H1.71661e-05Z"
);
function clamp(v: number, min: number, max: number) {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

function clipRect(rect: Rect) {
    ctx.beginPath();

    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
}
render();
