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