export let snakeTexture = null;

export function loadSnakeTexture(gl, callback, skin) {
    snakeTexture = gl.createTexture();
    const snakeImage = new Image();
    snakeImage.src = `../img/skins/skin-${skin}.png`;

    snakeImage.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, snakeTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snakeImage);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        callback(); // Proceed with rendering once loaded
    };
}

export function drawSnake(gl, positionBuffer, normalBuffer, texCoordBuffer, aPosition, aNormal, aTexCoord, uViewMatrix, uProjMatrix, uModelMatrix, uUseTexture, uSampler, uLightDirection, uForceLight, projMatrix, viewMatrix, snake, vertices) {
    gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(uProjMatrix, false, projMatrix);
    gl.uniform3fv(uLightDirection, [0.5, 1.0, 0.5]);

    // Bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    // Bind texture only for the snake
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, snakeTexture);
    gl.uniform1i(uSampler, 0);

    // Optional: Apply lighting to the snake
    gl.uniform1f(uForceLight, 0.4); 
    gl.uniform1f(uUseTexture, 1.0);
    // Draw each snake segment
    for (let segment of snake) {
        const modelMatrix = translate(segment.x, 0.5, segment.y);
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    }
}
