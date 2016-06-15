/*!
 * hslider v1.0.1
 * author peterhzc
 * date 2016-06-15
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
            index : 0,
            firstRandom: true,
            activeClass:"active",
            autoplay: true,
            delay: 8000,
            speed: 750,
            easing: 'swing', //"linear" 或 "swing"
            perView: 1,
            
            // 动画选择
            // "combine3Img": 3张图片组合动画 ，电子网首页的轮播图, 默认值
            // "horizontal": 水平滑动
            // "vertical": 垂直滑动
            // "fade": 未添加
            animation:"combine3Img",
            contentWrap : "."+slider.name + "-content",
            contentItem : "."+slider.name + "-c",
            nav:{
                wrapClass: "."+slider.name + "-nav",
                itemClass: "."+slider.name + "-n"
                },
            pager:{
                wrapClass : "."+ slider.name + "-page",
                prevClass : "."+"prev",
                nextClass : "."+"next"
                }
        };
        
        slider.options = $.extend({}, slider.defaults, opts);
        
        var index = slider.options.index,
            timer = null,
            activeClass = slider.options.activeClass,
            $contentWrap = slider.ele.find(slider.options.contentWrap),
            $contentItems = slider.ele.find(slider.options.contentItem),
            $navItems = slider.ele.find(slider.options.nav.itemClass),
            perView = slider.options.perView,
            animation = slider.options.animation,
            total = $contentItems.length,
            indexRandom  = parseInt(total * Math.random());

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
        
        //下一个
        slider.next = function() {
			index++;
            var num =  total / perView;
            if(index > num - 1){
                index = 0;
            }
            slider.showimg(index);
            return slider;
		};
        
        //上一个
        slider.prev = function() {
			index--;
            var num =  total / perView;
            if(index < 0){
                index = num - 1;
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
			// 设置容器宽度 或 高度
            var prop = 'width';
            if(animation === 'vertical') {
                prop = 'height';
            }
            var num =  total / perView ;
            
            $contentWrap.css(prop, (num * 100) + '%');
            $contentItems.css(prop, (100 / total) + '%');
		};
        if(animation == "horizontal" || "vertical") {
            slider.calculateSlides();
        };
        
        //动画
        slider.animate = {
            combine3Img: function(){
                $contentItems.removeClass(activeClass);
                var currentPerView = index * perView;
                for(var i = 0; i< perView; i++){
                    $contentItems.eq(currentPerView + i).addClass(activeClass);
                }
                //$contentItems.eq(index).addClass(activeClass).siblings().removeClass(activeClass);
                slider.ele.find(".left-img,.right-img").stop(true,true).css("opacity","0");
                $contentItems.eq(index).find(".left-img").css("left","-800px").animate({opacity:"1",left:"0"},800,function(){
                    $contentItems.eq(index).find(".right-img").css("right","20px").animate({right:"0",opacity:"1"},2000);
                });
            },
            horizontal: function(){
                $contentItems.removeClass(activeClass);
                var currentPerView = index * perView;
                for(var i = 0; i< perView; i++){
                    $contentItems.eq(currentPerView + i).addClass(activeClass);
                }
                //$contentItems.eq(index).addClass(activeClass).siblings().removeClass(activeClass);
                $contentWrap.stop(true,true).animate({left: -(100 * index) + '%' }, slider.options.speed / 2 ,slider.options.easing);
            },
            vertical: function(){
                
                $contentItems.removeClass(activeClass);
                var currentPerView = index * perView;
                for(var i = 0; i< perView; i++){
                    $contentItems.eq(currentPerView + i).addClass(activeClass);
                }
                //$contentItems.eq(index).addClass(activeClass).siblings().removeClass(activeClass);
                $contentWrap.stop(true,true).animate({top: -(100 * index) + '%' }, slider.options.speed / 2 ,slider.options.easing);
            }
        };
        
        //显示图片
        slider.showimg = function(index){
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
