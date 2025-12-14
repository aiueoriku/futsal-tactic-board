import React from 'react';
import { Stage, Layer, Rect, Line, Circle, Arc, Group } from 'react-konva';
import { COURT_CONFIG } from '../utils/constants';
import Player from './Player';
import Ball from './Ball';
import AnnotationObject from './AnnotationObject';

const Court = React.forwardRef(({ mode, players, ball, onPlayerDrag, onBallDrag, annotation, onAnnotationChange, onAnnotationDelete }, ref) => {
  const { width, height, lineColor, lineWidth, bgColor, penaltyRadius, padding } = COURT_CONFIG;

  const isFull = mode === 'full';
  const stageWidth = (isFull ? width : 400) + padding * 2;
  const stageHeight = (isFull ? height : 400) + padding * 2;

  const offX = padding;
  const offY = padding;

  const [fillPatternImage, setFillPatternImage] = React.useState(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = React.useState(null);

  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    const size = 40;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, 2, size);

    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    ctx.fillRect(0, 0, size, 1);
    ctx.fillRect(0, 20, size, 1);

    const img = new window.Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      setFillPatternImage(img);
    };
  }, [bgColor]);

  // Deselection logic
  const handleStageClick = (e) => {
    // Do nothing if Transformer is clicked
    if (clickedOnTransformer) {
      return;
    }

    // Do nothing if AnnotationObject is clicked
    // (Using .annotation-group name from AnnotationObject)
    const clickedOnAnnotation = e.target.name() === 'annotation-group' || e.target.findAncestor('.annotation-group');
    if (clickedOnAnnotation) {
      return;
    }

    // Deselect if clicking elsewhere (background, court lines, players, etc.)
    setSelectedAnnotationId(null);
  };

  return (
    <Stage
        ref={ref}
        width={stageWidth}
        height={stageHeight}
        style={{ display: 'inline-block' }}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
    >
      <Layer>
        {/* Court Background */}
        <Rect
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
            fill={!fillPatternImage ? bgColor : undefined}
            fillPatternImage={fillPatternImage}
        />

        {isFull ? (
          <Group x={offX} y={offY}>
            <Rect x={0} y={0} width={width} height={height} stroke={lineColor} strokeWidth={lineWidth} />
            <Line points={[width / 2, 0, width / 2, height]} stroke={lineColor} strokeWidth={lineWidth} />
            <Circle x={width / 2} y={height / 2} radius={60} stroke={lineColor} strokeWidth={lineWidth} />
            <Circle x={width / 2} y={height / 2} radius={4} fill={lineColor} />

            <Arc x={0} y={height / 2} innerRadius={0} outerRadius={penaltyRadius * 2} angle={180} rotation={-90} stroke={lineColor} strokeWidth={lineWidth} />
            <Arc x={width} y={height / 2} innerRadius={0} outerRadius={penaltyRadius * 2} angle={180} rotation={90} stroke={lineColor} strokeWidth={lineWidth} />

            <Rect x={-20} y={height / 2 - 60} width={20} height={120} stroke={lineColor} strokeWidth={lineWidth} />
            <Rect x={width} y={height / 2 - 60} width={20} height={120} stroke={lineColor} strokeWidth={lineWidth} />

            <Circle x={120} y={height / 2} radius={4} fill={lineColor} />
            <Circle x={width - 120} y={height / 2} radius={4} fill={lineColor} />
            <Circle x={200} y={height / 2} radius={4} fill={lineColor} />
            <Circle x={width - 200} y={height / 2} radius={4} fill={lineColor} />
          </Group>
        ) : (
          <Group x={offX} y={offY}>
             <Rect x={0} y={0} width={400} height={400} stroke={lineColor} strokeWidth={lineWidth} />
             <Line points={[0, 0, 400, 0]} stroke={lineColor} strokeWidth={lineWidth} />

             <Arc x={200} y={0} innerRadius={0} outerRadius={60} angle={180} rotation={0} stroke={lineColor} strokeWidth={lineWidth} />
             <Circle x={200} y={0} radius={4} fill={lineColor} />

             <Arc x={200} y={400} innerRadius={0} outerRadius={penaltyRadius * 2} angle={180} rotation={180} stroke={lineColor} strokeWidth={lineWidth} />

             <Rect x={200 - 60} y={400} width={120} height={20} stroke={lineColor} strokeWidth={lineWidth} />

             <Circle x={200} y={400 - 120} radius={4} fill={lineColor} />
             <Circle x={200} y={400 - 200} radius={4} fill={lineColor} />
          </Group>
        )}

        {/* Render Players */}
        {players.map(p => (
            <Player
                key={p.id}
                player={{
                    ...p,
                    x: (p.x / 100) * (isFull ? width : 400) + offX,
                    y: (p.y / 100) * (isFull ? height : 400) + offY,
                }}
                onDragEnd={(id, x, y, e) => {
                    if (x < 0 || x > stageWidth || y < 0 || y > stageHeight) {
                        const courtW = isFull ? width : 400;
                        const courtH = isFull ? height : 400;
                        const originalX = (p.x / 100) * courtW + offX;
                        const originalY = (p.y / 100) * courtH + offY;
                        e.target.position({ x: originalX, y: originalY });
                        e.target.getLayer().batchDraw();
                        return;
                    }

                    const courtW = isFull ? width : 400;
                    const courtH = isFull ? height : 400;
                    const px = ((x - offX) / courtW) * 100;
                    const py = ((y - offY) / courtH) * 100;
                    onPlayerDrag(id, px, py);
                }}
            />
        ))}

        {/* Render Ball */}
        <Ball
            x={(ball.x / 100) * (isFull ? width : 400) + offX}
            y={(ball.y / 100) * (isFull ? height : 400) + offY}
            onDragEnd={(x, y, e) => {
                if (x < 0 || x > stageWidth || y < 0 || y > stageHeight) {
                    const courtW = isFull ? width : 400;
                    const courtH = isFull ? height : 400;
                    const originalX = (ball.x / 100) * courtW + offX;
                    const originalY = (ball.y / 100) * courtH + offY;
                    e.target.position({ x: originalX, y: originalY });
                    e.target.getLayer().batchDraw();
                    return;
                }

                const courtW = isFull ? width : 400;
                const courtH = isFull ? height : 400;
                const px = ((x - offX) / courtW) * 100;
                const py = ((y - offY) / courtH) * 100;
                onBallDrag(px, py);
            }}
        />

        {/* Render Annotation */}
        {annotation && (
            <AnnotationObject
                annotation={annotation}
                isSelected={selectedAnnotationId === annotation.id}
                onSelect={() => setSelectedAnnotationId(annotation.id)}
                onChange={onAnnotationChange}
                onDelete={onAnnotationDelete}
                stageWidth={stageWidth}
                stageHeight={stageHeight}
            />
        )}

      </Layer>
    </Stage>
  );
});

export default Court;
