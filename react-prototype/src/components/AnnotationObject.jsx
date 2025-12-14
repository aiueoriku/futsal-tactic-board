import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text, Transformer, Circle } from 'react-konva';

const AnnotationObject = ({ annotation, isSelected, onSelect, onChange, onDelete, stageWidth, stageHeight }) => {
  const shapeRef = useRef();
  const textRef = useRef();
  const trRef = useRef();
  const deleteGroupRef = useRef();

  const [isTransforming, setIsTransforming] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const width = annotation.width || 100;
  const height = annotation.height || 60;
  const fontSize = annotation.fontSize || 24;
  const buttonOffset = 15;

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Inline editing implementation
  const handleTextEdit = () => {
    const textNode = textRef.current;
    const stage = textNode.getStage();

    // Get absolute position and scale of current text node
    const textPosition = textNode.getAbsolutePosition();
    const absScale = textNode.getAbsoluteScale();

    // Get stage (canvas) position on screen
    const stageBox = stage.container().getBoundingClientRect();

    // Calculate textarea display coordinates
    const areaPosition = {
      x: stageBox.left + textPosition.x + window.scrollX,
      y: stageBox.top + textPosition.y + window.scrollY,
    };

    // Calculate current font size and height
    const currentFontSize = textNode.fontSize() * absScale.y;
    const currentHeight = textNode.height() * absScale.y;
    const currentLineHeight = textNode.lineHeight();

    // Calculate number of lines (split by newline)
    const lines = annotation.text.split('\n').length;
    // Approximate text block height (lines * font size * line height)
    const textBlockHeight = currentFontSize * currentLineHeight * lines;

    // Fix: Calculate top/bottom padding to center align
    // (Box height - Text height) / 2
    const paddingTop = Math.max(0, (currentHeight - textBlockHeight) / 2);

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = annotation.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width() * absScale.x}px`;
    textarea.style.height = `${currentHeight}px`;
    textarea.style.fontSize = `${currentFontSize}px`;
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = currentLineHeight;
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();

    // Fix: Apply calculated paddingTop and set box-sizing
    textarea.style.paddingTop = `${paddingTop}px`;
    textarea.style.boxSizing = 'border-box'; // Include padding in size calculation

    textarea.focus();

    setIsEditing(true);

    const removeTextarea = () => {
        onChange({ ...annotation, text: textarea.value });
        setIsEditing(false);
        if (textarea.parentNode) {
            textarea.parentNode.removeChild(textarea);
        }
    };

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            removeTextarea();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            if (textarea.parentNode) {
                textarea.parentNode.removeChild(textarea);
            }
        }
    });

    textarea.addEventListener('blur', () => {
        removeTextarea();
    });
  };

  return (
    <>
      <Group
        name="annotation-group"
        x={annotation.x}
        y={annotation.y}
        draggable
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onDragStart={() => setIsTransforming(true)}
        onDragEnd={(e) => {
          const x = e.target.x();
          const y = e.target.y();

          // Check if outside stage
          if (x < 0 || x > stageWidth || y < 0 || y > stageHeight) {
              // Snap back to previous position
              e.target.position({ x: annotation.x, y: annotation.y });
              e.target.getLayer().batchDraw();
              return;
          }

          setIsTransforming(false);
          onChange({
            ...annotation,
            x: x,
            y: y,
          });
        }}
      >
        <Rect
          ref={shapeRef}
          width={width}
          height={height}
          fill="white"
          stroke={isSelected ? "black" : null}
          strokeWidth={isSelected ? 2 : 0}
          cornerRadius={10}
          shadowColor="black"
          shadowBlur={5}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.2}
          onTransformStart={() => setIsTransforming(true)}
          onTransform={() => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            node.scaleX(1);
            node.scaleY(1);

            const newWidth = Math.max(50, node.width() * scaleX);
            const newHeight = Math.max(30, node.height() * scaleY);

            node.width(newWidth);
            node.height(newHeight);

            if (textRef.current) {
                textRef.current.width(newWidth);
                textRef.current.height(newHeight);
                textRef.current.x(node.x());
                textRef.current.y(node.y());

                const currentFontSize = textRef.current.fontSize();
                textRef.current.fontSize(currentFontSize * scaleY);
            }

            if (deleteGroupRef.current) {
                deleteGroupRef.current.x(node.x() + newWidth + buttonOffset);
                deleteGroupRef.current.y(node.y() - buttonOffset);
            }
          }}
          onTransformEnd={() => {
            const node = shapeRef.current;

            const currentX = node.x();
            const currentY = node.y();
            const currentWidth = node.width();
            const currentHeight = node.height();
            const currentFontSize = textRef.current ? textRef.current.fontSize() : fontSize;

            node.x(0);
            node.y(0);
            node.scaleX(1);
            node.scaleY(1);

            if(textRef.current) {
                textRef.current.x(0);
                textRef.current.y(0);
            }

            setIsTransforming(false);

            onChange({
              ...annotation,
              x: annotation.x + currentX,
              y: annotation.y + currentY,
              width: currentWidth,
              height: currentHeight,
              fontSize: currentFontSize,
            });
          }}
          onDblClick={(e) => {
             e.cancelBubble = true;
             handleTextEdit();
          }}
          onDblTap={(e) => {
             e.cancelBubble = true;
             handleTextEdit();
          }}
        />

        <Text
          ref={textRef}
          visible={!isEditing}
          text={annotation.text}
          width={width}
          height={height}
          fontSize={fontSize}
          fontFamily="Arial"
          fill="#333"
          align="center"
          verticalAlign="middle"
          listening={true}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
          onDblClick={(e) => {
            e.cancelBubble = true;
            handleTextEdit();
          }}
          onDblTap={(e) => {
            e.cancelBubble = true;
            handleTextEdit();
          }}
        />

        {isSelected && !isTransforming && !isEditing && (
            <Group
                ref={deleteGroupRef}
                x={width + buttonOffset}
                y={-buttonOffset}
                onClick={(e) => {
                    e.cancelBubble = true;
                    onDelete();
                }}
                onTap={(e) => {
                    e.cancelBubble = true;
                    onDelete();
                }}
            >
                <Circle
                    radius={12}
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth={2}
                    shadowColor="black"
                    shadowBlur={2}
                    shadowOpacity={0.2}
                />
                <Text
                    text="✕"
                    fontSize={12}
                    fill="white"
                    x={-4}
                    y={-5}
                    fontStyle="bold"
                    listening={false}
                />
            </Group>
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default AnnotationObject;
