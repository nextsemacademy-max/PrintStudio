// Generates a realistic sample document with shadows, notes, diagrams, and highlighter
export function generateSampleDocumentDataUrl(): string {
  const canvas = document.createElement('canvas');
  // Moderately low resolution (simulating a 720p phone snapshot)
  canvas.width = 900;
  canvas.height = 1250;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Off-white/yellowish paper background with paper texture
  ctx.fillStyle = '#f6f3eb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle paper grain/noise
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, y, 2, 2);
  }

  // 2. Notebook ruled lines (faint cyan/blue)
  ctx.strokeStyle = 'rgba(70, 130, 180, 0.22)';
  ctx.lineWidth = 1;
  for (let y = 140; y < canvas.height - 40; y += 42) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(canvas.width - 60, y);
    ctx.stroke();
  }

  // Pink margin line on left
  ctx.strokeStyle = 'rgba(235, 90, 120, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(130, 60);
  ctx.lineTo(130, canvas.height - 40);
  ctx.stroke();

  // 3. Document Title
  ctx.font = 'bold 30px "Times New Roman", Georgia, serif';
  ctx.fillStyle = '#1a1a24';
  ctx.fillText('Lecture 04: Binary Trees & Algorithmic Complexity', 150, 105);

  // Subtitle / Date in pen ink
  ctx.font = 'italic 16px Arial, sans-serif';
  ctx.fillStyle = '#1e3a8a'; // Blue ballpoint pen
  ctx.fillText('NextSem Academy • Subject: BCS-111 • Instructor: Er. Manoj Kumar', 150, 130);

  // 4. Yellow Highlighter stroke over key phrase
  ctx.fillStyle = 'rgba(254, 240, 138, 0.65)'; // Highlighter yellow
  ctx.fillRect(145, 175, 420, 24);

  // 5. Notes Body Text
  ctx.font = '18px "Courier New", Courier, monospace';
  ctx.fillStyle = '#111827';
  ctx.fillText('1. Concept of Complete Binary Tree:', 150, 192);

  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#27272a';
  ctx.fillText('A Binary Tree where every level, except possibly the last, is completely filled.', 150, 234);
  ctx.fillText('All leaf nodes are packed as far left as possible. Height is O(log N).', 150, 276);

  // 6. Tree Diagram
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2.5;

  // Root node
  ctx.fillStyle = '#eff6ff';
  ctx.beginPath();
  ctx.arc(450, 360, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#1e40af';
  ctx.fillText('50', 440, 366);

  // Left child
  ctx.beginPath();
  ctx.arc(320, 450, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillText('30', 310, 456);

  // Right child
  ctx.beginPath();
  ctx.arc(580, 450, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillText('70', 570, 456);

  // Lines connecting nodes
  ctx.beginPath();
  ctx.moveTo(432, 378);
  ctx.lineTo(338, 432);
  ctx.moveTo(468, 378);
  ctx.lineTo(562, 432);
  ctx.stroke();

  // Leaf nodes
  const leaves = [
    { x: 250, y: 535, label: '20' },
    { x: 390, y: 535, label: '40' },
    { x: 510, y: 535, label: '60' },
    { x: 650, y: 535, label: '80' },
  ];
  leaves.forEach((l) => {
    ctx.beginPath();
    ctx.arc(l.x, l.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#f0fdf4';
    ctx.strokeStyle = '#16a34a';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#15803d';
    ctx.fillText(l.label, l.x - 10, l.y + 6);
  });

  // Connecting leaf lines
  ctx.strokeStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(306, 468);
  ctx.lineTo(262, 515);
  ctx.moveTo(334, 468);
  ctx.lineTo(378, 515);
  ctx.moveTo(566, 468);
  ctx.lineTo(522, 515);
  ctx.moveTo(594, 468);
  ctx.lineTo(638, 515);
  ctx.stroke();

  // 7. Formula box with handwritten red annotation
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.fillRect(150, 600, 600, 110);
  ctx.strokeRect(150, 600, 600, 110);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Mathematical Properties (Exam Highlight):', 170, 630);

  ctx.font = '15px "Courier New", monospace';
  ctx.fillStyle = '#334155';
  ctx.fillText('• Maximum nodes at level L = 2^L', 170, 660);
  ctx.fillText('• Total nodes in full tree of height H = 2^(H+1) - 1', 170, 688);

  // Red handwritten checkmark & star
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#dc2626';
  ctx.fillText('★ VERY IMPORTANT FOR VIVA!', 480, 750);

  // 8. Key Takeaways
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#1f2937';
  ctx.fillText('• Time Complexity for BST Search: Average Case = O(log N)', 150, 800);
  ctx.fillText('• Worst Case (Skewed Tree): O(N) -> Use AVL or Red-Black Tree', 150, 842);
  ctx.fillText('• Inorder Traversal yields nodes in strictly sorted ascending order.', 150, 884);

  // 9. Camera Phone Shadow (Gradient overlay from bottom right)
  // This simulates taking a photo under room lighting where user's hand/phone casts a shadow!
  const shadowGrad = ctx.createRadialGradient(
    canvas.width,
    canvas.height,
    50,
    canvas.width * 0.5,
    canvas.height * 0.5,
    750
  );
  shadowGrad.addColorStop(0, 'rgba(30, 25, 20, 0.48)'); // Heavy phone shadow
  shadowGrad.addColorStop(0.5, 'rgba(40, 35, 25, 0.25)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top-left ambient vignette
  const topGrad = ctx.createLinearGradient(0, 0, 0, 300);
  topGrad.addColorStop(0, 'rgba(50, 40, 30, 0.12)');
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, canvas.width, 300);

  return canvas.toDataURL('image/jpeg', 0.9);
}
