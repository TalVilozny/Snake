import "./Snake.css";
import SnakeBackground from "./Icons/SnakeBackground.jpg";
import { useState, useEffect, useRef } from "react";
import ArrowKey from "./Icons/ArrowKey.svg";

const COLS = 20;
const ROWS = 20;
const CELL_SIZE = 25;
const TICK_MS = 120;

export default function Snake() {
  const canvasRef = useRef(null);

  const [snakeBody, setSnakeBody] = useState([
    { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) },
  ]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [nextDirection, setNextDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [hasWon, setHasWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pressedKey, setPressedKey] = useState(null);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [endTime, setEndTime] = useState(null);

  const spawnFood = (body) => {
    while (true) {
      const x = Math.floor(Math.random() * COLS);
      const y = Math.floor(Math.random() * ROWS);
      const onSnake = body.some((seg) => seg.x === x && seg.y === y);
      if (!onSnake) {
        return { x, y };
      }
    }
  };

  const getSnakeColor = (index, totalLength) => {
    const headColor = { r: 0x17, g: 0xc2, b: 0x57 };

    const secondColor = { r: 0x14, g: 0xa8, b: 0x4b };

    const tailColor = { r: 0x0a, g: 0x5a, b: 0x2a };

    if (index === 0) {
      return "#17c257";
    }

    if (totalLength === 2) {
      return "#14a84b";
    }

    const segmentFactor = totalLength > 2 ? (index - 1) / (totalLength - 2) : 0;

    const factor = Math.sqrt(segmentFactor);

    const r = Math.round(
      secondColor.r + (tailColor.r - secondColor.r) * factor,
    );
    const g = Math.round(
      secondColor.g + (tailColor.g - secondColor.g) * factor,
    );
    const b = Math.round(
      secondColor.b + (tailColor.b - secondColor.b) * factor,
    );

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev);
      } else if (e.key === "ArrowUp" && !isPaused) {
        setPressedKey("ArrowUp");
        if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
      } else if (e.key === "ArrowDown" && !isPaused) {
        setPressedKey("ArrowDown");
        if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
      } else if (e.key === "ArrowLeft" && !isPaused) {
        setPressedKey("ArrowLeft");
        if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
      } else if (e.key === "ArrowRight" && !isPaused) {
        setPressedKey("ArrowRight");
        if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
      } else if (e.key === " " && gameOver) {
        restartGame();
      }
    };

    const handleKeyUp = (e) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        setPressedKey(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [direction, gameOver, isPaused]);

  useEffect(() => {
    if (!isRunning || gameOver || isPaused) return;

    const interval = setInterval(() => {
      setDirection(nextDirection);
      setSnakeBody((prevBody) => {
        const head = prevBody[0];
        let newHead = {
          x: head.x + nextDirection.x,
          y: head.y + nextDirection.y,
        };

        if (newHead.x < 0) newHead.x = COLS - 1;
        if (newHead.x >= COLS) newHead.x = 0;
        if (newHead.y < 0) newHead.y = ROWS - 1;
        if (newHead.y >= ROWS) newHead.y = 0;

        const hitsSelf = prevBody.some(
          (seg) => seg.x === newHead.x && seg.y === newHead.y,
        );
        if (hitsSelf) {
          setGameOver(true);
          setIsRunning(false);
          setHasWon(false);
          setEndTime(Date.now());
          return prevBody;
        }

        let newBody;
        if (newHead.x === food.x && newHead.y === food.y) {
          newBody = [newHead, ...prevBody];
          const newFood = spawnFood(newBody);
          setFood(newFood);
          setScore((s) => s + 1);
        } else {
          newBody = [newHead, ...prevBody.slice(0, -1)];
        }

        if (newBody.length === COLS * ROWS) {
          setGameOver(true);
          setIsRunning(false);
          setHasWon(true);
          setEndTime(Date.now());
        }

        return newBody;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [nextDirection, isRunning, gameOver, isPaused, food]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f73e25";
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    snakeBody.forEach((seg, index) => {
      ctx.fillStyle = getSnakeColor(index, snakeBody.length);
      ctx.fillRect(seg.x * CELL_SIZE, seg.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
  }, [snakeBody, food]);

  const restartGame = () => {
    const initialBody = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    setSnakeBody(initialBody);
    setDirection({ x: 1, y: 0 });
    setNextDirection({ x: 1, y: 0 });
    setFood(spawnFood(initialBody));
    setScore(0);
    setGameOver(false);
    setIsRunning(true);
    setHasWon(false);
    setIsPaused(false);
    setStartTime(Date.now());
    setEndTime(null);
  };

  const elapsedSeconds =
    startTime && endTime ? ((endTime - startTime) / 1000).toFixed(1) : null;

  return (
    <>
      <div className="SnakeBackground">
        <img src={SnakeBackground} alt="Snake background" />
      </div>
      <div className="Snake">
        <div className="SnakeHeader">
          <h1 className="SnakeTitle">Snake</h1>
          <div className="SnakeInfo">
            <span className="SnakeScore">Score: {score}</span>
            <span className="SnakeHint">Use arrow keys to move</span>
          </div>
        </div>
        <div className="SnakeBoardWrapper">
          <canvas
            ref={canvasRef}
            id="snakeCanvas"
            width={COLS * CELL_SIZE}
            height={ROWS * CELL_SIZE}
            className="Canvas"
          />
          {isPaused && (
            <div className="SnakeOverlay">
              <div className="SnakeOverlayContent">
                <h2>GAME PAUSED</h2>
                <p>Press Escape to resume</p>
              </div>
            </div>
          )}
          {gameOver && !isPaused && (
            <div className="SnakeOverlay">
              <div className="SnakeOverlayContent">
                <h2>{hasWon ? "You Win!" : "Game Over"}</h2>
                <p>Apples eaten: {score}</p>
                {hasWon && elapsedSeconds && (
                  <p>Time: {elapsedSeconds} seconds</p>
                )}
                <p>Press Space to restart</p>
                <button onClick={restartGame}>Restart</button>
              </div>
            </div>
          )}
        </div>
        <div className="KeyboardKeys">
          <div className="KeyRow">
            <div
              className={`KeyButton ${pressedKey === "ArrowUp" ? "pressed" : ""}`}
            >
              <img src={ArrowKey} alt="Up Arrow Key" />
            </div>
          </div>
          <div className="KeyRow">
            <div
              className={`KeyButton ${pressedKey === "ArrowLeft" ? "pressed" : ""}`}
            >
              <img className="LeftArrow" src={ArrowKey} alt="Left Arrow Key" />
            </div>
            <div
              className={`KeyButton ${pressedKey === "ArrowDown" ? "pressed" : ""}`}
            >
              <img className="DownArrow" src={ArrowKey} alt="Down Arrow Key" />
            </div>
            <div
              className={`KeyButton ${pressedKey === "ArrowRight" ? "pressed" : ""}`}
            >
              <img
                className="RightArrow"
                src={ArrowKey}
                alt="Right Arrow Key"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
