const { execSync } = require('child_process');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Remove a moldura/fundo de uma carta e a coloca em um fundo preto puro.
 * @param {string} caminhoOriginal - Caminho da imagem da carta original.
 * @param {string} caminhoResultado - Caminho onde a nova imagem será salva.
 */
async function processarCartaSemMoldura(caminhoOriginal, caminhoResultado) {
  // Define um caminho temporário para salvar o jogador com fundo transparente
  const caminhoTemporario = path.join(__dirname, `temp_${Date.now()}_jogador.png`);

  try {
    console.log('1. Executando a IA (rembg) para isolar o jogador e remover a moldura...');
    // Executa o comando do sistema. O rembg detecta o jogador e apaga o resto.
    execSync(`rembg i "${caminhoOriginal}" "${caminhoTemporario}"`, { stdio: 'pipe' });

    console.log('2. Lendo dimensões da imagem processada...');
    const { width, height } = await sharp(caminhoTemporario).metadata();

    console.log('3. Criando o fundo preto sólido no Sharp...');
    const fundoPreto = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 } // Preto opaco
      }
    })
    .png()
    .toBuffer();

    console.log('4. Sobrepondo o jogador isolado sobre o fundo preto...');
    await sharp(fundoPreto)
      .composite([
        { 
          input: caminhoTemporario, 
          top: 0, 
          left: 0 
        }
      ])
      .toFile(caminhoResultado);

    console.log(`✓ Sucesso! Imagem final salva em: ${caminhoResultado}`);

  } catch (erro) {
    console.error('✕ Erro durante o processamento:', erro.message);
  } finally {
    // Garante que o arquivo temporário será deletado, mesmo se houver erro
    if (fs.existsSync(caminhoTemporario)) {
      fs.unlinkSync(caminhoTemporario);
    }
  }
}

// === EXECUÇÃO DO EXEMPLO ===
// Certifique-se de que o arquivo 'carta_original.png' existe na mesma pasta
const imagemEntrada = path.join(__dirname, 'test8.png');
const imagemSaida = path.join(__dirname, 'carta_final_fundo_preto.png');

processarCartaSemMoldura(imagemEntrada, imagemSaida);