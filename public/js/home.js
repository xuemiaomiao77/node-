$(function(){
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        $('.nav').css('display', 'none')
        $('input').css('width', '60%')
    }
    $('#expand-menu-btn').click(function(){
        $('.suspend-menu-list').css('display', 'block')
        $('.suspend-menu-list').addClass('animate__backInRight')
        $(this).fadeOut()
    })
    $('#back_menu-btn').click(function(){
        $('.suspend-menu-list').css('display', 'none')
        $('#expand-menu-btn').fadeIn()
        $('.kefu').css('display', 'none')
    })
    $(".hot-keyword span").click(function(){
        window.open('https://ipl.parllay.cn/qa/front/index.html#?keyword='+$(this).html())
    })
    $('.search-btn').click(function(){
        var keyword = $("input").val();
        if(keyword){
            window.open('https://ipl.parllay.cn/qa/front/index.html#?keyword='+keyword)
        }
    })
    $('#kefu-btn').click(function(){
        $('.kefu').toggle()
    })
})
//enter键
$(document).keydown(function (event) {
    if (event.keyCode == 13) {
        var keyword = $("input").val();
        if(keyword){
            window.open('https://ipl.parllay.cn/qa/front/index.html#?keyword='+keyword)
        }
    }
});