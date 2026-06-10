var prefixUrl = '/';
$(document).ready(function(){
    loadItemColorProductPhoto();
    addToCartDetail();

    $(".fancybox").fancybox({
        helpers: {
            title : {
                type : 'float'
            }
        }
    });
    $(".fancybox-thumb").fancybox({
        prevEffect  : 'none',
        nextEffect  : 'none',
        helpers : {
            title   : {
                type: 'float'
            },
            thumbs  : {
                width   : 50,
                height  : 50
            }
        }
    });

    $(".product_photo_img_link").fancybox({
        helpers: {
            title : {
                type : 'float'
            }
        }
    });

    $(".product_photo_img_flex").fancybox({
        helpers: {
            title : {
                type : 'float'
            }
        }
    });

    $(".product_thumb_img_link").click(function () {
        var url = $(this).data("href");

        $(".img_pr_thumbnail li").removeClass("pr_photo_active");
        $(this).parent("li").addClass("pr_photo_active");
        $(".product_photo_img_link").attr("href", url);
        $(".product_photo_img img").attr("src", url);
    });

    $('.option-element').click(function() {
        var cost = $(this).data('cost');
        var price = $(this).data('price');
        var tmpid = $(this).data('tmpid');
        var options = {};
        options.tmpid = tmpid;
        var html = '';
        if (cost != 0 && price != 0) {
            html += '<div class="product_price_old">'+ cost +' đ</div><div class="product_price_new">'+ price +' đ</div>';
        }

        if((price == 0 && cost != 0) || cost == 0){
             html += '<div class="product_price_new product_price">'+ cost +' đ</div>'
        }

        $('.price_detail .box_product_detail_price').html(html);
        $('#attribute-element .option-element').removeClass('option-element-select');
        $(this).addClass('option-element-select');
        // $('#add_to_cart').data('options', options);
        $('#btn-1click-checkout').data('options', options);
        $('#btn-1click-cart').data('options', options);
    });


});

$(window).load(function(){
    loadFlexSlider();
});

function loadFlexSlider() {
    $('.flexslider').flexslider({
        animation: "slide",
        controlNav: "thumbnails",
        animationLoop: false,
        minItems: 1,
    });
}

function loadItemColorProductPhoto() {
    if ($('input[name=tmpid]').length > 0) {
         // add options to cart
        var options = {};
        var tmpid = $('input[name=tmpid]').val();
        options.tmpid = tmpid;
        $('#btn-1click-checkout').data('options', options);
        $('#btn-1click-cart').data('options', options);
    }
   
    $('.item-capacity').click(function() {
        var capacityId = $(this).data('capacity-id');
        var colorId = $('.item-color.active').data('color-id');
        var productId = $(this).data('product-id');
        $('.item-capacity').removeClass('active');
        $(this).addClass('active');
        updateProductElmAll(productId, colorId, capacityId);
    });

    $('.item-color').click(function() {
        var colorId = $(this).data('color-id');
        var capacityId = $('.item-capacity.active').data('capacity-id');
        var productId = $(this).data('product-id');
        $('.item-color').removeClass('active');
        $(this).addClass('active');
        $.ajax({
            type: 'POST',
            url: '/ajax-product-load-product-photo',
            data: {'product_id':productId, 'product_element_detail_id':colorId},
            success:function(result) {
                if (typeof result.code == 'undefined') {
                    $('#sliderFlex').html(result);
                    // loadFlexSlider();
                    customizeFlex();
                    updateProductElmAll(productId, colorId, capacityId);
                }
            }
        });

        // updateProductElmAll(productId, colorId, capacityId);
    })
}

function updateProductElmAll(productId, colorId, capacityId) {
    $.ajax({
        type: 'POST',
        url: '/ajax-product-get-product-element-info',
        data: {'productId':productId, 'colorId':colorId, 'capacityId':capacityId},
        success:function(result) {
            if (result.code == 200) {
                var cost = result.data.cost;
                var price = result.data.price;
                var tmpid = result.data.id;
                var options = {};
                options.tmpid = tmpid;
                var html = '';
                if (cost != 0 && price != 0) {
                    html += '<div class="product_price_old">'+ cost +' đ</div><div class="product_price_new">'+ price +' đ</div>';
                }

                if((price == 0 && cost != 0) || cost == 0){
                     html += '<div class="product_price_new product_price">'+ cost +' đ</div>'
                }

                $('.price_detail .box_product_detail_price').html(html);
                $('#product-combo-name').html(result.data.productElementComboName);
                $('input[name=tmpid]').val(tmpid);
                $('#btn-1click-checkout').data('options', options);
                $('#btn-1click-cart').data('options', options);
            } else {
                $('#product-combo-name').html('Không có sản phẩm này');
            }
        }
    })
}

function customizeFlex() {
    $('.flex-thum-customize img').click(function() {
        var image = $(this).attr('src');
        $('.slides li').first().find('img').attr('src', image);
    })
}

function addToCartDetail() {
    var qtyInput = $('input[name=product_qty]');
    var qty = $('input[name=product_qty]').val();
    var decreaseQty = $('.js-cart-product-decrease-quantity');
    $('.js-cart-product-increase-quantity').click(function() {
        qty = parseInt(qty) + 1;
        if (qty > 0) {
            qtyInput.val(qty);
            if (qty > 1) {
                decreaseQty.removeClass('disabled');
            } else {
                decreaseQty.addClass('disabled');
            }
        }
        
    });

    $(decreaseQty).click(function() {
        qty = parseInt(qty) - 1;
        if (qty > 0) {
            qtyInput.val(qty);
            if (qty > 1) {
                decreaseQty.removeClass('disabled');
            } else {
                decreaseQty.addClass('disabled');
            }
        }
    });

    $('#btn-1click-checkout').one('click', function () {
        var options  = $(this).data("options");
        var numberCartItem = $('.number_cart_item');
        var id  = $(this).data("id");
        var name  = $(this).data("name");
        var qty  = $('input[name=product_qty]').val();
        var type = $(this).data('type');
        var cartType = $(this).data('cart-type');
        var numberItem = numberCartItem.text();

        if (type == 'checkout') {
            var url = '/thanh-toan/';
            if (lang != 'vi') {
                url = '/' + lang + '/checkout'
            }
        }

        if (type == 'cart') {
            var url = '/gio-hang/';
            if (lang != 'vi') {
                url = '/' + lang + '/cart'
            }
        }

        $.ajax({
            type: "POST",
            url: "/add-to-cart",
            data: {"id":id, 'qty':qty, 'options':options},
            success:function(result){
                if(result == "success") {
                    if (cartType == 1) {
                        window.location.href = url;
                    } else {
                        toastr.options = {
                          "positionClass": "toast-top-right",
                        }

                        toastr.success('Thêm ' + name + ' vào giỏ hàng thành công');
                        numberCartItem.text(parseInt(numberItem) + 1);
                    }
                }
            }
        });
    });

    $('#btn-1click-cart').one('click', function () {
       var options  = $(this).data("options");
        var numberCartItem = $('.number_cart_item');
        var id  = $(this).data("id");
        var name  = $(this).data("name");
        var qty  = $('input[name=product_qty]').val();
        var type = $(this).data('type');
        var cartType = $(this).data('cart-type');
        var numberItem = numberCartItem.text();

        if (type == 'checkout') {
            var url = '/thanh-toan/';
            if (lang != 'vi') {
                url = '/' + lang + '/checkout'
            }
        }

        if (type == 'cart') {
            var url = '/gio-hang/';
            if (lang != 'vi') {
                url = '/' + lang + '/cart'
            }
        }

        $.ajax({
            type: "POST",
            url: "/add-to-cart",
            data: {"id":id, 'qty':qty, 'options':options},
            success:function(result){
                if(result == "success") {
                    if (cartType == 1) {
                        window.location.href = url;
                    } else {
                        toastr.options = {
                          "positionClass": "toast-top-right",
                        }

                        toastr.success('Thêm ' + name + ' vào giỏ hàng thành công');
                        numberCartItem.text(parseInt(numberItem) + 1);
                    }
                }
            }
        });
    });
}

