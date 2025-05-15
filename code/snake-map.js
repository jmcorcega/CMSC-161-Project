export let snakeTexture = null;

export function loadSnakeTexture(gl, callback, skin) {
    snakeTexture = gl.createTexture();
    const snakeImage = new Image();
    snakeImage.src = skin;

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

// export function drawSnake(gl, positionBuffer, normalBuffer, texCoordBuffer, aPosition, aNormal, aTexCoord, uViewMatrix, uProjMatrix, uModelMatrix, uUseTexture, uSampler, uLightDirection, uForceLight, projMatrix, viewMatrix, snake, vertices) {
//   gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
//   gl.uniformMatrix4fv(uProjMatrix, false, projMatrix);
//   gl.uniform3fv(uLightDirection, [0.5, 1.0, 0.5]);

//   // Bind buffers
//   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//   gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
//   gl.enableVertexAttribArray(aPosition);

//   gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
//   gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
//   gl.enableVertexAttribArray(aNormal);

//   gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
//   gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
//   gl.enableVertexAttribArray(aTexCoord);

//   // Bind texture only for the snake
//   gl.activeTexture(gl.TEXTURE0);
//   gl.bindTexture(gl.TEXTURE_2D, snakeTexture);
//   gl.uniform1i(uSampler, 0);

//   // Optional: Apply lighting to the snake
//   gl.uniform1f(uForceLight, 0.4); 
//   gl.uniform1f(uUseTexture, 1.0);
//   // Draw each snake segment
//   for (let segment of snake) {
//       const modelMatrix = translate(segment.x, 0.5, segment.y);
//       gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
//       gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
//   }
// }


export function drawSnake(gl, positionBuffer, normalBuffer, texCoordBuffer,
    aPosition, aNormal, aTexCoord,
    uViewMatrix, uProjMatrix, uModelMatrix,
    uColor, uUseTexture, uSampler,
    uLightDirection, uForceLight,
    projMatrix, viewMatrix,
    snake,
    verticesBody, normalsBody, texturesBody, 
    verticesHead, normalsHead, texturesHead, textureLengthsHead,
    facingAngle // <- Add facingAngle here
  ) {
    gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(uProjMatrix, false, projMatrix);
    gl.uniform3fv(uLightDirection, [0.5, 1.0, 0.5]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, snakeTexture);
    gl.uniform1i(uSampler, 0);
    gl.uniform1f(uForceLight, 0.4); 
    gl.uniform1f(uUseTexture, 1.0);

    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        
        // Create a model matrix and apply translation and rotation
        const modelMatrix = mat4.create();
        mat4.rotateY(modelMatrix, modelMatrix, -facingAngle);
        mat4.translate(modelMatrix, modelMatrix, [segment.x, 0.5, segment.y]);

        gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);

        if (i === 0) {
            // Head
            let counter = 0;
            for (const [key, value] of Object.entries(textureLengthsHead)) {
                const length = value;
                const headVertices = verticesHead.slice(counter * 3, counter * 3 + length * 3);
                const headNormals = normalsHead.slice(counter * 3, counter * 3 + length * 3);
                const headTextures = texturesHead.slice(counter * 2, counter * 2 + length * 2);

                if (key != 'head') {
                    gl.uniform1f(uUseTexture, 0.0);

                    if (key === 'leftEye' || key === 'rightEye') {
                        gl.uniform3fv(uColor, [1.0, 1.0, 1.0]);
                    } else { // pupil
                        gl.uniform3fv(uColor, [0.0, 0.0, 0.0]);
                    }
                } else {
                    gl.uniform1f(uUseTexture, 1.0);
                    gl.uniform3fv(uColor, [1.0, 1.0, 1.0]);
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headVertices), gl.STATIC_DRAW);
                gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headNormals), gl.STATIC_DRAW);
                gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headTextures), gl.STATIC_DRAW);
                gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

                // Draw the head
                gl.drawArrays(gl.TRIANGLES, 0, headVertices.length / 3);

                // adjust the counter for the next part of the head
                counter += length;
            }
            // Reset the buffer bindings
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.uniform1f(uUseTexture, 1.0);
        } else {
            // Body
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesBody), gl.STATIC_DRAW);
            gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalsBody), gl.STATIC_DRAW);
            gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturesBody), gl.STATIC_DRAW);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, verticesBody.length / 3);
        }
    }
}
  