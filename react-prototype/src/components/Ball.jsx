import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

import ballImg from '../assets/ball.svg';

const Ball = ({ x, y, onDragEnd }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [image] = useImage(ballImg);
  const size = 24;

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={size}
      height={size}
      offsetX={size / 2}
      offsetY={size / 2}
      draggable
      scaleX={isDragging ? 1.1 : 1}
      scaleY={isDragging ? 1.1 : 1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e) => {
        setIsDragging(false);
        onDragEnd(e.target.x(), e.target.y(), e);
      }}
      shadowColor="black"
      shadowBlur={isDragging ? 10 : 4}
      shadowOpacity={isDragging ? 0.6 : 0.3}
      shadowOffset={{ x: isDragging ? 5 : 0, y: isDragging ? 5 : 2 }}
    />
  );
};

export default Ball;
