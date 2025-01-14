import { colors } from "./swatches";

const view: Rect = { x: 0, y: 0, width: 0, height: 0 };
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

let scale = 1;
const ctx = canvas.getContext("2d")!;

const mouse = { x: 0, y: 0, pressedThisFrame: false };

let isPlaying = false;

document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener("mouseup", (e) => {
    mouse.pressedThisFrame = true;
});

function onResize() {
    scale = window.devicePixelRatio || 1;
    ctx.imageSmoothingEnabled = false;

    view.width = window.innerWidth;
    view.height = window.innerHeight;

    canvas.style.width = view.width + "px";
    canvas.style.height = view.height + "px";

    canvas.width = view.width * scale;
    canvas.height = view.height * scale;

    ctx.scale(scale, scale);
}

onResize();

window.addEventListener("resize", (e) => {
    onResize();
});

type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
let lastTime = 0;
function render(time: number) {
    const deltaMs = time - lastTime;

    if (isPlaying) {
        for (let i = 0; i < activeItems.length; i++) {
            const item = activeItems[i];
            item.timeToActivation += deltaMs;
            if (item.timeToActivation >= item.activationTime) {
                item.timeToActivation =
                    item.timeToActivation - item.activationTime;
            }
        }
    }
    ctx.fillStyle = colors.grey["900"];
    fillRect(view);

    ctx.fillStyle = "rgb(20,20,20)";
    const gap = 20;
    const fieldRect: Rect = {
        x: gap,
        y: gap,
        width: (view.width - gap * 2) * 0.6,
        height: view.height - gap * 2,
    };
    fillRect(fieldRect);

    currentRect = fieldRect;
    ctx.fillStyle = "white";
    fillRectCenteredAtCenter(40, 40);

    const rect = rectCenteredAtBottomCenter(0, -30, 90, 40);

    if (isPointInRect(mouse, rect) && mouse.pressedThisFrame) {
        isPlaying = !isPlaying;

        if (!isPlaying) activeItems.forEach((a) => (a.timeToActivation = 0));
    }

    if (isPointInRect(mouse, rect)) ctx.fillStyle = "#BB2222";
    else ctx.fillStyle = "#992222";

    fillRect(rect);
    ctx.fillStyle = "white";
    ctx.font = "800 22px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (isPlaying) fillTextCenteredAtBottomCenter("Stop", 0, -25);
    else fillTextCenteredAtBottomCenter("Start", 0, -25);

    const uiRect: Rect = {
        x: fieldRect.x + fieldRect.width + gap,
        y: gap,
        width: view.width - fieldRect.x - fieldRect.width - gap * 2,
        height: view.height - gap * 2,
    };

    ctx.fillStyle = "rgb(20, 20, 20)";
    fillRect(uiRect);

    currentRect = uiRect;
    ctx.fillStyle = colors.grey["900"];
    const squareSize = 80;
    const gapSize = 10;
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            fillRectTopLeft(
                gapSize + x * (squareSize + gapSize),
                gapSize + y * (squareSize + gapSize),
                squareSize,
                squareSize
            );
        }
    }

    for (let i = 0; i < activeItems.length; i++) {
        const item = activeItems[i];
        ctx.fillStyle = item.color;
        const rect = rectFromTopLeft(
            10 + gapSize + item.x * (squareSize + gapSize),
            10 + gapSize + item.y * (squareSize + gapSize),
            squareSize - 20,
            squareSize - 20
        );
        fillRect(rect);
        if (isPlaying) {
            ctx.fillStyle = "white";
            ctx.font = "400 12px monospace";
            fillTextCentered(
                rect,
                ((item.activationTime - item.timeToActivation) / 1000).toFixed(
                    1
                )
            );
        }
    }

    const lowSquareSize = 40;
    const lowGapSize = 5;
    currentRect.y =
        currentRect.y +
        currentRect.height -
        3 * (lowSquareSize + lowGapSize) -
        lowGapSize;

    ctx.fillStyle = colors.grey["900"];
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 3; y++) {
            fillRectTopLeft(
                lowGapSize + x * (lowSquareSize + lowGapSize),
                lowGapSize + y * (lowSquareSize + lowGapSize),
                lowSquareSize,
                lowSquareSize
            );
        }
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        ctx.fillStyle = item.color;
        fillRectTopLeft(
            5 + lowGapSize + item.x * (lowSquareSize + lowGapSize),
            5 + lowGapSize + item.y * (lowSquareSize + lowGapSize),
            lowSquareSize - 10,
            lowSquareSize - 10
        );
    }

    mouse.pressedThisFrame = false;

    lastTime = time;
    requestAnimationFrame(render);
}

const items = [
    //
    { x: 2, y: 1, color: "red" },
    { x: 2, y: 2, color: "blue" },
    { x: 3, y: 2, color: "yellow" },
];

const activeItems = [
    //
    { x: 0, y: 1, color: "red", timeToActivation: 0, activationTime: 3000 },
    { x: 1, y: 1, color: "blue", timeToActivation: 0, activationTime: 1300 },
];

//canvas
let currentRect: Rect;

function fillRectCenteredAtCenter(width: number, height: number) {
    ctx.fillRect(
        currentRect.x + currentRect.width / 2 - width / 2,
        currentRect.y + currentRect.height / 2 - height / 2,
        width,
        height
    );
}

function fillRect(rect: Rect) {
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
}

function fillRectTopLeft(x: number, y: number, w: number, h: number) {
    ctx.fillRect(currentRect.x + x, currentRect.y + y, w, h);
}
function rectFromTopLeft(x: number, y: number, w: number, h: number) {
    return { x: currentRect.x + x, y: currentRect.y + y, width: w, height: h };
}

function rectCenteredAtBottomCenter(
    x: number,
    y: number,
    w: number,
    h: number
) {
    const rect: Rect = {
        x: currentRect.x + currentRect.width / 2 - w / 2 + x,
        y: currentRect.y + currentRect.height - h / 2 + y,
        width: w,
        height: h,
    };
    return rect;
}

type V2 = { x: number; y: number };
function isPointInRect(point: V2, rect: Rect) {
    return (
        rect.x <= point.x &&
        rect.x + rect.width > point.x &&
        rect.y <= point.y &&
        rect.y + rect.height > point.y
    );
}

function fillTextCenteredAtBottomCenter(str: string, x: number, y: number) {
    ctx.fillText(
        str,
        currentRect.x + currentRect.width / 2 + x,
        currentRect.y + currentRect.height + y
    );
}

function fillTextCentered(r: Rect, str: string) {
    ctx.fillText(str, r.x + r.width / 2, r.y + r.height / 2);
}

requestAnimationFrame(render);
