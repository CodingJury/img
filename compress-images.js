import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import { readdir, writeFile, stat } from 'fs/promises';
import path from "path";
import chalk from 'chalk';
import config from './config.js';
import { readableSize } from './utils.js';

class ImageBuilder {
  constructor(config) {
    this.inputDir = config.inputDir;
    this.outputDir = config.outputDir;
    this.imagesJson = config.imagesJson;
    this.supportedExtensionsRegex = /\.(jpg|jpeg|png|webp|gif)$/i;

    console.log('⚙️ ' + chalk.blueBright.underline('Configuration:'));
    console.log(('📂 Input Directory').padEnd(30) + this.inputDir);
    console.log(('📂 Output Directory').padEnd(30) + this.outputDir);
    console.log(('📝 Images JSON').padEnd(30) + this.imagesJson);
  }

  async compressImages() {
    console.log('\n\n🔧 ' + chalk.blueBright('Starting compression...'));

    const inputPath = `${this.inputDir}/*.{jpg,png}`;
    const outputPath = `${this.outputDir}/`;
  
    const files = await imagemin([inputPath], {
      destination: outputPath,
      plugins: [
        imageminMozjpeg({ quality: 60 }),
        imageminPngquant({ quality: [0.6, 0.8] })
      ]
    });
    console.log(chalk.gray('-------------------------------------------------------------------'));
    console.log(chalk.bold('Image'.padEnd(30)) + chalk.bold('Original'.padEnd(15)) + chalk.bold('Compressed'.padEnd(15)) + chalk.bold('Saved'));
    console.log(chalk.gray('-------------------------------------------------------------------'));

    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    for(const file of files) {
      const originalStat = await stat(file.sourcePath)
      const compressedStat = await stat(file.destinationPath)

      const fileName = path.basename(file.destinationPath);

      const originalSize = originalStat.size;
      const compressedSize = compressedStat.size;
      const reductionPercent = ((1 - compressedSize / originalSize) * 100).toFixed(2) + '%';

      totalOriginalSize += originalSize;
      totalCompressedSize += compressedSize;

      console.log(fileName.padEnd(30) + readableSize(originalSize).padEnd(15) + readableSize(compressedSize).padEnd(15) + chalk.green(reductionPercent));
    }

    console.log(chalk.gray('-------------------------------------------------------------------\n'));
    console.log(
      chalk.bold(('✅ Total File Count').padEnd(30)) + chalk.bgYellow.bold(` ${files.length} `) + '\n' +
      chalk.bold(('📦 Total Original').padEnd(30)) + readableSize(totalOriginalSize) + '\n' +
      chalk.bold(('📦 Total Compressed').padEnd(30)) + readableSize(totalCompressedSize) + '\n' +
      chalk.bold(('📉 Overall Saved').padEnd(30)) + chalk.green(((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(2) + '%\n')
    );
  }

  async generateImagesJson() {
    console.log('\n\n📝 ' + chalk.blueBright(`Generating ${this.imagesJson}...`));

    const files = await readdir(this.outputDir);
    const imageFiles = files.filter(file => this.supportedExtensionsRegex.test(file));

    const imagesData = [];

    for (const file of imageFiles) {
      const filePath = `${this.outputDir}/${file}`;
      const stats = await stat(filePath);
      const size = stats.size; // in bytes
      const extension = file.split('.').pop().toLowerCase();

      imagesData.push({
        filename: file,
        sizeReadable: readableSize(size),
        type: extension
      });
    }

    await writeFile(this.imagesJson, JSON.stringify(imagesData));

    console.log(chalk.green(JSON.stringify(imagesData, null, 2), '\n'));
    console.log('✅ ' + chalk.bold(`Generated: "${this.imagesJson}" \n`));
  }


  async build() {
    try {
      await this.compressImages();
      await this.generateImagesJson();
    } catch (error) {
      console.error('❌ ' + chalk.bgRed.white('Build failed:'), error);
    }
  }
}

const builder = new ImageBuilder(config);
builder.build();