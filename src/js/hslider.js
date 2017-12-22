/*!
 * hslider v1.0.0
 * author peterhzc
 * date 2016-06-01
 */
;(function($) {
    if(!$) {
        return console.warn("请加载jquery");
    };
    var Hslider = function(ele,opts){
        var slider = this;
        slider.name = "hslider";
        slider.ele = ele;
        slider.defaults = {
            index : 0,              //默认索引
            index2 : 0,             //默认索引2
            firstRandom: true,      //第一个是否随机显示
            activeClass:"active",   //激活状态的 className
            autoPlay: false,        //是否自动播放
            delay: 8000,            //间隔时间
            speed: 750,             //速度
            easing: 'swing',        //"linear" 或 "swing"
            perView: 1,             //舞台显示几个
            infinite: true,         //是否无限轮回


            /**
             * animation 动画选择
             * "combine3Img": 3张图片组合动画 ，电子网首页的轮播图, 默认值
             * "horizontal": 水平滑动
             * "vertical": 垂直滑动
             * "fade": 未添加
             */
            animation: "combine3Img",
            contentWrap: "."+slider.name + "-content",
            contentItem: "."+slider.name + "-c",
            nav:{
                wrapClass: "."+slider.name + "-nav",
                itemClass: "."+slider.name + "-n"
            },
            pager:{
                wrapClass: "."+ slider.name + "-page",
                prevClass: "."+"prev",
                nextClass: "."+"next"
            }
        };
        slider.options = $.extend({}, slider.defaults, opts);

        var index = slider.options.index;
        var index2 = slider.options.index2;
        var timer = null;
        var activeClass = slider.options.activeClass;
        var $contentWrap = slider.ele.find(slider.options.contentWrap);
        var $contentItems = slider.ele.find(slider.options.contentItem);
        var $navItems = slider.ele.find(slider.options.nav.itemClass);
        var perView = slider.options.perView;
        var animation = slider.options.animation;
        var total = $contentItems.length;
        var indexRandom  = parseInt(total * Math.random());


        //图片懒惰加载
        slider.imgLazy = function(ul,index){
            var $li = ul.children("li");
            var sliderImg = $li.eq(index).find("[data-src]");
            if(sliderImg){
                sliderImg.each(function(i){
                    var slider = $(this);
                    if(slider.is("img")){
                        slider.attr("src",slider.data("src"));
                        slider.removeAttr("data-src");
                    }else{
                        slider.css({"background-image":"url("+slider.data("src")+")"});
                        slider.removeAttr("data-src");
                    }
                });
            }
        };

        //无限循环
        slider.infinite = function () {
            var firstItem = $contentItems.first();
            var lastItem = $contentItems.last();
            lastItem.after(firstItem.clone().removeClass("active").addClass("hslider-c-clone"));
            firstItem.before(lastItem.clone().addClass("hslider-c-clone"));
        };

        if (slider.options.infinite){
            slider.infinite();
        }

        var num =  slider.ele.find(slider.options.contentItem).length / perView;

        //下一个
        slider.next = function() {
            index++;
            index2++;

            if (slider.options.infinite){
                if(index === num - 2){
                    index = 0;
                }
                if(index2 > num ){
                    index2 = 0;
                }
            }else {
                if(index > num - 1){
                    index = 0;
                    index2 = 0;
                }
            }

            slider.showimg(index,index2);

            return slider;
        };

        //上一个
        slider.prev = function() {
            index--;
            index2--;

            if (slider.options.infinite){
                if(index < 0){
                    index = num - 3;
                }
                if(index2 < -1 ){
                    index2 = num - 2;
                }
            }else {
                if(index < 0){
                    index = num - 1;
                    index2 = num - 1;
                }
            }

            slider.showimg(index);
            return slider;
        };

        //开始循环
        slider.start = function() {
            timer = setTimeout(function() {
                slider.next();
            }, slider.options.delay);

            return slider;
        };

        if(slider.options.autoplay){
            slider.start();
        }

        //停止循环
        slider.stop = function() {
            clearTimeout(timer);
            return slider;
        };

        //slider导航
        slider.setSlideNav = function (index){
            $navItems.eq(index).addClass(activeClass).siblings().removeClass(activeClass);
        };

        slider.calculateSlides = function() {

            var _index = index ;
            if (slider.options.infinite){
                _index = _index + 1;
            }

            // 设置容器宽度 或 高度
            if(animation === 'horizontal') {
                $contentWrap.css({'width': (num * 100) + '%', 'left': -(100 * _index) + '%'});
                $contentItems.css({'width': (100 / slider.ele.find(slider.options.contentItem).length) + '%'});
            }else {
                $contentWrap.css({'height': (num * 100) + '%', 'top': -(100 * _index) + '%'});
                $contentItems.css({'height': (100 / slider.ele.find(slider.options.contentItem).length) + '%'});
            }


        };

        if(animation === "horizontal" || "vertical") {
            slider.calculateSlides();
        };

        /**
         * 动画
         */
        slider.animate = {

            //3张图片组合动画
            combine3Img: function(){
                $contentItems.removeClass(activeClass);
                var currentPerView = index * perView;
                for(var i = 0; i< perView; i++){
                    $contentItems.eq(currentPerView + i).addClass(activeClass);
                }

                slider.ele.find(".left-img,.right-img").stop(true,true).css("opacity","0");
                $contentItems.eq(index).find(".left-img").css("left","-800px").animate({opacity:"1",left:"0"},800,function(){
                    $contentItems.eq(index).find(".right-img").css("right","20px").animate({right:"0",opacity:"1"},2000);
                });
            },

            //水平滑动
            horizontal: function(){
                $contentItems.removeClass(activeClass);
                var currentPerView = index * perView;

                for(var i = 0; i< perView; i++){
                    $contentItems.eq(currentPerView + i).addClass(activeClass);
                }

                if (slider.options.infinite){
                    if (index === index2){
                        $contentWrap.stop().animate({'left': -(100 * ( index + 1)) + '%' }, slider.options.speed / 2 ,slider.options.easing);
                    }else{
                        $contentWrap.stop().animate({'left': -(100 * (index2 + 1)) + '%' }, slider.options.speed / 2 ,slider.options.easing,function () {
                            $contentWrap.css({'left':  -(100 * (index + 1)) + '%' });
                            index2 = index;
                        });
                    }
                }else {
                    $contentWrap.stop().animate({'left': -(100 * index) + '%' }, slider.options.speed / 2 ,slider.options.easing);
                }

            },

            //垂直滑动
            vertical: function(){
                $contentItems.removeClass(activeClass);
                var currentPerView = index * perView;
                for(var i = 0; i< perView; i++){
                    $contentItems.eq(currentPerView + i).addClass(activeClass);
                }

                if (slider.options.infinite){
                    if (index === index2){
                        $contentWrap.stop().animate({'top': -(100 * ( index + 1)) + '%' }, slider.options.speed / 2 ,slider.options.easing);
                    }else{
                        $contentWrap.stop().animate({'top': -(100 * (index2 + 1)) + '%' }, slider.options.speed / 2 ,slider.options.easing,function () {
                            $contentWrap.css({'top':  -(100 * (index + 1)) + '%' });
                            index2 = index;
                        });
                    }
                }else {
                    $contentWrap.stop().animate({'top': -(100 * index) + '%' }, slider.options.speed / 2 ,slider.options.easing);
                }
            },

            //fade
            fade: function () {
                $contentItems.removeClass(activeClass);
                var currentPerView = index * perView;
                for(var i = 0; i< perView; i++){
                    $contentItems.eq(currentPerView + i).addClass(activeClass);
                }
            }
        };

        //显示图片
        slider.showimg = function(index,index2){
            if(slider.options.autoplay) {
                slider.stop().start();
            }
            slider.setSlideNav(index);
            slider.imgLazy($contentWrap,index);
            slider.animate[animation]();
        };



        //初始化随机第一项
        slider.firstRandom = function(){
            $contentWrap.prepend($contentItems.eq(indexRandom));
            $contentItems = slider.ele.find(slider.options.contentItem);
            slider.showimg(index);
        };

        if(slider.options.firstRandom){
            slider.firstRandom();
        };

        //图片导航
        $navItems.on("click",function(){
            index = $(this).index();
            var num =  total / perView ;
            if(index > num - 1){
                index = 0;
            }
            slider.showimg(index);
        });

        //下一张图按钮
        slider.ele.find(slider.options.pager.nextClass).on("click",function(){
            slider.next();
        });

        //上一张图按钮
        slider.ele.find(slider.options.pager.prevClass).on("click",function(){
            slider.prev();
        });

        //鼠标悬停
        slider.ele.hover(function(){
            slider.stop();
        },function(){
            slider.start();
        });

    };

    //定义 jquery.hslider 插件
    $.fn.hslider = function(options) {
        return this.each(function() {
            var $this = $(this);
            return new Hslider($this, options);
        });
    };

})(window.jQuery);
