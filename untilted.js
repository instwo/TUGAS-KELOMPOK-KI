document
  .getElementById("encode-button")
  .addEventListener("click", encodeMessage);
document
  .getElementById("decode-button")
  .addEventListener("click", decodeMessage);

function encodeMessage() {
  const videoFile = document.getElementById("video-file").files[0];
  const message = document.getElementById("secret-message").value;
  const password = document.getElementById("password").value;

  if (videoFile && message && password) {
    const videoElement = document.createElement("video");
    const reader = new FileReader();

    reader.onload = function (event) {
      videoElement.src = event.target.result;
      videoElement.onloadeddata = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const encodedData = encodeLSB(frameData.data, message, password);

        ctx.putImageData(
          new ImageData(encodedData, canvas.width, canvas.height),
          0,
          0
        );

        const steganoVideoElement = document.getElementById("stegano-video");
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          steganoVideoElement.src = url;
          steganoVideoElement.play();
        }, "video/webm");
      };
    };

    reader.readAsDataURL(videoFile);
  } else {
    alert("Semua input harus diisi!");
  }
}

function decodeMessage() {
  const videoFile = document.getElementById("video-file").files[0];
  const password = document.getElementById("password").value;

  if (videoFile && password) {
    const videoElement = document.createElement("video");
    const reader = new FileReader();

    reader.onload = function (event) {
      videoElement.src = event.target.result;
      videoElement.onloadeddata = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decodedMessage = decodeLSB(frameData.data, password);

        document.getElementById("secret-message-display").innerText =
          "Pesan Tersembunyi: " + decodedMessage;
      };
    };

    reader.readAsDataURL(videoFile);
  } else {
    alert("Semua input harus diisi!");
  }
}

function encodeLSB(data, message, password) {
  const messageBits = messageToBits(message + password);
  for (let i = 0; i < messageBits.length; i++) {
    data[i] = (data[i] & ~1) | messageBits[i];
  }
  return data;
}

function decodeLSB(data, password) {
  let bits = [];
  for (let i = 0; i < data.length; i++) {
    bits.push(data[i] & 1);
  }
  const message = bitsToMessage(bits);
  return message.replace(password, "");
}

function messageToBits(message) {
  let bits = [];
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i);
    for (let j = 7; j >= 0; j--) {
      bits.push((charCode >> j) & 1);
    }
  }
  return bits;
}

function bitsToMessage(bits) {
  let message = "";
  for (let i = 0; i < bits.length; i += 8) {
    let charCode = 0;
    for (let j = 0; j < 8; j++) {
      charCode = (charCode << 1) | bits[i + j];
    }
    message += String.fromCharCode(charCode);
  }
  return message;
}
