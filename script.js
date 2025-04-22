const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }  // 후면 카메라 요청
    });
    video.srcObject = stream;
    return new Promise(resolve => {
      video.onloadedmetadata = () => resolve(video);
    });
  } catch (err) {
    alert("카메라 접근 오류: " + err.name + "\n" + err.message);
    console.error("카메라 오류:", err);
  }
}

async function detectFrame(model) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const predictions = await model.detect(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0);

  predictions.forEach(pred => {
    ctx.beginPath();
    ctx.rect(...pred.bbox);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'green';
    ctx.fillStyle = 'green';
    ctx.stroke();
    ctx.fillText(pred.class + ' ' + Math.round(pred.score * 100) + '%',
                 pred.bbox[0], pred.bbox[1] > 10 ? pred.bbox[1] - 5 : 10);
  });

  requestAnimationFrame(() => detectFrame(model));
}

async function main() {
  await setupCamera();
  video.play();
  const model = await cocoSsd.load();
  detectFrame(model);
}

main();
