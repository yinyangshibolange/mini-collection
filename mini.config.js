module.exports = {
 srcFold: 'tests/static_dev', // 源文件夹
 targetFold: 'tests/static', // 构建到目标文件夹
 hot: true, // 热监听
 loaders: [
     {
         fold: 'css', // fold为./ 则遍历整个srcFold文件夹
         use: 'postcss',
         ext: 'css'
     },
     {
         fold: 'images',
         use: 'imagemin',
         // tfold: 'images'
         // ext: 'TTF', 根据压缩代码
     },
     {
         fold: 'js',
         // tfold: 'js',
         use: 'uglifyJs',
         ext: 'js'
     },
     {
         file: 'icon.ico', // 直接拷贝单个文件
         rename: 'favicon.ico',
     }
 ]
}