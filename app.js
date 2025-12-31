const { useState, useRef, useEffect } = React;
const { Download, Upload, Grid, X, Move, ZoomIn, ZoomOut, ArrowLeft, ArrowRight } = lucide;

function CollageMaker() {
  const [images, setImages] = useState([]);
  const [aspectRatio, setAspectRatio] = useState('square');
  const [layout, setLayout] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [imageTransforms, setImageTransforms] = useState({});
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const aspectRatios = {
    square: { ratio: 1, label: '1:1' },
    '4:3': { ratio: 4/3, label: '4:3' },
    '3:4': { ratio: 3/4, label: '3:4' },
    '16:9': { ratio: 16/9, label: '16:9' },
    '9:16': { ratio: 9/16, label: '9:16' },
    original: { ratio: null, label: 'Original' }
  };

  const layouts = {
    2: [
      { name: '2 Horizontal', cells: [{x:0,y:0,w:0.5,h:1}, {x:0.5,y:0,w:0.5,h:1}], icon: 'M2 2h8v16H2zm10 0h8v16h-8z' },
      { name: '2 Vertical', cells: [{x:0,y:0,w:1,h:0.5}, {x:0,y:0.5,w:1,h:0.5}], icon: 'M2 2h16v7H2zm0 9h16v7H2z' }
    ],
    3: [
      { name: '3 Horizontal', cells: [{x:0,y:0,w:0.33,h:1}, {x:0.33,y:0,w:0.34,h:1}, {x:0.67,y:0,w:0.33,h:1}], icon: 'M2 2h5v16H2zm6 0h5v16H8zm6 0h5v16h-5z' },
      { name: '3 Grid', cells: [{x:0,y:0,w:0.5,h:1}, {x:0.5,y:0,w:0.5,h:0.5}, {x:0.5,y:0.5,w:0.5,h:0.5}], icon: 'M2 2h8v16H2zm10 0h8v7h-8zm0 9h8v7h-8z' },
      { name: '3 Vertical', cells: [{x:0,y:0,w:1,h:0.33}, {x:0,y:0.33,w:1,h:0.34}, {x:0,y:0.67,w:1,h:0.33}], icon: 'M2 2h16v5H2zm0 6h16v5H2zm0 6h16v5H2z' }
    ],
    4: [
      { name: '4 Grid', cells: [{x:0,y:0,w:0.5,h:0.5}, {x:0.5,y:0,w:0.5,h:0.5}, {x:0,y:0.5,w:0.5,h:0.5}, {x:0.5,y:0.5,w:0.5,h:0.5}], icon: 'M2 2h7v7H2zm9 0h7v7h-7zM2 11h7v7H2zm9 0h7v7h-7z' },
      { name: '4 Horizontal', cells: [{x:0,y:0,w:0.25,h:1}, {x:0.25,y:0,w:0.25,h:1}, {x:0.5,y:0,w:0.25,h:1}, {x:0.75,y:0,w:0.25,h:1}], icon: 'M2 2h3v16H2zm4 0h3v16H6zm4 0h3v16h-3zm4 0h3v16h-3z' },
      { name: '4 Mixed', cells: [{x:0,y:0,w:0.5,h:0.5}, {x:0.5,y:0,w:0.5,h:0.5}, {x:0,y:0.5,w:1,h:0.5}], icon: 'M2 2h7v7H2zm9 0h7v7h-7zM2 11h16v7H2z' }
    ],
    5: [
      { name: '5 Grid', cells: [{x:0,y:0,w:0.5,h:0.5}, {x:0.5,y:0,w:0.5,h:0.5}, {x:0,y:0.5,w:0.33,h:0.5}, {x:0.33,y:0.5,w:0.34,h:0.5}, {x:0.67,y:0.5,w:0.33,h:0.5}], icon: 'M2 2h7v7H2zm9 0h7v7h-7zM2 11h4v7H2zm5 0h4v7H7zm5 0h4v7h-4z' },
      { name: '5 Featured', cells: [{x:0,y:0,w:1,h:0.5}, {x:0,y:0.5,w:0.25,h:0.5}, {x:0.25,y:0.5,w:0.25,h:0.5}, {x:0.5,y:0.5,w:0.25,h:0.5}, {x:0.75,y:0.5,w:0.25,h:0.5}], icon: 'M2 2h16v7H2zM2 11h3v7H2zm4 0h3v7H6zm4 0h3v7h-3zm4 0h3v7h-3z' }
    ],
    6: [
      { name: '6 Grid', cells: [{x:0,y:0,w:0.33,h:0.5}, {x:0.33,y:0,w:0.34,h:0.5}, {x:0.67,y:0,w:0.33,h:0.5}, {x:0,y:0.5,w:0.33,h:0.5}, {x:0.33,y:0.5,w:0.34,h:0.5}, {x:0.67,y:0.5,w:0.33,h:0.5}], icon: 'M2 2h4v7H2zm5 0h4v7H7zm5 0h4v7h-4zM2 11h4v7H2zm5 0h4v7H7zm5 0h4v7h-4z' },
      { name: '6 Mixed', cells: [{x:0,y:0,w:0.5,h:0.5}, {x:0.5,y:0,w:0.5,h:0.5}, {x:0,y:0.5,w:0.25,h:0.5}, {x:0.25,y:0.5,w:0.25,h:0.5}, {x:0.5,y:0.5,w:0.25,h:0.5}, {x:0.75,y:0.5,w:0.25,h:0.5}], icon: 'M2 2h7v7H2zm9 0h7v7h-7zM2 11h3v7H2zm4 0h3v7H6zm4 0h3v7h-3zm4 0h3v7h-3z' }
    ]
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => resolve({ src: event.target.result, img });
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(loadedImages => {
      setImages(prev => [...prev, ...loadedImages]);
      if (loadedImages.length > 0 && !layout) {
        const count = Math.min(images.length + loadedImages.length, 6);
        setLayout(layouts[count]?.[0]);
      }
    });
  };

  const getTransform = (index) => {
    return imageTransforms[index] || { scale: 1, offsetX: 0, offsetY: 0, stretch: false };
  };

  const updateTransform = (index, updates) => {
    setImageTransforms(prev => ({
      ...prev,
      [index]: { ...getTransform(index), ...updates }
    }));
  };

  const handleInteractionStart = (e) => {
    if (editingCell === null) return;
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    setDragStart({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    e.preventDefault();
  };

  const handleInteractionMove = (e) => {
    if (!isDragging || editingCell === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const transform = getTransform(editingCell);
    updateTransform(editingCell, {
      offsetX: transform.offsetX + deltaX * 2,
      offsetY: transform.offsetY + deltaY * 2
    });
    
    setDragStart({ x: currentX, y: currentY });
    e.preventDefault();
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
  };

  const moveImage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    const newTransforms = {};
    Object.keys(imageTransforms).forEach(key => {
      const idx = parseInt(key);
      if (idx === fromIndex) {
        newTransforms[toIndex] = imageTransforms[idx];
      } else if (fromIndex < toIndex && idx > fromIndex && idx <= toIndex) {
        newTransforms[idx - 1] = imageTransforms[idx];
      } else if (fromIndex > toIndex && idx >= toIndex && idx < fromIndex) {
        newTransforms[idx + 1] = imageTransforms[idx];
      } else {
        newTransforms[idx] = imageTransforms[idx];
      }
    });
    
    setImages(newImages);
    setImageTransforms(newTransforms);
    if (editingCell === fromIndex) {
      setEditingCell(toIndex);
    }
  };

  const generateCollage = () => {
    if (!canvasRef.current || images.length === 0 || !layout) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const baseSize = 1200;
    
    let width, height;
    if (aspectRatio === 'original' && images.length > 0) {
      width = images[0].img.width;
      height = images[0].img.height;
    } else {
      const ratio = aspectRatios[aspectRatio].ratio;
      width = baseSize;
      height = baseSize / ratio;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const padding = 0;

    layout.cells.forEach((cell, i) => {
      if (i < images.length) {
        const img = images[i].img;
        const transform = getTransform(i);
        
        const cellX = cell.x * width + padding;
        const cellY = cell.y * height + padding;
        const cellW = cell.w * width - padding * 2;
        const cellH = cell.h * height - padding * 2;

        const imgAspect = img.width / img.height;
        const cellAspect = cellW / cellH;

        let drawW, drawH;
        
        if (transform.stretch) {
          drawW = cellW;
          drawH = cellH;
        } else {
          if (imgAspect > cellAspect) {
            drawH = cellH;
            drawW = drawH * imgAspect;
          } else {
            drawW = cellW;
            drawH = drawW / imgAspect;
          }
        }

        drawW *= transform.scale;
        drawH *= transform.scale;

        let offsetX = transform.offsetX;
        let offsetY = transform.offsetY;

        const maxOffsetX = Math.max(0, (drawW - cellW) / 2);
        offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offsetX));

        const maxOffsetY = Math.max(0, (drawH - cellH) / 2);
        offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offsetY));

        const drawX = cellX + (cellW - drawW) / 2 + offsetX;
        const drawY = cellY + (cellH - drawH) / 2 + offsetY;

        if (editingCell === i) {
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.drawImage(img, 0, 0, img.width, img.height, drawX, drawY, drawW, drawH);
          ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(cellX, cellY, cellW, cellH);
        ctx.clip();

        ctx.drawImage(img, 0, 0, img.width, img.height, drawX, drawY, drawW, drawH);

        if (editingCell === i) {
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 4;
          ctx.strokeRect(cellX, cellY, cellW, cellH);
        }

        ctx.restore();
      }
    });
  };

  useEffect(() => {
    generateCollage();
  }, [images, aspectRatio, layout, imageTransforms, editingCell]);

  const downloadCollage = () => {
    if (!canvasRef.current) return;
    const prevEditingCell = editingCell;
    setEditingCell(null);
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `collage-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setEditingCell(prevEditingCell);
      }, 'image/png');
    }, 100);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setEditingCell(null);
    const newTransforms = {};
    Object.keys(imageTransforms).forEach(key => {
      const idx = parseInt(key);
      if (idx < index) {
        newTransforms[idx] = imageTransforms[idx];
      } else if (idx > index) {
        newTransforms[idx - 1] = imageTransforms[idx];
      }
    });
    setImageTransforms(newTransforms);
    
    if (newImages.length > 0) {
      const count = Math.min(newImages.length, 6);
      setLayout(layouts[count]?.[0]);
    }
  };

  const availableLayouts = layouts[Math.min(images.length, 6)] || [];

  return React.createElement('div', { className: "min-h-screen bg-black p-4", style: {fontFamily: 'Arial, sans-serif'} },
    React.createElement('div', { className: "max-w-4xl mx-auto" },
      React.createElement('div', { className: "bg-zinc-900 shadow-2xl p-1 mb-6" },
        React.createElement('div', { className: "bg-black p-6" },
          React.createElement('h1', { className: "text-4xl font-black text-center mb-2 text-white", style: {textShadow: '0 0 10px rgba(255,153,0,0.5)'} },
            React.createElement('span', { className: "text-white" }, 'COLLAGE'),
            React.createElement('span', { className: "bg-orange-500 text-black px-3 py-1 rounded-lg ml-2" }, 'HUB')
          ),
          React.createElement('p', { className: "text-center text-gray-400 mb-6 font-semibold" }, 'Create beautiful photo collages instantly'),
          React.createElement('input', {
            type: 'file',
            ref: fileInputRef,
            onChange: handleImageUpload,
            accept: 'image/*',
            multiple: true,
            className: 'hidden'
          }),
          React.createElement('button', {
            onClick: () => fileInputRef.current?.click(),
            className: "w-full bg-orange-500 text-black py-4 font-black flex items-center justify-center gap-2 hover:bg-orange-600 active:bg-orange-700 transition mb-6 text-lg tracking-wide"
          },
            React.createElement(Upload, { size: 24 }),
            `UPLOAD PHOTOS (${images.length})`
          ),
          // Continue with rest of the component...
          images.length > 0 && React.createElement('div', { className: "mb-6 bg-zinc-900 p-4" },
            React.createElement('h3', { className: "font-black mb-3 flex items-center gap-2 text-orange-500 text-sm uppercase tracking-widest" },
              React.createElement(Grid, { size: 18 }),
              'ASPECT RATIO'
            ),
            React.createElement('div', { className: "grid grid-cols-3 sm:grid-cols-6 gap-2" },
              Object.entries(aspectRatios).map(([key, { label }]) =>
                React.createElement('button', {
                  key: key,
                  onClick: () => setAspectRatio(key),
                  className: `py-2 px-3 font-bold transition text-sm uppercase ${aspectRatio === key ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white'}`
                }, label)
              )
            )
          ),
          images.length > 0 && layout && React.createElement('div', { className: "bg-zinc-900 p-4 mb-6" },
            React.createElement('h3', { className: "font-black mb-3 text-center text-orange-500 text-sm uppercase tracking-widest" }, 'PREVIEW'),
            React.createElement('div', { className: "flex justify-center" },
              React.createElement('canvas', {
                ref: canvasRef,
                onMouseDown: handleInteractionStart,
                onMouseMove: handleInteractionMove,
                onMouseUp: handleInteractionEnd,
                onMouseLeave: handleInteractionEnd,
                onTouchStart: handleInteractionStart,
                onTouchMove: handleInteractionMove,
                onTouchEnd: handleInteractionEnd,
                className: `max-w-full h-auto ring-2 ring-zinc-700 ${editingCell !== null ? 'cursor-move touch-none' : 'cursor-default'}`
              })
            )
          ),
          images.length > 0 && layout && React.createElement('button', {
            onClick: downloadCollage,
            className: "w-full bg-orange-500 text-black py-4 font-black flex items-center justify-center gap-2 hover:bg-orange-600 active:bg-orange-700 transition text-lg tracking-widest"
          },
            React.createElement(Download, { size: 24 }),
            'DOWNLOAD COLLAGE'
          )
        )
      )
    )
  );
}

ReactDOM.render(React.createElement(CollageMaker), document.getElementById('root'));
