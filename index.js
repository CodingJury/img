import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import fs from 'fs';
import chalk from 'chalk';

(async () => {
  const inputPath = 'raw/*.{jpg,png}';
  const outputPath = 'min/';

  const files = await imagemin([inputPath], {
    destination: outputPath,
    plugins: [
      imageminMozjpeg({ quality: 60 }),
      imageminPngquant({
        quality: [0.6, 0.8]
      })
    ]
  });

  files.forEach(file => {
    const originalSize = fs.statSync(file.sourcePath).size;
    const compressedSize = fs.statSync(file.destinationPath).size;

    console.log('\n')
    console.log(chalk.bold(`File: ${file.sourcePath}`) + ' -> ' + chalk.bold(` ${file.destinationPath} `));
    console.log(chalk.bgMagenta.bold(redableSize(originalSize)) + ' -> ' + chalk.bgGreen.bold(redableSize(compressedSize)));
  });

  console.log('\n')
  console.log(chalk.bold('Total file compressed : ') + chalk.bgYellow.bold(` ${files.length} `));
  console.log('\n')
})()

const redableSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const result = parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];

  return ` ${result} `; //just for spacing to help with chalk
}