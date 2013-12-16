/**
 * 导航下拉
 */
$(function () {
  var $dropdown = $(".dropdown");
  var DC = {
    timer: []
  };

  $dropdown.each(function (i, oElem) {
    oElem = this;
    $(this).mouseover(function () {
      if (DC.timer[i]) clearTimeout(DC.timer[i]);
      DC.timer[i] = setTimeout(function () {
        $(oElem).attr('id', 'expansion');
        $('.nav-layer').eq(i).show()
          .css({
            left: $(oElem).position().left - parseInt($('.nav-layer').eq(i).width()) + 1
          })
          .mouseenter(function () {
            if (DC.timer[i]) clearTimeout(DC.timer[i]);
          }).
          mouseleave(function () {
            var $layer = $(this);
            DC.timer[i] = setTimeout(function () {
              $(oElem).attr('id', '');
              $layer.hide();
            }, 500);
          });
      }, 500);
    }).mouseout(function () {
        if (DC.timer[i]) clearTimeout(DC.timer[i]);
        DC.timer[i] = setTimeout(function () {
          $(oElem).attr('id', '');
          $('.nav-layer').eq(i).hide();
        }, 500);
      });
  });

  $('#hook').on('mouseenter', expandTask);
  $('#dish').on('mouseleave', unexpandTask);

  function expandTask() {
    $('#hook').animate({ marginLeft: '-48px' }); 
    $('#dish').animate({ marginLeft: '0' }); 
  }

  function unexpandTask() {
    $('#dish').animate({ marginLeft: '-116px' });
    $('#hook').animate({ marginLeft: '0' });
  }
});

/* 文本域自动扩展
*/

$.fn.extend({
    expand: function (minHeight, maxHeight) {
        return this.each(function () {
            new $.TextAreaExpander(this, minHeight, maxHeight);
        });
    }
});

$.TextAreaExpander = function (t, minHeight, maxHeight) {

    // 判断是否为文本域 textarea
    if (t.nodeName.toLowerCase() != "textarea")
        return;

    var padding = parseInt($(t).css("padding-top")) + parseInt($(t).css("padding-bottom"));

    resize(t);

    $(t).keyup(resize);

    function resize(e) {
        e = e.target || e;
        if (!document.all) e.style.height = "0px";
        var h = Math.max(minHeight || 0, Math.min(e.scrollHeight, maxHeight || 99999)); // 限定高度范围
        e.style.overflow = (e.scrollHeight > h) ? "auto" : "hidden"; // 超过限定高度，出现滚动条
        e.style.height = (document.all) ? h - padding + "px" : h - padding + "px";
    }
};