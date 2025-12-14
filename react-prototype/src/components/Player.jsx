import React from 'react';
import { Group, Circle, Text } from 'react-konva';
import { COLORS } from '../utils/constants';

const Player = ({ player, onDragEnd }) => {
  const { id, number, x, y, role } = player;
  const isHome = id.includes('home');
  const isGK = role === 'gk';
  const [isDragging, setIsDragging] = React.useState(false);

  let fillColor = isHome ? COLORS.home : COLORS.away;
  let textColor = COLORS.text;

  if (isGK) {
    fillColor = isHome ? COLORS.gkHome : COLORS.gkAway;
    textColor = isHome ? '#000000' : '#ffffff';
  }

  return (
    <Group
      x={x}
      y={y}
      draggable
      scaleX={isDragging ? 1.1 : 1}
      scaleY={isDragging ? 1.1 : 1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e) => {
        setIsDragging(false);
        onDragEnd(id, e.target.x(), e.target.y(), e);
      }}
    >
      <Circle
        radius={16}
        fill={fillColor}
        stroke="white"
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={isDragging ? 10 : 4}
        shadowOpacity={isDragging ? 0.6 : 0.3}
        shadowOffset={{ x: isDragging ? 5 : 0, y: isDragging ? 5 : 2 }}
      />
      <Text
        text={number}
        fontSize={14}
        fontStyle="bold"
        fill={textColor}
        width={32}
        height={32}
        align="center"
        verticalAlign="middle"
        offsetX={16}
        offsetY={16}
      />
    </Group>
  );
};

export default Player;
