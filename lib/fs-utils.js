
//使用fs.readdir()方法读取文件夹中的所有文件和文件夹，然后使用递归来删除每个文件和文件夹。
const fs = require('fs');
const path = require('path');
const fs_promises = fs.promises


// 深度遍历文件夹
async function deepFold(fold, targetFold, ext, doFunc, base_fold = "") {
    const srcFold = path.resolve(fold, base_fold)
    const stat = await fs_promises.stat(srcFold)
    if(stat.isDirectory()) {
        const fold_files =  await fs_promises.readdir(srcFold)
        for (const foldFile of fold_files) {
            const child_fold = path.resolve(srcFold, foldFile)
            const stat1 = await fs_promises.stat(child_fold)
            if(stat1.isDirectory()) {
                await deepFold(srcFold, targetFold,ext, doFunc ,base_fold ? ( base_fold + '/' +foldFile) : foldFile)
            } else if(stat1.isFile()) {
                const dir = path.resolve(targetFold, base_fold)
                await findAndMkdir(dir)
                const fileExt = path.parse(child_fold).ext.substring(1)
                if(!ext || child_fold.endsWith(`.${ext}`) || ext.split(",").includes(fileExt)) {
                    await doFunc(child_fold, path.resolve(targetFold, base_fold, foldFile))
                }
            }
        }
    }
}

async function deepFile(fold, {ext, ignores = [], includes = []}, doFunc, base_fold = "") {
    try {
        const srcFold = path.resolve(fold, base_fold)
        const stat = await fs_promises.stat(srcFold)
        if(stat.isDirectory()) {
            const fold_files =  await fs_promises.readdir(srcFold)
            for (const foldFile of fold_files) {
                const child_fold = path.resolve(srcFold, foldFile)
                const stat1 = await fs_promises.stat(child_fold)
                if(stat1.isDirectory()) {
                    // ignore
                    if(!ignores.map(item => path.resolve(fold, item)).includes(child_fold)) {
                        if(includes && includes.length > 0) {
                            if(includes.map(item => path.resolve(fold, item)).includes(child_fold)) {
                                await deepFile(fold, {ext, ignores, includes},  doFunc ,base_fold ? ( base_fold + '/' +foldFile) : foldFile)
                            }
                        } else {
                            await deepFile(fold, {ext, ignores, includes},  doFunc ,base_fold ? ( base_fold + '/' +foldFile) : foldFile)
                        }
                    }
                } else if(stat1.isFile()) {
                    const fileExt = path.parse(child_fold).ext.substring(1)
                    if(!ext || child_fold.endsWith(`.${ext}`) || ext.split(",").includes(fileExt)) {
                        await doFunc(child_fold, )
                    }
                }
            }
        }
    }catch(err) {
        console.error(err)
    }
}




async function findAndMkdir(dir) {
    try {
        const stat = await fs_promises.stat(dir)
        if(!stat.isDirectory()) {
            await fs_promises.mkdir(dir)
        }
    } catch(err) {
        await fs_promises.mkdir(dir)
    }
}

async function copyFold(fold, targetFold, ext) {
    async function doCopy(src, target) {
        await fs_promises.copyFile(src, target)
    }
    await deepFold(fold, targetFold, ext, doCopy)
}

module.exports = {
    deepFold,
    deepFile,
    findAndMkdir,
    copyFold,
}
