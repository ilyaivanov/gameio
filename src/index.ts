import {
    fieldSize,
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
const squreSize = 40;
const extraPadding = 20;
const iconPadding = squreSize * 0.2;
const canvasWidth = squreSize * fieldSize;
const canvasHeight = squreSize * fieldSize;

initField();

let offsets = { x: 0, y: 0 };

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

    if (view.x > canvasWidth) offsets.x = (canvasWidth - view.x) / 2;
    if (view.y > canvasHeight) offsets.y = (canvasHeight - view.y) / 2;
}

onResize();

window.addEventListener("resize", (e) => {
    onResize();
    render();
});

function updateMouseOver() {
    mouseOverSquare.x = Math.floor((offsets.x + mouse.x) / squreSize);
    mouseOverSquare.y = Math.floor((offsets.y + mouse.y) / squreSize);
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

const showAllNumbers = false;
const showMines = false;

document.addEventListener(
    "wheel",
    (e) => {
        if (view.x < canvasWidth)
            offsets.x = clamp(
                offsets.x + e.deltaX,
                -extraPadding,
                canvasWidth - view.x + extraPadding
            );
        if (view.y < canvasHeight)
            offsets.y = clamp(
                offsets.y + e.deltaY,
                -extraPadding,
                canvasHeight - view.y + extraPadding
            );

        updateMouseOver();
        render();
        e.preventDefault();
    },
    { passive: false }
);

function render() {
    ctx.save();

    ctx.clearRect(0, 0, view.x, view.y);

    ctx.translate(-offsets.x, -offsets.y);
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

            ctx.fillRect(x * squreSize, y * squreSize, squreSize, squreSize);

            if ((isCellOpen || showAllNumbers) && !cellHasMine) {
                ctx.fillStyle = "red";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.font = `600 ${squreSize * 0.5}px ${colors.font}`;
                const numberOfMines = getNumberOfMines({ x, y });
                if (numberOfMines > 0)
                    ctx.fillText(
                        numberOfMines + "",
                        x * squreSize + squreSize / 2,
                        y * squreSize + squreSize / 2
                    );
            }

            if (hasFlag({ x, y })) {
                ctx.save();
                ctx.translate(
                    iconPadding + x * squreSize,
                    iconPadding + y * squreSize
                );
                ctx.scale(
                    (squreSize - iconPadding * 2) / width,
                    (squreSize - iconPadding * 2) / height
                );
                ctx.fillStyle = "#EC1C24";
                ctx.fill(path);
                ctx.restore();
            }
        }

    ctx.restore();
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

render();
