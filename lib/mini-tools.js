// 压缩工具
const postcss = require("postcss")
const cssnano = require("cssnano")
const litePreset = require("cssnano-preset-lite")
const autoprefixer = require("autoprefixer")
const preset = litePreset({ discardComments: false });
const {  deepFold, findAndMkdir,  } = require("./fs-utils")
const fs = require("fs");
const fs_promises = fs.promises
const path = require("path");
const imagemin = require("imagemin")
const logger = require("./logger")
const imageminPngquant = require('imagemin-pngquant')
const imageminSvgo = require("imagemin-svgo")
const imageminJpegtran = require('imagemin-jpegtran')
const imageminGifsicle = require('imagemin-gifsicle');
const UglifyJS = require("uglify-js");
const watchFiles = require("node-watch");


async function minicss (fold, targetFold, ext, filepath) {
    async function minicssString (src, target) {
        if (!filepath || filepath === src) {
            const scs = await fs_promises.readFile(src, 'utf-8')
            const css_res = await postcss([cssnano({ preset, plugins: [autoprefixer] })]).process(scs ? scs.toString() : '')
            await fs_promises.writeFile(target, css_res.css)
        }
    }
    await deepFold(fold, targetFold, ext, minicssString)
    logger.success('css压缩构建完成')
}

// 需要安装pngquant，配置环境变量 去官网https://pngquant.org/下载
async function miniImage (fold, targetFold, ext) {
    await findAndMkdir(targetFold)
    const files = await imagemin([fold + '/**/*.{png,svg,jpg,gif}'], {
        // destination: targetFold,
        plugins: [
            imageminPngquant({
                quality: [0.6, 0.8]
            }),
            imageminSvgo({
                plugins: [{
                    name: 'removeViewBox',
                    active: false
                }]
            }),
            imageminJpegtran(),
            imageminGifsicle(),
        ]
    });

    for (const file of files) {
        const targetSourceFold = file.sourcePath.replace(`${fold}/`, "")
        const parseSourcePath = path.parse(targetSourceFold)
        if (parseSourcePath.dir) {
            for (const dirElement of parseSourcePath.dir.split('/')) {
                await findAndMkdir(path.resolve(targetFold, dirElement))
            }
        }
        await fs_promises.writeFile(path.resolve(targetFold, targetSourceFold), file.data)
    }

    logger.success('图片压缩构建完成')
}


async function uglifyJsDeal (fold, targetFold, ext) {
    async function uglifyJsString (src, target) {
        const scs = await fs_promises.readFile(src)
        const code_src = scs ? scs.toString() : ''
        const result = UglifyJS.minify(code_src, {

        });
        await fs_promises.writeFile(target, result.code)
    }
    await deepFold(fold, targetFold, ext, uglifyJsString)
    logger.success('js压缩构建完成')
}

async function deal_sf (config, sf) {
    const { fold, use, ext, file, rename, tfold } = sf
    if (file) {
        const targetPath = path.resolve(process.cwd(), config.targetFold, rename || file)
        const srcPath = path.resolve(process.cwd(), config.srcFold, file)
        await fs_promises.copyFile(srcPath, targetPath)
    } else {
        if (use) { // 使用处理器
            const targetPath = path.resolve(process.cwd(), config.targetFold, tfold || fold)
            if (use === 'postcss') {
                logger.primary('css处理中.....')
                try {
                    await minicss(path.resolve(process.cwd(), config.srcFold, fold), targetPath, ext)
                } catch (err) {
                    console.error(err)
                }
            } else if (use === 'imagemin') {
                logger.primary('图片资源处理中.....')
                try {
                    await miniImage(`${config.srcFold}/${fold}`, targetPath, ext)
                } catch (err) {
                    console.error(err)
                }
            } else if (use === 'uglifyJs') {
                logger.primary('js处理中.....')
                try {
                    await uglifyJsDeal(path.resolve(process.cwd(), config.srcFold, fold), targetPath, ext)
                } catch (err) {
                    console.error(err)
                }
            }
            

        }
    }
}

async function mini (config) {
    const static_folds = config.loaders
    for (const sf of static_folds) {
        await deal_sf(config, sf)
    }
    if (config.hot) {
        watchAndCompile(config,)

    }
}


let watcher;
function watchAndCompile (config,) {
    if (watcher) watcher.close()
    const fileFold = path.resolve(process.cwd(), config.srcFold)
    watcher = watchFiles(fileFold, {
        recursive: true,
        filter (f, skip) {
            for (let ld of config.loaders) {
                if (ld.file === f || (ld.fold && f.indexOf(path.resolve(fileFold, ld.fold)) > -1)) {
                    return true
                }
            }
            return false
        }
    }, async function (eventType, filePath,) {
        if (filePath) {
            const static_folds = config.loaders
            let loader;
            for (const sf of static_folds) {
                if (filePath.indexOf(path.resolve(fileFold, sf.file || sf.fold)) > -1) {
                    loader = sf
                }
            }
            if (loader) await deal_sf(config, loader)
        }
    })
    logger.primary("监听文件中...")
}

module.exports = mini
