(async function() {
  const canvas = document.getElementById('glCanvas');
  const errorBox = document.getElementById('shaderError');
  const editor = document.getElementById('shaderEditor');
  const shaderDivider = document.getElementById('shaderDivider');

  // ---- GLSL ----
  const vertexSrc = await fetch('shader.vert.glsl').then(r => r.text());
  let fragmentSrc = await fetch('shader.frag.glsl').then(r => r.text());
  editor.value = fragmentSrc.trim();

  // ---- УТИЛИТЫ ----
  function getCharWidth() {
    const span = document.createElement('span');
    span.style.fontFamily = 'Menlo, Consolas, monospace';
    span.style.fontSize = '14px';
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.textContent = 'A';
    document.body.appendChild(span);
    const w = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    return w;
  }

  function updateShaderDivider() {
    const widthPx = canvas.clientWidth;
    const charWidth = getCharWidth();
    shaderDivider.textContent = '-'.repeat(Math.floor(widthPx / charWidth));
  }

  // ---- WEBGL 2----
  let gl = canvas.getContext('webgl2');
  if(!gl){
    errorBox.textContent = 'WebGL2 не поддерживается.';
    return;
  }

  function compileShader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  let program = null;
  let positionAttribLoc, iResolutionLoc, iTimeLoc;

  function buildProgram() {
    if (program) gl.deleteProgram(program);

    errorBox.textContent = '';

    try {
      const vs = compileShader(gl.VERTEX_SHADER, vertexSrc);
      const fs = compileShader(gl.FRAGMENT_SHADER, editor.value);

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);

      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog));
      }

      program = prog;
      positionAttribLoc = gl.getAttribLocation(program, 'a_position');
      iResolutionLoc = gl.getUniformLocation(program, 'iResolution');
      iTimeLoc = gl.getUniformLocation(program, 'iTime');

    } catch (e) {
      errorBox.textContent = "Ошибка шейдера:\n" + e.message;
      program = null;
    }
  }

  buildProgram();

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]),
    gl.STATIC_DRAW
  );

  function resizeCanvas() {
    const dpr = devicePixelRatio;
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    updateShaderDivider();
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let startTime = performance.now();

  function render(time) {
    resizeCanvas();
    if (program) {
      gl.clearColor(0,0,0,1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.enableVertexAttribArray(positionAttribLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(iResolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(iTimeLoc, (time - startTime) * 0.001);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  let timer;
  editor.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(buildProgram, 300);
  });

})();