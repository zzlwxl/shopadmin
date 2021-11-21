module.exports={


    devServer:{
        host:'0.0.0.0',
        port:80
    },
    chainWebpack:config=>{
        config.when(process.env.NODE_ENV === 'production',config=>{
            config.entry('app').clear().add('./src/main-prod.js')
            config.set('externals', {
                vue: 'Vue', 
                vue_router : 'VueRouter',
                axios: 'axios',
                lodash: '_',
                echarts: 'echarts',
                nprogress: 'NProgress', 'vue-quill-editor': 'VueQuillEditor'
                })
        })
        config.when(process.env.NODE_ENV === 'development',config=>{
            config.entry('app').clear().add('./src/main-dev.js')
        })
    }
}