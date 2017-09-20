import * as path from 'path';
import * as webpack from 'webpack';
import * as fs from 'fs';
import ncp from 'ncp';
import mkdirp from 'mkdirp';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';

const AUTOPREFIXER_BROWSERS = [
    'Android 2.3',
    'Android >= 4',
    'Chrome >= 35',
    'Firefox >= 31',
    'Explorer >= 9',
    'iOS >= 7',
    'Opera >= 12',
    'Safari >= 7.1',
];

const loaders = [
    {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/
    },
    {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                'css-loader',
                'autoprefixer-loader',
                'sass-loader',
            ],
        })
    },
    // less 加载器
    {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                'css-loader',
                'autoprefixer-loader',
                'less-loader',
            ]
        })
    },
    {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                'css-loader',
                'autoprefixer-loader'
            ]
        })
    },
    {
        // JSON资源文件加载器
        // Reference: https://github.com/webpack/json-loader
        test: /\.json$/,
        loader: 'json-loader'
    },
    {
        // 图片加载器
        test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)(\?[=a-z0-9]+)?$/,
        loader: 'url-loader?limit=10000&name=images/[hash].[ext]'
    }
];

const plugins = [
    // new webpack.optimize.UglifyJsPlugin({}),
    new ExtractTextPlugin({
        filename: '[name].css',
        allChunks: true,
    })
];

const resolve = {
    // 省略后缀
    extensions: ['.js', '.jsx', '.ts'],
},

export async function compileComponent(project, name, optimize) {
    console.log('start to compile component: ', project, name);
    const projectPrefix = project + '/components';
    const outputFileName = 'Main.js';
    const entryPath = path.join(__dirname, '../src/resources', projectPrefix, name, outputFileName);
    const outputPath = path.join(__dirname, '../publish/', projectPrefix, name);
    var config = {
        entry: entryPath,
        output: {
            path: outputPath,
            filename: outputFileName
        },
        module: {
            loaders: loaders
        },
        plugins: optimize ? plugins : []
    };

    var compiler = webpack(config);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            } else {
                const fileContent = fs.readFileSync(path.join(outputPath, outputFileName));
                // todo 这么写太丑了
                ncp(outputPath, path.join(__dirname, './public'), function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve({
                        stats: stats,
                        fileContent: fileContent,
                        outputPath: outputPath,
                        outputFileName: outputFileName,
                    });
                    console.log('end compile component: ', project, name);
                });
            }
        });
    });
}


// export async function compileTemplate (page) {
//   const project = page.project;
//   const pageId = page._id;
//   const pageName = page.name;
//   console.log('start to compile template: ', project, pageId);
//   const inputPath = path.join(__dirname, '../src/components/PublishPage/');
//   const inputFileName = '_app.js';
//   const outputPath = path.join(__dirname, '../publish/', project, 'pages/' + pageName);
//   const outputFileName = 'app.bundle.js';
//   var config = {
//     entry: inputPath + inputFileName,
//     output: {
//       path: outputPath,
//       filename: outputFileName
//     },
//     module: {
//       loaders: loaders
//     },
//     plugins: plugins,
//     postcss: function plugins(bundler) {
//       return [
//         require('postcss-import')({ addDependencyTo: bundler }),
//         require('postcss-nested')(),
//         require('postcss-cssnext')({ autoprefixer: AUTOPREFIXER_BROWSERS }),
//       ];
//     },
//   };

//   let Coms = [];
//   page.components.forEach((component) => {
//     const componentPath = '../../resources/' + component.project + '/components/' + component.name + '/Main.js' ;
//     Coms.push('require("' + componentPath + '")');
//     // delete pre compiled content
//     delete component.fileContent;
//   });

//   const pageToString = JSON.stringify(page);
//   const varScripts = 'const page = ' + pageToString + ';\n\n' + 'const Coms = [' + Coms + ']\n\n\n';
//   const appScript = fs.readFileSync(path.join(inputPath, '_app_template.js')).toString();
//   const allScript = varScripts + appScript;
//   fs.writeFileSync(path.join(inputPath, inputFileName), allScript);
//   var compiler = webpack(config);
//   return new Promise((resolve, reject) => {
//     compiler.run((err, stats) => {
//       if (err) {
//         reject(err);
//       } else {
//         const outputFilePath = path.join(outputPath, outputFileName);
//         const jsonStats = stats.toJson();
//         if(jsonStats.errors.length > 0) {
//           console.log(jsonStats.errors);
//           reject(jsonStats.errors);
//         }
//         const fileContent = fs.readFileSync(outputFilePath);
//         resolve({
//           stats: stats,
//           fileContent: fileContent,
//           outputPath: outputPath,
//           outputFileName: outputFileName,
//         });
//         console.log('end compile template: ', project, pageId);
//       }
//     });
//   });
// }

export async function compileTemplate(page) {
    const data = page.data;
    const pageName = page.name;
    console.log('start to compile template: ', pageName);
    const inputPath = path.join(__dirname, '../../components/publishPage/');
    const inputFileName = '_app.js';
    const outputPath = path.join(__dirname, './publish/',  `${pageName}/`);
    const outputFileName = 'app.bundle.js';
    var config = {
        entry: inputPath + inputFileName,
        output: {
            path: outputPath,
            filename: outputFileName
        },
        module: {
            loaders: loaders
        },
        plugins: plugins,
        resolve: resolve
    };

    // let Coms = [];
    // page.components.forEach((component) => {
    //     const componentPath = '../../resources/' + component.project + '/components/' + component.name + '/Main.js';
    //     Coms.push('require("' + componentPath + '")');
    //     // delete pre compiled content
    //     delete component.fileContent;
    // });

    const pageToString = JSON.stringify(data);
    const varScripts = `const data = ${pageToString}\n\n`;
    const appScript = fs.readFileSync(path.join(inputPath, '_app_template.js')).toString();
    const allScript = varScripts + appScript;
    fs.writeFileSync(path.join(inputPath, inputFileName), allScript);
    var compiler = webpack(config);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            } else {
                const outputFilePath = path.join(outputPath, outputFileName);
                const outputStylePath = path.join(outputPath, 'main.css');
                const jsonStats = stats.toJson();
                if (jsonStats.errors.length > 0) {
                    console.log(jsonStats.errors);
                    reject(jsonStats.errors);
                }
                const fileContent = fs.readFileSync(outputFilePath);
                const styleContent = fs.readFileSync(outputStylePath);
                resolve({
                    stats: stats,
                    fileContent: fileContent,
                    styleContent: styleContent,
                    outputPath: outputPath,
                    outputFileName: outputFileName,
                });
                console.log('end compile template: ', pageName);
            }
        });
    });
}
