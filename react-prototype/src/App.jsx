import React, { useState, useEffect, useRef } from 'react';
import Court from './components/Court';
import { INITIAL_POSITIONS } from './utils/constants';
import './App.css';
import { Play, Square, CirclePlus, CircleMinus, Video, Share2, MessageSquarePlus, Save, FolderOpen } from 'lucide-react';
import lzString from 'lz-string';
import SavedList from './components/SavedList';

function App() {
  const [mode, setMode] = useState('full'); // 'full' or 'half'
  const [players, setPlayers] = useState([]);
  const [ball, setBall] = useState({ x: 50, y: 50 });
  const [annotation, setAnnotation] = useState(null); // { id, text, x, y, width, height, tailX, tailY } | null

  // UI State
  const [showSavedList, setShowSavedList] = useState(false);

  // Animation State
  const [frames, setFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const animationRef = useRef();
  const stageRef = useRef();

  // Initialize positions on mount or restore from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');

    if (data) {
        try {
            const decompressed = lzString.decompressFromEncodedURIComponent(data);
            if (decompressed) {
                const state = JSON.parse(decompressed);
                setMode(state.mode || 'full');
                setFrames(state.frames || []);
                if (state.frames && state.frames.length > 0) {
                    setPlayers(state.frames[0].players);
                    setBall(state.frames[0].ball);
                    setAnnotation(state.frames[0].annotation || null);
                    setCurrentFrameIndex(0);
                } else {
                    resetPositions(state.mode || 'full');
                }
            }
        } catch (e) {
            console.error("Failed to restore state from URL", e);
            resetPositions('full');
        }
    } else {
        resetPositions('full');
        setFrames([]);
    }
  }, []);

  // Sync current frame when frames change or index changes (if not playing)
  useEffect(() => {
    if (frames.length > 0 && !isPlaying) {
        const frame = frames[currentFrameIndex];
        setPlayers(frame.players);
        setBall(frame.ball);
        setAnnotation(frame.annotation || null);
    }
  }, [currentFrameIndex, frames, isPlaying]);

  const resetPositions = (currentMode) => {
    const initial = INITIAL_POSITIONS[currentMode];
    setPlayers([...initial.home, ...initial.away]);
    setBall(initial.ball);
    setAnnotation(null);
    // Reset frames
    setFrames([]);
    setCurrentFrameIndex(0);
  };

  const handleModeChange = (newMode) => {
    if (frames.length > 0) {
        if (!window.confirm("Changing mode will clear all frames. Continue?")) {
            return;
        }
    }
    setMode(newMode);
    resetPositions(newMode);
  };

  const handlePlayerDrag = (id, x, y) => {
    const newPlayers = players.map(p => p.id === id ? { ...p, x, y } : p);
    setPlayers(newPlayers);
  };

  const handleBallDrag = (x, y) => {
    const newBall = { x, y };
    setBall(newBall);
  };

  const handleAnnotationChange = (newAnnotation) => {
      setAnnotation(newAnnotation);
  };

  const handleAnnotationDelete = () => {
      setAnnotation(null);
  };

  const addAnnotation = () => {
      if (annotation) return;
      // Default position center
      setAnnotation({
          id: Date.now().toString(),
          text: "MEMO",
          x: 400, // px (approx center of 800 width)
          y: 200, // px (approx center of 400 height)
          width: 100,
          height: 60,
          fontSize: 24
      });
  };

  // Frame Management
  const addFrame = () => {
    // Capture current state
    const newFrame = {
        players: JSON.parse(JSON.stringify(players)),
        ball: { ...ball },
        annotation: annotation ? { ...annotation } : null
    };
    const newFrames = [...frames];

    if (frames.length === 0) {
        newFrames.push(newFrame);
        setCurrentFrameIndex(0);
    } else {
        newFrames.splice(currentFrameIndex + 1, 0, newFrame);
        setCurrentFrameIndex(currentFrameIndex + 1);
    }
    setFrames(newFrames);
  };

  const deleteFrame = () => {
    if (frames.length === 0) return;
    const newFrames = frames.filter((_, i) => i !== currentFrameIndex);
    setFrames(newFrames);
    setCurrentFrameIndex(prev => Math.min(prev, newFrames.length - 1));
    if (newFrames.length === 0) {
        resetPositions(mode);
    }
  };

  const updateCurrentFrame = () => {
      if (frames.length === 0) return;
      const newFrames = [...frames];
      newFrames[currentFrameIndex] = {
          players: JSON.parse(JSON.stringify(players)),
          ball: { ...ball },
          annotation: annotation ? { ...annotation } : null
      };
      setFrames(newFrames);
  };


  useEffect(() => {
      if (frames.length > 0 && !isPlaying) {
         const newFrames = [...frames];


         if (JSON.stringify(newFrames[currentFrameIndex].annotation) !== JSON.stringify(annotation)) {
             newFrames[currentFrameIndex].annotation = annotation;
             setFrames(newFrames);
         }
      }
  }, [annotation]);

  const shareUrl = () => {
      const state = {
          mode,
          frames
      };
      const json = JSON.stringify(state);
      const compressed = lzString.compressToEncodedURIComponent(json);
      const url = `${window.location.origin}${window.location.pathname}?data=${compressed}`;

      navigator.clipboard.writeText(url).then(() => {
          alert("Link Copied!");
      });
  };

  const handleSaveTactic = () => {
      const name = prompt("Enter a name for this tactic:", "tactic.mp4");
      if (!name) return;

      const state = {
          mode,
          frames
      };
      const json = JSON.stringify(state);
      const compressed = lzString.compressToEncodedURIComponent(json);

      const id = Date.now().toString();
      const saveItem = {
          id,
          name,
          date: new Date().toISOString(),
          data: compressed
      };

      localStorage.setItem(`futsal_tactic_${id}`, JSON.stringify(saveItem));
      alert("Tactic Saved!");
  };

  const handleLoadTactic = (compressedData) => {
      try {
          const decompressed = lzString.decompressFromEncodedURIComponent(compressedData);
          if (decompressed) {
              const state = JSON.parse(decompressed);
              setMode(state.mode || 'full');
              setFrames(state.frames || []);
              if (state.frames && state.frames.length > 0) {
                  setPlayers(state.frames[0].players);
                  setBall(state.frames[0].ball);
                  setAnnotation(state.frames[0].annotation || null);
                  setCurrentFrameIndex(0);
              } else {
                  resetPositions(state.mode || 'full');
              }
              setShowSavedList(false);
          }
      } catch (e) {
          console.error("Failed to load tactic", e);
          alert("Failed to load tactic.");
      }
  };

  // Animation Logic
  const playAnimation = () => {
    if (isPlaying) return;
    if (frames.length < 2) return;
    setIsPlaying(true);

    const moveDuration = 1250; // 1.25s move
    const defaultPauseDuration = 250; // 0.25s pause

    // Pre-calculate timeline
    const timeline = [];
    let totalTime = 0;

    for (let i = 0; i < frames.length - 1; i++) {
        const hasAnnotation = !!frames[i+1].annotation;
        const isLast = i === frames.length - 2;
        const nextFrame = frames[i+1];
        const pause = (nextFrame.annotation ? 500 : 0) + defaultPauseDuration;

        timeline.push({
            start: totalTime,
            moveDuration: moveDuration,
            pauseDuration: pause,
            totalDuration: moveDuration + pause,
            fromIndex: i,
            toIndex: i + 1
        });
        totalTime += moveDuration + pause;
    }

    const totalDuration = totalTime;

    let startTime = null;

    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (elapsed >= totalDuration) {
            setIsPlaying(false);
            setCurrentFrameIndex(frames.length - 1);
            return;
        }

        // Find current segment
        const segment = timeline.find(s => elapsed >= s.start && elapsed < s.start + s.totalDuration);

        if (!segment) {
             // Should not happen if elapsed < totalDuration
             return;
        }

        const segmentElapsed = elapsed - segment.start;
        let progress = 0;

        // Logic: Move then Pause
        if (segmentElapsed < segment.moveDuration) {
            progress = segmentElapsed / segment.moveDuration;
        } else {
            progress = 1; // Pausing
        }

        const currentStep = segment.fromIndex;

        const fromFrame = frames[currentStep];
        const toFrame = frames[currentStep + 1];

        if (fromFrame && toFrame) {
            const interpolatedPlayers = fromFrame.players.map((p) => {
                const toP = toFrame.players.find(tp => tp.id === p.id) || p;
                return {
                    ...p,
                    x: p.x + (toP.x - p.x) * progress,
                    y: p.y + (toP.y - p.y) * progress,
                };
            });

            const interpolatedBall = {
                x: fromFrame.ball.x + (toFrame.ball.x - fromFrame.ball.x) * progress,
                y: fromFrame.ball.y + (toFrame.ball.y - fromFrame.ball.y) * progress,
            };

            setPlayers(interpolatedPlayers);
            setBall(interpolatedBall);

            // Show annotation of the *current step* (fromFrame)
            setAnnotation(fromFrame.annotation || null);

            setCurrentFrameIndex(currentStep);
        }

        animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsPlaying(false);
  };

  // Video Export Logic
  const exportVideo = async () => {
    if (frames.length < 2) {
        alert('Need at least 2 frames to export video.');
        return;
    }

    const filename = prompt("Enter filename:", "tactic.mp4");
    if (!filename) return;

    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(0);

    try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
        const ffmpeg = new FFmpeg();

        console.log('Starting FFmpeg load...');

        // Use local path (change to CDN URL if errors occur)
        const baseURL = window.location.origin + '/ffmpeg';
        const coreURL = `${baseURL}/ffmpeg-core.js`;
        const wasmURL = `${baseURL}/ffmpeg-core.wasm`;

        console.log('Loading FFmpeg from:', coreURL, wasmURL);

        await ffmpeg.load({
            coreURL: await toBlobURL(coreURL, 'text/javascript'),
            wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
        });

        console.log('FFmpeg loaded successfully');

        const fps = 30;
        const moveDuration = 1.25;
        const defaultPauseDuration = 0.25;

        // Build timeline for export
        const timeline = [];
        let totalTime = 0;
        for (let i = 0; i < frames.length - 1; i++) {
            const nextFrame = frames[i+1];
            const pause = (nextFrame.annotation ? 0.5 : 0) + defaultPauseDuration;
            timeline.push({
                start: totalTime,
                moveDuration: moveDuration,
                pauseDuration: pause,
                totalDuration: moveDuration + pause,
                fromIndex: i,
                toIndex: i + 1
            });
            totalTime += moveDuration + pause;
        }

        const totalDuration = totalTime;
        const totalFrames = Math.ceil(totalDuration * fps);

        // 1. Render Frames
        for (let i = 0; i <= totalFrames; i++) {
            const time = i / fps;

            // Find segment
            let segment = timeline.find(s => time >= s.start && time < s.start + s.totalDuration);
            if (!segment && time >= totalDuration) {
                segment = timeline[timeline.length - 1]; // End of video
            }

            if (!segment) continue;

            const segmentTime = time - segment.start;
            let progress = 0;
            if (segmentTime < segment.moveDuration) {
                progress = segmentTime / segment.moveDuration;
            } else {
                progress = 1;
            }

            const currentStep = segment.fromIndex;

            if (currentStep >= frames.length - 1) break;



            const fromFrame = frames[currentStep];
            const toFrame = frames[currentStep + 1];

            // Interpolation
            const interpolatedPlayers = fromFrame.players.map((p) => {
                const toP = toFrame.players.find(tp => tp.id === p.id) || p;
                return {
                    ...p,
                    x: p.x + (toP.x - p.x) * progress,
                    y: p.y + (toP.y - p.y) * progress,
                };
            });

            const interpolatedBall = {
                x: fromFrame.ball.x + (toFrame.ball.x - fromFrame.ball.x) * progress,
                y: fromFrame.ball.y + (toFrame.ball.y - fromFrame.ball.y) * progress,
            };

            setPlayers(interpolatedPlayers);

            setBall(interpolatedBall);

            if (progress === 1) {
                 setAnnotation(toFrame.annotation || null);
            } else {
                 setAnnotation(fromFrame.annotation || null);
            }
            setCurrentFrameIndex(currentStep);

            setExportProgress(Math.round((i / totalFrames) * 100));

            // Wait for render (double rAF to ensure paint)
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

            if (stageRef.current) {
                const dataURL = stageRef.current.toDataURL({ pixelRatio: 1.5 });
                // IMPORTANT: Use sequential filenames to avoid glob issues
                const fileName = `frame_${i.toString().padStart(4, '0')}.png`;
                await ffmpeg.writeFile(fileName, await fetchFile(dataURL));
            }
        }

        setExportProgress(100);
        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Encode Video
        // IMPORTANT: Use sequential numbering instead of glob, and specify yuv420p for Chrome compatibility
        await ffmpeg.exec([
            '-framerate', '30',
            '-i', 'frame_%04d.png',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-pix_fmt', 'yuv420p',
            'out.mp4'
        ]);

        // 3. Download Video
        const data = await ffmpeg.readFile('out.mp4');
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        // IMPORTANT: Chrome compatible download process
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
        document.body.appendChild(a); // DOMに追加
        a.click();
        document.body.removeChild(a); // 削除

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        // Cleanup
        try {
            for (let i = 0; i <= totalFrames; i++) {
               const fileName = `frame_${i.toString().padStart(4, '0')}.png`;
               await ffmpeg.deleteFile(fileName).catch(() => {});
            }
            await ffmpeg.deleteFile('out.mp4').catch(() => {});
       } catch(e) { console.log('Cleanup warning', e); }

    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Check console for details.\n' + error.message);
    } finally {
        setIsExporting(false);
        setCurrentFrameIndex(0);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Futsal Tactic Board</h1>
      </header>

      <div className="controls">
        <button
            className={mode === 'full' ? 'active' : ''}
            onClick={() => handleModeChange('full')}
        >
            Full Court
        </button>
        <button
            className={mode === 'half' ? 'active' : ''}
            onClick={() => handleModeChange('half')}
        >
            Half Court
        </button>
        <button onClick={() => resetPositions(mode)}>Reset</button>
        <div className="divider-vertical"></div>
        <button onClick={() => setShowSavedList(true)} title="Load Saved Tactic">
            <FolderOpen size={16} style={{ marginRight: 6 }} />
            Load
        </button>
        <button onClick={handleSaveTactic} title="Save to Browser">
            <Save size={16} style={{ marginRight: 6 }} />
            Save
        </button>
        <button onClick={shareUrl} className="share-btn" title="Share URL">
            <Share2 size={16} style={{ marginRight: 6 }} />
            Share
        </button>
      </div>

      <div className="controls-bar">
        <div className="playback-controls">
            <button onClick={addFrame} title="Add Frame" className="icon-btn">
                <CirclePlus size={24} />
            </button>
            <button onClick={deleteFrame} disabled={frames.length === 0} title="Delete Frame" className="icon-btn" style={{ color: '#ef4444' }}>
                <CircleMinus size={24} />
            </button>
            <button onClick={addAnnotation} title="Add Note" className="icon-btn">
                <MessageSquarePlus size={24} />
            </button>
            <div className="divider"></div>
            <button onClick={isPlaying ? stopAnimation : playAnimation} title={isPlaying ? "Stop" : "Play"} className="icon-btn">
                {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
        </div>

        <div className="progress-container">
            <span className="frame-counter">Frame: {frames.length > 0 ? currentFrameIndex + 1 : 0} / {frames.length}</span>
            <div className="progress-bar">
                {frames.map((_, idx) => (
                    <div
                        key={idx}
                        className={`progress-step ${idx === currentFrameIndex ? 'active' : ''}`}
                        onClick={() => {
                            setCurrentFrameIndex(idx);
                            setPlayers(frames[idx].players);
                            setBall(frames[idx].ball);
                            setAnnotation(frames[idx].annotation || null);
                        }}
                    />
                ))}
            </div>
        </div>

        <button id="export-btn" onClick={exportVideo} disabled={frames.length < 2} className="export-btn">
            <Video size={20} style={{ marginRight: 8 }} />
            Export Video
        </button>
      </div>

      <div className="court-wrapper">
        <Court
            ref={stageRef}
            mode={mode}
            players={players}
            ball={ball}
            onPlayerDrag={handlePlayerDrag}
            onBallDrag={handleBallDrag}
            annotation={annotation}
            onAnnotationChange={handleAnnotationChange}
            onAnnotationDelete={handleAnnotationDelete}
        />
      </div>

      {/* Export Progress Overlay */}
      {isExporting && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                width: '300px',
                textAlign: 'center'
            }}>
                <h3>{exportProgress === 100 ? 'Please wait...' : 'Exporting Video...'}</h3>
                <div style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#eee',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginTop: '10px'
                }}>
                    <div style={{
                        width: `${exportProgress}%`,
                        height: '100%',
                        backgroundColor: '#4CAF50',
                        transition: 'width 0.2s'
                    }} />
                </div>
                <p>{exportProgress}%</p>
            </div>
        </div>
      )}

      {/* Saved List Overlay */}
      {showSavedList && (
          <SavedList
            onLoad={handleLoadTactic}
            onClose={() => setShowSavedList(false)}
          />
      )}
    </div>
  );
}

export default App;
